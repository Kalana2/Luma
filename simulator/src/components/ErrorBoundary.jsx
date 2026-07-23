import { Component } from 'react'
import { Box, Typography, Button, alpha } from '@mui/material'
import { WarningAmber, Refresh } from '@mui/icons-material'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 440 }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: alpha('#BE123C', 0.1), border: `1px solid ${alpha('#BE123C', 0.15)}`,
              }}
            >
              <WarningAmber sx={{ fontSize: 28, color: '#BE123C' }} />
            </Box>
            <Typography variant="h5" sx={{ color: '#E8D5A3', fontWeight: 600, mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ color: '#7C6B8A', mb: 3 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh sx={{ fontSize: 18 }} />}
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              sx={{
                borderColor: alpha('#C9A84C', 0.2), color: '#C9A84C',
                '&:hover': { borderColor: alpha('#C9A84C', 0.4), bgcolor: alpha('#C9A84C', 0.04) },
              }}
            >
              Reload App
            </Button>
          </Box>
        </Box>
      )
    }
    return this.props.children
  }
}
