import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'
import { C } from '../theme/colors'
import { useToast } from '../contexts/ToastContext'

export default function AddRoomDialog({ open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(name.trim())
      setName('')
      onClose()
    } catch (err) {
      toast.toast('Error: ' + (err.message || 'Save failed'))
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: C.text, pb: 1 }}>
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
          sx={{ mt: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: C.muted }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {saving ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
