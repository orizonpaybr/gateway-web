import React, { memo } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(
  ({ size = 'md', className = '' }) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
    }

    return (
      <div
        className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin ${className}`}
        role="status"
        aria-label="Carregando"
      >
        <span className="sr-only">Carregando...</span>
      </div>
    )
  },
)
