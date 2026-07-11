import { useState, useEffect } from 'react'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material'
import { Home, Stairs, Roofing, ChevronLeft, Menu, Layers } from '@mui/icons-material'

const iconMap = { home: Home, stairs: Stairs, attic: Roofing }

const floors = [
  { id: 'floor-001', name: 'Ground Floor', icon: 'home', rooms: 2, devices: 2 },
  { id: 'floor-002', name: 'First Floor', icon: 'stairs', rooms: 2, devices: 2 },
  { id: 'floor-003', name: 'Second Floor', icon: 'attic', rooms: 1, devices: 1 },
]

const DRAWER_WIDTH = 252
const COLLAPSED_WIDTH = 60

export default function Sidebar({ selectedFloorId, onFloorSelect }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const selectedIdx = floors.findIndex((f) => f.id === selectedFloorId)

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
        '& .MuiDrawer-paper': {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: 'border-box',
          pt: 9,
          overflowX: 'hidden',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
          px: collapsed ? 0 : 2.5,
          pt: 2,
          pb: 0,
        }}
      >
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#475569', fontWeight: 600 }}
          >
            Floors
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton
            onClick={() => setCollapsed((c) => !c)}
            size="small"
            sx={{
              color: '#475569',
              width: 28,
              height: 28,
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#93C5FD',
                background: alpha('#3B82F6', 0.08),
              },
            }}
          >
            {collapsed ? <Menu sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ position: 'relative', px: collapsed ? 0.8 : 1.5, pt: 1.5 }}>
        {!collapsed && selectedIdx >= 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: 6,
              width: 3,
              height: 24,
              borderRadius: 3,
              background: 'linear-gradient(180deg, #3B82F6, #6366F1)',
              top: selectedIdx * 50 + 22,
              transition: 'top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 0 12px rgba(59,130,246,0.5)',
            }}
          />
        )}

        <List sx={{ p: 0 }}>
          {floors.map((floor, idx) => {
            const Icon = iconMap[floor.icon] || Home
            const isSelected = selectedFloorId === floor.id

            return (
              <Tooltip
                key={floor.id}
                title={collapsed ? floor.name : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onFloorSelect(floor.id)}
                  disableRipple
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.5,
                    py: collapsed ? 1.1 : 0.9,
                    px: collapsed ? 1 : 1.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    minHeight: 42,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                    transition: `all 0.4s cubic-bezier(0.4,0,0.2,1) ${idx * 0.05}s`,
                    border: '1px solid transparent',
                    ...(isSelected
                      ? {
                          background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.12)}, ${alpha('#6366F1', 0.06)})`,
                          borderColor: alpha('#3B82F6', 0.15),
                          '&:hover': { background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.16)}, ${alpha('#6366F1', 0.08)})` },
                        }
                      : {
                          '&:hover': {
                            background: alpha('#3B82F6', 0.04),
                            borderColor: alpha('#3B82F6', 0.06),
                          },
                        }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 34,
                      color: isSelected ? '#93C5FD' : '#475569',
                      transition: 'all 0.3s ease',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: collapsed ? 20 : 18 }} />
                  </ListItemIcon>

                  {!collapsed && (
                    <>
                      <ListItemText
                        primary={floor.name}
                        primaryTypographyProps={{
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? '#F1F5F9' : '#94A3B8',
                        }}
                        sx={{ my: 0 }}
                      />
                      <Box
                        sx={{
                          minWidth: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isSelected ? alpha('#3B82F6', 0.15) : alpha('#475569', 0.1),
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            color: isSelected ? '#93C5FD' : '#64748B',
                            lineHeight: 1,
                            textTransform: 'none',
                            letterSpacing: 0,
                          }}
                        >
                          {floor.devices}
                        </Typography>
                      </Box>
                    </>
                  )}
                </ListItemButton>
              </Tooltip>
            )
          })}
        </List>
      </Box>

      {!collapsed && (
        <Box sx={{ px: 2, pt: 3, pb: 2, mt: 'auto' }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.06)}, ${alpha('#6366F1', 0.03)})`,
              border: `1px solid ${alpha('#3B82F6', 0.08)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Layers sx={{ fontSize: 14, color: '#475569' }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'none' }}>
                Simulator Status
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                { label: 'Floors', value: 3 },
                { label: 'Devices', value: 5 },
              ].map((stat) => (
                <Box key={stat.label}>
                  <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#F1F5F9', lineHeight: 1.1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
