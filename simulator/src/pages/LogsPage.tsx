import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
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
import PageHeader from '../components/PageHeader'
import SkeletonLoader from '../components/SkeletonLoader'
import { C } from '../theme/colors'

const eventColors = {
  page_navigation: '#2563EB',
  floor_select: '#7C3AED',
  dashboard_view: '#059669',
  device_detail_view: '#F59E0B',
  device_toggle: '#DC2626',
  switch_toggle: '#7C3AED',
  session_start: '#059669',
  session_end: '#DC2626',
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

function LogList({ items, renderItem, emptyMessage }) {
  if (!items.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: C.muted }}>
        <Typography variant="body2">{emptyMessage}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {items.slice(0, 100).map((item, i) => (
        <Box
          key={item.id}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: C.paper,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: alpha(C.primary, 0.15) },
          }}
        >
          {renderItem(item, i)}
        </Box>
      ))}
    </Box>
  )
}

function UserActivityLogs({ userId }) {
  const { logs, loading } = useUserLogs(userId)

  if (loading) return <SkeletonLoader type="list" />

  return (
    <LogList
      items={logs}
      emptyMessage="No activity logs yet."
      renderItem={(log) => (
        <>
          <Box
            sx={{
              px: 1.2,
              py: 0.4,
              borderRadius: 1.5,
              bgcolor: alpha(eventColors[log.event] || C.muted, 0.08),
              color: eventColors[log.event] || C.muted,
              fontWeight: 600,
              fontSize: '0.65rem',
              letterSpacing: '0.02em',
            }}
          >
            {log.event}
          </Box>
          <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
            {formatTime(log.timestamp)}
          </Typography>
          {log.details?.from && log.details?.to && (
            <Typography variant="caption" sx={{ color: C.textSecondary, fontSize: '0.68rem' }}>
              {log.details.from} &rarr; {log.details.to}
            </Typography>
          )}
          {log.details?.deviceId && (
            <Typography variant="caption" sx={{ color: C.textSecondary, fontSize: '0.68rem' }}>
              Device: {log.details.deviceId}
            </Typography>
          )}
          {log.details?.state && (
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: 1,
                bgcolor: log.details.state === 'ON' ? alpha(C.success, 0.08) : alpha(C.muted, 0.08),
                color: log.details.state === 'ON' ? C.success : C.muted,
                fontWeight: 600,
                fontSize: '0.6rem',
              }}
            >
              {log.details.state}
            </Box>
          )}
          {log.sessionId && (
            <Typography variant="caption" sx={{ color: alpha(C.muted, 0.4), fontSize: '0.6rem', ml: 'auto' }}>
              {log.sessionId.slice(0, 8)}
            </Typography>
          )}
        </>
      )}
    />
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
          const data = snap.val() as Record<string, any>
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

  if (loading) return <SkeletonLoader type="list" />

  const allEntries = Object.entries(historyMap)
    .flatMap(([devId, entries]) => (entries as any[]).map((e) => ({ ...e, devId })))
    .sort((a, b) => (b.turnedOffAt || 0) - (a.turnedOffAt || 0))

  return (
    <LogList
      items={allEntries}
      emptyMessage="No device session history yet. Turn a device ON and OFF to generate history."
      renderItem={(entry) => (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: C.text, fontWeight: 600, fontSize: '0.75rem', minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {entry.devId}
            </Typography>
            <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
              Off at: {formatTime(entry.turnedOffAt)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <Box
              sx={{
                px: 1.2, py: 0.3, borderRadius: 1.5,
                bgcolor: alpha(C.secondary, 0.08), color: C.secondary,
                fontWeight: 600, fontSize: '0.65rem',
              }}
            >
              {formatDuration(entry.durationMinutes)}
            </Box>
            {entry.estimatedKwh != null && (
              <Box
                sx={{
                  px: 1.2, py: 0.3, borderRadius: 1.5,
                  bgcolor: alpha(C.primary, 0.08), color: C.primary,
                  fontWeight: 600, fontSize: '0.65rem',
                }}
              >
                {entry.estimatedKwh.toFixed(3)} kWh
              </Box>
            )}
          </Box>
        </>
      )}
    />
  )
}

function DailyReports({ deviceIds }) {
  const { reports, loading } = useReports(deviceIds)

  if (loading) return <SkeletonLoader type="list" />

  return (
    <LogList
      items={reports}
      emptyMessage="No daily reports yet. Reports are generated when a device is turned OFF."
      renderItem={(report) => (
        <>
          <Typography variant="caption" sx={{ color: C.text, fontWeight: 600, fontSize: '0.75rem', minWidth: 100 }}>
            {report.deviceName || report.deviceId}
          </Typography>
          <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
            {report.date}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8, ml: 'auto' }}>
            <Box sx={{ px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: alpha(C.success, 0.08), color: C.success, fontWeight: 600, fontSize: '0.65rem' }}>
              {formatDuration(report.totalOnDurationMinutes)}
            </Box>
            <Box sx={{ px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: alpha(C.primary, 0.08), color: C.textSecondary, fontWeight: 600, fontSize: '0.65rem' }}>
              {report.totalSessions || 0} sessions
            </Box>
            {report.estimatedKwh != null && (
              <Box sx={{ px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: alpha(C.primary, 0.08), color: C.primary, fontWeight: 600, fontSize: '0.65rem' }}>
                {report.estimatedKwh.toFixed(2)} kWh
              </Box>
            )}
          </Box>
        </>
      )}
    />
  )
}

function AlertsList({ deviceIds }) {
  const { alerts, loading } = useAlerts(deviceIds)

  if (loading) return <SkeletonLoader type="list" />

  return (
    <LogList
      items={alerts}
      emptyMessage="No alerts. Everything looks good!"
      renderItem={(alert) => (
        <>
          <Box sx={{
            width: 3,
            height: 24,
            borderRadius: 3,
            bgcolor: alert.type === 'AUTO_SHUTDOWN' ? C.warning : C.error,
          }} />
          <Box
            sx={{
              px: 1.2, py: 0.3, borderRadius: 1.5,
              bgcolor: alert.type === 'AUTO_SHUTDOWN' ? alpha(C.warning, 0.08) : alpha(C.error, 0.08),
              color: alert.type === 'AUTO_SHUTDOWN' ? C.warning : C.error,
              fontWeight: 600, fontSize: '0.65rem',
            }}
          >
            {alert.type}
          </Box>
          <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
            {formatTime(alert.timestamp)}
          </Typography>
          <Typography variant="caption" sx={{ color: C.textSecondary, fontSize: '0.68rem' }}>
            {alert.message}
          </Typography>
        </>
      )}
    />
  )
}

export default function LogsPage({ userId }) {
  const [tab, setTab] = useState(0)
  const { deviceIds, loading: devLoading } = useUserDevices(userId)

  const tabs = [
    { label: 'Activity', icon: <History sx={{ fontSize: 18 }} />, component: <UserActivityLogs userId={userId} /> },
    { label: 'History', icon: <Timeline sx={{ fontSize: 18 }} />, component: <DeviceHistory deviceIds={deviceIds} /> },
    { label: 'Reports', icon: <Description sx={{ fontSize: 18 }} />, component: <DailyReports deviceIds={deviceIds} /> },
    { label: 'Alerts', icon: <WarningAmber sx={{ fontSize: 18 }} />, component: <AlertsList deviceIds={deviceIds} /> },
  ]

  return (
    <Box sx={{ maxWidth: 900, width: '100%', mx: 'auto' }}>
      <PageHeader
        icon={<History />}
        title="Logs & Reports"
        subtitle="View device activity, usage reports, and alerts"
      />

      {devLoading ? (
        <SkeletonLoader type="list" />
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 3, borderBottom: `1px solid ${C.border}`, minHeight: 40 }}
          >
            {tabs.map((t, i) => (
              <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" sx={{ minHeight: 40 }} />
            ))}
          </Tabs>

          {tabs[tab].component}
        </>
      )}
    </Box>
  )
}
