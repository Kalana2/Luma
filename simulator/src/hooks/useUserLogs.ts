import { useState, useEffect } from 'react'
import { db, ref, onValue } from '../firebase/firebaseConfig'

export default function useUserLogs(userId) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false)
      return
    }

    const logRef = ref(db, `userLogs/${userId}`)
    const unsub = onValue(logRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, any>
          const entries = Object.entries(data).map(([id, entry]) => ({
            id,
            ...entry,
          }))
          entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          setLogs(entries)
        } else {
          setLogs([])
        }
      } catch {
        setLogs([])
      }
      setLoading(false)
    })

    return () => unsub()
  }, [userId])

  return { logs, loading }
}
