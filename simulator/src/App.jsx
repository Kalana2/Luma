import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  Box,
} from '@mui/material'
import { auth, signInAnonymously, onAuthStateChanged } from './firebase/firebaseConfig'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import FloorOverviewPage from './pages/FloorOverviewPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import CameraFeedPage from './pages/CameraFeedPage'

const lumaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
    secondary: { main: '#1E293B', light: '#334155', dark: '#0F172A' },
    warning: { main: '#F59E0B' },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    background: { default: '#0B1121', paper: 'rgba(17,24,39,0.8)' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    divider: 'rgba(59,130,246,0.08)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, fontSize: '1.1rem' },
    body1: { color: '#CBD5E1' },
    body2: { color: '#94A3B8', fontSize: '0.875rem' },
    caption: { color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, fontSize: '0.7rem' },
    button: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#0B1121',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(59,130,246,0.1)',
          borderRadius: 16,
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: 'rgba(59,130,246,0.3)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.15), 0 0 60px rgba(59,130,246,0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(11,17,33,0.85)',
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          borderBottom: '1px solid rgba(59,130,246,0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(11,17,33,0.9)',
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          borderRight: '1px solid rgba(59,130,246,0.08)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 30,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 3,
            '&.Mui-checked': {
              transform: 'translateX(22px)',
              '& .MuiSwitch-thumb': {
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                boxShadow: '0 0 16px rgba(59,130,246,0.6), 0 2px 8px rgba(0,0,0,0.3)',
              },
              '& + .MuiSwitch-track': {
                opacity: 1,
                background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(99,102,241,0.2))',
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 24,
            height: 24,
            background: '#475569',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 15,
            opacity: 1,
            background: 'rgba(71,85,105,0.25)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          padding: '10px 22px',
          letterSpacing: '0.02em',
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
          boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
            boxShadow: '0 6px 24px rgba(59,130,246,0.5)',
            transform: 'translateY(-2px)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(59,130,246,0.25)',
          color: '#93C5FD',
          '&:hover': {
            borderColor: 'rgba(59,130,246,0.5)',
            background: 'rgba(59,130,246,0.06)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.03em',
          borderRadius: 8,
          fontSize: '0.7rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(145deg, #0F172A, #1E293B)',
          border: '1px solid rgba(59,130,246,0.12)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 120px rgba(59,130,246,0.06)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(30,41,59,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 8,
          fontSize: '0.7rem',
          padding: '8px 14px',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(59,130,246,0.04) 25%, rgba(59,130,246,0.08) 37%, rgba(59,130,246,0.04) 63%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s ease-in-out infinite',
          borderRadius: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: { color: '#475569', mx: 1 },
        li: { fontSize: '0.8rem' },
      },
    },
  },
})

function AppInner() {
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [selectedFloorId, setSelectedFloorId] = useState(null)

  useEffect(() => {
    if (!auth) {
      setConnectionStatus('error')
      return
    }

    signInAnonymously(auth)
      .then(() => setConnectionStatus('connected'))
      .catch(() => setConnectionStatus('error'))

    const unsub = onAuthStateChanged(auth, (user) => {
      setConnectionStatus(user ? 'connected' : 'error')
    })
    return unsub
  }, [])

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B1121' }}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: 800,
              height: 800,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 60%)',
              filter: 'blur(90px)',
              animation: 'float-orb-1 25s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-15%',
              left: '-10%',
              width: 700,
              height: 700,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.04), transparent 60%)',
              filter: 'blur(90px)',
              animation: 'float-orb-2 30s ease-in-out infinite',
            }}
          />
        </Box>

        <Navbar connectionStatus={connectionStatus} selectedFloorId={selectedFloorId} />
        <Sidebar selectedFloorId={selectedFloorId} onFloorSelect={setSelectedFloorId} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 9,
            ml: '252px',
            p: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={<FloorOverviewPage selectedFloorId={selectedFloorId} />}
            />
            <Route
              path="/device/:deviceId"
              element={<DeviceDetailPage />}
            />
            <Route
              path="/camera/:deviceId"
              element={<CameraFeedPage />}
            />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  )
}

export default function ThemedApp() {
  return (
    <ThemeProvider theme={lumaTheme}>
      <AppInner />
    </ThemeProvider>
  )
}
