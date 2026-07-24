import { Box, Typography, alpha, IconButton, Tooltip } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'
import { C } from '../theme/colors'

export default function Footer({ onAboutClick }) {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        pt: 2.5,
        pb: 2,
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.65rem' }}>
        &copy; {new Date().getFullYear()} Luma Smart Home Simulator
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="caption" sx={{ color: alpha(C.muted, 0.6), fontSize: '0.58rem' }}>
          v1.0.0
        </Typography>
        <Tooltip title="About Luma Simulator" arrow>
          <IconButton
            size="small"
            onClick={onAboutClick}
            aria-label="About"
            sx={{
              color: C.muted,
              width: 24,
              height: 24,
              '&:hover': { color: C.primary, bgcolor: alpha(C.primary, 0.06) },
            }}
          >
            <InfoOutlined sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
