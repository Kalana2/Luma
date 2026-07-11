import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Box } from '@mui/material'
import { Home, Stairs, Roofing } from '@mui/icons-material'

const iconMap = { home: Home, stairs: Stairs, attic: Roofing }
const defaultFloors = [
  { id: 'floor-001', name: 'Ground Floor', icon: 'home' },
  { id: 'floor-002', name: 'First Floor', icon: 'stairs' },
  { id: 'floor-003', name: 'Second Floor', icon: 'attic' },
]

export default function Sidebar({ selectedFloorId, onFloorSelect }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', pt: 8 },
      }}
    >
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', letterSpacing: '0.12em' }}>
          Floors
        </Typography>
      </Box>
      <List sx={{ px: 1.5 }}>
        {defaultFloors.map((floor) => {
          const Icon = iconMap[floor.icon] || Home
          return (
            <ListItemButton
              key={floor.id}
              selected={selectedFloorId === floor.id}
              onClick={() => onFloorSelect(floor.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(47,102,144,0.3), rgba(47,102,144,0.1))',
                  border: '1px solid rgba(47,102,144,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, rgba(47,102,144,0.4), rgba(47,102,144,0.15))' },
                },
                '&:hover': {
                  background: 'rgba(47,102,144,0.1)',
                  border: '1px solid rgba(47,102,144,0.1)',
                },
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: selectedFloorId === floor.id ? '#FFA630' : '#8892B0' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={floor.name}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Drawer>
  )
}
