import { useState, useEffect } from 'react'
import { db, ref, onValue } from '../firebase/firebaseConfig'

export default function useAlerts(deviceIds) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !deviceIds || deviceIds.length === 0) {
      setLoading(false)
      return
    }

    const deviceSet = new Set(deviceIds)
    const alertsRef = ref(db, 'alerts')
    const unsub = onValue(alertsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, any>
          const entries = Object.entries(data)
            .filter(([, entry]) => deviceSet.has(entry.deviceId))
            .map(([id, entry]) => ({ id, ...entry }))
          entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          setAlerts(entries)
        } else {
          setAlerts([])
        }
      } catch {
        setAlerts([])
      }
      setLoading(false)
    })

    return () => unsub()
  }, [deviceIds])

  return { alerts, loading }
}
