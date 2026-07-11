import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'
import { auth, signInAnonymously, onAuthStateChanged } from './firebase/firebaseConfig'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

const lumaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2F6690', light: '#3A7DB0', dark: '#1E4D6E' },
    secondary: { main: '#16425B', light: '#1D5575', dark: '#0E2F42' },
    warning: { main: '#FFA630' },
    success: { main: '#2E8B57' },
    error: { main: '#C0392B' },
    background: { default: '#0A1628', paper: '#112240' },
    text: { primary: '#E8F1F5', secondary: '#8892B0' },
    divider: 'rgba(47,102,144,0.15)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, fontSize: '1.05rem' },
    body1: { color: '#CCD6E0' },
    body2: { color: '#8892B0', fontSize: '0.85rem' },
    caption: { color: '#8892B0', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 },
    button: { fontWeight: 600, letterSpacing: '0.03em', textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0A1628 0%, #112240 50%, #0D1F3C 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(17,34,64,0.9) 0%, rgba(26,51,86,0.6) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(47,102,144,0.15)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: 'rgba(255,166,48,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,166,48,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10,22,40,0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(47,102,144,0.2)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(10,22,40,0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(47,102,144,0.15)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 28,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 1,
            '&.Mui-checked': {
              transform: 'translateX(24px)',
              '& .MuiSwitch-thumb': {
                background: 'linear-gradient(135deg, #FFA630, #FF8C00)',
                boxShadow: '0 0 12px rgba(255,166,48,0.6)',
              },
              '& + .MuiSwitch-track': {
                opacity: 1,
                background: 'rgba(255,166,48,0.25)',
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 26,
            height: 26,
            background: '#546E7A',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 14,
            opacity: 1,
            background: 'rgba(84,110,122,0.35)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: '0.04em', borderRadius: 8, fontSize: '0.75rem' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '8px 20px', fontWeight: 600 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2F6690, #1E4D6E)',
          '&:hover': { background: 'linear-gradient(135deg, #3A7DB0, #2F6690)' },
        },
        containedWarning: {
          background: 'linear-gradient(135deg, #FFA630, #E89620)',
          color: '#0A1628',
          '&:hover': { background: 'linear-gradient(135deg, #FFB850, #FFA630)' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(145deg, #112240, #1A3356)',
          border: '1px solid rgba(47,102,144,0.2)',
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: '#1A3356',
          border: '1px solid rgba(47,102,144,0.3)',
          borderRadius: 8,
          fontSize: '0.75rem',
          padding: '8px 12px',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(47,102,144,0.08) 25%, rgba(47,102,144,0.15) 37%, rgba(47,102,144,0.08) 63%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          borderRadius: 8,
        },
      },
    },
  },
})

function App() {
  const [authReady, setAuthReady] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [city] = useState('')

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => setConnectionStatus('connected'))
      .catch((err) => {
        console.error('Auth failed:', err)
        setConnectionStatus('error')
      })

    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthReady(true)
      setConnectionStatus(user ? 'connected' : 'error')
    })
    return unsub
  }, [])

  if (!authReady) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0A1628 0%, #112240 50%, #0D1F3C 100%)',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Box sx={{ position: 'relative', width: 120, height: 120 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '2px solid rgba(47,102,144,0.2)',
              animation: 'status-pulse 2s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              border: '1px solid rgba(255,166,48,0.1)',
              animation: 'status-pulse 3s ease-in-out infinite 0.5s',
            }}
          />
          <Box
            component="img"
            src="/logo.png"
            alt="Luma"
            sx={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
          />
        </Box>
        <Typography variant="h6" sx={{ color: '#8892B0', fontWeight: 300, letterSpacing: '0.15em' }}>
          SMART HOME SIMULATOR
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#FFA630',
              animation: 'status-pulse 1.5s ease-in-out infinite',
            }}
          />
          <Typography variant="caption">Connecting to Firebase</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar connectionStatus={connectionStatus} />
        <Sidebar selectedFloorId={selectedFloorId} onFloorSelect={setSelectedFloorId} />
        <Box component="main" sx={{ flexGrow: 1, mt: 8, ml: '240px', p: 3 }}>
          <Routes>
            <Route
              path="/"
              element={
                <PlaceholderPage
                  title="Device Dashboard"
                  subtitle="Select a floor to view devices"
                  city={city}
                />
              }
            />
            <Route
              path="/device/:deviceId"
              element={<PlaceholderPage title="Device Details" subtitle="Device controls coming soon" city={city} />}
            />
            <Route
              path="/camera/:deviceId"
              element={<PlaceholderPage title="Camera Feed" subtitle="Camera view coming soon" city={city} />}
            />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  )
}

function PlaceholderPage({ title, subtitle, city }) {
  return (
    <Box sx={{ animation: 'float-in 0.5s ease-out' }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        {subtitle}
      </Typography>
      <Box
        sx={{
          p: 4,
          borderRadius: 4,
          border: '1px dashed rgba(47,102,144,0.25)',
          textAlign: 'center',
          background: 'linear-gradient(145deg, rgba(17,34,64,0.5), rgba(26,51,86,0.3))',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#8892B0', mb: 2 }}>
          Phase 2 coming next
        </Typography>
        <Typography variant="body2">
          Floor overview, device cards, and controls will be implemented in the next phase.
        </Typography>
        {city && (
          <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
            {city}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default function ThemedApp() {
  return (
    <ThemeProvider theme={lumaTheme}>
      <App />
    </ThemeProvider>
  )
}
