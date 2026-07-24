import { useState, useEffect } from 'react'
import { db, ref, onValue } from '../firebase/firebaseConfig'

export default function useUserProfile(userId) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false)
      return
    }

    const userRef = ref(db, `users/${userId}`)
    const unsub = onValue(userRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          setUserData({ id: userId, ...snapshot.val() })
        } else {
          setUserData(null)
        }
      } catch {
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [userId])

  return { userData, loading }
}
