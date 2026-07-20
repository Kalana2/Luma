import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Slider,
  alpha,
} from '@mui/material'
import {
  Lightbulb,
  Power,
  Iron,
  ToggleOn,
  Videocam,
} from '@mui/icons-material'

const deviceTypes = [
  { value: 'outlet', label: 'Electrical Outlet', Icon: Power, color: '#3B82F6' },
  { value: 'light', label: 'Smart Light', Icon: Lightbulb, color: '#F59E0B' },
  { value: 'iron', label: 'Electric Iron', Icon: Iron, color: '#EF4444' },
  { value: 'switchPanel', label: 'Switch Panel', Icon: ToggleOn, color: '#8B5CF6' },
  { value: 'camera', label: 'Camera', Icon: Videocam, color: '#10B981' },
]

const defaultData = {
  outlet: { name: 'New Outlet', type: 'outlet', state: 'OFF', status: 'OFF' },
  light: { name: 'New Light', type: 'light', state: 'OFF', status: 'OFF', startTime: '18:00', endTime: '23:00' },
  iron: { name: 'New Iron', type: 'iron', state: 'OFF', status: 'OFF', turnedOnAt: null, maxDurationMinutes: 30 },
  switchPanel: { name: 'New Switch Panel', type: 'switchPanel', switchCount: 3, switches: { switch1: 'OFF', switch2: 'OFF', switch3: 'OFF' }, status: 'OFF' },
  camera: { name: 'New Camera', type: 'camera', status: 'ONLINE' },
}

export default function AddDeviceDialog({ open, onClose, onSave, rooms }) {
  const [type, setType] = useState('outlet')
  const [name, setName] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [switchCount, setSwitchCount] = useState(3)
  const [maxDuration, setMaxDuration] = useState(30)
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('23:00')
  const [saving, setSaving] = useState(false)

  const roomOptions = rooms
    ? Object.entries(rooms).map(([id, room]) => ({ id, name: room.name }))
    : []

  const handleSave = async () => {
    if (!name.trim() || !selectedRoomId) return
    setSaving(true)

    let deviceData = {}
    switch (type) {
      case 'light':
        deviceData = { ...defaultData.light, name: name.trim(), startTime, endTime }
        break
      case 'switchPanel':
        const switches = {}
        for (let i = 1; i <= switchCount; i++) {
          switches[`switch${i}`] = 'OFF'
        }
        deviceData = { ...defaultData.switchPanel, name: name.trim(), switchCount, switches }
        break
      case 'iron':
        deviceData = { ...defaultData.iron, name: name.trim(), maxDurationMinutes: maxDuration }
        break
      default:
        deviceData = { ...defaultData[type] || defaultData.outlet, name: name.trim() }
    }

    await onSave(selectedRoomId, deviceData)
    setSaving(false)
    setName('')
    setType('outlet')
    setSelectedRoomId('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: '#F1F5F9' }}>
        Add Device
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Device Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          sx={{
            mt: 1,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              '& fieldset': { borderColor: alpha('#3B82F6', 0.12) },
              '&:hover fieldset': { borderColor: alpha('#3B82F6', 0.3) },
              '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
            },
            '& .MuiInputLabel-root': { color: '#64748B' },
            '& input': { color: '#F1F5F9' },
          }}
        />

        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
          Device Type
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {deviceTypes.map(({ value, label, Icon, color }) => (
            <Box
              key={value}
              onClick={() => setType(value)}
              sx={{
                p: 1,
                borderRadius: 2.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                bgcolor: type === value ? alpha(color, 0.1) : 'transparent',
                border: type === value ? `1px solid ${alpha(color, 0.3)}` : '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: alpha(color, 0.05) },
              }}
            >
              <Icon sx={{ fontSize: 18, color }} />
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: type === value ? color : '#64748B', textTransform: 'none', letterSpacing: 0 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <TextField
          select
          label="Room"
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          fullWidth
          size="small"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              '& fieldset': { borderColor: alpha('#3B82F6', 0.12) },
              '&:hover fieldset': { borderColor: alpha('#3B82F6', 0.3) },
              '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
            },
            '& .MuiInputLabel-root': { color: '#64748B' },
            '& .MuiSelect-select': { color: '#F1F5F9' },
          }}
        >
          {roomOptions.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
            </MenuItem>
          ))}
          {roomOptions.length === 0 && (
            <MenuItem disabled>No rooms available — add a room first</MenuItem>
          )}
        </TextField>

        {type === 'switchPanel' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
              Switch Count: {switchCount}
            </Typography>
            <Slider
              value={switchCount}
              onChange={(_, v) => setSwitchCount(v)}
              min={2}
              max={5}
              step={1}
              marks={[
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 5, label: '5' },
              ]}
              sx={{
                color: '#8B5CF6',
                '& .MuiSlider-markLabel': { color: '#64748B', fontSize: '0.65rem' },
              }}
            />
          </Box>
        )}

        {type === 'iron' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0 }}>
              Max Duration: {maxDuration} min
            </Typography>
            <Slider
              value={maxDuration}
              onChange={(_, v) => setMaxDuration(v)}
              min={5}
              max={120}
              step={5}
              marks={[
                { value: 15, label: '15m' },
                { value: 30, label: '30m' },
                { value: 60, label: '1h' },
                { value: 120, label: '2h' },
              ]}
              sx={{
                color: '#EF4444',
                '& .MuiSlider-markLabel': { color: '#64748B', fontSize: '0.65rem' },
              }}
            />
          </Box>
        )}

        {type === 'light' && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="On Time"
              type="time"
              size="small"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  '& fieldset': { borderColor: alpha('#3B82F6', 0.12) },
                },
                '& input': { color: '#F1F5F9' },
              }}
              inputProps={{ sx: { colorScheme: 'dark' } }}
            />
            <TextField
              label="Off Time"
              type="time"
              size="small"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  '& fieldset': { borderColor: alpha('#3B82F6', 0.12) },
                },
                '& input': { color: '#F1F5F9' },
              }}
              inputProps={{ sx: { colorScheme: 'dark' } }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#64748B' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim() || !selectedRoomId || saving}
        >
          {saving ? 'Creating...' : 'Add Device'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
