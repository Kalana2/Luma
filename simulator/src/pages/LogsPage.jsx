import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  alpha,
} from '@mui/material'
import {
  History,
  Description,
  WarningAmber,
  Timeline,
} from '@mui/icons-material'
import useUserDevices from '../hooks/useUserDevices'
import useUserLogs from '../hooks/useUserLogs'
import useReports from '../hooks/useReports'
import useAlerts from '../hooks/useAlerts'
import { db, ref, onValue } from '../firebase/firebaseConfig'

const C = {
  gold: '#C9A84C',
  navy: '#1E3A5F',
  champagne: '#E8D5A3',
  platinum: '#C4B5D0',
  muted: '#7C6B8A',
  dark: '#0F1D35',
  emerald: '#0D9488',
  red: '#BE123C',
  purple: '#8B5CF6',
}

const eventColors = {
  page_navigation: '#3B82F6',
  floor_select: '#8B5CF6',
  dashboard_view: '#0D9488',
  device_detail_view: '#F59E0B',
  device_toggle: '#EF4444',
  switch_toggle: '#8B5CF6',
}

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}

function formatDuration(minutes) {
  if (!minutes) return '-'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function UserActivityLogs({ userId }) {
  const { logs, loading } = useUserLogs(userId)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} sx={{ color: C.gold }} /></Box>
  if (!logs.length) return <EmptySection message="No activity logs yet." />

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {logs.slice(0, 50).map((log) => (
        <Card key={log.id} sx={{ '&:hover': { transform: 'none' } }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={log.event}
                size="small"
                sx={{
                  bgcolor: alpha(eventColors[log.event] || C.muted, 0.12),
                  color: eventColors[log.event] || C.muted,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              />
              <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
                {formatTime(log.timestamp)}
              </Typography>
              {log.details?.from && log.details?.to && (
                <Typography variant="caption" sx={{ color: C.platinum, fontSize: '0.68rem' }}>
                  {log.details.from} → {log.details.to}
                </Typography>
              )}
              {log.details?.deviceId && (
                <Typography variant="caption" sx={{ color: C.platinum, fontSize: '0.68rem' }}>
                  Device: {log.details.deviceId}
                </Typography>
              )}
              {log.details?.state && (
                <Chip
                  label={log.details.state}
                  size="small"
                  sx={{
                    bgcolor: log.details.state === 'ON' ? alpha(C.emerald, 0.12) : alpha(C.muted, 0.12),
                    color: log.details.state === 'ON' ? C.emerald : C.muted,
                    fontWeight: 600,
                    fontSize: '0.6rem',
                    height: 20,
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

function DeviceHistory({ deviceIds }) {
  const [historyMap, setHistoryMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!deviceIds || !deviceIds.length) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubs = []
    const result = {}

    let completed = 0
    const checkDone = () => {
      completed++
      if (completed === deviceIds.length) {
        setHistoryMap({ ...result })
        setLoading(false)
      }
    }

    deviceIds.forEach((did) => {
      const histRef = ref(db, `devices/${did}/history`)
      const unsub = onValue(histRef, (snap) => {
        if (snap.exists()) {
          const data = snap.val()
          result[did] = Object.entries(data).map(([id, entry]) => ({ id, ...entry }))
        } else {
          result[did] = []
        }
        checkDone()
      })
      unsubs.push(unsub)
    })

    return () => unsubs.forEach((u) => u())
  }, [deviceIds])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} sx={{ color: C.gold }} /></Box>

  const allEntries = Object.entries(historyMap)
    .flatMap(([devId, entries]) => entries.map((e) => ({ ...e, devId })))
    .sort((a, b) => (b.turnedOffAt || 0) - (a.turnedOffAt || 0))

  if (!allEntries.length) return <EmptySection message="No device session history yet. Turn a device ON and OFF to generate history." />

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {allEntries.slice(0, 50).map((entry) => (
        <Card key={entry.id} sx={{ '&:hover': { transform: 'none' } }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: C.champagne, fontWeight: 600, fontSize: '0.75rem' }}>
                {entry.devId}
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
                Off at: {formatTime(entry.turnedOffAt)}
              </Typography>
              <Chip
                label={`${formatDuration(entry.durationMinutes)}`}
                size="small"
                icon={<Timeline sx={{ fontSize: 13 }} />}
                sx={{
                  bgcolor: alpha(C.purple, 0.1),
                  color: C.purple,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              />
              {entry.estimatedKwh != null && (
                <Chip
                  label={`${entry.estimatedKwh.toFixed(3)} kWh`}
                  size="small"
                  sx={{
                    bgcolor: alpha(C.gold, 0.1),
                    color: C.gold,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

function DailyReports({ deviceIds }) {
  const { reports, loading } = useReports(deviceIds)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} sx={{ color: C.gold }} /></Box>
  if (!reports.length) return <EmptySection message="No daily reports yet. Reports are generated when a device is turned OFF." />

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {reports.slice(0, 50).map((report) => (
        <Card key={report.id} sx={{ '&:hover': { transform: 'none' } }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: C.champagne, fontWeight: 600, fontSize: '0.75rem' }}>
                {report.deviceName || report.deviceId}
              </Typography>
              <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
                {report.date}
              </Typography>
              <Chip
                label={`${formatDuration(report.totalOnDurationMinutes)} on`}
                size="small"
                sx={{
                  bgcolor: alpha(C.emerald, 0.1),
                  color: C.emerald,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              />
              <Chip
                label={`${report.totalSessions || 0} sessions`}
                size="small"
                sx={{
                  bgcolor: alpha(C.navy, 0.12),
                  color: C.platinum,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              />
              {report.estimatedKwh != null && (
                <Chip
                  label={`${report.estimatedKwh.toFixed(2)} kWh`}
                  size="small"
                  sx={{
                    bgcolor: alpha(C.gold, 0.1),
                    color: C.gold,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

function AlertsList({ deviceIds }) {
  const { alerts, loading } = useAlerts(deviceIds)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} sx={{ color: C.gold }} /></Box>
  if (!alerts.length) return <EmptySection message="No alerts. Everything looks good!" />

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {alerts.slice(0, 50).map((alert) => (
        <Card
          key={alert.id}
          sx={{
            borderLeft: `3px solid ${alert.type === 'AUTO_SHUTDOWN' ? C.gold : C.red}`,
            '&:hover': { transform: 'none' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={alert.type}
                size="small"
                icon={<WarningAmber sx={{ fontSize: 13 }} />}
                sx={{
                  bgcolor: alert.type === 'AUTO_SHUTDOWN' ? alpha(C.gold, 0.12) : alpha(C.red, 0.12),
                  color: alert.type === 'AUTO_SHUTDOWN' ? C.gold : C.red,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              />
              <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
                {formatTime(alert.timestamp)}
              </Typography>
              <Typography variant="caption" sx={{ color: C.platinum, fontSize: '0.68rem' }}>
                {alert.message}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

function EmptySection({ message }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, color: C.muted }}>
      <Typography variant="body2">{message}</Typography>
    </Box>
  )
}

export default function LogsPage({ userId }) {
  const [tab, setTab] = useState(0)
  const { deviceIds, loading: devLoading } = useUserDevices(userId)

  const tabs = [
    { label: 'Activity Logs', icon: <History sx={{ fontSize: 18 }} />, component: <UserActivityLogs userId={userId} /> },
    { label: 'Device History', icon: <Timeline sx={{ fontSize: 18 }} />, component: <DeviceHistory deviceIds={deviceIds} /> },
    { label: 'Daily Reports', icon: <Description sx={{ fontSize: 18 }} />, component: <DailyReports deviceIds={deviceIds} /> },
    { label: 'Alerts', icon: <WarningAmber sx={{ fontSize: 18 }} />, component: <AlertsList deviceIds={deviceIds} /> },
  ]

  return (
    <Box className="page-enter" sx={{ maxWidth: 900 }}>
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
          <History sx={{ fontSize: 20, color: C.gold }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: C.champagne, fontWeight: 600 }}>
            Logs & Reports
          </Typography>
          <Typography variant="body2" sx={{ color: C.muted }}>
            View your device activity, reports, and alerts
          </Typography>
        </Box>
      </Box>

      {devLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: C.gold }} />
        </Box>
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 3,
              borderBottom: `1px solid ${alpha(C.gold, 0.06)}`,
              '& .MuiTab-root': {
                color: C.muted,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.82rem',
                minHeight: 44,
                py: 0,
                '&.Mui-selected': { color: C.gold },
              },
              '& .MuiTabs-indicator': { bgcolor: C.gold },
            }}
          >
            {tabs.map((t, i) => (
              <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
            ))}
          </Tabs>

          {tabs[tab].component}
        </>
      )}
    </Box>
  )
}
