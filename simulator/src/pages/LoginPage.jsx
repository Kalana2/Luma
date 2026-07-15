import { useState } from 'react'
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.message)
    }
    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0A1628', position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '-15%', right: '-10%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,58,95,0.06), transparent 60%)', filter: 'blur(100px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.03), transparent 60%)', filter: 'blur(100px)' }} />
      </Box>

      <Card sx={{ p: 5, maxWidth: 420, width: '90%', position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
            <Box component="img" src="/logo.png" alt="" sx={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 12px rgba(30,58,95,0.4))' }} />
          </Box>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            <Box component="span" sx={{ color: '#3B82F6' }}>Lum</Box>
            <Box component="span" sx={{ color: '#EF4444' }}>a</Box>
          </Typography>
          <Typography variant="body2" sx={{ color: '#7C6B8A', mt: 0.5 }}>Hardware Simulator</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            sx={{ mb: 2.5 }}
            InputLabelProps={{ sx: { color: '#7C6B8A' } }}
            inputProps={{ sx: { color: '#E8D5A3' } }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 1 }}
            InputLabelProps={{ sx: { color: '#7C6B8A' } }}
            inputProps={{ sx: { color: '#E8D5A3' } }}
          />

          {error && (
            <Typography variant="caption" sx={{ color: '#BE123C', textTransform: 'none', letterSpacing: 0, display: 'block', mb: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, py: 1.3, fontSize: '0.9rem' }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#FFF' }} /> : 'Sign In'}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ color: '#7C6B8A', textTransform: 'none', letterSpacing: 0, display: 'block', textAlign: 'center', mt: 3 }}>
          Use your Luma account credentials
        </Typography>
      </Card>
    </Box>
  )
}
