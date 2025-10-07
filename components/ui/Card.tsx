import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddings = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm transition-all duration-200',
        hover && 'hover:shadow-md hover:-translate-y-0.5',
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}
