'use client'

import { forwardRef, useState, useEffect, memo, useCallback } from 'react'
import { formatCurrencyInput, cleanCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  name?: string
  placeholder?: string
  hideLabel?: boolean
  prefix?: string
}

export const CurrencyInput = memo(
  forwardRef<HTMLInputElement, CurrencyInputProps>(
    (
      {
        label,
        error,
        value = '',
        onChange,
        onBlur,
        disabled,
        className,
        name,
        placeholder = '0,00',
        hideLabel = false,
        prefix = 'R$',
      },
      ref,
    ) => {
      const [displayValue, setDisplayValue] = useState('')

      useEffect(() => {
        if (value === '') {
          setDisplayValue('')
        } else {
          setDisplayValue(formatCurrencyInput(value))
        }
      }, [value])

      const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value
          const cleaned = cleanCurrency(inputValue)

          const limitedCleaned = cleaned.slice(0, 8)

          const formatted = formatCurrencyInput(limitedCleaned)
          setDisplayValue(formatted)

          onChange?.(limitedCleaned)
        },
        [onChange],
      )

      return (
        <div className="space-y-2">
          {!hideLabel && label && (
            <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider">
              {label}
            </label>
          )}

          <div className="relative">
            <input
              ref={ref}
              name={name}
              type="text"
              value={displayValue}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={placeholder}
              autoComplete="off"
              className={cn(
                'w-full px-4 py-3.5 pl-12 pr-4 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 transition-all duration-200',
                'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
                'placeholder:text-gray-400',
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                error
                  ? 'border-red-500'
                  : 'border-gray-300 hover:border-gray-400',
                className,
              )}
            />

            {prefix && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold pointer-events-none">
                {prefix}
              </span>
            )}
          </div>

          {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
        </div>
      )
    },
  ),
)

CurrencyInput.displayName = 'CurrencyInput'
