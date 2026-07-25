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
  IconButton,
  alpha,
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
} from '@mui/icons-material'
import useDeviceState from '../hooks/useDeviceState'
import SkeletonLoader from '../components/SkeletonLoader'
import {
  setDeviceState,
  setSwitchState,
  updateDeviceSchedule,
  updateIronMaxDuration,
  triggerDeviceError,
  triggerDeviceDisconnected,
} from '../firebase/deviceService'
import { C, deviceTypeColors } from '../theme/colors'
import StatusChip from '../components/StatusChip'
import ToggleButton from '../components/ToggleButton'
import { useToast } from '../contexts/ToastContext'

export default function DeviceDetailPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
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
    return <SkeletonLoader type="detail" />
  }

  if (!device) {
    return (
      <Box sx={{ textAlign: 'center', pt: 8 }}>
        <Typography variant="h5" sx={{ color: C.text, mb: 2 }}>Device not found</Typography>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBack />} variant="outlined">
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  const typeInfo = deviceTypeColors[device.type] || deviceTypeColors.outlet
  const { label: typeLabel, color: typeColor } = typeInfo
  const typeIcons = { light: Lightbulb, outlet: Power, iron: Iron, switchPanel: ToggleOn, camera: Videocam }
  const TypeIcon = typeIcons[device.type] || Power
  const status = device.type === 'camera' ? (device.status || 'ONLINE') : (device.status || device.state || 'OFF')

  const handleToggle = async (on) => {
    const newState = on ? 'ON' : 'OFF'
    logEvent('device_toggle', { deviceId, deviceType: device.type, state: newState })
    try {
      await setDeviceState(deviceId, newState)
    } catch {
      toast.toast('Failed to toggle device')
    }
  }

  const handleSwitchToggle = async (switchKey, currentState) => {
    const newState = currentState === 'ON' ? 'OFF' : 'ON'
    logEvent('switch_toggle', { deviceId, switchKey, state: newState })
    await setSwitchState(deviceId, switchKey, newState)
  }

  const handleScheduleSave = async () => {
    if (scheduleStart && scheduleEnd) {
      await updateDeviceSchedule(deviceId, scheduleStart, scheduleEnd)
      toast.toast('Schedule updated', 'success')
    }
  }

  const handleMaxDurationChange = async (_: unknown, v: number | number[]) => {
    await updateIronMaxDuration(deviceId, v as number)
    toast.toast('Max duration updated', 'success')
  }

  return (
    <Box sx={{ maxWidth: 800, width: '100%', mx: 'auto' }}>
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
          <TypeIcon sx={{ fontSize: 22, color: typeColor }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: C.text, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {device.name}
          </Typography>
          <Typography variant="body2" sx={{ color: C.textSecondary }}>
            {typeLabel}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.62rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                Status & Power
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text, mb: 0.3 }}>
                  Power Control
                </Typography>
                <Typography variant="caption" sx={{ color: C.textSecondary, textTransform: 'none', letterSpacing: 0 }}>
                  Turn device {device.state === 'ON' ? 'off' : 'on'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StatusChip status={status} size="medium" />
                <ToggleButton checked={device.state === 'ON'} onChange={handleToggle} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {device.type === 'light' && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <AccessTime sx={{ fontSize: 20, color: '#F59E0B' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>
                    Auto Schedule
                  </Typography>
                  <Typography variant="caption" sx={{ color: C.textSecondary, textTransform: 'none', letterSpacing: 0 }}>
                    Set automatic on/off times
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <TextField
                  label="On Time"
                  type="time"
                  size="small"
                  value={scheduleStart || device.startTime || ''}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  label="Off Time"
                  type="time"
                  size="small"
                  value={scheduleEnd || device.endTime || ''}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 140 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleScheduleSave}
                  sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }}
                >
                  Save Schedule
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {device.type === 'switchPanel' && device.switches && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text, mb: 2 }}>
                Switches
              </Typography>
              <Grid container spacing={1.5}>
                {(Object.entries(device.switches) as [string, string][]).map(([key, state]) => (
                  <Grid item xs={4} sm={3} key={key}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: state === 'ON' ? alpha('#7C3AED', 0.06) : C.bg,
                        border: `1px solid ${state === 'ON' ? alpha('#7C3AED', 0.2) : C.border}`,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: alpha('#7C3AED', 0.3) },
                      }}
                      onClick={() => handleSwitchToggle(key, state)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSwitchToggle(key, state) }}
                      aria-label={`Switch ${key}, currently ${state}`}
                    >
                      <Typography variant="caption" sx={{ color: C.textSecondary, textTransform: 'none', letterSpacing: 0, display: 'block', mb: 0.5 }}>
                        {key}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: state === 'ON' ? '#7C3AED' : C.muted }}>
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
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Timer sx={{ fontSize: 20, color: '#DC2626' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>
                    Auto Shutdown Timer
                  </Typography>
                  <Typography variant="caption" sx={{ color: C.textSecondary, textTransform: 'none', letterSpacing: 0 }}>
                    Device will turn off after {maxDuration || device.maxDurationMinutes || 30} minutes
                  </Typography>
                </Box>
              </Box>
              <Slider
                value={maxDuration || device.maxDurationMinutes || 30}
                onChange={(_, v) => setMaxDuration(v as number)}
                onChangeCommitted={handleMaxDurationChange as (event: React.SyntheticEvent | Event, value: number | number[]) => void}
                min={5}
                max={120}
                step={5}
                marks={[{ value: 30, label: '30m' }, { value: 60, label: '1h' }, { value: 120, label: '2h' }]}
                sx={{ color: '#DC2626', '& .MuiSlider-markLabel': { color: C.muted, fontSize: '0.65rem' } }}
              />
            </CardContent>
          </Card>
        )}

        {device.type === 'camera' && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Videocam sx={{ fontSize: 20, color: '#059669' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>
                    Snapshot
                  </Typography>
                  <Typography variant="caption" sx={{ color: C.textSecondary, textTransform: 'none', letterSpacing: 0 }}>
                    Last taken: {device.lastSnapshotAt ? new Date(device.lastSnapshotAt).toLocaleTimeString() : 'never'}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Videocam />}
                onClick={() => navigate(`/camera/${deviceId}`)}
                sx={{ borderColor: alpha('#059669', 0.2), color: '#059669', '&:hover': { borderColor: alpha('#059669', 0.4), bgcolor: alpha('#059669', 0.04) } }}
              >
                View Camera Feed
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <WarningAmber sx={{ fontSize: 20, color: '#F59E0B' }} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: C.text }}>
                  Simulator Controls
                </Typography>
                <Typography variant="caption" sx={{ color: C.textSecondary, textTransform: 'none', letterSpacing: 0 }}>
                  Force device states for testing
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<WarningAmber sx={{ fontSize: 14 }} />}
                onClick={() => triggerDeviceError(deviceId)}
                sx={{ borderColor: alpha(C.error, 0.2), color: C.error, '&:hover': { borderColor: C.error, bgcolor: C.red50 } }}
              >
                Simulate Error
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<WifiOff sx={{ fontSize: 14 }} />}
                onClick={() => triggerDeviceDisconnected(deviceId)}
                sx={{ borderColor: alpha(C.warning, 0.2), color: C.warning, '&:hover': { borderColor: C.warning, bgcolor: C.amber50 } }}
              >
                Simulate Disconnect
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
