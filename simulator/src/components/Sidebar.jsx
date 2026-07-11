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
  Skeleton,
  Menu,
  MenuItem,
  alpha,
} from '@mui/material'
import {
  Home,
  Stairs,
  Roofing,
  ChevronLeft,
  Menu as MenuIcon,
  Layers,
  Add,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material'
import useFloorList from '../hooks/useFloorList'
import { addFloor, updateFloor, deleteFloor } from '../firebase/deviceService'
import AddFloorDialog from './AddFloorDialog'
import ConfirmDialog from './ConfirmDialog'

const iconMap = { home: Home, stairs: Stairs, attic: Roofing, apartment: Home, villa: Home, office: Home }
const DRAWER_WIDTH = 252
const COLLAPSED_WIDTH = 60

export default function Sidebar({ selectedFloorId, onFloorSelect }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [addFloorOpen, setAddFloorOpen] = useState(false)
  const [editFloorOpen, setEditFloorOpen] = useState(false)
  const [editingFloor, setEditingFloor] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingFloorId, setDeletingFloorId] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuFloorId, setMenuFloorId] = useState(null)
  const { floors, loading } = useFloorList()

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const selectedIdx = floors.findIndex((f) => f.id === selectedFloorId)

  const handleAddFloor = async (data) => {
    await addFloor(data.name, data.icon)
  }

  const handleEditFloor = async (data) => {
    await updateFloor(editingFloor.id, data)
    setEditingFloor(null)
  }

  const handleDeleteFloor = async () => {
    if (deletingFloorId) {
      await deleteFloor(deletingFloorId)
      if (selectedFloorId === deletingFloorId) onFloorSelect(null)
      setDeletingFloorId(null)
    }
  }

  const openMenu = (e, floorId) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
    setMenuFloorId(floorId)
  }

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuFloorId(null)
  }

  return (
    <>
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
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!collapsed && (
              <Tooltip title="Add Floor">
                <IconButton
                  size="small"
                  onClick={() => setAddFloorOpen(true)}
                  sx={{
                    color: '#475569',
                    width: 28,
                    height: 28,
                    '&:hover': { color: '#93C5FD', bgcolor: alpha('#3B82F6', 0.08) },
                  }}
                >
                  <Add sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
              <IconButton
                onClick={() => setCollapsed((c) => !c)}
                size="small"
                sx={{
                  color: '#475569',
                  width: 28,
                  height: 28,
                  '&:hover': { color: '#93C5FD', bgcolor: alpha('#3B82F6', 0.08) },
                }}
              >
                {collapsed ? <MenuIcon sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Box>
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

          {loading ? (
            <Box sx={{ px: collapsed ? 0.5 : 1.5 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" height={42} sx={{ mb: 0.5, borderRadius: 2.5 }} />
              ))}
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {floors.map((floor, idx) => {
                const Icon = iconMap[floor.icon] || Home
                const isSelected = selectedFloorId === floor.id

                return (
                  <Tooltip key={floor.id} title={collapsed ? floor.name : ''} placement="right" arrow>
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
                        position: 'relative',
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
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, floor.id)}
                            sx={{
                              ml: 0.5,
                              color: isSelected ? '#64748B' : '#475569',
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              '.MuiListItemButton-root:hover &': { opacity: 1 },
                              '&:hover': { color: '#93C5FD', bgcolor: alpha('#3B82F6', 0.08) },
                            }}
                          >
                            <MoreVert sx={{ fontSize: 16 }} />
                          </IconButton>
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                )
              })}
            </List>
          )}
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
                  { label: 'Floors', value: floors.length },
                  { label: 'Devices', value: floors.reduce((sum, f) => sum + (f.devices || 0), 0) },
                ].map((stat) => (
                  <Box key={stat.label}>
                    <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#F1F5F9', lineHeight: 1.1 }}>
                      {loading ? '-' : stat.value}
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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 160,
            background: 'linear-gradient(160deg, #0F172A, #1E293B)',
            border: '1px solid rgba(59,130,246,0.12)',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            backgroundImage: 'none',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            closeMenu()
            const floor = floors.find((f) => f.id === menuFloorId)
            setEditingFloor(floor)
            setEditFloorOpen(true)
          }}
          sx={{
            mx: 1,
            my: 0.3,
            borderRadius: 2,
            color: '#94A3B8',
            gap: 1.5,
            '&:hover': { bgcolor: alpha('#3B82F6', 0.08), color: '#93C5FD' },
          }}
        >
          <Edit sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: '0.8rem' }}>Edit Floor</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu()
            setDeletingFloorId(menuFloorId)
            setDeleteConfirmOpen(true)
          }}
          sx={{
            mx: 1,
            my: 0.3,
            borderRadius: 2,
            color: '#EF4444',
            gap: 1.5,
            '&:hover': { bgcolor: alpha('#EF4444', 0.08), color: '#F87171' },
          }}
        >
          <Delete sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: '0.8rem' }}>Delete Floor</Typography>
        </MenuItem>
      </Menu>

      <AddFloorDialog
        open={addFloorOpen}
        onClose={() => setAddFloorOpen(false)}
        onSave={handleAddFloor}
      />

      <AddFloorDialog
        open={editFloorOpen}
        onClose={() => { setEditFloorOpen(false); setEditingFloor(null) }}
        onSave={handleEditFloor}
        initialData={editingFloor}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setDeletingFloorId(null) }}
        onConfirm={handleDeleteFloor}
        title="Delete Floor"
        message="This will permanently delete this floor and all its rooms and devices. This action cannot be undone."
        confirmLabel="Delete Floor"
      />
    </>
  )
}
