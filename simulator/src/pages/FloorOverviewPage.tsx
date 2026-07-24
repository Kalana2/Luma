import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  alpha,
} from '@mui/material'
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
  Layers,
} from '@mui/icons-material'
import { db, ref, onValue, get } from '../firebase/firebaseConfig'
import {
  setDeviceState,
  addRoom,
  deleteRoom,
  addDevice,
  deleteDevice,
} from '../firebase/deviceService'
import useFloorList from '../hooks/useFloorList'
import DeviceCard from '../components/DeviceCard'
import AddRoomDialog from '../components/AddRoomDialog'
import AddDeviceDialog from '../components/AddDeviceDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import SkeletonLoader from '../components/SkeletonLoader'
import PageHeader from '../components/PageHeader'
import { C, statCardColors } from '../theme/colors'
import { useToast } from '../contexts/ToastContext'

type AnyRecord = Record<string, any>

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

export default function FloorOverviewPage({ userId, selectedFloorId }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { floors, loading: floorsLoading } = useFloorList(userId)
  const [devices, setDevices] = useState<Record<string, any>>({})
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [floorData, setFloorData] = useState<Record<string, any> | null>(null)

  const [addRoomOpen, setAddRoomOpen] = useState(false)
  const [addDeviceOpen, setAddDeviceOpen] = useState(false)
  const [deleteRoomOpen, setDeleteRoomOpen] = useState(false)
  const [deletingRoomId, setDeletingRoomId] = useState(null)
  const [deleteDeviceOpen, setDeleteDeviceOpen] = useState(false)
  const [deletingDeviceId, setDeletingDeviceId] = useState(null)
  const [deletingDeviceRoomId, setDeletingDeviceRoomId] = useState(null)
  const [collapsedRooms, setCollapsedRooms] = useState({})

  const floor = floors.find((f) => f.id === selectedFloorId)

  useEffect(() => {
    if (!selectedFloorId) {
      setDevices({})
      setFloorData(null)
      return
    }

    setDevicesLoading(true)
    setDevices({})

    const floorRef = ref(db, `users/${userId}/floors/${selectedFloorId}`)
    const stopFloor = onValue(floorRef, (snap) => {
      if (snap.exists()) setFloorData(snap.val() as AnyRecord)
    })

    const devicesRef = ref(db, 'devices')
    const stopDevices = onValue(devicesRef, async (snapshot) => {
      try {
        const allDevices = (snapshot.exists() ? snapshot.val() : {}) as AnyRecord
        const floorSnap = await get(ref(db, `users/${userId}/floors/${selectedFloorId}`))
        if (!floorSnap.exists()) {
          setDevices({})
          setFloorData(null)
          setDevicesLoading(false)
          return
        }

        const fData = floorSnap.val() as AnyRecord
        setFloorData(fData)

        const roomMap: AnyRecord = {}
        if (fData.rooms) {
          for (const roomId in fData.rooms) {
            const room = fData.rooms[roomId] as AnyRecord
            const devs: AnyRecord[] = []
            if (room.devices) {
              for (const did in room.devices) {
                if (allDevices[did]) {
                  devs.push({ id: did, ...allDevices[did] })
                }
              }
            }
            roomMap[roomId] = { id: roomId, name: room.name, devices: devs }
          }
        }

        setDevices(roomMap)
      } catch {
        setDevices({})
      }
      setDevicesLoading(false)
    })

    return () => { stopFloor(); stopDevices() }
  }, [selectedFloorId, userId])

  const handleToggle = async (deviceId, state) => {
    try {
      await setDeviceState(deviceId, state)
    } catch {
      toast.toast('Failed to update device state')
    }
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
      await addRoom(userId, selectedFloorId, name)
    } catch (err) {
      toast.toast('Failed to add room: ' + (err.message || err.code))
    }
  }

  const handleAddDevice = async (roomId, deviceData) => {
    try {
      await addDevice(userId, selectedFloorId, roomId, deviceData)
    } catch (err) {
      toast.toast('Failed to add device: ' + (err.message || err.code))
    }
  }

  const handleDeleteRoom = async () => {
    if (deletingRoomId) {
      await deleteRoom(userId, selectedFloorId, deletingRoomId)
      setDeletingRoomId(null)
    }
  }

  const handleDeleteDevice = async () => {
    if (deletingDeviceId && selectedFloorId) {
      await deleteDevice(userId, deletingDeviceId, selectedFloorId, deletingDeviceRoomId)
      setDeletingDeviceId(null)
      setDeletingDeviceRoomId(null)
    }
  }

  const toggleRoomCollapse = (roomId) => {
    setCollapsedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }))
  }

  const allRoomEntries = Object.values(devices)
  const allDevs = allRoomEntries.flatMap((room) => room.devices)
  const totalDevices = allDevs.length
  const onDevices = allDevs.filter((d) => d.state === 'ON' || d.status === 'ON').length
  const errorDevices = allDevs.filter((d) => d.status === 'ERROR' || d.status === 'DISCONNECTED').length
  const allRooms = floorData?.rooms || {}

  if (!selectedFloorId) {
    if (floors.length === 0 && !floorsLoading) {
      return (
        <EmptyState
          icon={<Layers />}
          title="No floors yet"
          description="Add a floor using the sidebar or seed sample data from the navbar."
        />
      )
    }
    return (
      <EmptyState
        icon={<Settings />}
        title="Select a Floor"
        description="Choose a floor from the sidebar to view and control its devices."
      />
    )
  }

  if (floorsLoading || devicesLoading) {
    return (
      <Box>
        <SkeletonLoader type="detail" />
        <Box sx={{ mt: 3 }}>
          <SkeletonLoader type="stats" />
        </Box>
        <Box sx={{ mt: 3 }}>
          <SkeletonLoader type="card" count={6} />
        </Box>
      </Box>
    )
  }

  if (!floor) {
    return (
      <EmptyState
        icon={<Home />}
        title="Floor not found"
        description="Try selecting a different floor."
      />
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: C.blue50,
              border: `1px solid ${C.border}`,
            }}
          >
            {React.createElement(iconMap[floor.icon] || Home, { sx: { fontSize: 20, color: C.primary } })}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: C.text, fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {floor.name}
            </Typography>
            <Typography variant="body2" sx={{ color: C.muted }}>
              {allRoomEntries.length} room{allRoomEntries.length !== 1 ? 's' : ''} &middot; <AnimatedNumber value={totalDevices} /> device{totalDevices !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            onClick={() => setAddRoomOpen(true)}
          >
            Room
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            onClick={() => setAddDeviceOpen(true)}
            disabled={Object.keys(allRooms).length === 0}
          >
            Device
          </Button>
        </Box>
      </Box>

      {totalDevices > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: totalDevices, ...statCardColors.total, Icon: Bolt },
            { label: 'Active', value: onDevices, ...statCardColors.active, Icon: ToggleOn },
            { label: 'Alerts', value: errorDevices, ...statCardColors.alerts, Icon: WarningAmber },
          ].map(({ label, value, color, bg, Icon }) => (
            <Box
              key={label}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 2.5,
                bgcolor: bg,
                border: `1px solid ${alpha(color, 0.12)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                flex: 1,
                minWidth: 140,
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
                  bgcolor: alpha(color, 0.08),
                }}
              >
                <Icon sx={{ fontSize: 16, color }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.text, lineHeight: 1.1 }}>
                  <AnimatedNumber value={value} />
                </Typography>
                <Typography variant="caption" sx={{ color: C.muted, textTransform: 'none', letterSpacing: 0, fontSize: '0.62rem' }}>
                  {label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {totalDevices === 0 ? (
        <EmptyState
          icon={<Bolt />}
          title={Object.keys(allRooms).length === 0 ? 'No rooms on this floor' : 'No devices on this floor'}
          description={Object.keys(allRooms).length === 0 ? 'Click "Room" to create a room, then add devices.' : 'Click "Device" to add devices to existing rooms.'}
          action={Object.keys(allRooms).length === 0 ? { label: 'Add Room', onClick: () => setAddRoomOpen(true) } : undefined}
        />
      ) : (
        allRoomEntries.map((room) => {
          const isCollapsed = collapsedRooms[room.id]
          return (
            <Box key={room.id} sx={{ mb: 3 }}>
              <Box
                onClick={() => toggleRoomCollapse(room.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1.5,
                  gap: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  py: 0.5,
                  '&:hover > .room-chevron': { color: C.primary },
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleRoomCollapse(room.id) }}
                aria-expanded={!isCollapsed}
                aria-label={`${room.name} section`}
              >
                <ExpandMore
                  className="room-chevron"
                  sx={{
                    fontSize: 18,
                    color: C.muted,
                    transition: 'all 0.3s ease',
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: C.muted,
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                  }}
                >
                  {room.name} &middot; {room.devices.length} device{room.devices.length !== 1 ? 's' : ''}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDeletingRoomId(room.id); setDeleteRoomOpen(true) }}
                  aria-label="Delete room"
                  sx={{
                    color: alpha(C.error, 0.4),
                    p: 0.3,
                    transition: 'all 0.2s ease',
                    '&:hover': { color: C.error, bgcolor: C.red50 },
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
                          onDelete={() => { setDeletingDeviceId(device.id); setDeletingDeviceRoomId(room.id); setDeleteDeviceOpen(true) }}
                          style={{ animationDelay: `${idx * 0.06}s` }}
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
      <ConfirmDialog
        open={deleteDeviceOpen}
        onClose={() => { setDeleteDeviceOpen(false); setDeletingDeviceId(null); setDeletingDeviceRoomId(null) }}
        onConfirm={handleDeleteDevice}
        title="Delete Device"
        message="This will permanently delete this device."
        confirmLabel="Delete Device"
      />
    </Box>
  )
}
