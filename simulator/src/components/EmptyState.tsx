import { type ReactElement } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { C } from '../theme/colors'

interface EmptyStateProps {
  icon: ReactElement
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        mt: 4,
        py: 8,
        px: 4,
        borderRadius: 3,
        textAlign: 'center',
        border: `1px solid ${C.border}`,
        bgcolor: C.paper,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: C.bg,
          border: `1px solid ${C.border}`,
          mx: 'auto',
          mb: 2.5,
          '& .MuiSvgIcon-root': { fontSize: 24, color: C.muted },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ color: C.textSecondary, fontWeight: 500, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: C.muted, maxWidth: 380, mx: 'auto', mb: action ? 3 : 0 }}>
        {description}
      </Typography>
      {action && (
        <Button variant="contained" size="small" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  )
}
