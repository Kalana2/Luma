import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: '#E8D5A3' }}>{title || 'Confirm'}</DialogTitle>
      <DialogContent><DialogContentText sx={{ color: '#C4B5D0' }}>{message || 'Are you sure?'}</DialogContentText></DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#7C6B8A' }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ background: 'linear-gradient(135deg, #BE123C, #9A0F30)', '&:hover': { background: 'linear-gradient(135deg, #D41A4A, #BE123C)' } }}>{confirmLabel || 'Delete'}</Button>
      </DialogActions>
    </Dialog>
  )
}
