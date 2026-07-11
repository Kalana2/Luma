import { AppBar, Toolbar, Box, Typography, Chip, Button } from '@mui/material'
import { seedSampleData } from '../firebase/deviceService'

export default function Navbar({ connectionStatus }) {
  const statusConfig = {
    connected: { label: 'Connected', color: 'success', dot: '#2E8B57' },
    connecting: { label: 'Connecting', color: 'warning', dot: '#FFA630' },
    error: { label: 'Disconnected', color: 'error', dot: '#C0392B' },
  }
  const status = statusConfig[connectionStatus] || statusConfig.connecting

  const handleSeedData = async () => {
    try {
      await seedSampleData()
      alert('Sample data seeded! 3 floors, 5 devices created.')
    } catch (err) {
      console.error('Seed failed:', err)
      alert('Seed failed: ' + err.message)
    }
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/logo.png"
            alt=""
            sx={{ width: 32, height: 32, objectFit: 'contain' }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Luma
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#8892B0', letterSpacing: '0.1em' }}>
              Hardware Simulator
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSeedData}
            sx={{
              borderColor: 'rgba(255,166,48,0.3)',
              color: '#FFA630',
              fontSize: '0.75rem',
              px: 2,
              '&:hover': { borderColor: '#FFA630', background: 'rgba(255,166,48,0.08)' },
            }}
          >
            Seed Data
          </Button>
          <Chip
            size="small"
            label={status.label}
            sx={{
              bgcolor: `${status.dot}20`,
              color: status.dot,
              border: `1px solid ${status.dot}40`,
              fontWeight: 600,
              '& .MuiChip-label': { px: 1 },
            }}
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: status.dot,
                  boxShadow: connectionStatus === 'connected' ? `0 0 8px ${status.dot}` : 'none',
                  animation: connectionStatus === 'connected' ? 'status-pulse 2s ease-in-out infinite' : 'none',
                  ml: 0.5,
                }}
              />
            }
          />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
