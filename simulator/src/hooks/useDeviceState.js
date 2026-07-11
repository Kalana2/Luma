import { useState, useEffect } from 'react'
import { db, ref, onValue } from '../firebase/firebaseConfig'

export default function useDeviceState(deviceId) {
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!deviceId || !db) {
      setDevice(null)
      setLoading(false)
      return
    }

    const deviceRef = ref(db, `devices/${deviceId}`)
    const unsub = onValue(deviceRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          setDevice({ id: deviceId, ...snapshot.val() })
        } else {
          setDevice(null)
        }
      } catch (err) {
        console.error('Device parse error:', err)
        setDevice(null)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [deviceId])

  return { device, loading }
}
