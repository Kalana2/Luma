const {onValueWritten} = require('firebase-functions/v2/database')
const admin = require('firebase-admin')

exports.reportAggregator = onValueWritten(
  {
    ref: '/devices/{deviceId}/state',
    instance: process.env.DATABASE_INSTANCE || undefined,
  },
  async (event) => {
    const db = admin.database()
    const {deviceId} = event.params

    const beforeState = event.data.before.exists() ? event.data.before.val() : null
    const afterState = event.data.after.exists() ? event.data.after.val() : null

    if (beforeState === 'ON' && afterState === 'OFF') {
      try {
        const deviceSnap = await db.ref(`devices/${deviceId}`).once('value')
        if (!deviceSnap.exists()) return

        const device = deviceSnap.val()
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        const weekStr = weekStart.toISOString().split('T')[0]
        const monthStr = dateStr.substring(0, 7)

        const sessionDuration = device.turnedOnAt
          ? Math.round((now.getTime() - device.turnedOnAt) / 60000)
          : 0

        const nominalWattages = {
          light: 10,
          outlet: 1500,
          iron: 1000,
          switchPanel: 100,
          camera: 5,
        }

        const wattage = nominalWattages[device.type] || 100
        const estimatedKwh = ((sessionDuration / 60) * wattage) / 1000

        const historyRef = db.ref(`devices/${deviceId}/history`).push()
        await historyRef.set({
          turnedOffAt: now.getTime(),
          durationMinutes: sessionDuration,
          estimatedKwh: parseFloat(estimatedKwh.toFixed(3)),
        })

        const reportId = `${deviceId}_${dateStr}`

        const existingSnap = await db.ref(`reports/${reportId}`).once('value')
        const existing = existingSnap.exists() ? existingSnap.val() : {
          deviceId,
          deviceName: device.name,
          deviceType: device.type,
          period: 'daily',
          date: dateStr,
          week: weekStr,
          month: monthStr,
          totalOnDurationMinutes: 0,
          totalSessions: 0,
          estimatedKwh: 0,
        }

        const updatedReport = {
          ...existing,
          totalOnDurationMinutes: (existing.totalOnDurationMinutes || 0) + sessionDuration,
          totalSessions: (existing.totalSessions || 0) + 1,
          estimatedKwh: parseFloat(((existing.estimatedKwh || 0) + estimatedKwh).toFixed(3)),
          lastUpdated: now.getTime(),
        }

        await db.ref(`reports/${reportId}`).set(updatedReport)

        console.log(`Report: ${device.name} ran for ${sessionDuration}min, total today: ${updatedReport.totalOnDurationMinutes}min`)
      } catch (error) {
        console.error('Report aggregator error:', error)
      }
    }
  }
)
