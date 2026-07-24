import { Chip, Box, alpha } from '@mui/material'
import { PowerSettingsNew, PowerOff, ErrorOutline, WifiOff, Videocam } from '@mui/icons-material'
import { statusColors } from '../theme/colors'

const stateConfig = {
  ON: { label: 'Active', ...statusColors.ON, Icon: PowerSettingsNew },
  OFF: { label: 'Inactive', ...statusColors.OFF, Icon: PowerOff },
  ERROR: { label: 'Fault', ...statusColors.ERROR, Icon: ErrorOutline },
  DISCONNECTED: { label: 'Offline', ...statusColors.DISCONNECTED, Icon: WifiOff },
  ONLINE: { label: 'Streaming', ...statusColors.ONLINE, Icon: Videocam },
  LIVE: { label: 'Live', ...statusColors.LIVE, Icon: Videocam },
}

export default function StatusChip({ status, size = 'small' }) {
  const config = stateConfig[status] || stateConfig.OFF
  const { label, color, Icon } = config

  return (
    <Chip
      size={size as 'small' | 'medium'}
      label={label}
      icon={
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, mr: 0.5 }} />
        </Box>
      }
      sx={{
        bgcolor: alpha(color, 0.06),
        color,
        border: `1px solid ${alpha(color, 0.15)}`,
        fontWeight: 600,
        letterSpacing: '0.02em',
        height: size === 'small' ? 26 : 30,
        fontSize: size === 'small' ? '0.68rem' : '0.72rem',
        '& .MuiChip-icon': { mr: 0.3 },
        '& .MuiChip-label': { px: 1 },
      }}
    />
  )
}
