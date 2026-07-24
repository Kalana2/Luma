import { useState, useEffect } from 'react'
import { AppBar, Toolbar, Box, Typography, Chip, Button, alpha, IconButton, Tooltip, Menu, MenuItem } from '@mui/material'
import { Storage, Logout, Person, Home } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { seedSampleData } from '../firebase/deviceService'
import useUserProfile from '../hooks/useUserProfile'
import { C } from '../theme/colors'

export default function Navbar({ userId, connectionStatus, selectedFloorId, onLogout }) {
  const navigate = useNavigate()
  const [seedStatus, setSeedStatus] = useState('idle')
  const [mounted, setMounted] = useState(false)
  const [profileMenu, setProfileMenu] = useState(null)
  const { userData } = useUserProfile(userId)
  const initials = (userData?.name || 'U').charAt(0).toUpperCase()

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const statusConfig = {
    connected: { label: 'Connected', color: C.success, bg: C.green50 },
    connecting: { label: 'Connecting', color: C.warning, bg: C.amber50 },
    error: { label: 'Offline', color: C.error, bg: C.red50 },
  }
  const status = statusConfig[connectionStatus] || statusConfig.connecting

  const handleSeedData = async () => {
    setSeedStatus('loading')
    try {
      await seedSampleData(userId)
      setSeedStatus('success')
      setTimeout(() => setSeedStatus('idle'), 2500)
    } catch {
      setSeedStatus('error')
      setTimeout(() => setSeedStatus('idle'), 3000)
    }
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: { xs: '16px !important', md: '24px !important' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box sx={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-8px)', transition: 'all 0.6s ease', display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box component="img" src="/logo.png" alt="" sx={{ width: 32, height: 32, objectFit: 'contain' }} />
            <Box sx={{ lineHeight: 1 }}>
              <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, color: C.text }}>
                Luma
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: C.muted, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
                Simulator
              </Typography>
            </Box>
          </Box>
          {selectedFloorId && (
            <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.7rem', display: { xs: 'none', sm: 'block' } }}>
              /
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Dashboard" arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Home sx={{ fontSize: 15 }} />}
              onClick={() => navigate('/')}
              sx={{ fontSize: '0.7rem', px: 1.5, py: 0.6, height: 32, fontWeight: 500, borderRadius: 8, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Dashboard
            </Button>
          </Tooltip>
          {seedStatus === 'success' ? (
            <Chip size="small" icon={<Storage sx={{ fontSize: 14 }} />} label="Seeded" sx={{ bgcolor: C.green50, color: C.success, border: `1px solid ${alpha(C.success, 0.15)}`, fontWeight: 600, fontSize: '0.68rem', height: 30 }} />
          ) : (
            <Button variant="outlined" size="small" startIcon={<Storage sx={{ fontSize: 15 }} />} onClick={handleSeedData} disabled={seedStatus === 'loading'}
              sx={{ fontSize: '0.7rem', px: 1.5, py: 0.6, height: 32, fontWeight: 500, borderRadius: 8, display: { xs: 'none', sm: 'inline-flex' }, ...(seedStatus === 'loading' && { opacity: 0.7 }) }}>
              {seedStatus === 'loading' ? 'Seeding...' : 'Seed Data'}
            </Button>
          )}
          <Tooltip title={status.label} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1.2, borderRadius: 2, bgcolor: status.bg, border: `1px solid ${alpha(status.color, 0.15)}` }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: status.color }} />
              <Typography variant="caption" sx={{ color: status.color, fontSize: '0.65rem', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                {status.label}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Account" arrow>
            <IconButton
              size="small"
              onClick={(e) => setProfileMenu(e.currentTarget)}
              sx={{
                color: C.text, width: 34, height: 34,
                borderRadius: 2,
                bgcolor: C.bg,
                border: `1px solid ${C.border}`,
                '&:hover': { bgcolor: C.blue50, borderColor: C.primaryLight },
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
            PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${C.divider}` }}>
              <Typography sx={{ color: C.text, fontSize: '0.82rem', fontWeight: 600 }}>
                {userData?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
                {userData?.email || userId}
              </Typography>
            </Box>
            <MenuItem
              onClick={() => { setProfileMenu(null); navigate('/profile') }}
              sx={{ mx: 1, my: 0.3, borderRadius: 2, color: C.textSecondary, gap: 1.5, '&:hover': { bgcolor: C.blue50, color: C.primary } }}
            >
              <Person sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.8rem' }}>Profile</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => { setProfileMenu(null); onLogout?.() }}
              sx={{ mx: 1, my: 0.3, borderRadius: 2, color: C.error, gap: 1.5, '&:hover': { bgcolor: C.red50 } }}
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
