import { db, ref, set } from '../firebase/firebaseConfig'

let heartbeatInterval = null

export function startHeartbeat(deviceIds) {
  stopHeartbeat()

  heartbeatInterval = setInterval(() => {
    deviceIds.forEach((deviceId) => {
      set(ref(db, `devices/${deviceId}/lastSeen`), Date.now())
        .catch((err) => console.error(`Heartbeat failed for ${deviceId}:`, err))
    })
  }, 10000)
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}
