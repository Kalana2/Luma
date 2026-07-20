import { useState, useEffect } from 'react'
import { db, ref, onValue } from '../firebase/firebaseConfig'

export default function useUserDevices(userId) {
  const [deviceIds, setDeviceIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false)
      return
    }

    const devRef = ref(db, `users/${userId}/devices`)
    const unsub = onValue(devRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          setDeviceIds(Object.keys(snapshot.val()))
        } else {
          setDeviceIds([])
        }
      } catch {
        setDeviceIds([])
      }
      setLoading(false)
    })

    return () => unsub()
  }, [userId])

  return { deviceIds, loading }
}
