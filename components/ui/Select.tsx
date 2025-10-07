import React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
            error && 'border-red-500',
            className,
          )}
          {...props}
        >
          <option value="">Selecione...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
      </div>
    )
  },
)

Select.displayName = 'Select'
