'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminReconciliationAPI } from '@/lib/api'
import { formatCurrencyBRL } from '@/lib/format'
import { useReconciliationReport } from '@/hooks/useReconciliationReport'

const PERIODO_LABEL: Record<string, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7dias': 'Últimos 7 dias',
  '30dias': 'Últimos 30 dias',
  tudo: 'Todo o período',
}

interface ReconciliationExportCardProps {
  /** Período efetivo da conciliação/export (máx. 30 dias). */
  periodo: string
  /** Período selecionado no dashboard (pode ser "tudo"). */
  dashboardPeriodo?: string
  enabled?: boolean
}

/**
 * Card de conciliação acoplado ao Dashboard Admin.
 * O Excel e o resumo usam o mesmo filtro de período da página.
 */
export function ReconciliationExportCard({
  periodo,
  dashboardPeriodo,
  enabled = true,
}: ReconciliationExportCardProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { data: report, isLoading } = useReconciliationReport(
    periodo,
    undefined,
    enabled,
  )

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await adminReconciliationAPI.downloadCsv(periodo)
      toast.success('Relatório exportado', {
        description: `Período: ${PERIODO_LABEL[periodo] ?? periodo}`,
      })
    } catch (error) {
      toast.error('Erro ao exportar relatório', {
        description:
          error instanceof Error ? error.message : 'Tente novamente',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const label = PERIODO_LABEL[periodo] ?? periodo

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Conciliação por usuário
              </p>
              <p className="text-xl font-bold text-gray-900">
                Relatório do período: {label}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 shrink-0">
              <FileSpreadsheet size={24} className="text-emerald-600" />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Exporta saldo inicial do dia, depósitos, saques e saldo final por
            usuário — útil quando alguém saca mais do que vendeu no dia porque
            já tinha saldo acumulado.
            {dashboardPeriodo === 'tudo' && (
              <> O Excel usa no máximo os últimos 30 dias.</>
            )}
          </p>

          {!isLoading && report?.resumo && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} />
                {report.resumo.usuarios_ativos} usuário(s) ativos
              </span>
              <span>
                Lucro (taxas):{' '}
                <strong className="text-gray-900">
                  {formatCurrencyBRL(report.resumo.lucro_total)}
                </strong>
              </span>
              <span>
                Entradas líq.:{' '}
                <strong className="text-gray-900">
                  {formatCurrencyBRL(report.resumo.depositos.valor_liquido)}
                </strong>
              </span>
              <span>
                Saídas debitadas:{' '}
                <strong className="text-gray-900">
                  {formatCurrencyBRL(report.resumo.saques.valor_debitado)}
                </strong>
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <Button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            icon={<Download size={16} />}
          >
            {isExporting ? 'Gerando...' : 'Gerar Excel'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
