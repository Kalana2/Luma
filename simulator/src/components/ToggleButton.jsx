import { useState } from 'react'
import { Switch, Box, Typography, alpha, CircularProgress } from '@mui/material'

export default function ToggleButton({ checked, onChange, disabled = false, label, size = 'normal' }) {
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
        gap: 1,
        px: 1.2,
        py: 0.6,
        borderRadius: 2,
        bgcolor: alpha('#0F172A', 0.6),
        border: `1px solid ${alpha('#3B82F6', 0.08)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha('#3B82F6', 0.2),
        },
      }}
    >
      {label && (
        <Typography
          variant="caption"
          sx={{
            color: checked ? '#93C5FD' : '#64748B',
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: '0.02em',
            fontSize: '0.72rem',
          }}
        >
          {label}
        </Typography>
      )}
      {loading ? (
        <CircularProgress size={18} sx={{ color: '#3B82F6' }} />
      ) : (
        <Switch
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
          size={size}
        />
      )}
    </Box>
  )
}
