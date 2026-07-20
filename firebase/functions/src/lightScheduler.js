const {onSchedule} = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')

exports.lightScheduler = onSchedule('every 1 minutes', async (event) => {
  const db = admin.database()
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  try {
    const devicesSnap = await db.ref('devices').once('value')
    if (!devicesSnap.exists()) return

    const devices = devicesSnap.val()
    const updates = {}
    let scheduleCount = 0

    for (const [deviceId, device] of Object.entries(devices)) {
      if (device.type !== 'light') continue
      if (!device.startTime || !device.endTime) continue

      const [startH, startM] = (device.startTime || '00:00').split(':').map(Number)
      const [endH, endM] = (device.endTime || '00:00').split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      const isInSchedule = startMinutes <= endMinutes
        ? currentMinutes >= startMinutes && currentMinutes < endMinutes
        : currentMinutes >= startMinutes || currentMinutes < endMinutes

      const targetState = isInSchedule ? 'ON' : 'OFF'

      if (device.state !== targetState) {
        updates[`devices/${deviceId}/state`] = targetState
        updates[`devices/${deviceId}/status`] = targetState
        updates[`devices/${deviceId}/lastSeen`] = now.getTime()

        if (targetState === 'ON') {
          updates[`devices/${deviceId}/turnedOnAt`] = now.getTime()
        }

        scheduleCount++
      }
    }

    if (scheduleCount > 0) {
      await db.ref().update(updates)
      console.log(`Light scheduler: ${scheduleCount} light(s) updated`)
    }
  } catch (error) {
    console.error('Light scheduler error:', error)
  }
})
