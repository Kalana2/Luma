import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, alpha } from '@mui/material'
import { Home, Stairs, Roofing, Apartment, Villa, Business } from '@mui/icons-material'

const C = { gold: '#C9A84C', navy: '#1E3A5F', champagne: '#E8D5A3', muted: '#7C6B8A', platinum: '#C4B5D0' }
const icons = [
  { value: 'home', Icon: Home, label: 'Home' }, { value: 'stairs', Icon: Stairs, label: 'Stairs' },
  { value: 'attic', Icon: Roofing, label: 'Attic' }, { value: 'apartment', Icon: Apartment, label: 'Apt' },
  { value: 'villa', Icon: Villa, label: 'Villa' }, { value: 'office', Icon: Business, label: 'Office' },
]

export default function AddFloorDialog({ open, onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || '')
  const [icon, setIcon] = useState(initialData?.icon || 'home')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => { if (!name.trim()) return; setSaving(true); await onSave({ name: name.trim(), icon }); setSaving(false); setName(''); setIcon('home'); onClose() }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: C.champagne }}>{initialData ? 'Edit Floor' : 'Add Floor'}</DialogTitle>
      <DialogContent>
        <TextField autoFocus label="Floor Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" sx={{ mt: 1 }} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
        <Typography variant="caption" sx={{ display: 'block', mt: 2, mb: 1, color: C.muted, textTransform: 'none', letterSpacing: 0 }}>Icon</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {icons.map(({ value, Icon, label }) => (
            <Box key={value} onClick={() => setIcon(value)} sx={{ p: 1.2, borderRadius: 2.5, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, bgcolor: icon === value ? alpha(C.navy, 0.12) : 'transparent', border: icon === value ? `1px solid ${alpha(C.gold, 0.3)}` : '1px solid transparent', transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha(C.navy, 0.06) } }}>
              <Icon sx={{ fontSize: 24, color: icon === value ? C.gold : C.muted }} />
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: icon === value ? C.gold : C.muted, textTransform: 'none', letterSpacing: 0 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: C.muted }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>{saving ? 'Saving...' : initialData ? 'Update' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  )
}
