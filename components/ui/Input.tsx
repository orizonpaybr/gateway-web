import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-4 flex items-center justify-center text-gray-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3.5 border border-gray-500 rounded-lg text-sm bg-white text-gray-900 transition-all duration-200',
              'placeholder:text-gray-500 placeholder:opacity-80',
              'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
              'hover:border-gray-600',
              icon && 'pl-11',
              error && 'border-red-500',
              className,
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
