import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
  Divider,
} from '@mui/material'
import { HomeOutlined, StorageOutlined, SecurityOutlined, LayersOutlined } from '@mui/icons-material'

const C = { gold: '#C9A84C', navy: '#1E3A5F', champagne: '#E8D5A3', muted: '#7C6B8A', platinum: '#C4B5D0', dark: '#0A1628' }

const features = [
  { Icon: LayersOutlined, label: 'Multi-Floor Management', desc: 'Organize devices across floors and rooms' },
  { Icon: StorageOutlined, label: 'Real-Time Sync', desc: 'Live device state via Firebase Realtime Database' },
  { Icon: SecurityOutlined, label: 'Device Simulation', desc: 'Simulate errors, disconnections, and auto-shutdown' },
  { Icon: HomeOutlined, label: 'Smart Controls', desc: 'Toggle, schedule, and monitor all smart devices' },
]

export default function AboutDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: C.champagne, fontSize: '1.2rem' }}>
          About Luma Simulator
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ color: C.platinum, mb: 2, lineHeight: 1.6 }}>
          Luma is a smart home monitoring and control system simulator. It demonstrates real-time device management
          with Firebase integration, supporting lights, outlets, irons, switch panels, and cameras across multiple floors.
        </Typography>

        <Divider sx={{ borderColor: alpha(C.gold, 0.06), my: 2 }} />

        <Typography variant="caption" sx={{ color: C.gold, fontWeight: 600, mb: 1.5, display: 'block' }}>
          FEATURES
        </Typography>

        {features.map(({ Icon, label, desc }, i) => (
          <Box
            key={label}
            sx={{
              display: 'flex',
              gap: 1.5,
              mb: 1.5,
              opacity: 0,
              animation: 'fade-slide-up 0.4s ease-out both',
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(C.navy, 0.08),
                border: `1px solid ${alpha(C.gold, 0.08)}`,
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 16, color: C.gold }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', color: C.champagne }}>
                {label}
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted, textTransform: 'none', letterSpacing: 0, fontSize: '0.68rem' }}>
                {desc}
              </Typography>
            </Box>
          </Box>
        ))}

        <Divider sx={{ borderColor: alpha(C.gold, 0.06), my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.6rem' }}>
            Luma Smart Home Simulator &middot; v1.0.0 &middot; Built with React + Firebase
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{
            borderColor: alpha(C.gold, 0.12),
            color: C.platinum,
            '&:hover': { borderColor: alpha(C.gold, 0.25), color: C.gold },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
