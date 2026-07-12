import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, Box, Typography, alpha } from '@mui/material'
import { Lightbulb, Power, ToggleOn, Iron, Videocam } from '@mui/icons-material'
import StatusChip from './StatusChip'
import ToggleButton from './ToggleButton'

const C = {
  gold: '#C9A84C', navy: '#1E3A5F', emerald: '#0D9488', violet: '#2D5A8C',
  velvet: '#0F1D35', muted: '#7C6B8A', champagne: '#E8D5A3', platinum: '#C4B5D0',
}

const typeConfig = {
  light: { label: 'Smart Light', Icon: Lightbulb, color: C.gold, bg: alpha(C.gold, 0.08) },
  outlet: { label: 'Outlet', Icon: Power, color: C.navy, bg: alpha(C.navy, 0.08) },
  iron: { label: 'Iron', Icon: Iron, color: '#BE123C', bg: alpha('#BE123C', 0.08) },
  switchPanel: { label: 'Switch Panel', Icon: ToggleOn, color: C.violet, bg: alpha(C.violet, 0.08) },
  camera: { label: 'Camera', Icon: Videocam, color: C.emerald, bg: alpha(C.emerald, 0.08) },
}

export default function DeviceCard({ device, onToggle, onViewDetails, style }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState(false)

  const typeInfo = typeConfig[device.type] || typeConfig.outlet
  const { Icon, color, bg } = typeInfo
  const status = device.type === 'camera' ? (device.status || 'ONLINE') : (device.status || device.state || 'OFF')

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setTilt({ x: ((e.clientY - rect.top) / rect.height - 0.5) * -8, y: ((e.clientX - rect.left) / rect.width - 0.5) * 8 })
    setGlow(true)
  }, [])

  const handleMouseLeave = useCallback(() => { setTilt({ x: 0, y: 0 }); setGlow(false) }, [])

  return (
    <Card ref={cardRef} onClick={() => onViewDetails?.(device.id)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className="card-stagger"
      sx={{
        cursor: 'pointer', position: 'relative', overflow: 'visible',
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.45s ease',
        ...style,
        '&::before': { content: '""', position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${alpha(C.gold, 0.4)}, transparent)`, opacity: glow ? 1 : 0, transition: 'opacity 0.4s ease' },
      }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: bg, border: `1px solid ${alpha(color, 0.15)}`, transition: 'all 0.3s ease', transform: glow ? 'scale(1.08)' : 'scale(1)', boxShadow: glow ? `0 0 16px ${alpha(color, 0.3)}` : 'none' }}>
              <Icon sx={{ fontSize: 20, color }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: C.champagne, lineHeight: 1.3 }}>{device.name}</Typography>
              <Typography variant="caption" sx={{ color: C.muted, textTransform: 'none', letterSpacing: 0, fontSize: '0.68rem' }}>{typeInfo.label}</Typography>
            </Box>
          </Box>
          <StatusChip status={status} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.2, borderTop: '1px solid rgba(201,168,76,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ position: 'relative', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: device.lastSeen && (Date.now() - device.lastSeen < 30000) ? C.emerald : '#4A3A6A', boxShadow: device.lastSeen && (Date.now() - device.lastSeen < 30000) ? '0 0 6px rgba(13,148,136,0.4)' : 'none', position: 'relative', zIndex: 1 }} />
              {device.lastSeen && (Date.now() - device.lastSeen < 30000) && <Box sx={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1px solid rgba(13,148,136,0.3)', animation: 'ring-expand 1.5s ease-out infinite' }} />}
            </Box>
            <Typography variant="caption" sx={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem', color: C.muted }}>{device.lastSeen ? `${Math.round((Date.now() - device.lastSeen) / 1000)}s ago` : 'never'}</Typography>
          </Box>
          {(device.type === 'outlet' || device.type === 'light' || device.type === 'iron') && (
            <Box onClick={(e) => e.stopPropagation()}><ToggleButton checked={device.state === 'ON'} onChange={(on) => onToggle(device.id, on ? 'ON' : 'OFF')} /></Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
