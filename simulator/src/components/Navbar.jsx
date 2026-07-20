import { useState, useEffect } from 'react'
import { AppBar, Toolbar, Box, Typography, Chip, Button, Breadcrumbs, alpha, IconButton, Tooltip, Menu, MenuItem, Avatar } from '@mui/material'
import { ChevronRight, Storage, Logout, History, Person } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { seedSampleData } from '../firebase/deviceService'
import useUserProfile from '../hooks/useUserProfile'

const floorNames = { 'floor-001': 'Ground Floor', 'floor-002': 'First Floor', 'floor-003': 'Second Floor' }

export default function Navbar({ userId, connectionStatus, selectedFloorId, onLogout }) {
  const navigate = useNavigate()
  const [seedStatus, setSeedStatus] = useState('idle')
  const [mounted, setMounted] = useState(false)
  const [profileMenu, setProfileMenu] = useState(null)
  const { userData } = useUserProfile(userId)
  const initials = (userData?.name || 'U').charAt(0).toUpperCase()

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const C = {
    gold: '#C9A84C',
    champagne: '#E8D5A3',
    emerald: '#0D9488',
    velvet: '#B76E79',
    purple: '#6D28D9',
    muted: '#7C6B8A',
    dark: '#1A0A2E',
  }

  const statusConfig = {
    connected: { label: 'Connected', color: C.emerald, bg: alpha(C.emerald, 0.08) },
    connecting: { label: 'Connecting', color: C.gold, bg: alpha(C.gold, 0.08) },
    error: { label: 'Offline', color: C.velvet, bg: alpha(C.velvet, 0.08) },
  }
  const status = statusConfig[connectionStatus] || statusConfig.connecting

  const handleSeedData = async () => {
    setSeedStatus('loading')
    try {
      await seedSampleData(userId)
      setSeedStatus('success')
      setTimeout(() => setSeedStatus('idle'), 2500)
    } catch (err) {
      console.error('Seed failed:', err)
      alert('Seed failed: ' + (err.message || err.code))
      setSeedStatus('error')
      setTimeout(() => setSeedStatus('idle'), 3000)
    }
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '72px !important', px: '24px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-8px)', transition: 'all 0.6s ease', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative', width: 40, height: 40 }}>
              <Box sx={{ position: 'absolute', inset: -8, borderRadius: 12, background: 'linear-gradient(135deg, rgba(30,58,95,0.2), rgba(201,168,76,0.08))', filter: 'blur(8px)' }} />
              <Box component="img" src="/logo.png" alt="" sx={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 12px rgba(30,58,95,0.4))' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3, color: C.champagne }}>Luma</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: C.muted, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Hardware Simulator</Typography>
            </Box>
          </Box>
          {selectedFloorId && (
            <Breadcrumbs separator={<ChevronRight sx={{ fontSize: 14 }} />} sx={{ ml: 2, opacity: mounted ? 1 : 0, transition: 'all 0.5s ease 0.15s' }}>
              <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0, color: C.muted, fontWeight: 400 }}>Floors</Typography>
              <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0, color: C.gold, fontWeight: 600 }}>{floorNames[selectedFloorId] || selectedFloorId}</Typography>
            </Breadcrumbs>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="View Logs & Reports" arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<History sx={{ fontSize: 15 }} />}
              onClick={() => navigate('/logs')}
              sx={{
                borderColor: alpha(C.gold, 0.2),
                color: C.gold,
                fontSize: '0.7rem',
                px: 2,
                py: 0.6,
                height: 32,
                fontWeight: 500,
                borderRadius: 8,
                '&:hover': { borderColor: alpha(C.gold, 0.4), color: C.gold, background: alpha(C.gold, 0.04) },
              }}
            >
              Logs
            </Button>
          </Tooltip>
          {seedStatus === 'success' ? (
            <Chip size="small" icon={<Storage sx={{ fontSize: 14 }} />} label="Data Seeded" sx={{ bgcolor: alpha(C.emerald, 0.08), color: C.emerald, border: `1px solid ${alpha(C.emerald, 0.15)}`, fontWeight: 600, fontSize: '0.68rem', height: 30 }} />
          ) : (
            <Button variant="outlined" size="small" startIcon={<Storage sx={{ fontSize: 15 }} />} onClick={handleSeedData} disabled={seedStatus === 'loading'}
              sx={{ borderColor: alpha(C.gold, 0.2), color: C.gold, fontSize: '0.7rem', px: 2, py: 0.6, height: 32, fontWeight: 500, borderRadius: 8, '&:hover': { borderColor: alpha(C.gold, 0.4), color: C.gold, background: alpha(C.gold, 0.04) }, ...(seedStatus === 'loading' && { opacity: 0.7 }) }}>
              {seedStatus === 'loading' ? 'Seeding...' : 'Seed Data'}
            </Button>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8, px: 1.5, borderRadius: 2.5, bgcolor: status.bg, border: `1px solid ${alpha(status.color, 0.15)}`, transition: 'all 0.4s ease' }}>
            <Box sx={{ position: 'relative', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: status.color, position: 'relative', zIndex: 2, boxShadow: connectionStatus === 'connected' ? `0 0 8px ${alpha(status.color, 0.5)}` : 'none', animation: connectionStatus === 'connected' ? 'status-pulse 2.5s ease-in-out infinite' : 'none' }} />
              {connectionStatus === 'connected' && <Box sx={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `1px solid ${alpha(status.color, 0.3)}`, animation: 'ring-expand 1.8s ease-out infinite' }} />}
            </Box>
            <Typography variant="caption" sx={{ color: status.color, textTransform: 'none', letterSpacing: '0.04em', fontWeight: 600, fontSize: '0.68rem' }}>{status.label}</Typography>
          </Box>
          <Tooltip title="Account" arrow>
            <IconButton
              size="small"
              onClick={(e) => setProfileMenu(e.currentTarget)}
              sx={{
                color: C.champagne, width: 34, height: 34,
                borderRadius: 2,
                bgcolor: alpha(C.navy, 0.15),
                border: `1px solid ${alpha(C.gold, 0.1)}`,
                '&:hover': { bgcolor: alpha(C.navy, 0.25), borderColor: alpha(C.gold, 0.2) },
              }}
            >
              <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.7rem', fontWeight: 700 }}>
                {initials}
              </Typography>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileMenu}
            open={!!profileMenu}
            onClose={() => setProfileMenu(null)}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                background: 'linear-gradient(160deg, #1A0A2E, #241040)',
                border: '1px solid rgba(201,168,76,0.08)',
                borderRadius: 3,
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                backgroundImage: 'none',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(C.gold, 0.06)}` }}>
              <Typography sx={{ color: C.champagne, fontSize: '0.82rem', fontWeight: 600 }}>
                {userData?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
                {userData?.email || userId}
              </Typography>
            </Box>
            <MenuItem
              onClick={() => { setProfileMenu(null); navigate('/profile') }}
              sx={{ mx: 1, my: 0.3, borderRadius: 2, color: C.platinum, gap: 1.5, '&:hover': { bgcolor: alpha(C.navy, 0.08), color: C.gold } }}
            >
              <Person sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.8rem' }}>Profile</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => { setProfileMenu(null); onLogout?.() }}
              sx={{ mx: 1, my: 0.3, borderRadius: 2, color: '#BE123C', gap: 1.5, '&:hover': { bgcolor: alpha('#BE123C', 0.08) } }}
            >
              <Logout sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.8rem' }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
