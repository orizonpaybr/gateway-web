'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SelectProps {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
}

// Componente Select otimizado para trabalhar com react-hook-form
// Usamos forwardRef sem memo para garantir que re-renderize quando necessário
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      value = '',
      onChange,
      onBlur,
      className = '',
      placeholder = 'Selecione...',
      disabled = false,
      id,
      name,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Atualizar valor interno quando prop value mudar (controlled component)
    useEffect(() => {
      setSelectedValue(value)
    }, [value])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = useCallback(
      (optionValue: string) => {
        onChange?.(optionValue)
        setSelectedValue(optionValue)
        setIsOpen(false)
      },
      [onChange],
    )

    const selectedOption = useMemo(
      () => options.find((option) => option.value === selectedValue),
      [options, selectedValue],
    )

    return (
      <div className="flex flex-col gap-1.5 w-full" ref={ref}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-gray-900 uppercase tracking-wider leading-tight h-4"
          >
            {label}
          </label>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            id={id}
            name={name}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 transition-all duration-200',
              'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
              'hover:border-gray-400',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              error && 'border-red-500',
              className,
            )}
          >
            <span className="block text-left truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors',
                    'first:rounded-t-lg last:rounded-b-lg',
                    selectedValue === option.value &&
                      'bg-blue-50 text-blue-900',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
      </div>
    )
  },
)

Select.displayName = 'Select'
