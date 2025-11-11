'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { USER_PERMISSION } from '@/lib/constants'
import { withdrawalsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Settings, Save, Info, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function ConfiguracoesSaquesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [saqueAutomatico, setSaqueAutomatico] = useState(false)
  const [limite, setLimite] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)

  const isAdmin = Boolean(
    user && Number(user.permission) === USER_PERMISSION.ADMIN,
  )

  // Buscar configurações
  const { data, isLoading } = useQuery<{
    success: boolean
    data: {
      saque_automatico: boolean
      limite_saque_automatico: number | null
    }
  }>({
    queryKey: ['withdrawal-config'],
    queryFn: () => withdrawalsAPI.getConfig(),
    enabled: isAdmin,
  })

  // Sincronizar dados quando a query retornar
  useEffect(() => {
    if (data?.success && data?.data) {
      setSaqueAutomatico(data.data.saque_automatico)
      setLimite(
        data.data.limite_saque_automatico !== null
          ? data.data.limite_saque_automatico.toString()
          : '',
      )
      setHasChanges(false)
    }
  }, [data])

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: (data: {
      saque_automatico: boolean
      limite_saque_automatico?: number | null
    }) => withdrawalsAPI.updateConfig(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Configurações salvas com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['withdrawal-config'] })
      setHasChanges(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar configurações')
    },
  })

  // Detectar mudanças
  useEffect(() => {
    if (data?.data) {
      const originalLimite =
        data.data.limite_saque_automatico !== null
          ? data.data.limite_saque_automatico.toString()
          : ''
      const changed =
        saqueAutomatico !== data.data.saque_automatico ||
        limite !== originalLimite
      setHasChanges(changed)
    }
  }, [saqueAutomatico, limite, data])

  const handleSave = useCallback(() => {
    const limiteValue =
      limite.trim() === '' ? null : parseFloat(limite.replace(',', '.'))

    if (limiteValue !== null && (isNaN(limiteValue) || limiteValue < 0)) {
      toast.error('O limite deve ser um número válido maior ou igual a zero')
      return
    }

    updateMutation.mutate({
      saque_automatico: saqueAutomatico,
      limite_saque_automatico: limiteValue,
    })
  }, [saqueAutomatico, limite, updateMutation])

  const handleLimiteChange = (value: string) => {
    // Permitir apenas números, vírgula e ponto
    const cleaned = value.replace(/[^\d,.]/g, '')
    setLimite(cleaned)
  }

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            Configurações de Saques
          </h1>
          <p className="text-sm text-gray-600">
            Configure como os saques serão processados no sistema
          </p>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="text-gray-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Modo de Processamento
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Escolha como os saques serão processados no sistema
                  </p>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          Saque Automático
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {saqueAutomatico
                          ? 'Os saques serão processados automaticamente'
                          : 'Os saques precisarão de aprovação manual'}
                      </p>
                    </div>
                    <Switch
                      checked={saqueAutomatico}
                      onCheckedChange={setSaqueAutomatico}
                    />
                  </div>
                </div>
              </div>
            </div>

            {saqueAutomatico && (
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Info className="text-blue-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Limite para Saque Automático
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Defina um valor máximo para processamento automático.
                      Saques acima deste valor precisarão de aprovação manual.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Limite (R$)
                        </label>
                        <Input
                          type="text"
                          placeholder="Deixe vazio para processar todos automaticamente"
                          value={limite}
                          onChange={(e) => handleLimiteChange(e.target.value)}
                          className="max-w-md"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Deixe em branco para processar{' '}
                          <strong>todos os saques automaticamente</strong>, sem
                          limite de valor.
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle
                            className="text-blue-600 mt-0.5"
                            size={16}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-900 mb-2">
                              Exemplos de configuração:
                            </p>
                            <ul className="text-xs text-blue-800 space-y-1">
                              <li>
                                • <strong>Sem limite:</strong> Todos os saques
                                serão processados automaticamente
                              </li>
                              <li>
                                • <strong>Limite R$ 5.000:</strong> Saques até
                                R$ 5.000 são automáticos, acima disso precisam
                                de aprovação
                              </li>
                              <li>
                                • <strong>Limite R$ 10.000:</strong> Saques até
                                R$ 10.000 são automáticos, acima disso precisam
                                de aprovação
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Resumo da Configuração Atual:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Modo:</span>
                  <span className="font-medium text-gray-900">
                    {saqueAutomatico ? 'Automático' : 'Manual'}
                  </span>
                </div>
                {saqueAutomatico && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Limite:</span>
                    <span className="font-medium text-gray-900">
                      {limite.trim() === ''
                        ? 'Sem limite (todos automáticos)'
                        : `R$ ${parseFloat(
                            limite.replace(',', '.'),
                          ).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </span>
                  </div>
                )}
                {saqueAutomatico && limite.trim() !== '' && (
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    Saques acima de{' '}
                    <strong>
                      R${' '}
                      {parseFloat(limite.replace(',', '.')).toLocaleString(
                        'pt-BR',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </strong>{' '}
                    precisarão de aprovação manual.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                icon={<Save size={18} />}
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
              >
                {updateMutation.isPending
                  ? 'Salvando...'
                  : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
