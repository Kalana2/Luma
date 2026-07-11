import { Box, Button, Menu, MenuItem, Typography, alpha } from '@mui/material'
import { useState } from 'react'
import { KeyboardArrowDown, Home, Stairs, Roofing } from '@mui/icons-material'

const iconMap = { home: Home, stairs: Stairs, attic: Roofing }

export default function FloorSelector({ floors, selectedFloorId, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const selectedFloor = floors.find((f) => f.id === selectedFloorId)
  const Icon = selectedFloor ? iconMap[selectedFloor.icon] || Home : Home

  const handleClick = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleSelect = (floorId) => {
    onSelect(floorId)
    handleClose()
  }

  return (
    <Box>
      <Button
        onClick={handleClick}
        endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
        startIcon={selectedFloor && <Icon sx={{ fontSize: 18 }} />}
        sx={{
          color: '#F1F5F9',
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          fontSize: '0.85rem',
          textTransform: 'none',
          letterSpacing: '0.02em',
          px: 2,
          py: 1,
          borderRadius: 2.5,
          border: `1px solid ${alpha('#3B82F6', 0.12)}`,
          bgcolor: alpha('#0F172A', 0.6),
          '&:hover': {
            borderColor: alpha('#3B82F6', 0.3),
            bgcolor: alpha('#0F172A', 0.8),
          },
        }}
      >
        {selectedFloor ? selectedFloor.name : 'Select Floor'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            background: 'linear-gradient(160deg, #0F172A, #1E293B)',
            border: '1px solid rgba(59,130,246,0.12)',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            backgroundImage: 'none',
          },
        }}
      >
        {floors.map((floor) => {
          const FIcon = iconMap[floor.icon] || Home
          const isSelected = floor.id === selectedFloorId
          return (
            <MenuItem
              key={floor.id}
              onClick={() => handleSelect(floor.id)}
              sx={{
                mx: 1,
                my: 0.3,
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                color: isSelected ? '#F1F5F9' : '#94A3B8',
                bgcolor: isSelected ? alpha('#3B82F6', 0.1) : 'transparent',
                border: isSelected ? `1px solid ${alpha('#3B82F6', 0.15)}` : '1px solid transparent',
                '&:hover': {
                  bgcolor: alpha('#3B82F6', 0.06),
                },
              }}
            >
              <FIcon sx={{ fontSize: 18, mr: 1.5, color: isSelected ? '#93C5FD' : '#475569' }} />
              <Typography sx={{ flexGrow: 1, fontSize: '0.82rem', fontWeight: isSelected ? 600 : 400 }}>
                {floor.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0, fontSize: '0.65rem' }}>
                {floor.rooms} rooms
              </Typography>
            </MenuItem>
          )
        })}
      </Menu>
    </Box>
  )
}
