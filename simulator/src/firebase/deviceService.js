import { db, ref, get, set, update, onValue } from './firebaseConfig'

function ensureDb() {
  if (!db) throw new Error('Firebase not initialized')
  return db
}

export async function getFloors(userId) {
  ensureDb()
  const snapshot = await get(ref(db, `users/${userId}/floors`))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }))
  }
  return []
}

export async function getFloor(userId, floorId) {
  const snapshot = await get(ref(db, `users/${userId}/floors/${floorId}`))
  if (snapshot.exists()) {
    return { id: floorId, ...snapshot.val() }
  }
  return null
}

export async function getDevice(deviceId) {
  const snapshot = await get(ref(db, `devices/${deviceId}`))
  if (snapshot.exists()) {
    return { id: deviceId, ...snapshot.val() }
  }
  return null
}

export async function getDevicesByFloor(userId, floorId) {
  const floor = await getFloor(userId, floorId)
  if (!floor || !floor.rooms) return []

  const deviceIds = new Set()
  for (const roomId of Object.keys(floor.rooms)) {
    const room = floor.rooms[roomId]
    if (room.devices) {
      for (const deviceId of Object.keys(room.devices)) {
        deviceIds.add(deviceId)
      }
    }
  }

  if (deviceIds.size === 0) return []

  const snapshots = await get(ref(db, 'devices'))
  const allDevices = snapshots.exists() ? snapshots.val() : {}

  return Array.from(deviceIds)
    .map((id) => (allDevices[id] ? { id, ...allDevices[id] } : null))
    .filter(Boolean)
}

export function getFloorDevicesLive(userId, floorId, callback) {
  const devicesRef = ref(db, 'devices')
  return onValue(devicesRef, async () => {
    const devices = await getDevicesByFloor(userId, floorId)
    callback(devices)
  })
}

export async function setDeviceState(deviceId, state) {
  const updates = {}
  updates[`devices/${deviceId}/state`] = state
  updates[`devices/${deviceId}/status`] = state
  updates[`devices/${deviceId}/lastSeen`] = Date.now()

  if (state === 'ON') {
    updates[`devices/${deviceId}/turnedOnAt`] = Date.now()
  }

  await update(ref(db), updates)
}

export async function updateDeviceLastSeen(deviceId) {
  await set(ref(db, `devices/${deviceId}/lastSeen`), Date.now())
}

export async function setDeviceStatus(deviceId, status) {
  await update(ref(db), {
    [`devices/${deviceId}/status`]: status,
    [`devices/${deviceId}/lastSeen`]: Date.now(),
  })
}

export async function setSwitchState(deviceId, switchKey, state) {
  await update(ref(db), {
    [`devices/${deviceId}/switches/${switchKey}`]: state,
    [`devices/${deviceId}/lastSeen`]: Date.now(),
  })
}

export async function updateDeviceSchedule(deviceId, startTime, endTime) {
  await update(ref(db), {
    [`devices/${deviceId}/startTime`]: startTime,
    [`devices/${deviceId}/endTime`]: endTime,
    [`devices/${deviceId}/lastSeen`]: Date.now(),
  })
}

export async function updateIronMaxDuration(deviceId, maxDurationMinutes) {
  await update(ref(db), {
    [`devices/${deviceId}/maxDurationMinutes`]: maxDurationMinutes,
    [`devices/${deviceId}/lastSeen`]: Date.now(),
  })
}

export async function requestCameraSnapshot(deviceId) {
  const snapshotUrl = `https://picsum.photos/seed/${deviceId}${Date.now()}/640/480`
  await update(ref(db), {
    [`devices/${deviceId}/lastSnapshotUrl`]: snapshotUrl,
    [`devices/${deviceId}/lastSnapshotAt`]: Date.now(),
    [`devices/${deviceId}/lastSeen`]: Date.now(),
  })
  return snapshotUrl
}

export async function triggerDeviceError(deviceId) {
  await set(ref(db, `devices/${deviceId}/status`), 'ERROR')
  await set(ref(db, `devices/${deviceId}/lastSeen`), Date.now())
}

export async function triggerDeviceDisconnected(deviceId) {
  await set(ref(db, `devices/${deviceId}/status`), 'DISCONNECTED')
  await set(ref(db, `devices/${deviceId}/lastSeen`), 0)
}

export async function seedSampleData(userId) {
  ensureDb()
  const seedDevices = {
    'device-001': {
      type: 'light',
      name: 'Living Room Light',
      state: 'OFF',
      status: 'OFF',
      lastSeen: Date.now(),
      startTime: '18:00',
      endTime: '23:00',
      userId,
    },
    'device-002': {
      type: 'outlet',
      name: 'Kitchen Outlet',
      state: 'OFF',
      status: 'OFF',
      lastSeen: Date.now(),
      userId,
    },
    'device-003': {
      type: 'iron',
      name: 'Bedroom Iron',
      state: 'OFF',
      status: 'OFF',
      lastSeen: Date.now(),
      turnedOnAt: null,
      maxDurationMinutes: 30,
      userId,
    },
    'device-004': {
      type: 'switchPanel',
      name: 'Study Switch Panel',
      switchCount: 3,
      switches: { switch1: 'OFF', switch2: 'OFF', switch3: 'OFF' },
      status: 'OFF',
      lastSeen: Date.now(),
      userId,
    },
    'device-005': {
      type: 'camera',
      name: 'Garage Camera',
      status: 'ONLINE',
      lastSeen: Date.now(),
      lastSnapshotUrl: 'https://picsum.photos/seed/camera-garage/640/480',
      lastSnapshotAt: Date.now(),
      userId,
    },
  }

  const userDeviceIndex = {}
  for (const did of Object.keys(seedDevices)) {
    userDeviceIndex[`users/${userId}/devices/${did}`] = true
  }

  const seedFloors = {
    'floor-001': {
      name: 'Ground Floor',
      icon: 'home',
      rooms: {
        'room-001': { name: 'Living Room', devices: { 'device-001': true } },
        'room-002': { name: 'Kitchen', devices: { 'device-002': true } },
      },
    },
    'floor-002': {
      name: 'First Floor',
      icon: 'stairs',
      rooms: {
        'room-003': { name: 'Master Bedroom', devices: { 'device-003': true } },
        'room-004': { name: 'Study', devices: { 'device-004': true } },
      },
    },
    'floor-003': {
      name: 'Second Floor',
      icon: 'attic',
      rooms: {
        'room-005': { name: 'Garage', devices: { 'device-005': true } },
      },
    },
  }

  await update(ref(db), {
    devices: seedDevices,
    ...userDeviceIndex,
    [`users/${userId}/floors`]: seedFloors,
  })
  return { floors: seedFloors, devices: seedDevices }
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export async function addFloor(userId, name, icon) {
  ensureDb()
  const id = generateId('floor')
  await set(ref(db, `users/${userId}/floors/${id}`), {
    name,
    icon: icon || 'home',
    rooms: {},
  })
  return id
}

export async function updateFloor(userId, floorId, data) {
  ensureDb()
  const updates = {}
  if (data.name) updates[`users/${userId}/floors/${floorId}/name`] = data.name
  if (data.icon) updates[`users/${userId}/floors/${floorId}/icon`] = data.icon
  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates)
  }
}

export async function deleteFloor(userId, floorId) {
  ensureDb()
  const floorSnap = await get(ref(db, `users/${userId}/floors/${floorId}`))
  if (!floorSnap.exists()) return

  const floor = floorSnap.val()
  const deviceIds = []

  if (floor.rooms) {
    for (const roomId of Object.keys(floor.rooms)) {
      const room = floor.rooms[roomId]
      if (room.devices) {
        for (const did of Object.keys(room.devices)) {
          deviceIds.push(did)
        }
      }
    }
  }

  const updates = {}
  updates[`users/${userId}/floors/${floorId}`] = null
  for (const did of deviceIds) {
    updates[`devices/${did}`] = null
    updates[`users/${userId}/devices/${did}`] = null
  }

  await update(ref(db), updates)
}

export async function addRoom(userId, floorId, name) {
  ensureDb()
  const id = generateId('room')
  await set(ref(db, `users/${userId}/floors/${floorId}/rooms/${id}`), {
    name,
    devices: {},
  })
  return id
}

export async function deleteRoom(userId, floorId, roomId) {
  ensureDb()
  const roomSnap = await get(ref(db, `users/${userId}/floors/${floorId}/rooms/${roomId}`))
  if (!roomSnap.exists()) return

  const room = roomSnap.val()
  const deviceIds = []
  if (room.devices) {
    for (const did of Object.keys(room.devices)) {
      deviceIds.push(did)
    }
  }

  const updates = {}
  updates[`users/${userId}/floors/${floorId}/rooms/${roomId}`] = null
  for (const did of deviceIds) {
    updates[`devices/${did}`] = null
    updates[`users/${userId}/devices/${did}`] = null
  }

  await update(ref(db), updates)
}

export async function addDevice(userId, floorId, roomId, deviceData) {
  ensureDb()
  const id = generateId('device')
  const device = {
    ...deviceData,
    lastSeen: Date.now(),
    userId,
  }
  await update(ref(db), {
    [`devices/${id}`]: device,
    [`users/${userId}/floors/${floorId}/rooms/${roomId}/devices/${id}`]: true,
    [`users/${userId}/devices/${id}`]: true,
  })
  return id
}

export async function deleteDevice(userId, deviceId, floorId, roomId) {
  ensureDb()
  const updates = {}
  updates[`devices/${deviceId}`] = null
  if (userId) updates[`users/${userId}/devices/${deviceId}`] = null
  if (floorId && roomId) {
    updates[`users/${userId}/floors/${floorId}/rooms/${roomId}/devices/${deviceId}`] = null
  }
  await update(ref(db), updates)
}
