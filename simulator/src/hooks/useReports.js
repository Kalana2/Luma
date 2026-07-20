import { useState, useEffect } from 'react'
import { db, ref, onValue } from '../firebase/firebaseConfig'

export default function useReports(deviceIds) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !deviceIds || deviceIds.length === 0) {
      setLoading(false)
      return
    }

    const deviceSet = new Set(deviceIds)
    const reportsRef = ref(db, 'reports')
    const unsub = onValue(reportsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val()
          const entries = Object.entries(data)
            .filter(([key]) => {
              const devId = key.split('_')[0]
              return deviceSet.has(devId)
            })
            .map(([id, entry]) => ({ id, ...entry }))
          entries.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
          setReports(entries)
        } else {
          setReports([])
        }
      } catch {
        setReports([])
      }
      setLoading(false)
    })

    return () => unsub()
  }, [deviceIds])

  return { reports, loading }
}
