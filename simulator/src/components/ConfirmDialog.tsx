import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import { C } from '../theme/colors'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: C.text, pb: 1 }}>
        {title || 'Confirm'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: C.textSecondary }}>
          {message || 'Are you sure?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: C.muted }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {confirmLabel || 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
