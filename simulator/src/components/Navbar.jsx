import { useState, useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Chip,
  Button,
  Breadcrumbs,
  alpha,
} from '@mui/material'
import { ChevronRight, Storage } from '@mui/icons-material'
import { seedSampleData } from '../firebase/deviceService'

const floorNames = {
  'floor-001': 'Ground Floor',
  'floor-002': 'First Floor',
  'floor-003': 'Second Floor',
}

export default function Navbar({ connectionStatus, selectedFloorId }) {
  const [seedStatus, setSeedStatus] = useState('idle')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const statusConfig = {
    connected: { label: 'Live', color: '#10B981', bg: alpha('#10B981', 0.1) },
    connecting: { label: 'Syncing', color: '#F59E0B', bg: alpha('#F59E0B', 0.1) },
    error: { label: 'Offline', color: '#EF4444', bg: alpha('#EF4444', 0.1) },
  }
  const { label: statusLabel, color: statusColor, bg: statusBg } =
    statusConfig[connectionStatus] || statusConfig.connecting

  const handleSeedData = async () => {
    setSeedStatus('loading')
    try {
      const result = await seedSampleData()
      console.log('Seed success:', result)
      setSeedStatus('success')
      setTimeout(() => setSeedStatus('idle'), 2500)
    } catch (err) {
      console.error('Seed failed:', err.message, err.code)
      alert('Seed failed: ' + (err.message || err.code || 'Unknown error') + '\n\nCheck browser console (F12) for details.')
      setSeedStatus('error')
      setTimeout(() => setSeedStatus('idle'), 3000)
    }
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '72px !important', px: '24px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ position: 'relative', width: 40, height: 40 }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))',
                  filter: 'blur(8px)',
                }}
              />
              <Box
                component="img"
                src="/logo.png"
                alt=""
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.4))',
                }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                  color: '#F1F5F9',
                }}
              >
                Luma
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.55rem',
                  color: '#64748B',
                  letterSpacing: '0.16em',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Hardware Simulator
              </Typography>
            </Box>
          </Box>

          {selectedFloorId && (
            <Breadcrumbs
              separator={<ChevronRight sx={{ fontSize: 14 }} />}
              sx={{
                ml: 2,
                opacity: mounted ? 1 : 0,
                transition: 'all 0.5s ease-out 0.15s',
              }}
            >
              <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0, color: '#64748B', fontWeight: 400 }}>
                Floors
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0, color: '#93C5FD', fontWeight: 600 }}>
                {floorNames[selectedFloorId] || selectedFloorId}
              </Typography>
            </Breadcrumbs>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {seedStatus === 'success' ? (
            <Chip
              size="small"
              icon={<Storage sx={{ fontSize: 14 }} />}
              label="Data Seeded"
              sx={{
                bgcolor: alpha('#10B981', 0.08),
                color: '#10B981',
                border: `1px solid ${alpha('#10B981', 0.15)}`,
                fontWeight: 600,
                fontSize: '0.68rem',
                height: 30,
              }}
            />
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Storage sx={{ fontSize: 15 }} />}
              onClick={handleSeedData}
              disabled={seedStatus === 'loading'}
              sx={{
                borderColor: alpha('#3B82F6', 0.2),
                color: '#94A3B8',
                fontSize: '0.7rem',
                px: 2,
                py: 0.6,
                height: 32,
                fontWeight: 500,
                borderRadius: 8,
                '&:hover': {
                  borderColor: alpha('#3B82F6', 0.4),
                  color: '#93C5FD',
                  background: alpha('#3B82F6', 0.04),
                },
                ...(seedStatus === 'loading' && {
                  opacity: 0.7,
                }),
              }}
            >
              {seedStatus === 'loading' ? 'Seeding...' : 'Seed Data'}
            </Button>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.8,
              px: 1.5,
              borderRadius: 2.5,
              bgcolor: statusBg,
              border: `1px solid ${alpha(statusColor, 0.15)}`,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: statusColor,
                boxShadow: connectionStatus === 'connected' ? `0 0 8px ${alpha(statusColor, 0.6)}` : 'none',
                animation: connectionStatus === 'connected' ? 'status-pulse 2.5s ease-in-out infinite' : 'none',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: statusColor,
                textTransform: 'none',
                letterSpacing: '0.04em',
                fontWeight: 600,
                fontSize: '0.68rem',
              }}
            >
              {statusLabel}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
