import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase/firebaseConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    let timeoutId
    let unsubFn = null

    signOut(auth).catch(() => {}).finally(() => {
      timeoutId = setTimeout(() => {
        setLoading(false)
        setUser(null)
      }, 5000)

      const unsub = onAuthStateChanged(auth, (u) => {
        clearTimeout(timeoutId)
        setUser(u)
        setLoading(false)
      })

      unsubFn = unsub
    })

    return () => {
      clearTimeout(timeoutId)
      if (unsubFn) unsubFn()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, userId: user?.uid || null, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
