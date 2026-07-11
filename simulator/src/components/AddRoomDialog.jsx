import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  alpha,
} from '@mui/material'

export default function AddRoomDialog({ open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(name.trim())
      setName('')
      onClose()
    } catch (err) {
      alert('Error: ' + (err.message || 'Save failed'))
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: '#F1F5F9' }}>
        Add Room
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Room Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              '& fieldset': { borderColor: alpha('#3B82F6', 0.12) },
              '&:hover fieldset': { borderColor: alpha('#3B82F6', 0.3) },
              '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
            },
            '& .MuiInputLabel-root': { color: '#64748B' },
            '& input': { color: '#F1F5F9' },
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#64748B' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim() || saving}
        >
          {saving ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
