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
  [key: string]: unknown
}

export interface UseFinancialExportOptions<T = ExportItem> {
  filename?: string
  sheetName?: string
  customMapper?: (item: T) => Record<string, any>
}

export function useFinancialExport<T = ExportItem>(
  items: T[],
  options: UseFinancialExportOptions<T> = {},
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

      // Mapper padrão - só funciona se o item for ExportItem
      const exportItem = item as unknown as ExportItem
      return {
        ID: exportItem.id,
        Tipo: exportItem.tipo ? formatTransactionType(exportItem.tipo) : '',
        'Cliente ID': exportItem.cliente_id || '',
        'Transação ID': exportItem.transacao_id || '',
        'Valor Total': exportItem.valor_total || 0,
        'Valor Líquido': exportItem.valor_liquido || 0,
        ...(exportItem.taxa !== undefined && { Taxa: exportItem.taxa }),
        Status: exportItem.status_legivel || '',
        Data: exportItem.data
          ? format(new Date(exportItem.data), 'dd/MM/yyyy HH:mm')
          : '',
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
