// components/optimized/LazyComponent.tsx
'use client'

import React, { Suspense, memo, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

interface LazyComponentProps {
  fallback?: React.ReactNode
  className?: string
}

const DefaultFallback = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
))

DefaultFallback.displayName = 'DefaultFallback'

export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(importFunc)

  return memo((props: React.ComponentProps<T> & LazyComponentProps) => {
    const { fallback: customFallback, className, ...restProps } = props

    return (
      <Suspense
        fallback={
          customFallback || (
            <div className={className}>
              <DefaultFallback />
            </div>
          )
        }
      >
        <LazyComponent {...(restProps as React.ComponentProps<T>)} />
      </Suspense>
    )
  })
}

// Exemplo de uso:
// const LazyDashboard = createLazyComponent(() => import('./Dashboard'))
// const LazyChart = createLazyComponent(() => import('./Chart'))
