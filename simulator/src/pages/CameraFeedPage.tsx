import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  alpha,
} from '@mui/material'
import { ArrowBack, Videocam, CameraAlt } from '@mui/icons-material'
import useDeviceState from '../hooks/useDeviceState'
import { requestCameraSnapshot } from '../firebase/deviceService'
import SkeletonLoader from '../components/SkeletonLoader'
import { C, deviceTypeColors } from '../theme/colors'

export default function CameraFeedPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const { device, loading } = useDeviceState(deviceId)
  const [refreshing, setRefreshing] = useState(false)

  if (loading) {
    return <SkeletonLoader type="detail" />
  }

  if (!device) {
    return (
      <Box sx={{ textAlign: 'center', pt: 8 }}>
        <Typography variant="h5" sx={{ color: C.text, mb: 2 }}>Device not found</Typography>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBack />} variant="outlined">
          Back
        </Button>
      </Box>
    )
  }

  const typeInfo = deviceTypeColors[device.type] || deviceTypeColors.camera
  const { color: typeColor } = typeInfo
  const snapshotUrl = device.lastSnapshotUrl || `https://picsum.photos/seed/${deviceId}-default/640/480`

  const handleRefresh = async () => {
    setRefreshing(true)
    await requestCameraSnapshot(deviceId)
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <Box sx={{ maxWidth: 900, width: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton
          onClick={() => navigate('/')}
          aria-label="Back to dashboard"
          sx={{
            color: C.textSecondary,
            border: `1px solid ${C.border}`,
            borderRadius: 2.5,
            '&:hover': { color: C.primary, borderColor: C.primaryLight, bgcolor: C.blue50 },
          }}
        >
          <ArrowBack sx={{ fontSize: 20 }} />
        </IconButton>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(typeColor, 0.08),
            border: `1px solid ${alpha(typeColor, 0.15)}`,
          }}
        >
          <Videocam sx={{ fontSize: 22, color: typeColor }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: C.text, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {device.name}
          </Typography>
          <Typography variant="body2" sx={{ color: C.textSecondary }}>
            Camera Feed
          </Typography>
        </Box>
      </Box>

      <Card sx={{ overflow: 'hidden', mb: 2.5 }}>
        <Box
          sx={{
            position: 'relative',
            bgcolor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 250, sm: 400 },
          }}
        >
          <Box
            component="img"
            src={snapshotUrl}
            alt="Camera snapshot"
            sx={{
              width: '100%',
              maxHeight: 600,
              objectFit: 'contain',
              transition: 'opacity 0.5s ease',
              opacity: refreshing ? 0.5 : 1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 44,
              background: 'linear-gradient(0deg, rgba(0,0,0,0.04), transparent)',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              gap: 1,
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: device.status === 'ONLINE' ? '#059669' : '#DC2626' }} />
            <Typography variant="caption" sx={{ color: C.textSecondary, fontSize: '0.65rem' }}>
              {device.status === 'ONLINE' ? 'LIVE' : 'OFFLINE'}
            </Typography>
            <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.6rem', ml: 'auto' }}>
              {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>
              Camera Controls
            </Typography>
            <Typography variant="caption" sx={{ color: C.textSecondary, textTransform: 'none', letterSpacing: 0 }}>
              Last snapshot: {device.lastSnapshotAt ? new Date(device.lastSnapshotAt).toLocaleString() : 'never'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CameraAlt />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
          >
            {refreshing ? 'Capturing...' : 'Capture Snapshot'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
