import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  alpha,
} from '@mui/material'
import { ArrowBack, Refresh, Videocam, CameraAlt } from '@mui/icons-material'
import useDeviceState from '../hooks/useDeviceState'
import { requestCameraSnapshot } from '../firebase/deviceService'

export default function CameraFeedPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const { device, loading } = useDeviceState(deviceId)
  const [refreshing, setRefreshing] = useState(false)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress size={32} sx={{ color: '#3B82F6' }} />
      </Box>
    )
  }

  if (!device) {
    return (
      <Box sx={{ textAlign: 'center', pt: 12 }}>
        <Typography variant="h5" sx={{ color: '#F1F5F9', mb: 1 }}>Device not found</Typography>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBack />} sx={{ color: '#93C5FD' }}>
          Back
        </Button>
      </Box>
    )
  }

  const snapshotUrl = device.lastSnapshotUrl || `https://picsum.photos/seed/${deviceId}-default/640/480`

  const handleRefresh = async () => {
    setRefreshing(true)
    await requestCameraSnapshot(deviceId)
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <Box sx={{ animation: 'slide-up-stagger 0.5s ease-out', maxWidth: 900 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            color: '#64748B',
            border: `1px solid ${alpha('#3B82F6', 0.1)}`,
            borderRadius: 2.5,
            '&:hover': { color: '#93C5FD', borderColor: alpha('#3B82F6', 0.3), bgcolor: alpha('#3B82F6', 0.06) },
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
            bgcolor: alpha('#10B981', 0.08),
            border: `1px solid ${alpha('#10B981', 0.15)}`,
          }}
        >
          <Videocam sx={{ fontSize: 22, color: '#10B981' }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '1.5rem' }}>
            {device.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Camera Feed
          </Typography>
        </Box>
      </Box>

      <Card sx={{ overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            position: 'relative',
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
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
              transition: 'opacity 0.3s ease',
              opacity: refreshing ? 0.7 : 1,
            }}
          />
          {refreshing && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={40} sx={{ color: '#10B981' }} />
            </Box>
          )}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 60,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: device.status === 'ONLINE' ? '#10B981' : '#EF4444',
                boxShadow: device.status === 'ONLINE' ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(239,68,68,0.5)',
                animation: 'status-pulse 2s ease-in-out infinite',
              }}
            />
            <Typography variant="caption" sx={{ color: '#FFF', textTransform: 'none', letterSpacing: '0.04em', fontSize: '0.65rem' }}>
              {device.status === 'ONLINE' ? 'LIVE' : 'OFFLINE'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none', letterSpacing: 0, fontSize: '0.6rem', ml: 'auto' }}>
              {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F9' }}>
              Camera Controls
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
              Last snapshot: {device.lastSnapshotAt ? new Date(device.lastSnapshotAt).toLocaleString() : 'never'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={16} sx={{ color: '#FFF' }} /> : <CameraAlt />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #34D399, #10B981)',
                boxShadow: '0 6px 24px rgba(16,185,129,0.4)',
              },
            }}
          >
            {refreshing ? 'Capturing...' : 'Capture Snapshot'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
            Device Info
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Status', value: device.status || 'ONLINE' },
              { label: 'Type', value: 'Camera' },
              { label: 'Last Seen', value: device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'never' },
            ].map(({ label, value }) => (
              <Box key={label}>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0, fontSize: '0.62rem' }}>
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#F1F5F9' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
