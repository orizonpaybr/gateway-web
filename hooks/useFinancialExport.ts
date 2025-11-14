/**
 * Hook para exportação de dados financeiros
 * Centraliza lógica de exportação
 */

import { useCallback } from 'react'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { formatTransactionType } from '@/lib/helpers/financialUtils'

export interface ExportItem {
  id?: number
  tipo?: string
  cliente_id?: string
  user_id?: string
  transacao_id?: string
  valor_total?: number
  total_transacoes?: number
  saldo?: number
  valor_liquido?: number
  taxa?: number
  status_legivel?: string
  data?: string
  email?: string
  telefone?: string | null
  [key: string]: any
}

export interface UseFinancialExportOptions {
  filename?: string
  sheetName?: string
  customMapper?: (item: ExportItem) => Record<string, any>
}

/**
 * Hook para exportar dados financeiros para XLSX
 */
export function useFinancialExport<T extends ExportItem>(
  items: T[],
  options: UseFinancialExportOptions = {},
) {
  const {
    filename = `transacoes_${new Date().toISOString().slice(0, 10)}.xlsx`,
    sheetName = 'Transações',
    customMapper,
  } = options

  const handleExport = useCallback(() => {
    if (items.length === 0) {
      toast.error('Nenhuma transação para exportar')
      return
    }

    const exportData = items.map((item) => {
      if (customMapper) {
        return customMapper(item)
      }

      // Mapper padrão
      return {
        ID: item.id,
        Tipo: item.tipo ? formatTransactionType(item.tipo) : '',
        'Cliente ID': item.cliente_id || '',
        'Transação ID': item.transacao_id || '',
        'Valor Total': item.valor_total || 0,
        'Valor Líquido': item.valor_liquido || 0,
        ...(item.taxa !== undefined && { Taxa: item.taxa }),
        Status: item.status_legivel || '',
        Data: item.data ? format(new Date(item.data), 'dd/MM/yyyy HH:mm') : '',
      }
    })

    try {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
      XLSX.writeFile(wb, filename)
      toast.success('Arquivo exportado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar arquivo')
      console.error('Erro na exportação:', error)
    }
  }, [items, filename, sheetName, customMapper])

  return { handleExport }
}
