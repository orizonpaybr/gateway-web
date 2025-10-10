'use client'

import { forwardRef } from 'react'
import InputMask from 'react-input-mask'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  label?: string
  placeholder?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  name?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      placeholder,
      error,
      value = '',
      onChange,
      onBlur,
      disabled,
      className,
      name,
    },
    ref,
  ) => {
    // Determinar máscara baseada no valor atual
    const cleaned = value.replace(/[^\d]/g, '')
    const mask = cleaned.length <= 10 ? '(99) 9999-99999' : '(99) 99999-9999'

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-semibold text-gray-700 uppercase">
            {label}
          </label>
        )}

        <div className="relative">
          <InputMask
            mask={mask}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            maskChar={null}
          >
            {(inputProps: any) => (
              <input
                {...inputProps}
                ref={ref}
                name={name}
                type="tel"
                placeholder={placeholder}
                autoComplete="tel"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  'placeholder:text-gray-400',
                  'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                  error
                    ? 'border-red-500'
                    : 'border-gray-300 hover:border-gray-400',
                  className,
                )}
              />
            )}
          </InputMask>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)

PhoneInput.displayName = 'PhoneInput'

// Exportar função de validação
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d]/g, '')
  return cleaned.length >= 10 && cleaned.length <= 11
}
