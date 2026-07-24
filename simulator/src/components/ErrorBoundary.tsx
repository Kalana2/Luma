import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { C } from '../theme/colors'

interface ErrorBoundaryState {
  hasError: boolean
}

interface ErrorBoundaryProps {
  children: ReactNode
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: C.bg, p: 4, gap: 2 }}>
          <Typography variant="h5" sx={{ color: C.text, fontWeight: 600 }}>Something went wrong</Typography>
          <Typography variant="body2" sx={{ color: C.muted, mb: 1 }}>An unexpected error occurred. Please try reloading.</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
