import { Box, Skeleton } from '@mui/material'
import { C } from '../theme/colors'

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'detail' | 'stats'
  count?: number
}

function StatSkeleton() {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.2,
        borderRadius: 2.5,
        bgcolor: C.paper,
        border: `1px solid ${C.border}`,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
      }}
    >
      <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 2 }} />
      <Box>
        <Skeleton variant="text" width={40} height={24} />
        <Skeleton variant="text" width={50} height={12} />
      </Box>
    </Box>
  )
}

function CardSkeleton() {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: C.paper,
        border: `1px solid ${C.border}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: 2.5 }} />
          <Box>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={60} height={14} />
          </Box>
        </Box>
        <Skeleton variant="rounded" width={70} height={26} sx={{ borderRadius: 1.5 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.2, borderTop: `1px solid ${C.border}` }}>
        <Skeleton variant="text" width={80} height={14} />
        <Skeleton variant="rounded" width={44} height={24} sx={{ borderRadius: 12 }} />
      </Box>
    </Box>
  )
}

function ListSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: C.paper,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Skeleton variant="rounded" width={24} height={24} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={80} height={14} sx={{ ml: 'auto' }} />
        </Box>
      ))}
    </Box>
  )
}

function DetailSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2.5 }} />
        <Box>
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={100} height={16} />
        </Box>
      </Box>
      <Box sx={{ p: 3, borderRadius: 3, bgcolor: C.paper, border: `1px solid ${C.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={50} height={14} />
          <Skeleton variant="rounded" width={80} height={30} sx={{ borderRadius: 1.5 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Skeleton variant="text" width={100} height={18} />
            <Skeleton variant="text" width={120} height={14} />
          </Box>
          <Skeleton variant="rounded" width={44} height={24} sx={{ borderRadius: 12 }} />
        </Box>
      </Box>
    </Box>
  )
}

export default function SkeletonLoader({ type, count = 3 }: SkeletonLoaderProps) {
  if (type === 'stats') {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </Box>
    )
  }

  if (type === 'detail') {
    return <DetailSkeleton />
  }

  if (type === 'list') {
    return <ListSkeleton />
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </Box>
  )
}
