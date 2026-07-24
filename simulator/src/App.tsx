import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider, createTheme, Box, CircularProgress, Typography } from '@mui/material'
import { ref, push, get as fbGet } from 'firebase/database'
import { auth, db, onAuthStateChanged } from './firebase/firebaseConfig'
import { LogContext } from './contexts/LogContext'
import { ToastProvider } from './contexts/ToastContext'
import { seedSampleData } from './firebase/deviceService'
import { C } from './theme/colors'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import useFloorList from './hooks/useFloorList'
import FloorOverviewPage from './pages/FloorOverviewPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import CameraFeedPage from './pages/CameraFeedPage'
import LogsPage from './pages/LogsPage'
import ProfilePage from './pages/ProfilePage'
import Footer from './components/Footer'
import AboutDialog from './components/AboutDialog'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: C.primary, light: C.primaryLight, dark: C.primaryDark },
    secondary: { main: C.secondary },
    success: { main: C.success },
    warning: { main: C.warning },
    error: { main: C.error },
    background: { default: C.bg, paper: C.paper },
    text: { primary: C.text, secondary: C.textSecondary },
    divider: C.border,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.03em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, fontSize: '1.1rem', letterSpacing: '-0.01em' },
    body1: { color: C.text },
    body2: { color: C.textSecondary, fontSize: '0.875rem' },
    caption: { color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, fontSize: '0.7rem' },
    button: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { background: C.bg, minHeight: '100vh' } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: C.paper,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          boxShadow: C.cardShadow,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: C.cardShadowHover,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: C.paper,
          borderBottom: `1px solid ${C.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: C.paper,
          borderRight: `1px solid ${C.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44, height: 24, padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 3,
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              '& .MuiSwitch-thumb': {
                background: C.primary,
                boxShadow: 'none',
              },
              '& + .MuiSwitch-track': {
                opacity: 1,
                background: '#DBEAFE',
              },
            },
          },
          '& .MuiSwitch-thumb': { width: 18, height: 18, background: '#CBD5E1' },
          '& .MuiSwitch-track': { borderRadius: 12, opacity: 1, background: '#E2E8F0' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, fontWeight: 600, padding: '8px 18px',
          letterSpacing: '0.01em', textTransform: 'none',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: C.primary,
          boxShadow: '0 1px 3px rgba(37,99,235,0.15)',
          '&:hover': {
            background: C.primaryDark,
            boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
          },
        },
        outlined: {
          borderColor: C.border,
          color: C.textSecondary,
          '&:hover': { borderColor: C.primary, color: C.primary, background: C.blue50 },
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8rem',
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, letterSpacing: '0.03em', borderRadius: 6, fontSize: '0.7rem' } } },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: C.paper,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          boxShadow: C.dialogShadow,
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: C.text,
          borderRadius: 6, fontSize: '0.7rem', padding: '6px 12px',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 37%, #F1F5F9 63%)',
          backgroundSize: '200% 100%', animation: 'shimmer 2s ease-in-out infinite', borderRadius: 6,
        },
      },
    },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 8, margin: '2px 8px' } } },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: { color: '#CBD5E1' },
        li: { fontSize: '0.8rem' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: C.border },
            '&:hover fieldset': { borderColor: C.primaryLight },
            '&.Mui-focused fieldset': { borderColor: C.primary },
          },
          '& .MuiInputLabel-root': { color: C.muted },
          '& input, & .MuiSelect-select': { color: C.text },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 40,
          '&.Mui-selected': { color: C.primary },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: C.primary, height: 2.5, borderRadius: 2 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          boxShadow: C.menuShadow,
          backgroundImage: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
        standardError: { background: C.red50, color: C.error, border: `1px solid ${C.border}` },
        standardSuccess: { background: C.green50, color: C.success, border: `1px solid ${C.border}` },
        standardWarning: { background: C.amber50, color: C.warning, border: `1px solid ${C.border}` },
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
      <Box sx={{ minHeight: '100vh', bgcolor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} sx={{ color: C.primary }} />
      </Box>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <ErrorBoundary>
      <LogContext.Provider value={logEvent}>
        <ToastProvider>
          <BrowserRouter>
            <AppLayout userId={user.uid} connectionStatus={connectionStatus} logEvent={logEvent} onOpenAbout={() => setAboutOpen(true)} />
          </BrowserRouter>
          <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
        </ToastProvider>
      </LogContext.Provider>
    </ErrorBoundary>
  )
}

function AppLayout({ userId, connectionStatus, logEvent, onOpenAbout }) {
  const location = useLocation()
  const prevPathRef = useRef('')
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const seededRef = useRef(false)
  const { floors } = useFloorList(userId)

  useEffect(() => {
    if (floors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(floors[0].id)
    }
  }, [floors, selectedFloorId])

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
      <Box sx={{ minHeight: '100vh', bgcolor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={32} sx={{ color: C.primary }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: C.text, fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '1.1rem' }}>Setting up your workspace...</Typography>
          <Typography variant="body2" sx={{ color: C.muted, mt: 0.5 }}>Seeding sample data for your account</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: C.bg }}>
      <Navbar userId={userId} connectionStatus={connectionStatus} selectedFloorId={selectedFloorId} onLogout={() => auth?.signOut()} />
      <Sidebar userId={userId} selectedFloorId={selectedFloorId} onFloorSelect={setSelectedFloorId} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 9,
          ml: { xs: '60px', md: '252px' },
          p: { xs: 2, sm: 3, md: 4 },
          pb: 2,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: 1, width: '100%' }}>
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
  return <ThemeProvider theme={lightTheme}><AppInner /></ThemeProvider>
}
