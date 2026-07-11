const {onValueCreated} = require('firebase-functions/v2/database')
const admin = require('firebase-admin')

exports.alertNotifier = onValueCreated(
  {
    ref: '/alerts/{alertId}',
    instance: process.env.DATABASE_INSTANCE || undefined,
  },
  async (event) => {
    const db = admin.database()

    try {
      const alert = event.data.val()
      if (!alert || !alert.deviceId) return

      const deviceSnap = await db.ref(`devices/${alert.deviceId}`).once('value')
      const deviceName = deviceSnap.exists() ? deviceSnap.val().name : 'Unknown device'

      console.log(`[ALERT] ${alert.type}: ${alert.message}`)
      console.log(`[ALERT] Device: ${deviceName} (${alert.deviceId})`)
      console.log(`[ALERT] Timestamp: ${new Date(alert.timestamp).toISOString()}`)

    } catch (error) {
      console.error('Alert notifier error:', error)
    }
  }
)
