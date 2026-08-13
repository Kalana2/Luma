import { useState } from 'react'
import { Switch, Box, Typography, alpha, CircularProgress } from '@mui/material'

export default function ToggleButton({ checked, onChange, disabled = false, label }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e) => {
    if (disabled || loading) return
    setLoading(true)
    try { await onChange(e.target.checked) } finally { setTimeout(() => setLoading(false), 400) }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.2, py: 0.6, borderRadius: 2, bgcolor: alpha('#1A0A2E', 0.6), border: '1px solid rgba(201,168,76,0.06)', transition: 'all 0.3s ease', '&:hover': { borderColor: 'rgba(201,168,76,0.15)' } }}>
      {label && <Typography variant="caption" sx={{ color: checked ? '#C9A84C' : '#7C6B8A', fontWeight: 500, textTransform: 'none', letterSpacing: '0.02em', fontSize: '0.72rem' }}>{label}</Typography>}
      {loading ? <CircularProgress size={18} sx={{ color: '#1E3A5F' }} /> : <Switch checked={checked} onChange={handleToggle} disabled={disabled} />}
    </Box>
  )
}
