import { Chip, Box, alpha } from '@mui/material'
import {
  PowerSettingsNew,
  PowerOff,
  ErrorOutline,
  WifiOff,
  Videocam,
  Bolt,
} from '@mui/icons-material'

const stateConfig = {
  ON: { label: 'Active', color: '#10B981', bg: alpha('#10B981', 0.08), Icon: PowerSettingsNew },
  OFF: { label: 'Inactive', color: '#64748B', bg: alpha('#64748B', 0.08), Icon: PowerOff },
  ERROR: { label: 'Fault', color: '#EF4444', bg: alpha('#EF4444', 0.08), Icon: ErrorOutline },
  DISCONNECTED: { label: 'Offline', color: '#F59E0B', bg: alpha('#F59E0B', 0.08), Icon: WifiOff },
  ONLINE: { label: 'Streaming', color: '#3B82F6', bg: alpha('#3B82F6', 0.08), Icon: Videocam },
  LIVE: { label: 'Live', color: '#10B981', bg: alpha('#10B981', 0.08), Icon: Videocam },
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
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: color,
              boxShadow: `0 0 6px ${alpha(color, 0.5)}`,
              animation: (status === 'ON' || status === 'ONLINE' || status === 'LIVE')
                ? 'status-pulse 2s ease-in-out infinite'
                : 'none',
            }}
          />
          <Icon sx={{ fontSize: 14, color }} />
        </Box>
      }
      sx={{
        bgcolor: bg,
        color,
        border: `1px solid ${alpha(color, 0.15)}`,
        fontWeight: 600,
        letterSpacing: '0.03em',
        height: size === 'small' ? 26 : 30,
        fontSize: size === 'small' ? '0.68rem' : '0.72rem',
        '& .MuiChip-icon': { mr: 0.3 },
        '& .MuiChip-label': { px: 1 },
      }}
    />
  )
}
