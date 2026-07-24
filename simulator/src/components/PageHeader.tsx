import { type ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import { C } from '../theme/colors'

interface PageHeaderProps {
  icon: ReactElement
  title: string
  subtitle?: string
}

export default function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: C.blue50,
          border: `1px solid ${C.border}`,
          '& .MuiSvgIcon-root': { fontSize: 20, color: C.primary },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ color: C.text, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: C.muted }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
