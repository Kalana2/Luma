import { useState } from 'react'
import {
  Box, Typography, TextField, Button, CircularProgress, alpha,
} from '@mui/material'
import { EmailOutlined, LockOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import { auth, signInWithEmailAndPassword } from '../firebase/firebaseConfig'
import { C } from '../theme/colors'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.code === 'auth/invalid-email'
            ? 'Invalid email format'
            : err.code === 'auth/too-many-requests'
              ? 'Too many attempts. Try again later.'
              : 'Login failed. Please try again.'
      setError(msg)
    }
    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: C.bg, p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: '100%', maxWidth: 380,
          p: 4, borderRadius: 3,
          bgcolor: C.paper,
          border: `1px solid ${C.border}`,
          boxShadow: C.cardShadowHover,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              bgcolor: C.blue50,
              border: `1px solid ${alpha(C.primary, 0.15)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: C.primary, lineHeight: 1 }}>
              L
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.4rem', color: C.text }}>
            Luma
          </Typography>
          <Typography variant="caption" sx={{ color: C.muted, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.6rem' }}>
            Hardware Simulator
          </Typography>
        </Box>

        <TextField
          fullWidth
          size="small"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: <EmailOutlined sx={{ fontSize: 18, color: C.muted, mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          size="small"
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: <LockOutlined sx={{ fontSize: 18, color: C.muted, mr: 1 }} />,
            endAdornment: (
              <Box
                component="span"
                onClick={() => setShowPw((s) => !s)}
                sx={{ cursor: 'pointer', display: 'flex', color: C.muted, '&:hover': { color: C.text } }}
              >
                {showPw ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
              </Box>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Typography
            variant="caption"
            sx={{
              color: C.error, display: 'block', mb: 2, textAlign: 'center',
              bgcolor: C.red50, py: 1, px: 1.5, borderRadius: 2,
              border: `1px solid ${alpha(C.error, 0.1)}`,
            }}
          >
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          type="submit"
          disabled={loading}
          variant="contained"
          sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 600, fontSize: '0.85rem' }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : 'Login'}
        </Button>
      </Box>
    </Box>
  )
}
