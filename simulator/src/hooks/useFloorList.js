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
          const data = snapshot.val()
          const floorList = Object.entries(data).map(([id, floor]) => {
            let rooms = 0
            let devices = 0
            if (floor.rooms) {
              rooms = Object.keys(floor.rooms).length
              for (const roomId in floor.rooms) {
                const room = floor.rooms[roomId]
                if (room.devices) {
                  devices += Object.keys(room.devices).length
                }
              }
            }
            return { id, ...floor, rooms, devices }
          })
          setFloors(floorList)
        } else {
          setFloors([])
        }
      } catch (err) {
        console.error('Floor parse error:', err)
        setFloors([])
      }
      setLoading(false)
    })

    return () => unsub()
  }, [userId])

  return { floors, loading }
}
