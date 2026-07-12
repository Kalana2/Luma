import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'

const C = { gold: '#C9A84C', champagne: '#E8D5A3', muted: '#7C6B8A' }

export default function AddRoomDialog({ open, onClose, onSave }) {
  const [name, setName] = useState(''); const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return; setSaving(true)
    try { await onSave(name.trim()); setName(''); onClose() } catch (err) { alert('Error: ' + (err.message || 'Save failed')) }
    setSaving(false)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: C.champagne }}>Add Room</DialogTitle>
      <DialogContent>
        <TextField autoFocus label="Room Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" sx={{ mt: 1 }} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: C.muted }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>{saving ? 'Creating...' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  )
}
