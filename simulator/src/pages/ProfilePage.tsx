import {
  Box,
  Typography,
  Card,
  CardContent,
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
import PageHeader from '../components/PageHeader'
import SkeletonLoader from '../components/SkeletonLoader'
import { C } from '../theme/colors'

function getInitials(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

export default function ProfilePage({ userId }) {
  const { userData, loading } = useUserProfile(userId)

  if (loading) {
    return <SkeletonLoader type="detail" />
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
    <Box sx={{ maxWidth: 600 }}>
      <PageHeader
        icon={<Person />}
        title="Profile"
        subtitle="Your account information"
      />

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
              bgcolor: C.blue50,
              border: `2px solid ${alpha(C.primary, 0.15)}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '2rem',
                fontWeight: 700,
                color: C.primary,
              }}
            >
              {initials}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: C.text, fontWeight: 600 }}>
              {profile.name || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: C.muted, mt: 0.5 }}>
              {profile.role || 'User'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="caption"
            sx={{ color: C.muted, fontSize: '0.62rem', letterSpacing: '0.12em', fontWeight: 600, mb: 1.5, display: 'block' }}
          >
            Account Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {fields.map(({ label, value, icon: Icon }) => (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${C.divider}`,
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
                    bgcolor: C.bg,
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: C.muted }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem', textTransform: 'none', letterSpacing: 0 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ color: C.text, fontSize: '0.85rem', fontWeight: 500 }}>
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
