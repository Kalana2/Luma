const {onSchedule} = require('firebase-functions/v2/scheduler')
const {onValueWritten} = require('firebase-functions/v2/database')
const admin = require('firebase-admin')

admin.initializeApp()

exports.ironAutoShutdown = onSchedule('every 1 minutes', async (event) => {
  const db = admin.database()
  const now = Date.now()

  try {
    const devicesSnap = await db.ref('devices').once('value')
    if (!devicesSnap.exists()) return

    const devices = devicesSnap.val()
    const updates = {}
    const alerts = []
    let changedCount = 0

    for (const [deviceId, device] of Object.entries(devices)) {
      if (device.type !== 'iron') continue
      if (device.state !== 'ON') continue
      if (!device.turnedOnAt) continue

      const maxDuration = (device.maxDurationMinutes || 30) * 60 * 1000
      const elapsed = now - device.turnedOnAt

      if (elapsed >= maxDuration) {
        updates[`devices/${deviceId}/state`] = 'OFF'
        updates[`devices/${deviceId}/status`] = 'OFF'
        updates[`devices/${deviceId}/turnedOnAt`] = null
        updates[`devices/${deviceId}/lastSeen`] = now

        alerts.push({
          deviceId,
          type: 'AUTO_SHUTDOWN',
          message: `Iron "${device.name}" automatically turned OFF after ${device.maxDurationMinutes || 30} minutes for safety`,
          timestamp: now,
        })

        changedCount++
      }
    }

    if (changedCount > 0) {
      await db.ref().update(updates)

      for (const alert of alerts) {
        await db.ref('alerts').push(alert)
      }

      console.log(`Auto-shutdown: ${changedCount} iron(s) turned off`)
    }
  } catch (error) {
    console.error('Iron auto-shutdown error:', error)
  }
})
