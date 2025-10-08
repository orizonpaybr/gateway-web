import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  showPasswordToggle?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      showPasswordToggle = false,
      className = '',
      type,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setShowPassword(!showPassword)
    }

    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type

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
            type={inputType}
            data-show-password={showPasswordToggle ? showPassword : undefined}
            className={cn(
              'w-full px-4 py-3.5 border border-gray-500 rounded-lg text-sm bg-white text-gray-900 transition-all duration-200',
              'placeholder:text-gray-500 placeholder:opacity-80',
              'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
              'hover:border-gray-600',
              icon && 'pl-11',
              showPasswordToggle && 'pr-11',
              error && 'border-red-500',
              className,
            )}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10 p-1 rounded hover:bg-gray-100"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
