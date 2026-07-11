import { db, ref, get, set, update, onValue } from './firebaseConfig'

export async function getFloors() {
  const snapshot = await get(ref(db, 'floors'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }))
  }
  return []
}

export async function getFloor(floorId) {
  const snapshot = await get(ref(db, `floors/${floorId}`))
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

export async function getDevicesByFloor(floorId) {
  const floor = await getFloor(floorId)
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

export function getFloorDevicesLive(floorId, callback) {
  const devicesRef = ref(db, 'devices')
  return onValue(devicesRef, async () => {
    const devices = await getDevicesByFloor(floorId)
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

export async function seedSampleData() {
  const seedDevices = {
    'device-001': {
      type: 'light',
      name: 'Living Room Light',
      state: 'OFF',
      status: 'OFF',
      lastSeen: Date.now(),
      startTime: '18:00',
      endTime: '23:00',
    },
    'device-002': {
      type: 'outlet',
      name: 'Kitchen Outlet',
      state: 'OFF',
      status: 'OFF',
      lastSeen: Date.now(),
    },
    'device-003': {
      type: 'iron',
      name: 'Bedroom Iron',
      state: 'OFF',
      status: 'OFF',
      lastSeen: Date.now(),
      turnedOnAt: null,
      maxDurationMinutes: 30,
    },
    'device-004': {
      type: 'switchPanel',
      name: 'Study Switch Panel',
      switchCount: 3,
      switches: { switch1: 'OFF', switch2: 'OFF', switch3: 'OFF' },
      status: 'OFF',
      lastSeen: Date.now(),
    },
    'device-005': {
      type: 'camera',
      name: 'Garage Camera',
      status: 'ONLINE',
      lastSeen: Date.now(),
      lastSnapshotUrl: 'https://picsum.photos/seed/camera-garage/640/480',
      lastSnapshotAt: Date.now(),
    },
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

  await update(ref(db), { floors: seedFloors, devices: seedDevices })
  return { floors: seedFloors, devices: seedDevices }
}
