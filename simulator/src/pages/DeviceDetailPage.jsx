import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LogContext } from '../contexts/LogContext'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Slider,
  CircularProgress,
  IconButton,
  alpha,
  Chip,
  Grid,
} from '@mui/material'
import {
  ArrowBack,
  Lightbulb,
  Power,
  ToggleOn,
  Iron,
  Videocam,
  AccessTime,
  Timer,
  WarningAmber,
  WifiOff,
  Refresh,
} from '@mui/icons-material'
import useDeviceState from '../hooks/useDeviceState'
import StatusChip from '../components/StatusChip'
import ToggleButton from '../components/ToggleButton'
import {
  setDeviceState,
  setSwitchState,
  updateDeviceSchedule,
  updateIronMaxDuration,
  triggerDeviceError,
  triggerDeviceDisconnected,
} from '../firebase/deviceService'

const typeConfig = {
  light: { label: 'Smart Light', Icon: Lightbulb, color: '#F59E0B' },
  outlet: { label: 'Electrical Outlet', Icon: Power, color: '#3B82F6' },
  iron: { label: 'Electric Iron', Icon: Iron, color: '#EF4444' },
  switchPanel: { label: 'Switch Panel', Icon: ToggleOn, color: '#8B5CF6' },
  camera: { label: 'Camera', Icon: Videocam, color: '#10B981' },
}

export default function DeviceDetailPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const { device, loading } = useDeviceState(deviceId)
  const [scheduleStart, setScheduleStart] = useState('')
  const [scheduleEnd, setScheduleEnd] = useState('')
  const [maxDuration, setMaxDuration] = useState(30)

  const logEvent = useContext(LogContext)

  useEffect(() => {
    if (device) {
      logEvent('device_detail_view', { deviceId, deviceType: device.type, deviceName: device.name })
    }
  }, [device?.name])

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
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  const typeInfo = typeConfig[device.type] || typeConfig.outlet
  const { label: typeLabel, Icon: TypeIcon, color: typeColor } = typeInfo
  const status = device.type === 'camera' ? (device.status || 'ONLINE') : (device.status || device.state || 'OFF')

  const handleToggle = async (on) => {
    const newState = on ? 'ON' : 'OFF'
    logEvent('device_toggle', { deviceId, deviceType: device.type, state: newState })
    await setDeviceState(deviceId, newState)
  }

  const handleSwitchToggle = async (switchKey, currentState) => {
    const newState = currentState === 'ON' ? 'OFF' : 'ON'
    logEvent('switch_toggle', { deviceId, switchKey, state: newState })
    await setSwitchState(deviceId, switchKey, newState)
  }

  const handleScheduleSave = async () => {
    if (scheduleStart && scheduleEnd) {
      await updateDeviceSchedule(deviceId, scheduleStart, scheduleEnd)
    }
  }

  const handleMaxDurationChange = async () => {
    await updateIronMaxDuration(deviceId, maxDuration)
  }

  return (
    <Box className="page-enter-right" sx={{ maxWidth: 800 }}>
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
            bgcolor: alpha(typeColor, 0.08),
            border: `1px solid ${alpha(typeColor, 0.15)}`,
          }}
        >
          <TypeIcon sx={{ fontSize: 22, color: typeColor }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '1.5rem' }}>
            {device.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {typeLabel}
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption">Status</Typography>
            <StatusChip status={status} size="medium" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F9' }}>
                Power Control
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
                Turn device {device.state === 'ON' ? 'off' : 'on'}
              </Typography>
            </Box>
            <ToggleButton
              checked={device.state === 'ON'}
              onChange={handleToggle}
            />
          </Box>
        </CardContent>
      </Card>

      {device.type === 'light' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AccessTime sx={{ fontSize: 20, color: '#F59E0B' }} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F9' }}>
                  Auto Schedule
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
                  Set automatic on/off times
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="On Time"
                type="time"
                size="small"
                value={scheduleStart || device.startTime || ''}
                onChange={(e) => setScheduleStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    '& fieldset': { borderColor: alpha('#3B82F6', 0.12) },
                    '&:hover fieldset': { borderColor: alpha('#3B82F6', 0.3) },
                  },
                  '& .MuiInputLabel-root': { color: '#64748B' },
                  '& input': { color: '#F1F5F9' },
                }}
                inputProps={{ sx: { colorScheme: 'dark' } }}
              />
              <TextField
                label="Off Time"
                type="time"
                size="small"
                value={scheduleEnd || device.endTime || ''}
                onChange={(e) => setScheduleEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    '& fieldset': { borderColor: alpha('#3B82F6', 0.12) },
                    '&:hover fieldset': { borderColor: alpha('#3B82F6', 0.3) },
                  },
                  '& .MuiInputLabel-root': { color: '#64748B' },
                  '& input': { color: '#F1F5F9' },
                }}
                inputProps={{ sx: { colorScheme: 'dark' } }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleScheduleSave}
                sx={{
                  borderColor: alpha('#F59E0B', 0.2),
                  color: '#F59E0B',
                  '&:hover': { borderColor: alpha('#F59E0B', 0.4), bgcolor: alpha('#F59E0B', 0.06) },
                }}
              >
                Save
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {device.type === 'switchPanel' && device.switches && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F9', mb: 2 }}>
              Switches
            </Typography>
            <Grid container spacing={1.5}>
              {Object.entries(device.switches).map(([key, state]) => (
                <Grid item xs={4} key={key}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: state === 'ON' ? alpha('#8B5CF6', 0.08) : alpha('#0F172A', 0.5),
                      border: `1px solid ${state === 'ON' ? alpha('#8B5CF6', 0.2) : alpha('#3B82F6', 0.06)}`,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: alpha('#8B5CF6', 0.3) },
                    }}
                    onClick={() => handleSwitchToggle(key, state)}
                  >
                    <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0, display: 'block', mb: 0.5 }}>
                      {key}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: state === 'ON' ? '#A78BFA' : '#475569' }}>
                      {state}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {device.type === 'iron' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Timer sx={{ fontSize: 20, color: '#EF4444' }} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F9' }}>
                  Max Duration
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
                  Auto-shutdown after {maxDuration || device.maxDurationMinutes || 30} minutes
                </Typography>
              </Box>
            </Box>
            <Slider
              value={maxDuration || device.maxDurationMinutes || 30}
              onChange={(_, v) => setMaxDuration(v)}
              onChangeCommitted={handleMaxDurationChange}
              min={5}
              max={120}
              step={5}
              marks={[{ value: 30, label: '30m' }, { value: 60, label: '1h' }, { value: 120, label: '2h' }]}
              sx={{
                color: '#EF4444',
                '& .MuiSlider-thumb': {
                  boxShadow: '0 0 8px rgba(239,68,68,0.4)',
                },
                '& .MuiSlider-markLabel': {
                  color: '#64748B',
                  fontSize: '0.65rem',
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {device.type === 'camera' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Refresh sx={{ fontSize: 20, color: '#10B981' }} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F9' }}>
                  Snapshot
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
                  Last taken: {device.lastSnapshotAt ? new Date(device.lastSnapshotAt).toLocaleTimeString() : 'never'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => navigate(`/camera/${deviceId}`)}
              sx={{
                borderColor: alpha('#10B981', 0.2),
                color: '#10B981',
                '&:hover': { borderColor: alpha('#10B981', 0.4), bgcolor: alpha('#10B981', 0.06) },
              }}
            >
              View Camera Feed
            </Button>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <WarningAmber sx={{ fontSize: 20, color: '#F59E0B' }} />
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F9' }}>
                Simulator Controls
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
                Force device states for testing
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label="Simulate Error"
              icon={<WarningAmber sx={{ fontSize: 14 }} />}
              onClick={() => triggerDeviceError(deviceId)}
              sx={{
                bgcolor: alpha('#EF4444', 0.06),
                color: '#EF4444',
                border: `1px solid ${alpha('#EF4444', 0.12)}`,
                '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
              }}
            />
            <Chip
              label="Simulate Disconnect"
              icon={<WifiOff sx={{ fontSize: 14 }} />}
              onClick={() => triggerDeviceDisconnected(deviceId)}
              sx={{
                bgcolor: alpha('#F59E0B', 0.06),
                color: '#F59E0B',
                border: `1px solid ${alpha('#F59E0B', 0.12)}`,
                '&:hover': { bgcolor: alpha('#F59E0B', 0.1) },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
