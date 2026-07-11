import { Card, CardContent, Box, Typography, alpha } from '@mui/material'
import {
  Lightbulb,
  Power,
  ToggleOn,
  Iron,
  Videocam,
} from '@mui/icons-material'
import StatusChip from './StatusChip'
import ToggleButton from './ToggleButton'

const typeConfig = {
  light: { label: 'Smart Light', Icon: Lightbulb, color: '#F59E0B', bg: alpha('#F59E0B', 0.08) },
  outlet: { label: 'Outlet', Icon: Power, color: '#3B82F6', bg: alpha('#3B82F6', 0.08) },
  iron: { label: 'Iron', Icon: Iron, color: '#EF4444', bg: alpha('#EF4444', 0.08) },
  switchPanel: { label: 'Switch Panel', Icon: ToggleOn, color: '#8B5CF6', bg: alpha('#8B5CF6', 0.08) },
  camera: { label: 'Camera', Icon: Videocam, color: '#10B981', bg: alpha('#10B981', 0.08) },
}

export default function DeviceCard({ device, onToggle, onViewDetails }) {
  const typeInfo = typeConfig[device.type] || typeConfig.outlet
  const { Icon, color, bg } = typeInfo

  const status = device.type === 'camera'
    ? (device.status || 'ONLINE')
    : (device.status || device.state || 'OFF')

  return (
    <Card
      onClick={() => onViewDetails && onViewDetails(device.id)}
      sx={{
        cursor: 'pointer',
        animation: 'slide-up-stagger 0.5s ease-out',
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: bg,
                border: `1px solid ${alpha(color, 0.15)}`,
              }}
            >
              <Icon sx={{ fontSize: 20, color }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#F1F5F9', lineHeight: 1.3 }}>
                {device.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0, fontSize: '0.68rem' }}>
                {typeInfo.label}
              </Typography>
            </Box>
          </Box>
          <StatusChip status={status} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.2,
            borderTop: `1px solid ${alpha('#3B82F6', 0.06)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: device.lastSeen && (Date.now() - device.lastSeen < 30000) ? '#10B981' : '#475569',
                boxShadow: device.lastSeen && (Date.now() - device.lastSeen < 30000) ? '0 0 6px rgba(16,185,129,0.4)' : 'none',
              }}
            />
            <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem', color: '#475569' }}>
              {device.lastSeen ? `${Math.round((Date.now() - device.lastSeen) / 1000)}s ago` : 'never'}
            </Typography>
          </Box>

          {(device.type === 'outlet' || device.type === 'light' || device.type === 'iron') && (
            <Box onClick={(e) => e.stopPropagation()}>
              <ToggleButton
                checked={device.state === 'ON'}
                onChange={(on) => onToggle(device.id, on ? 'ON' : 'OFF')}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
