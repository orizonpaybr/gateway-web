import { useMemo } from 'react'
import { useDebounce } from './useDebounce'

export interface TableFilterOptions {
  /**
   * Campo de descrição do item
   */
  descricaoField?: string
  /**
   * Campo de valor numérico do item
   */
  valorField?: string
  /**
   * Campos adicionais para busca (ex: transaction_id, end_to_end, nome_cliente)
   */
  searchFields?: string[]
  /**
   * Função customizada de filtro
   */
  customFilter?: (item: unknown, searchTerm: string) => boolean
}

/**
 * Hook para filtro client-side em tempo real de tabelas
 * Filtra dados já carregados enquanto o usuário digita
 *
 * @param items - Array de items para filtrar
 * @param searchTerm - Termo de busca
 * @param options - Opções de configuração do filtro
 * @returns Items filtrados
 */
export function useTableFilter<T extends Record<string, unknown>>(
  items: T[],
  searchTerm: string,
  options: TableFilterOptions = {},
): T[] {
  const {
    descricaoField = 'descricao',
    valorField = 'valor_liquido',
    searchFields = ['transaction_id', 'end_to_end'],
    customFilter,
  } = options

  return useMemo(() => {
    if (!searchTerm.trim()) {
      return items
    }

    const searchLower = searchTerm.toLowerCase().trim()
    const searchNumber = searchLower.replace(/[^0-9]/g, '')

    return items.filter((item) => {
      // Se há filtro customizado, usar ele primeiro
      if (customFilter) {
        if (customFilter(item, searchTerm)) {
          return true
        }
      }

      // Buscar por descrição (case insensitive)
      const descricaoValue = item[descricaoField]
      const descricaoMatch =
        descricaoValue &&
        String(descricaoValue).toLowerCase().includes(searchLower)

      // Buscar por campos adicionais
      const searchFieldsMatch = searchFields.some((field) => {
        const fieldValue = item[field]
        return (
          fieldValue && String(fieldValue).toLowerCase().includes(searchLower)
        )
      })

      // Buscar por valor
      let valorMatch = false
      if (searchNumber && searchNumber.length > 0 && valorField) {
        const valorItem = Number(item[valorField]) || 0

        // Converter valor do item para string sem formatação
        const valorItemStr = Math.round(valorItem * 100).toString() // Converte para centavos (sem decimais)
        const valorItemStrSemDecimais = Math.round(valorItem).toString()

        // Verificar se o número digitado está contido no valor (busca parcial)
        valorMatch =
          valorItemStr.includes(searchNumber) ||
          valorItemStrSemDecimais.includes(searchNumber) ||
          // Verificar se começa com os dígitos digitados
          valorItemStr.startsWith(searchNumber) ||
          valorItemStrSemDecimais.startsWith(searchNumber)
      }

      return descricaoMatch || searchFieldsMatch || valorMatch
    })
  }, [
    items,
    searchTerm,
    descricaoField,
    valorField,
    searchFields,
    customFilter,
  ])
}

/**
 * Hook combinado que gerencia busca com debounce para backend e filtro client-side
 *
 * @param searchTerm - Termo de busca
 * @param hasPeriodFilter - Se há filtro de período ativo
 * @param debounceDelay - Delay para debounce (padrão: 500ms)
 * @returns Objeto com searchTerm (para filtro client-side) e debouncedSearch (para backend)
 */
export function useSearchFilter(
  searchTerm: string,
  hasPeriodFilter: boolean = false,
  debounceDelay: number = 500,
) {
  const debouncedSearch = useDebounce(searchTerm, debounceDelay)

  // Sempre usar debouncedSearch para backend quando houver busca
  // Se não há filtro de período mas há busca, também enviar para backend
  const backendSearch = debouncedSearch.trim() ? debouncedSearch : ''

  return {
    // Termo de busca para filtro client-side (sem debounce)
    clientSearch: searchTerm,
    // Termo de busca para backend (com debounce, apenas se houver filtro de período)
    backendSearch,
    // Debounced search para uso em outros casos
    debouncedSearch,
  }
}
