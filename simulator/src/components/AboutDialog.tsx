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
import { C } from '../theme/colors'

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
        <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: C.text, fontSize: '1.2rem' }}>
          About Luma Simulator
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ color: C.textSecondary, mb: 2, lineHeight: 1.6 }}>
          Luma is a smart home monitoring and control system simulator. It demonstrates real-time device management
          with Firebase integration, supporting lights, outlets, irons, switch panels, and cameras across multiple floors.
        </Typography>

        <Divider sx={{ borderColor: C.border, my: 2 }} />

        <Typography variant="caption" sx={{ color: C.primary, fontWeight: 600, mb: 1.5, display: 'block' }}>
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
                bgcolor: C.blue50,
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 16, color: C.primary }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', color: C.text }}>
                {label}
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted, textTransform: 'none', letterSpacing: 0, fontSize: '0.68rem' }}>
                {desc}
              </Typography>
            </Box>
          </Box>
        ))}

        <Divider sx={{ borderColor: C.border, my: 2 }} />

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
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
