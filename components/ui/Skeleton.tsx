import { memo } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton = memo<SkeletonProps>(function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
  )
})
