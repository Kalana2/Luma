import { useState, useEffect, useCallback } from 'react'
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
  Chip,
} from '@mui/material'
import {
  Home,
  Stairs,
  Roofing,
  ChevronLeft,
  ChevronRight,
  Menu,
} from '@mui/icons-material'

const iconMap = { home: Home, stairs: Stairs, attic: Roofing }

const defaultFloors = [
  { id: 'floor-001', name: 'Ground Floor', icon: 'home', rooms: 2, devices: 2 },
  { id: 'floor-002', name: 'First Floor', icon: 'stairs', rooms: 2, devices: 2 },
  { id: 'floor-003', name: 'Second Floor', icon: 'attic', rooms: 1, devices: 1 },
]

const DRAWER_WIDTH = 250
const COLLAPSED_WIDTH = 64

export default function Sidebar({ selectedFloorId, onFloorSelect }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), [])

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          transition: 'width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '& .MuiDrawer-paper': {
            width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            boxSizing: 'border-box',
            pt: 8,
            overflowX: 'hidden',
            transition: 'width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', px: 1.5, pt: 2.5, pb: 1 }}>
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                color: '#8892B0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#FFA630',
                  background: 'rgba(255,166,48,0.08)',
                },
              }}
            >
              {collapsed ? <Menu fontSize="small" /> : <ChevronLeft fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {!collapsed && (
          <Box sx={{ px: 2.5, pt: 1, pb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.68rem',
                letterSpacing: '0.15em',
                color: '#557A9E',
              }}
            >
              Navigation
            </Typography>
          </Box>
        )}

        <Box sx={{ position: 'relative', px: collapsed ? 1 : 1.5 }}>
          {!collapsed && selectedFloorId && (
            <Box
              sx={{
                position: 'absolute',
                left: 6,
                top: 0,
                width: 3,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(180deg, #FFA630, #2F6690)',
                transition: 'top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 0 12px rgba(255,166,48,0.4)',
                ...(() => {
                  const idx = defaultFloors.findIndex((f) => f.id === selectedFloorId)
                  return { top: idx * 52 + 6 }
                })(),
              }}
            />
          )}

          <List sx={{ p: 0 }}>
            {defaultFloors.map((floor, idx) => {
              const Icon = iconMap[floor.icon] || Home
              const isSelected = selectedFloorId === floor.id

              return (
                <Tooltip key={floor.id} title={collapsed ? floor.name : ''} placement="right">
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onFloorSelect(floor.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.6,
                      py: collapsed ? 1.2 : 1,
                      px: collapsed ? 1 : 2,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      minHeight: 44,
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
                      transition: `all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${idx * 0.08}s`,
                      ...(isSelected
                        ? {
                            background: 'linear-gradient(135deg, rgba(47,102,144,0.25), rgba(47,102,144,0.08))',
                            border: '1px solid rgba(47,102,144,0.25)',
                            '&:hover': { background: 'linear-gradient(135deg, rgba(47,102,144,0.35), rgba(47,102,144,0.12))' },
                          }
                        : {
                            '&:hover': {
                              background: 'rgba(47,102,144,0.08)',
                              border: '1px solid rgba(47,102,144,0.08)',
                            },
                            border: '1px solid transparent',
                          }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 38,
                        color: isSelected ? '#FFA630' : '#5B7FA5',
                        transition: 'all 0.3s ease',
                        justifyContent: 'center',
                        ...(isSelected && {
                          filter: 'drop-shadow(0 0 6px rgba(255,166,48,0.3))',
                        }),
                      }}
                    >
                      <Box
                        sx={{
                          transition: 'transform 0.3s ease',
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                          display: 'flex',
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                    </ListItemIcon>

                    {!collapsed && (
                      <ListItemText
                        primary={floor.name}
                        primaryTypographyProps={{
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 600 : 400,
                          fontFamily: '"Inter", sans-serif',
                          color: isSelected ? '#E4ECF2' : '#8892B0',
                        }}
                        sx={{ mr: 0.5 }}
                      />
                    )}

                    {!collapsed && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {floor.devices > 0 && (
                          <Chip
                            size="small"
                            label={floor.devices}
                            sx={{
                              height: 20,
                              minWidth: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              fontFamily: '"Outfit", sans-serif',
                              bgcolor: isSelected ? 'rgba(255,166,48,0.15)' : 'rgba(47,102,144,0.12)',
                              color: isSelected ? '#FFA630' : '#5B7FA5',
                              '& .MuiChip-label': { px: 0.8 },
                              ...(isSelected && {
                                animation: 'count-pulse 2s ease-in-out infinite',
                              }),
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </ListItemButton>
                </Tooltip>
              )
            })}
          </List>
        </Box>

        {!collapsed && (
          <Box sx={{ px: 2.5, pt: 3, pb: 1, mt: 'auto' }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(47,102,144,0.1), rgba(47,102,144,0.04))',
                border: '1px solid rgba(47,102,144,0.1)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#557A9E', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
                Simulator
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.78rem', color: '#8892B0' }}>
                3 floors &middot; 5 devices
              </Typography>
            </Box>
          </Box>
        )}
      </Drawer>
    </>
  )
}
