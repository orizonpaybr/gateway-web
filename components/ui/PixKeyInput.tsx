'use client'

import { forwardRef, useState, useEffect, memo } from 'react'
import InputMask from 'react-input-mask'
import { cn } from '@/lib/utils'
import { validateCPF, validateCNPJ } from './DocumentInput'
import { validatePhone } from './PhoneInput'

interface PixKeyInputProps {
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  name?: string
  keyType: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria'
  hideLabel?: boolean
}

const getPlaceholder = (keyType: string): string => {
  switch (keyType) {
    case 'cpf':
      return '000.000.000-00'
    case 'cnpj':
      return '00.000.000/0000-00'
    case 'telefone':
      return '(11) 99999-9999'
    case 'email':
      return 'seu@email.com'
    case 'aleatoria':
      return 'Chave aleatória'
    default:
      return 'Digite a chave'
  }
}

const getMask = (keyType: string): string => {
  switch (keyType) {
    case 'cpf':
      return '999.999.999-99'
    case 'cnpj':
      return '99.999.999/9999-99'
    case 'telefone':
      return '(99) 99999-9999'
    case 'email':
    case 'aleatoria':
    default:
      return ''
  }
}

const validateKey = (keyType: string, value: string): boolean => {
  switch (keyType) {
    case 'cpf':
      return validateCPF(value)
    case 'cnpj':
      return validateCNPJ(value)
    case 'telefone':
      return validatePhone(value)
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'aleatoria':
      return value.length > 0
    default:
      return false
  }
}

export const PixKeyInput = memo(
  forwardRef<HTMLInputElement, PixKeyInputProps>(
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
        keyType,
        hideLabel = false,
      },
      ref,
    ) => {
      const [isValid, setIsValid] = useState<boolean | null>(null)
      const placeholder = getPlaceholder(keyType)
      const mask = getMask(keyType)

      useEffect(() => {
        if (value.length === 0) {
          setIsValid(null)
        } else {
          setIsValid(validateKey(keyType, value))
        }
      }, [value, keyType])

      if (keyType === 'email' || keyType === 'aleatoria') {
        return (
          <div className="space-y-2">
            {!hideLabel && label && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
            )}

            <div className="relative">
              <input
                ref={ref}
                name={name}
                type={keyType === 'email' ? 'email' : 'text'}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete={keyType === 'email' ? 'email' : 'off'}
                className={cn(
                  'w-full px-4 py-3.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 transition-all duration-200',
                  'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
                  'placeholder:text-gray-400',
                  'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                  error
                    ? 'border-red-500'
                    : isValid === true
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                    : isValid === false
                    ? 'border-red-500'
                    : 'border-gray-300 hover:border-gray-400',
                  className,
                )}
              />
            </div>

            {error && (
              <span className="text-xs text-red-500 -mt-1">{error}</span>
            )}
          </div>
        )
      }

      return (
        <div className="space-y-2">
          {!hideLabel && label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  type="text"
                  placeholder={placeholder}
                  autoComplete="off"
                  className={cn(
                    'w-full px-4 py-3.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 transition-all duration-200',
                    'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
                    'placeholder:text-gray-400',
                    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                    error
                      ? 'border-red-500'
                      : isValid === true
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : isValid === false
                      ? 'border-red-500'
                      : 'border-gray-300 hover:border-gray-400',
                    className,
                  )}
                />
              )}
            </InputMask>
          </div>

          {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
        </div>
      )
    },
  ),
)

PixKeyInput.displayName = 'PixKeyInput'

export const validatePixKey = (keyType: string, value: string): boolean => {
  return validateKey(keyType, value)
}
