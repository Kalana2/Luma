import { useRef } from 'react'
import { Card, CardContent, Box, Typography, IconButton, alpha } from '@mui/material'
import { Lightbulb, Power, ToggleOn, Iron, Videocam, Delete } from '@mui/icons-material'
import { C, deviceTypeColors } from '../theme/colors'
import StatusChip from './StatusChip'
import ToggleButton from './ToggleButton'

export default function DeviceCard({ device, onToggle, onViewDetails, onDelete, style }) {
  const cardRef = useRef(null)

  const typeInfo = deviceTypeColors[device.type] || deviceTypeColors.outlet
  const { color, bg, label: typeLabel } = typeInfo
  const typeIcons = { light: Lightbulb, outlet: Power, iron: Iron, switchPanel: ToggleOn, camera: Videocam }
  const IconComp = typeIcons[device.type] || Power
  const status = device.type === 'camera' ? (device.status || 'ONLINE') : (device.status || device.state || 'OFF')

  return (
    <Card
      ref={cardRef}
      onClick={() => onViewDetails?.(device.id)}
      className="card-stagger"
      sx={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: alpha(color, 0.2),
          '& .device-delete-btn': { opacity: 1 },
        },
        ...style,
      }}
    >
      {onDelete && (
        <IconButton
          className="device-delete-btn"
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(device.id) }}
          aria-label="Delete device"
          sx={{
            position: 'absolute', top: 6, right: 6, zIndex: 10,
            width: 28, height: 28, opacity: 0, transition: 'opacity 0.2s ease',
            color: alpha(C.error, 0.5),
            bgcolor: alpha(C.paper, 0.9),
            backdropFilter: 'blur(4px)',
            '&:hover': { color: C.error, bgcolor: C.red50 },
          }}
        >
          <Delete sx={{ fontSize: 15 }} />
        </IconButton>
      )}
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38, height: 38, borderRadius: 2.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: bg,
                border: `1px solid ${alpha(color, 0.2)}`,
              }}
            >
              <IconComp sx={{ fontSize: 20, color }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: C.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                {device.name}
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted, textTransform: 'none', letterSpacing: 0, fontSize: '0.68rem' }}>
                {typeLabel}
              </Typography>
            </Box>
          </Box>
          <StatusChip status={status} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.2, borderTop: `1px solid ${C.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: device.lastSeen && (Date.now() - device.lastSeen < 30000) ? C.success : C.muted }} />
            <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem', color: C.muted }}>
              {device.lastSeen ? `${Math.round((Date.now() - device.lastSeen) / 1000)}s ago` : 'never'}
            </Typography>
          </Box>
          {(device.type === 'outlet' || device.type === 'light' || device.type === 'iron') && (
            <Box onClick={(e) => e.stopPropagation()}>
              <ToggleButton checked={device.state === 'ON'} onChange={(on) => onToggle(device.id, on ? 'ON' : 'OFF')} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
