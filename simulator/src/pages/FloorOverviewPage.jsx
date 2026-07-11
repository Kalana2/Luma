import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Button,
  IconButton,
  alpha,
  Chip,
} from '@mui/material'
import { db, ref, onValue, get } from '../firebase/firebaseConfig'
import {
  setDeviceState,
  addRoom,
  deleteRoom,
  addDevice,
} from '../firebase/deviceService'
import useFloorList from '../hooks/useFloorList'
import DeviceCard from '../components/DeviceCard'
import AddRoomDialog from '../components/AddRoomDialog'
import AddDeviceDialog from '../components/AddDeviceDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  Home,
  Stairs,
  Roofing,
  Settings,
  Add,
  Delete,
  ExpandMore,
  Bolt,
  ToggleOn,
  WarningAmber,
} from '@mui/icons-material'

const iconMap = { home: Home, stairs: Stairs, attic: Roofing }

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === display) return
    const start = display
    const diff = value - start
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return <>{display}</>
}

export default function FloorOverviewPage({ selectedFloorId }) {
  const navigate = useNavigate()
  const { floors, loading: floorsLoading } = useFloorList()
  const [devices, setDevices] = useState([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [floorData, setFloorData] = useState(null)

  const [addRoomOpen, setAddRoomOpen] = useState(false)
  const [addDeviceOpen, setAddDeviceOpen] = useState(false)
  const [deleteRoomOpen, setDeleteRoomOpen] = useState(false)
  const [deletingRoomId, setDeletingRoomId] = useState(null)
  const [collapsedRooms, setCollapsedRooms] = useState({})

  const floor = floors.find((f) => f.id === selectedFloorId)

  useEffect(() => {
    if (!selectedFloorId) {
      setDevices([])
      setFloorData(null)
      return
    }

    setDevicesLoading(true)
    setDevices([])

    const unsubs = []

    const floorRef = ref(db, `floors/${selectedFloorId}`)
    const stopFloor = onValue(floorRef, (snap) => {
      if (snap.exists()) setFloorData(snap.val())
    })
    unsubs.push(stopFloor)

    const devicesRef = ref(db, 'devices')
    const stopDevices = onValue(devicesRef, async (snapshot) => {
      try {
        const allDevices = snapshot.exists() ? snapshot.val() : {}
        const floorSnap = await get(ref(db, `floors/${selectedFloorId}`))
        if (!floorSnap.exists()) {
          setDevices([])
          setFloorData(null)
          setDevicesLoading(false)
          return
        }

        const fData = floorSnap.val()
        setFloorData(fData)

        const roomMap = {}
        if (fData.rooms) {
          for (const roomId in fData.rooms) {
            const room = fData.rooms[roomId]
            const devs = []
            if (room.devices) {
              for (const did in room.devices) {
                if (allDevices[did]) {
                  devs.push({ id: did, ...allDevices[did] })
                }
              }
            }
            roomMap[roomId] = { name: room.name, devices: devs }
          }
        }

        setDevices(roomMap)
      } catch (err) {
        console.error('Device load error:', err)
        setDevices([])
      }
      setDevicesLoading(false)
    })
    unsubs.push(stopDevices)

    return () => unsubs.forEach((u) => u())
  }, [selectedFloorId])

  const handleToggle = async (deviceId, state) => {
    await setDeviceState(deviceId, state)
  }

  const handleViewDetails = (deviceId) => {
    const allDevs = Object.values(devices).flatMap((r) => r.devices)
    const device = allDevs.find((d) => d.id === deviceId)
    if (device?.type === 'camera') {
      navigate(`/camera/${deviceId}`)
    } else {
      navigate(`/device/${deviceId}`)
    }
  }

  const handleAddRoom = async (name) => {
    try {
      await addRoom(selectedFloorId, name)
    } catch (err) {
      alert('Failed to add room: ' + (err.message || err.code))
    }
  }

  const handleAddDevice = async (roomId, deviceData) => {
    try {
      await addDevice(selectedFloorId, roomId, deviceData)
    } catch (err) {
      alert('Failed to add device: ' + (err.message || err.code))
    }
  }

  const handleDeleteRoom = async () => {
    if (deletingRoomId) {
      await deleteRoom(selectedFloorId, deletingRoomId)
      setDeletingRoomId(null)
    }
  }

  const toggleRoomCollapse = (roomId) => {
    setCollapsedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }))
  }

  const allRoomEntries = Object.entries(devices)
  const allDevs = allRoomEntries.flatMap(([, room]) => room.devices)
  const totalDevices = allDevs.length
  const onDevices = allDevs.filter((d) => d.state === 'ON' || d.status === 'ON').length
  const errorDevices = allDevs.filter((d) => d.status === 'ERROR' || d.status === 'DISCONNECTED').length
  const allRooms = floorData?.rooms || {}

  if (!selectedFloorId) {
    return (
      <Box className="page-enter" sx={{ textAlign: 'center', pt: 12 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha('#3B82F6', 0.08),
            border: `1px solid ${alpha('#3B82F6', 0.1)}`,
            mx: 'auto',
            mb: 3,
          }}
        >
          <Settings sx={{ fontSize: 28, color: '#64748B' }} />
        </Box>
        <Typography variant="h5" sx={{ color: '#F1F5F9', fontWeight: 500 }}>
          Select a Floor
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 320, mx: 'auto' }}>
          Choose a floor from the sidebar to view and control its devices.
        </Typography>
      </Box>
    )
  }

  if (floorsLoading || devicesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress size={32} sx={{ color: '#3B82F6' }} />
      </Box>
    )
  }

  if (!floor) {
    return (
      <Box sx={{ textAlign: 'center', pt: 12 }}>
        <Typography variant="h5" sx={{ color: '#F1F5F9', mb: 1 }}>Floor not found</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Try selecting a different floor.</Typography>
      </Box>
    )
  }

  return (
    <Box className="page-enter">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha('#3B82F6', 0.08),
              border: `1px solid ${alpha('#3B82F6', 0.1)}`,
            }}
          >
            {React.createElement(iconMap[floor.icon] || Home, { sx: { fontSize: 20, color: '#93C5FD' } })}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: '#F1F5F9', fontWeight: 600 }}>
              {floor.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {allRoomEntries.length} rooms &middot; <AnimatedNumber value={totalDevices} /> devices
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            onClick={() => setAddRoomOpen(true)}
            sx={{
              borderColor: alpha('#3B82F6', 0.15),
              color: '#94A3B8',
              transition: 'all 0.3s ease',
              '&:hover': { borderColor: alpha('#3B82F6', 0.3), color: '#93C5FD', transform: 'translateY(-1px)' },
            }}
          >
            Add Room
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            onClick={() => setAddDeviceOpen(true)}
            disabled={Object.keys(allRooms).length === 0}
            sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-1px)' } }}
          >
            Add Device
          </Button>
        </Box>
      </Box>

      {totalDevices > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          {[
            { label: 'Total', value: totalDevices, color: '#3B82F6', Icon: Bolt },
            { label: 'Active', value: onDevices, color: '#10B981', Icon: ToggleOn },
            { label: 'Alerts', value: errorDevices, color: '#EF4444', Icon: WarningAmber },
          ].map(({ label, value, color, Icon }) => (
            <Box
              key={label}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.02)})`,
                border: `1px solid ${alpha(color, 0.12)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                flex: 1,
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: alpha(color, 0.25), transform: 'translateY(-1px)' },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(color, 0.1),
                }}
              >
                <Icon sx={{ fontSize: 16, color }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F1F5F9', lineHeight: 1.1 }}>
                  <AnimatedNumber value={value} />
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'none', letterSpacing: 0, fontSize: '0.62rem' }}>
                  {label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {totalDevices === 0 ? (
        <Box
          sx={{
            mt: 4,
            p: 6,
            borderRadius: 3,
            textAlign: 'center',
            border: `1px solid ${alpha('#3B82F6', 0.08)}`,
            bgcolor: alpha('#0F172A', 0.5),
            animation: 'fade-slide-up 0.5s ease-out both',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha('#3B82F6', 0.06),
              border: `1px solid ${alpha('#3B82F6', 0.08)}`,
              mx: 'auto',
              mb: 2,
            }}
          >
            <Bolt sx={{ fontSize: 24, color: '#64748B' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#64748B', fontWeight: 400 }}>
            {Object.keys(allRooms).length === 0 ? 'No rooms on this floor' : 'No devices on this floor'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {Object.keys(allRooms).length === 0
              ? 'Click Add Room to create a room, then add devices.'
              : 'Click Add Device to add devices to existing rooms.'}
          </Typography>
        </Box>
      ) : (
        allRoomEntries.map(([roomId, room], roomIdx) => {
          const isCollapsed = collapsedRooms[roomId]
          return (
            <Box key={roomId} sx={{ mb: 3 }}>
              <Box
                onClick={() => toggleRoomCollapse(roomId)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1.5,
                  gap: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  py: 0.5,
                  '&:hover > .room-chevron': { color: '#93C5FD' },
                }}
              >
                <ExpandMore
                  className="room-chevron"
                  sx={{
                    fontSize: 18,
                    color: '#475569',
                    transition: 'all 0.3s ease',
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#475569',
                    fontSize: '0.62rem',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                  }}
                >
                  {room.name} &middot; {room.devices.length} device{room.devices.length !== 1 ? 's' : ''}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDeletingRoomId(roomId); setDeleteRoomOpen(true) }}
                  sx={{
                    color: alpha('#EF4444', 0.4),
                    p: 0.3,
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#EF4444', bgcolor: alpha('#EF4444', 0.06) },
                  }}
                >
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>

              {!isCollapsed && (
                <Box className="collapse-enter">
                  <Grid container spacing={2}>
                    {room.devices.map((device, idx) => (
                      <Grid item xs={12} sm={6} md={4} lg={4} key={device.id}>
                        <DeviceCard
                          device={device}
                          onToggle={handleToggle}
                          onViewDetails={handleViewDetails}
                          style={{
                            animationDelay: `${(roomIdx * 3 + idx) * 0.06}s`,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )
        })
      )}

      <AddRoomDialog open={addRoomOpen} onClose={() => setAddRoomOpen(false)} onSave={handleAddRoom} />
      <AddDeviceDialog open={addDeviceOpen} onClose={() => setAddDeviceOpen(false)} onSave={handleAddDevice} rooms={allRooms} />
      <ConfirmDialog
        open={deleteRoomOpen}
        onClose={() => { setDeleteRoomOpen(false); setDeletingRoomId(null) }}
        onConfirm={handleDeleteRoom}
        title="Delete Room"
        message="This will delete this room and all devices inside it."
        confirmLabel="Delete Room"
      />
    </Box>
  )
}
