/**
 * Hooks e helpers de formatação
 * Centraliza formatação de dados (DRY)
 * Usa useCallback para memoização
 */

import { useCallback } from 'react'
import {
  formatDateBR,
  formatCurrencyBRL,
  formatNumber as formatNumberUtil,
} from '@/lib/format'

/**
 * Hook para formatar datas
 * Memorizado com useCallback
 */
export function useFormatDate() {
  return useCallback((dateStr?: string | null): string => {
    if (!dateStr) return '-'
    return formatDateBR(dateStr)
  }, [])
}

/**
 * Hook para formatar moeda
 * Memorizado com useCallback
 */
export function useFormatCurrency() {
  return useCallback((value: number | undefined | null): string => {
    return formatCurrencyBRL(value || 0)
  }, [])
}

/**
 * Hook para formatar número
 * Memorizado com useCallback
 */
export function useFormatNumber(decimals: number = 2) {
  return useCallback(
    (value: number | undefined | null): string => {
      return formatNumberUtil(value, decimals)
    },
    [decimals],
  )
}

/**
 * Função utilitária para formatar data (sem hook)
 * Útil para uso fora de componentes React
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-'
  return formatDateBR(dateStr)
}

/**
 * Função utilitária para formatar moeda (sem hook)
 * Útil para uso fora de componentes React
 */
export function formatCurrency(value: number | undefined | null): string {
  return formatCurrencyBRL(value || 0)
}
