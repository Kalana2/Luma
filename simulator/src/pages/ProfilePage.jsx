import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  alpha,
} from '@mui/material'
import {
  Person,
  Email,
  Phone,
  Home,
  Badge,
  Shield,
} from '@mui/icons-material'
import useUserProfile from '../hooks/useUserProfile'

const C = {
  gold: '#C9A84C',
  navy: '#1E3A5F',
  champagne: '#E8D5A3',
  platinum: '#C4B5D0',
  muted: '#7C6B8A',
  emerald: '#0D9488',
}

function getInitials(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

export default function ProfilePage({ userId }) {
  const { userData, loading } = useUserProfile(userId)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress size={32} sx={{ color: C.gold }} />
      </Box>
    )
  }

  const profile = userData || {}
  const initials = getInitials(profile.name)

  const fields = [
    { label: 'Name', value: profile.name || '-', icon: Person },
    { label: 'Email', value: profile.email || userId, icon: Email },
    { label: 'Phone', value: profile.phone || '-', icon: Phone },
    { label: 'Address', value: profile.address || '-', icon: Home },
    { label: 'User ID', value: profile.id || userId, icon: Badge },
    { label: 'Role', value: profile.role || 'User', icon: Shield },
  ]

  return (
    <Box className="page-enter" sx={{ maxWidth: 600 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(C.navy, 0.08),
            border: `1px solid ${alpha(C.gold, 0.1)}`,
          }}
        >
          <Person sx={{ fontSize: 20, color: C.gold }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: C.champagne, fontWeight: 600 }}>
            Profile
          </Typography>
          <Typography variant="body2" sx={{ color: C.muted }}>
            Your account information
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${C.navy}, ${alpha(C.gold, 0.3)})`,
              border: `2px solid ${alpha(C.gold, 0.2)}`,
              boxShadow: `0 0 24px ${alpha(C.gold, 0.08)}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '2rem',
                fontWeight: 700,
                color: C.champagne,
              }}
            >
              {initials}
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ color: C.champagne, fontWeight: 600 }}>
            {profile.name || 'User'}
          </Typography>
          <Chip
            label={profile.role || 'User'}
            size="small"
            icon={<Shield sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: alpha(C.navy, 0.12),
              color: C.platinum,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="caption"
            sx={{ color: C.muted, fontSize: '0.62rem', letterSpacing: '0.12em', fontWeight: 600, mb: 2, display: 'block' }}
          >
            Account Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {fields.map(({ label, value, icon: Icon }) => (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${alpha(C.gold, 0.04)}`,
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(C.navy, 0.06),
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: C.muted }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem', textTransform: 'none', letterSpacing: 0 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ color: C.champagne, fontSize: '0.85rem', fontWeight: 500 }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
