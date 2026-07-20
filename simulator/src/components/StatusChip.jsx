import { Chip, Box, alpha } from '@mui/material'
import { PowerSettingsNew, PowerOff, ErrorOutline, WifiOff, Videocam } from '@mui/icons-material'

const C = {
  on: '#0D9488',
  off: '#7C6B8A',
  error: '#BE123C',
  disconnected: '#C9A84C',
  online: '#1E3A5F',
}

const stateConfig = {
  ON: { label: 'Active', color: C.on, bg: alpha(C.on, 0.08), Icon: PowerSettingsNew },
  OFF: { label: 'Inactive', color: C.off, bg: alpha(C.off, 0.08), Icon: PowerOff },
  ERROR: { label: 'Fault', color: C.error, bg: alpha(C.error, 0.08), Icon: ErrorOutline },
  DISCONNECTED: { label: 'Offline', color: C.disconnected, bg: alpha(C.disconnected, 0.08), Icon: WifiOff },
  ONLINE: { label: 'Streaming', color: C.online, bg: alpha(C.online, 0.08), Icon: Videocam },
  LIVE: { label: 'Live', color: C.on, bg: alpha(C.on, 0.08), Icon: Videocam },
}

export default function StatusChip({ status, size = 'small' }) {
  const config = stateConfig[status] || stateConfig.OFF
  const { label, color, bg, Icon } = config

  return (
    <Chip
      size={size}
      label={label}
      icon={
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5, gap: 0.8 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 6px ${alpha(color, 0.5)}`, animation: (status === 'ON' || status === 'ONLINE' || status === 'LIVE') ? 'status-pulse 2s ease-in-out infinite' : 'none' }} />
          <Icon sx={{ fontSize: 14, color }} />
        </Box>
      }
      sx={{
        bgcolor: bg, color, border: `1px solid ${alpha(color, 0.15)}`, fontWeight: 600,
        letterSpacing: '0.03em', height: size === 'small' ? 26 : 30,
        fontSize: size === 'small' ? '0.68rem' : '0.72rem',
        '& .MuiChip-icon': { mr: 0.3 }, '& .MuiChip-label': { px: 1 },
      }}
    />
  )
}
