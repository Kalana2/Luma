import { useState } from 'react'
import { Switch, Box, CircularProgress, alpha } from '@mui/material'
import { C } from '../theme/colors'

export default function ToggleButton({ checked, onChange, disabled = false }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e) => {
    if (disabled || loading) return
    setLoading(true)
    try {
      await onChange(e.target.checked)
    } finally {
      setTimeout(() => setLoading(false), 400)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.2,
        py: 0.4,
        borderRadius: 2,
        bgcolor: C.bg,
        border: `1px solid ${C.border}`,
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: C.primaryLight },
      }}
    >
      {loading ? (
        <CircularProgress size={18} sx={{ color: C.primary }} />
      ) : (
        <Switch checked={checked} onChange={handleToggle} disabled={disabled} />
      )}
    </Box>
  )
}
