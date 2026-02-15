import { useState, useCallback } from 'react'

interface UseNumericInputOptions {
  min?: number
  max?: number
  decimals?: number
  onValueChange?: (value: number | null) => void
}

export function useNumericInput(
  initialValue: number | null = null,
  options: UseNumericInputOptions = {},
) {
  const { min = 0, max, decimals = 2, onValueChange } = options
  const [displayValue, setDisplayValue] = useState<string>(
    initialValue !== null ? String(initialValue) : '',
  )
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = useCallback((rawValue: string) => {
    setIsEditing(true)
    setDisplayValue(rawValue)
  }, [])

  const handleBlur = useCallback(() => {
    setIsEditing(false)

    // Parsear valor
    const parsed = parseFloat(displayValue)

    if (isNaN(parsed) || displayValue.trim() === '') {
      // Resetar para vazio se inválido
      setDisplayValue('')
      onValueChange?.(null)
      return
    }

    // Aplicar limites
    let finalValue = parsed
    if (min !== undefined && finalValue < min) {
      finalValue = min
    }
    if (max !== undefined && finalValue > max) {
      finalValue = max
    }

    // Formatar com decimais
    const formatted = finalValue.toFixed(decimals)
    setDisplayValue(formatted)
    onValueChange?.(finalValue)
  }, [displayValue, min, max, decimals, onValueChange])

  const setValue = useCallback((value: number | null) => {
    setDisplayValue(value !== null ? String(value) : '')
    setIsEditing(false)
  }, [])

  return {
    displayValue: isEditing ? displayValue : displayValue,
    handleChange,
    handleBlur,
    setValue,
    numericValue: parseFloat(displayValue) || null,
  }
}
