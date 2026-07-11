const {onSchedule} = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')

const DISCONNECTION_THRESHOLD_MS = 60 * 1000 // 60 seconds

exports.disconnectionDetector = onSchedule('every 1 minutes', async (event) => {
  const db = admin.database()
  const now = Date.now()

  try {
    const devicesSnap = await db.ref('devices').once('value')
    if (!devicesSnap.exists()) return

    const devices = devicesSnap.val()
    const updates = {}
    const alerts = []
    let disconnectedCount = 0

    for (const [deviceId, device] of Object.entries(devices)) {
      if (device.status === 'DISCONNECTED') continue
      if (device.status === 'ERROR') continue

      const lastSeen = device.lastSeen || 0
      const timeSinceSeen = now - lastSeen

      if (timeSinceSeen > DISCONNECTION_THRESHOLD_MS) {
        updates[`devices/${deviceId}/status`] = 'DISCONNECTED'
        updates[`devices/${deviceId}/lastSeen`] = now

        alerts.push({
          deviceId,
          type: 'DEVICE_DISCONNECTED',
          message: `Device "${device.name}" has been disconnected for ${Math.round(timeSinceSeen / 1000)} seconds`,
          timestamp: now,
        })

        disconnectedCount++
      }
    }

    if (disconnectedCount > 0) {
      await db.ref().update(updates)

      for (const alert of alerts) {
        await db.ref('alerts').push(alert)
      }

      console.log(`Disconnection detector: ${disconnectedCount} device(s) marked as disconnected`)
    }
  } catch (error) {
    console.error('Disconnection detector error:', error)
  }
})
