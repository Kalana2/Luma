import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider, createTheme, Box, alpha, CircularProgress, Typography } from '@mui/material'
import { ref, push, get as fbGet } from 'firebase/database'
import { auth, db, onAuthStateChanged } from './firebase/firebaseConfig'
import { LogContext } from './contexts/LogContext'
import { seedSampleData } from './firebase/deviceService'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import FloorOverviewPage from './pages/FloorOverviewPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import CameraFeedPage from './pages/CameraFeedPage'
import LogsPage from './pages/LogsPage'
import ProfilePage from './pages/ProfilePage'
import Footer from './components/Footer'
import AboutDialog from './components/AboutDialog'
import LoginPage from './pages/LoginPage'

const royalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1E3A5F', light: '#2D5A8C', dark: '#15304D' },
    secondary: { main: '#0F1D35', light: '#15253F', dark: '#0A1628' },
    warning: { main: '#C9A84C' },
    success: { main: '#0D9488' },
    error: { main: '#BE123C' },
    background: { default: '#0A1628', paper: 'rgba(15,29,53,0.85)' },
    text: { primary: '#E8D5A3', secondary: '#C4B5D0' },
    divider: 'rgba(201,168,76,0.06)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.03em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, fontSize: '1.1rem', letterSpacing: '-0.01em' },
    body1: { color: '#E8D5A3' },
    body2: { color: '#C4B5D0', fontSize: '0.875rem' },
    caption: { color: '#7C6B8A', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, fontSize: '0.7rem' },
    button: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { background: '#0A1628', minHeight: '100vh' } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(160deg, rgba(15,29,53,0.95) 0%, rgba(18,34,60,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,168,76,0.06)',
          borderRadius: 16,
          transition: 'all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: 'rgba(201,168,76,0.2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1), 0 0 60px rgba(30,58,95,0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10,22,40,0.88)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: '1px solid rgba(201,168,76,0.06)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(10,22,40,0.92)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderRight: '1px solid rgba(201,168,76,0.05)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52, height: 30, padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 3,
            '&.Mui-checked': {
              transform: 'translateX(22px)',
              '& .MuiSwitch-thumb': {
                background: 'linear-gradient(135deg, #C9A84C, #B8963A)',
                boxShadow: '0 0 16px rgba(201,168,76,0.5), 0 2px 8px rgba(0,0,0,0.3)',
              },
              '& + .MuiSwitch-track': {
                opacity: 1,
                background: 'linear-gradient(90deg, rgba(201,168,76,0.25), rgba(201,168,76,0.12))',
              },
            },
          },
          '& .MuiSwitch-thumb': { width: 24, height: 24, background: '#2D4A6A' },
          '& .MuiSwitch-track': { borderRadius: 15, opacity: 1, background: 'rgba(30,58,95,0.25)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, fontWeight: 600, padding: '10px 22px',
          letterSpacing: '0.02em', textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1E3A5F 0%, #15304D 100%)',
          boxShadow: '0 4px 16px rgba(30,58,95,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2D5A8C 0%, #1E3A5F 100%)',
            boxShadow: '0 6px 24px rgba(30,58,95,0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(201,168,76,0.2)',
          color: '#C4B5D0',
          '&:hover': { borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C', background: 'rgba(201,168,76,0.04)' },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, letterSpacing: '0.03em', borderRadius: 8, fontSize: '0.7rem' } } },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(160deg, #0A1628, #0F1D35)',
          border: '1px solid rgba(201,168,76,0.08)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 120px rgba(30,58,95,0.06)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(15,29,53,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(201,168,76,0.1)',
          borderRadius: 8, fontSize: '0.7rem', padding: '8px 14px',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(30,58,95,0.04) 25%, rgba(30,58,95,0.08) 37%, rgba(30,58,95,0.04) 63%)',
          backgroundSize: '200% 100%', animation: 'shimmer 2s ease-in-out infinite', borderRadius: 8,
        },
      },
    },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 10, margin: '2px 8px' } } },
    MuiBreadcrumbs: {
      styleOverrides: {
          separator: { color: '#2D4A6A', mx: 1 },
        li: { fontSize: '0.8rem' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(201,168,76,0.08)' },
            '&:hover fieldset': { borderColor: 'rgba(201,168,76,0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#6D28D9' },
          },
          '& .MuiInputLabel-root': { color: '#7C6B8A' },
          '& input, & .MuiSelect-select': { color: '#E8D5A3' },
        },
      },
    },
  },
})

function AppInner() {
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [user, setUser] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    if (!auth) { setConnectionStatus('error'); setInitializing(false); return }
    auth.signOut().catch(() => {})
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setConnectionStatus(u ? 'connected' : 'error')
      setInitializing(false)
    })
    return unsub
  }, [])

  const logEvent = useCallback((event, details = {}) => {
    if (!user?.uid) return
    try {
      const logRef = ref(db, `userLogs/${user.uid}`)
      push(logRef, {
        environment: 'simulator',
        device: navigator.userAgent || 'unknown',
        event,
        timestamp: Date.now(),
        details,
      }).catch(() => {})
    } catch {}
  }, [user])

  if (initializing) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} sx={{ color: '#C9A84C' }} />
      </Box>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <LogContext.Provider value={logEvent}>
      <BrowserRouter>
        <AppLayout userId={user.uid} connectionStatus={connectionStatus} logEvent={logEvent} onOpenAbout={() => setAboutOpen(true)} />
      </BrowserRouter>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </LogContext.Provider>
  )
}

function AppLayout({ userId, connectionStatus, logEvent, onOpenAbout }) {
  const location = useLocation()
  const prevPathRef = useRef('')
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const seededRef = useRef(false)

  useEffect(() => {
    if (!userId || seededRef.current) return
    seededRef.current = true

    const checkAndSeed = async () => {
      try {
        const snap = await fbGet(ref(db, `users/${userId}/floors`))
        if (!snap.exists() || Object.keys(snap.val()).length === 0) {
          setSeeding(true)
          await seedSampleData(userId)
          setSeeding(false)
        }
      } catch {
        setSeeding(false)
      }
    }

    checkAndSeed()
  }, [userId])

  useEffect(() => {
    const prev = prevPathRef.current
    if (prev && prev !== location.pathname) {
      logEvent('page_navigation', { from: prev, to: location.pathname })
    }
    prevPathRef.current = location.pathname
  }, [location.pathname, logEvent])

  useEffect(() => {
    if (selectedFloorId) {
      logEvent('floor_select', { floorId: selectedFloorId })
    }
  }, [selectedFloorId, logEvent])

  if (seeding) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0A1628', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={32} sx={{ color: '#C9A84C' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#E8D5A3', fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '1.1rem' }}>Setting up your workspace...</Typography>
          <Typography variant="body2" sx={{ color: '#7C6B8A', mt: 0.5 }}>Seeding sample data for your account</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0A1628' }}>
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Box sx={{ position: 'absolute', top: '-15%', right: '-10%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,58,95,0.06), transparent 60%)', filter: 'blur(100px)', animation: 'float-orb-1 28s ease-in-out infinite' }} />
        <Box sx={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.03), transparent 60%)', filter: 'blur(100px)', animation: 'float-orb-2 32s ease-in-out infinite' }} />
      </Box>

          <Navbar userId={userId} connectionStatus={connectionStatus} selectedFloorId={selectedFloorId} onLogout={() => auth?.signOut()} />
      <Sidebar userId={userId} selectedFloorId={selectedFloorId} onFloorSelect={setSelectedFloorId} />
      <Box component="main" sx={{ flexGrow: 1, mt: 9, ml: '252px', p: 4, pb: 2, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<FloorOverviewPage userId={userId} selectedFloorId={selectedFloorId} />} />
            <Route path="/device/:deviceId" element={<DeviceDetailPage />} />
            <Route path="/camera/:deviceId" element={<CameraFeedPage />} />
            <Route path="/logs" element={<LogsPage userId={userId} />} />
            <Route path="/profile" element={<ProfilePage userId={userId} />} />
          </Routes>
        </Box>
        <Footer onAboutClick={onOpenAbout} />
      </Box>
    </Box>
  )
}

export default function ThemedApp() {
  return <ThemeProvider theme={royalTheme}><AppInner /></ThemeProvider>
}
