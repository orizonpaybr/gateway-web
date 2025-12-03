'use client'

import React, { forwardRef, useState, useEffect } from 'react'

import InputMask from 'react-input-mask'

import { cn } from '@/lib/utils'

interface DocumentInputProps {
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

// Funções de validação
const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/[^\d]/g, '')

  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) {
    digit = 0
  }
  if (digit !== parseInt(cleaned.charAt(9))) {
    return false
  }

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) {
    digit = 0
  }
  if (digit !== parseInt(cleaned.charAt(10))) {
    return false
  }

  return true
}

const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/[^\d]/g, '')

  if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) {
    return false
  }

  let size = cleaned.length - 2
  let numbers = cleaned.substring(0, size)
  const digits = cleaned.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) {
      pos = 9
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) {
    return false
  }

  size = size + 1
  numbers = cleaned.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) {
      pos = 9
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) {
    return false
  }

  return true
}

export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(
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
    const [isValid, setIsValid] = useState<boolean | null>(null)

    // Determinar máscara e tipo baseado no valor atual
    const cleaned = value.replace(/[^\d]/g, '')
    const mask = cleaned.length <= 11 ? '999.999.999-999' : '99.999.999/9999-99'
    const documentType = cleaned.length <= 11 ? 'CPF' : 'CNPJ'

    useEffect(() => {
      if (cleaned.length === 0) {
        setIsValid(null)
      } else if (cleaned.length === 11) {
        setIsValid(validateCPF(value))
      } else if (cleaned.length === 14) {
        setIsValid(validateCNPJ(value))
      } else {
        setIsValid(null)
      }
    }, [value, cleaned.length])

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
            {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
              <input
                {...inputProps}
                ref={ref}
                name={name}
                type="text"
                placeholder={placeholder}
                autoComplete="off"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
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

          {cleaned.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {documentType}
              </span>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {isValid === true && !error && (
          <p className="text-xs text-green-600">✓ {documentType} válido</p>
        )}

        {isValid === false && !error && (
          <p className="text-xs text-red-500">✗ {documentType} inválido</p>
        )}
      </div>
    )
  },
)

DocumentInput.displayName = 'DocumentInput'

export const validateDocument = (doc: string): boolean => {
  const cleaned = doc.replace(/[^\d]/g, '')
  if (cleaned.length === 11) {
    return validateCPF(doc)
  } else if (cleaned.length === 14) {
    return validateCNPJ(doc)
  }
  return false
}

export { validateCPF, validateCNPJ }
