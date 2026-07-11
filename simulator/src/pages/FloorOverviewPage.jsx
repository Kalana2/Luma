import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, CircularProgress, alpha } from '@mui/material'
import { db, ref, onValue, get } from '../firebase/firebaseConfig'
import { setDeviceState } from '../firebase/deviceService'
import useFloorList from '../hooks/useFloorList'
import DeviceCard from '../components/DeviceCard'
import { Home, Stairs, Roofing, Settings } from '@mui/icons-material'

const iconMap = { home: Home, stairs: Stairs, attic: Roofing }

export default function FloorOverviewPage({ selectedFloorId }) {
  const navigate = useNavigate()
  const { floors, loading: floorsLoading } = useFloorList()
  const [devices, setDevices] = useState([])
  const [devicesLoading, setDevicesLoading] = useState(false)

  const floor = floors.find((f) => f.id === selectedFloorId)

  useEffect(() => {
    if (!selectedFloorId) {
      setDevices([])
      return
    }

    setDevicesLoading(true)
    setDevices([])

    const devicesRef = ref(db, 'devices')
    const stopDevices = onValue(devicesRef, async (snapshot) => {
      try {
        const allDevices = snapshot.exists() ? snapshot.val() : {}
        const floorSnap = await get(ref(db, `floors/${selectedFloorId}`))
        if (!floorSnap.exists()) {
          setDevices([])
          setDevicesLoading(false)
          return
        }

        const floorData = floorSnap.val()
        const roomMap = {}

        if (floorData.rooms) {
          for (const roomId in floorData.rooms) {
            const room = floorData.rooms[roomId]
            const devs = []
            if (room.devices) {
              for (const did in room.devices) {
                if (allDevices[did]) {
                  devs.push({ id: did, ...allDevices[did] })
                }
              }
            }
            if (devs.length > 0) {
              roomMap[roomId] = { name: room.name, devices: devs }
            }
          }
        }

        setDevices(roomMap)
      } catch (err) {
        console.error('Device load error:', err)
        setDevices([])
      }
      setDevicesLoading(false)
    })

    return () => {
      stopDevices()
    }
  }, [selectedFloorId])

  const handleToggle = async (deviceId, state) => {
    await setDeviceState(deviceId, state)
  }

  const handleViewDetails = (deviceId) => {
    const device = Object.values(devices).flatMap((r) => r.devices).find((d) => d.id === deviceId)
    if (device?.type === 'camera') {
      navigate(`/camera/${deviceId}`)
    } else {
      navigate(`/device/${deviceId}`)
    }
  }

  if (!selectedFloorId) {
    return (
      <Box sx={{ animation: 'slide-up-stagger 0.6s ease-out', textAlign: 'center', pt: 12 }}>
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
        <Typography variant="h5" sx={{ color: '#F1F5F9', mb: 1, fontWeight: 500 }}>
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

  const totalDevices = Object.values(devices).reduce((sum, room) => sum + room.devices.length, 0)

  return (
    <Box sx={{ animation: 'slide-up-stagger 0.6s ease-out' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
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
            {Object.keys(devices).length} rooms &middot; {totalDevices} devices
          </Typography>
        </Box>
      </Box>

      {totalDevices === 0 ? (
        <Box
          sx={{
            mt: 4,
            p: 6,
            borderRadius: 3,
            textAlign: 'center',
            border: `1px solid ${alpha('#3B82F6', 0.08)}`,
            bgcolor: alpha('#0F172A', 0.5),
          }}
        >
          <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 400 }}>
            No devices on this floor
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Click <strong>Seed Data</strong> in the navbar to create demo devices.
          </Typography>
        </Box>
      ) : (
        Object.entries(devices).map(([roomId, room]) => (
          <Box key={roomId} sx={{ mb: 4 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1.5,
                color: '#475569',
                fontSize: '0.62rem',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              {room.name} &middot; {room.devices.length} device{room.devices.length !== 1 ? 's' : ''}
            </Typography>
            <Grid container spacing={2}>
              {room.devices.map((device, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={device.id}>
                  <Box sx={{ animation: `slide-up-stagger 0.4s ease-out ${idx * 0.06}s both` }}>
                    <DeviceCard
                      device={device}
                      onToggle={handleToggle}
                      onViewDetails={handleViewDetails}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
    </Box>
  )
}
