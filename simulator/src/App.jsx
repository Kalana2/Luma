import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  Box,
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
    background: { default: '#060D1A', paper: 'rgba(15,30,55,0.85)' },
    text: { primary: '#E4ECF2', secondary: '#8892B0' },
    divider: 'rgba(47,102,144,0.12)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '1.05rem' },
    body1: { color: '#CCD6E0', fontSize: '0.95rem' },
    body2: { color: '#8892B0', fontSize: '0.85rem' },
    caption: { color: '#8892B0', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500, fontSize: '0.7rem' },
    button: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'none' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#060D1A',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(15,30,55,0.9) 0%, rgba(20,40,70,0.5) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(47,102,144,0.12)',
          borderRadius: 20,
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            borderColor: 'rgba(255,166,48,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,166,48,0.08), 0 0 40px rgba(47,102,144,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(6,13,26,0.8)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(47,102,144,0.12)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(6,13,26,0.9)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRight: '1px solid rgba(47,102,144,0.1)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 56,
          height: 30,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 1,
            '&.Mui-checked': {
              transform: 'translateX(26px)',
              '& .MuiSwitch-thumb': {
                background: 'linear-gradient(135deg, #FFA630, #FF8C00)',
                boxShadow: '0 0 16px rgba(255,166,48,0.7), 0 2px 8px rgba(0,0,0,0.3)',
              },
              '& + .MuiSwitch-track': {
                opacity: 1,
                background: 'linear-gradient(90deg, rgba(255,166,48,0.3), rgba(255,166,48,0.15))',
                border: '1px solid rgba(255,166,48,0.2)',
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, #546E7A, #37474F)',
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 15,
            opacity: 1,
            background: 'rgba(84,110,122,0.18)',
            border: '1px solid rgba(84,110,122,0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: '0.05em', borderRadius: 8, fontSize: '0.72rem' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          fontFamily: '"Outfit", sans-serif',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2F6690 0%, #1E4D6E 100%)',
          boxShadow: '0 4px 20px rgba(47,102,144,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3A7DB0 0%, #2F6690 100%)',
            boxShadow: '0 6px 28px rgba(47,102,144,0.4)',
            transform: 'translateY(-1px)',
          },
        },
        containedWarning: {
          background: 'linear-gradient(135deg, #FFA630 0%, #E89620 100%)',
          color: '#060D1A',
          boxShadow: '0 4px 20px rgba(255,166,48,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFB850 0%, #FFA630 100%)',
            boxShadow: '0 6px 28px rgba(255,166,48,0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(47,102,144,0.3)',
          color: '#8892B0',
          '&:hover': {
            borderColor: 'rgba(255,166,48,0.5)',
            color: '#FFA630',
            background: 'rgba(255,166,48,0.06)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(160deg, #0F1E37, #142847)',
          border: '1px solid rgba(47,102,144,0.18)',
          borderRadius: 24,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(47,102,144,0.1)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(20,40,70,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(47,102,144,0.25)',
          borderRadius: 10,
          fontSize: '0.75rem',
          padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(47,102,144,0.06) 25%, rgba(47,102,144,0.12) 37%, rgba(47,102,144,0.06) 63%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s ease-in-out infinite',
          borderRadius: 10,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
      },
    },
  },
})

function AppInner() {
  const [authReady, setAuthReady] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
  }, [])

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
          background: '#060D1A',
          flexDirection: 'column',
          gap: 5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 40%, rgba(47,102,144,0.06) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(255,166,48,0.04) 0%, transparent 60%)',
          }}
        />
        <Box sx={{ position: 'relative', width: 140, height: 140 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: -20,
              borderRadius: '50%',
              border: '2px solid rgba(47,102,144,0.12)',
              animation: 'rotate-slow 8s linear infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: -35,
              borderRadius: '50%',
              border: '1px solid rgba(255,166,48,0.08)',
              animation: 'rotate-slow 12s linear infinite reverse',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: -50,
              borderRadius: '50%',
              border: '1px dashed rgba(47,102,144,0.06)',
              animation: 'rotate-slow 20s linear infinite',
            }}
          />
          <Box
            component="img"
            src="/logo.png"
            alt="Luma"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              animation: 'floating 3s ease-in-out infinite',
              filter: 'drop-shadow(0 0 30px rgba(47,102,144,0.3))',
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: '1.1rem',
              fontWeight: 300,
              letterSpacing: '0.2em',
              background: 'linear-gradient(90deg, #8892B0, #5B7FA5, #8892B0)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'text-shimmer 3s linear infinite',
            }}
          >
            HARDWARE SIMULATOR
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#FFA630',
              animation: 'status-pulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 12px rgba(255,166,48,0.6)',
            }}
          />
          <Typography variant="caption" sx={{ letterSpacing: '0.08em' }}>
            Initializing
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <BrowserRouter>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          position: 'relative',
          background: '#060D1A',
        }}
        onMouseMove={handleMouseMove}
      >
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background: `
              radial-gradient(ellipse 900px 700px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(47,102,144,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 700px 500px at ${(1 - mousePos.x) * 100}% ${(1 - mousePos.y) * 100}%, rgba(255,166,48,0.04) 0%, transparent 60%)
            `,
            transition: 'background 0.6s ease-out',
          }}
        />
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
              top: '10%',
              left: '5%',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(47,102,144,0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'float-orb-1 20s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '-5%',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,166,48,0.05) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'float-orb-2 25s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '40%',
              width: 350,
              height: 350,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(46,139,87,0.05) 0%, transparent 70%)',
              filter: 'blur(50px)',
              animation: 'float-orb-3 22s ease-in-out infinite',
            }}
          />
        </Box>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.03,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.03,
            background: `
              radial-gradient(circle at 50% 50%, rgba(47,102,144,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        <Navbar connectionStatus={connectionStatus} selectedFloorId={selectedFloorId} />
        <Sidebar selectedFloorId={selectedFloorId} onFloorSelect={setSelectedFloorId} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 8,
            ml: '250px',
            p: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={<PlaceholderPage title="Device Dashboard" subtitle="Select a floor from the sidebar to view its devices" />}
            />
            <Route
              path="/device/:deviceId"
              element={<PlaceholderPage title="Device Details" subtitle="Interactive device controls coming in Phase 2" />}
            />
            <Route
              path="/camera/:deviceId"
              element={<PlaceholderPage title="Camera Feed" subtitle="Live camera view coming in Phase 2" />}
            />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  )
}

function PlaceholderPage({ title, subtitle }) {
  return (
    <Box sx={{ animation: 'slide-up-stagger 0.6s ease-out' }}>
      <Typography
        variant="h4"
        sx={{
          background: 'linear-gradient(135deg, #E4ECF2, #8892B0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        {subtitle}
      </Typography>
      <Box
        sx={{
          p: 6,
          borderRadius: 4,
          border: '1px solid rgba(47,102,144,0.12)',
          textAlign: 'center',
          background: 'linear-gradient(160deg, rgba(15,30,55,0.6), rgba(20,40,70,0.3))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: 'border-glow 4s ease-in-out infinite',
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2px solid rgba(47,102,144,0.15)',
              animation: 'rotate-slow 6s linear infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FFA630' }} />
          </Box>
        </Box>
        <Typography variant="h6" sx={{ color: '#8892B0', fontWeight: 400, mb: 1 }}>
          Phase 2 — Coming Next
        </Typography>
        <Typography variant="body2">
          Device cards, interactive controls, real-time status chips, and camera feeds will be implemented in the next phase.
        </Typography>
      </Box>
    </Box>
  )
}

export default function ThemedApp() {
  return (
    <ThemeProvider theme={lumaTheme}>
      <AppInner />
    </ThemeProvider>
  )
}
