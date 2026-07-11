import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: '#F1F5F9' }}>
        {title || 'Confirm'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#94A3B8' }}>
          {message || 'Are you sure?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#64748B' }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            '&:hover': { background: 'linear-gradient(135deg, #F87171, #EF4444)' },
          }}
        >
          {confirmLabel || 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
