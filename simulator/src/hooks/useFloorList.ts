import { useState, useEffect } from 'react'
import { db, ref, onValue } from '../firebase/firebaseConfig'

export default function useFloorList(userId) {
  const [floors, setFloors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false)
      return
    }

    const floorsRef = ref(db, `users/${userId}/floors`)
    const unsub = onValue(floorsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, any>
          const floorList = Object.entries(data || {}).map(([id, floor]) => {
            const f = floor || {}
            let rooms = 0
            let devices = 0
            if (f.rooms) {
              rooms = Object.keys(f.rooms).length
              for (const roomId in f.rooms) {
                const room = f.rooms[roomId]
                if (room?.devices) {
                  devices += Object.keys(room.devices).length
                }
              }
            }
            return { id, ...f, rooms, devices }
          })
          setFloors(floorList)
        } else {
          setFloors([])
        }
      } catch {
        setFloors([])
      }
      setLoading(false)
    })

    return () => unsub()
  }, [userId])

  return { floors, loading }
}
