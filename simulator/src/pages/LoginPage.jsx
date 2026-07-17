import { useState } from 'react'
import {
  Box, Typography, TextField, Button, CircularProgress, alpha,
} from '@mui/material'
import { EmailOutlined, LockOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import { auth, signInWithEmailAndPassword } from '../firebase/firebaseConfig'

const C = {
  gold: '#C9A84C', navy: '#1E3A5F', champagne: '#E8D5A3', platinum: '#C4B5D0',
  muted: '#7C6B8A', dark: '#0A1628', emerald: '#0D9488',
}

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
        bgcolor: C.dark, p: 2,
      }}
    >
      <Box
        sx={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,58,95,0.08), transparent 60%)', filter: 'blur(100px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04), transparent 60%)', filter: 'blur(100px)' }} />
      </Box>

      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 400,
          p: 4, borderRadius: 4,
          background: 'linear-gradient(160deg, rgba(15,29,53,0.95) 0%, rgba(18,34,60,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(C.gold, 0.08)}`,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              background: `linear-gradient(135deg, ${alpha(C.gold, 0.15)}, ${alpha(C.navy, 0.1)})`,
              border: `1px solid ${alpha(C.gold, 0.1)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.4rem', color: C.gold, lineHeight: 1 }}>
              L
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.4rem', color: C.champagne }}>
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
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              '& fieldset': { borderColor: alpha(C.gold, 0.08) },
              '&:hover fieldset': { borderColor: alpha(C.gold, 0.2) },
              '&.Mui-focused fieldset': { borderColor: C.navy },
            },
            '& .MuiInputLabel-root': { color: C.muted },
            '& input': { color: C.champagne },
          }}
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
                sx={{ cursor: 'pointer', display: 'flex', color: C.muted, '&:hover': { color: C.champagne } }}
              >
                {showPw ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
              </Box>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              '& fieldset': { borderColor: alpha(C.gold, 0.08) },
              '&:hover fieldset': { borderColor: alpha(C.gold, 0.2) },
              '&.Mui-focused fieldset': { borderColor: C.navy },
            },
            '& .MuiInputLabel-root': { color: C.muted },
            '& input': { color: C.champagne },
          }}
        />

        {error && (
          <Typography
            variant="caption"
            sx={{
              color: '#BE123C', display: 'block', mb: 2, textAlign: 'center',
              bgcolor: alpha('#BE123C', 0.06), py: 1, px: 1.5, borderRadius: 2,
              border: `1px solid ${alpha('#BE123C', 0.1)}`,
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
          sx={{
            py: 1.5, borderRadius: 2.5,
            background: `linear-gradient(135deg, ${C.navy} 0%, #15304D 100%)`,
            boxShadow: `0 4px 16px ${alpha(C.navy, 0.35)}`,
            color: C.champagne,
            fontWeight: 600,
            fontSize: '0.85rem',
            '&:hover': {
              background: `linear-gradient(135deg, #2D5A8C 0%, ${C.navy} 100%)`,
              boxShadow: `0 6px 24px ${alpha(C.navy, 0.5)}`,
              transform: 'translateY(-1px)',
            },
            '&:disabled': { opacity: 0.7 },
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: C.champagne }} /> : 'Login'}
        </Button>
      </Box>
    </Box>
  )
}
