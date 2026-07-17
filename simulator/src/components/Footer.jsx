import { Box, Typography, alpha, IconButton, Tooltip } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'

const C = { gold: '#C9A84C', muted: '#7C6B8A', champagne: '#E8D5A3', dark: '#0A1628', navy: '#1E3A5F' }

export default function Footer({ onAboutClick }) {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        pt: 2.5,
        pb: 2,
        px: 2,
        borderTop: `1px solid ${alpha(C.gold, 0.06)}`,
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
          v1.0.0 &middot; Simulator
        </Typography>
        <Tooltip title="About Luma Simulator" arrow>
          <IconButton
            size="small"
            onClick={onAboutClick}
            sx={{
              color: C.muted,
              width: 24,
              height: 24,
              '&:hover': { color: C.gold, bgcolor: alpha(C.gold, 0.06) },
            }}
          >
            <InfoOutlined sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
