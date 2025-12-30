export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const computeDateRange = (
  period: 'hoje' | '7d' | '30d' | 'custom',
  startDate?: string,
  endDate?: string,
) => {
  const now = new Date()
  let inicio: string | undefined
  let fim: string | undefined

  if (period === 'hoje') {
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    inicio = d1.toISOString().slice(0, 10)
    fim = d2.toISOString().slice(0, 10)
  } else if (period === '7d') {
    const d1 = new Date(now)
    d1.setDate(now.getDate() - 6)
    inicio = d1.toISOString().slice(0, 10)
    fim = now.toISOString().slice(0, 10)
  } else if (period === '30d') {
    const d1 = new Date(now)
    d1.setDate(now.getDate() - 29)
    inicio = d1.toISOString().slice(0, 10)
    fim = now.toISOString().slice(0, 10)
  } else if (period === 'custom' && startDate && endDate) {
    inicio = startDate
    fim = endDate
  }

  return { inicio, fim }
}

// Função para formatar data para exportação
export const formatDateForExport = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Função para formatar data para exibição
export const formatDateForDisplay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Função para resetar filtros de data
export const createResetDatesHandler = (
  setStartDate: (value: string) => void,
  setEndDate: (value: string) => void,
  setShowDatePicker: (value: boolean) => void,
  setPeriod: (value: 'hoje' | '7d' | '30d' | 'custom' | null) => void,
  setPage: (value: number) => void,
) => {
  return () => {
    setStartDate('')
    setEndDate('')
    setShowDatePicker(false)
    setPeriod(null)
    setPage(1)
  }
}

// Função para criar filtros de paginação
export const createPaginationFilters = (
  page: number,
  perPage: number,
  debouncedSearch: string,
  period: 'hoje' | '7d' | '30d' | 'custom' | null,
  startDate: string,
  endDate: string,
  tipo?: string,
) => {
  // Se period é null e não há datas customizadas, não enviar filtros de data
  const hasDateFilter = period !== null || (startDate && endDate)

  const { inicio, fim } =
    hasDateFilter && period
      ? computeDateRange(period, startDate, endDate)
      : { inicio: undefined, fim: undefined }

  const filters: {
    page: number
    limit: number
    busca?: string
    data_inicio?: string
    data_fim?: string
    tipo?: string
    periodo?: 'hoje' | '7d' | '30d' | 'custom'
  } = {
    page,
    limit: perPage,
    busca: debouncedSearch ? normalize(debouncedSearch) : undefined,
  }

  // Apenas adicionar filtros de data se houver período ou datas customizadas
  if (hasDateFilter) {
    if (inicio) {
      filters.data_inicio = inicio
    }
    if (fim) {
      filters.data_fim = fim
    }
    if (period) {
      filters.periodo = period
    }
  }

  if (tipo) {
    filters.tipo = tipo
  }

  return filters
}
