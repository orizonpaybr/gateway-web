import { useCallback, useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

export interface TableExportOptions<T = unknown> {
  /**
   * Nome do arquivo (sem extensão)
   */
  filename?: string
  /**
   * Nome da planilha
   */
  sheetName?: string
  /**
   * Função para buscar TODOS os dados (sem paginação)
   * Deve retornar um array de items
   */
  fetchAllData: () => Promise<T[]>
  /**
   * Função para mapear os dados para o formato de exportação
   */
  dataMapper: (item: T) => Record<string, unknown>
  /**
   * Mensagem de erro quando não há dados
   */
  emptyMessage?: string
  /**
   * Mensagem de sucesso
   */
  successMessage?: string
}

/**
 * Hook para exportação de tabelas que busca TODOS os dados (sem paginação)
 * Centraliza a lógica de exportação para reutilização em todas as tabelas
 *
 * @param options - Opções de configuração da exportação
 * @returns Função handleExport e estado de loading
 */
export function useTableExport<T = unknown>(options: TableExportOptions<T>) {
  const {
    filename = `export_${new Date().toISOString().slice(0, 10)}.xlsx`,
    sheetName = 'Dados',
    fetchAllData,
    dataMapper,
    emptyMessage = 'Nenhum dado para exportar',
    successMessage = 'Arquivo exportado com sucesso!',
  } = options

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true)

      // Buscar TODOS os dados (sem paginação)
      const allData = await fetchAllData()

      if (!allData || allData.length === 0) {
        toast.error(emptyMessage)
        return
      }

      // Mapear dados para formato de exportação
      const exportData = allData.map(dataMapper)

      // Criar planilha
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
      XLSX.writeFile(wb, filename)

      toast.success(successMessage)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar arquivo')
    } finally {
      setIsExporting(false)
    }
  }, [
    fetchAllData,
    dataMapper,
    filename,
    sheetName,
    emptyMessage,
    successMessage,
  ])

  return {
    handleExport,
    isExporting,
  }
}
