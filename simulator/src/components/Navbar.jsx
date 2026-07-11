import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Chip,
  Button,
  Breadcrumbs,
} from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { seedSampleData } from '../firebase/deviceService'

const floorNames = {
  'floor-001': 'Ground Floor',
  'floor-002': 'First Floor',
  'floor-003': 'Second Floor',
}

export default function Navbar({ connectionStatus, selectedFloorId }) {
  const location = useLocation()
  const [seedStatus, setSeedStatus] = useState('idle')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const statusConfig = {
    connected: { label: 'Connected', color: '#2E8B57', bg: 'rgba(46,139,87,0.12)' },
    connecting: { label: 'Connecting', color: '#FFA630', bg: 'rgba(255,166,48,0.12)' },
    error: { label: 'Disconnected', color: '#C0392B', bg: 'rgba(192,57,43,0.12)' },
  }
  const status = statusConfig[connectionStatus] || statusConfig.connecting

  const handleSeedData = async () => {
    setSeedStatus('loading')
    try {
      await seedSampleData()
      setSeedStatus('success')
      setTimeout(() => setSeedStatus('idle'), 2000)
    } catch (err) {
      console.error('Seed failed:', err)
      setSeedStatus('error')
      setTimeout(() => setSeedStatus('idle'), 3000)
    }
  }

  const isDevicePage = location.pathname.includes('/device/')

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #2F6690, #FFA630, #2E8B57, #2F6690)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 4s ease-in-out infinite',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'all 0.5s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt=""
              sx={{
                width: 72,
                height: 72,
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 14px rgba(47,102,144,0.5))',
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #E4ECF2, #8892B0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Luma
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontSize: '0.6rem', color: '#8892B0', letterSpacing: '0.12em', lineHeight: 1 }}
              >
                Hardware Simulator
              </Typography>
            </Box>
          </Box>

          {selectedFloorId && (
            <Breadcrumbs
              separator={<ChevronRight sx={{ fontSize: 14, color: '#4490B0' }} />}
              sx={{
                ml: 3,
                opacity: mounted ? 1 : 0,
                transition: 'all 0.5s ease-out 0.15s',
                '& .MuiBreadcrumbs-li': {
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                },
                '& .MuiBreadcrumbs-separator': { mx: 0.8 },
              }}
            >
              <Typography variant="caption" sx={{ color: '#FFA630', fontSize: '0.75rem', textTransform: 'none', letterSpacing: 0 }}>
                Floors
              </Typography>
              <Typography variant="caption" sx={{ color: '#8892B0', fontSize: '0.75rem', textTransform: 'none', letterSpacing: 0 }}>
                {floorNames[selectedFloorId] || selectedFloorId}
              </Typography>
            </Breadcrumbs>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {seedStatus === 'success' ? (
            <Chip
              size="small"
              label="Seeded"
              sx={{
                bgcolor: 'rgba(46,139,87,0.12)',
                color: '#2E8B57',
                border: '1px solid rgba(46,139,87,0.2)',
                fontWeight: 600,
              }}
            />
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={handleSeedData}
              disabled={seedStatus === 'loading'}
              sx={{
                borderColor: 'rgba(255,166,48,0.25)',
                color: '#FFA630',
                fontSize: '0.75rem',
                px: 2.5,
                py: 0.8,
                position: 'relative',
                overflow: 'hidden',
                '&::before': seedStatus === 'loading' ? {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,166,48,0.08), transparent)',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                } : {},
              }}
            >
              {seedStatus === 'error' ? 'Retry Seed' : seedStatus === 'loading' ? 'Seeding...' : 'Seed Demo Data'}
            </Button>
          )}

          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Chip
              size="small"
              label={status.label}
              sx={{
                bgcolor: status.bg,
                color: status.color,
                border: `1px solid ${status.color}30`,
                fontWeight: 600,
                fontFamily: '"Outfit", sans-serif',
                pr: 1.2,
                '& .MuiChip-label': { px: 1 },
              }}
              icon={
                <Box
                  sx={{
                    position: 'relative',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: status.color,
                      boxShadow: connectionStatus === 'connected' ? `0 0 10px ${status.color}` : 'none',
                      animation: connectionStatus === 'connected' ? 'status-pulse 2s ease-in-out infinite' : 'none',
                    }}
                  />
                  {connectionStatus === 'connected' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `1.5px solid ${status.color}40`,
                        animation: 'rotate-slow 3s linear infinite',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          bgcolor: status.color,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              }
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
