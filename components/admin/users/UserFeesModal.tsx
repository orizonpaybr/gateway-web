import React, { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AdminUser, UpdateUserData, adminUsersAPI } from '@/lib/api'
import {
  formatNumber,
  formatCurrencyInput,
  parseCurrencyInput,
} from '@/lib/format'

interface UserFeesModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
  onSubmit: (userId: number, data: UpdateUserData) => Promise<void> | void
  isSaving?: boolean
}

export const UserFeesModal = memo(function UserFeesModal({
  open,
  onClose,
  user,
  onSubmit,
  isSaving = false,
}: UserFeesModalProps) {
  const [form, setForm] = useState<UpdateUserData>({})
  // Estados locais para permitir edição livre nos inputs numéricos
  const [localValues, setLocalValues] = useState<Record<string, string>>({})
  // Estado para controlar modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loadingDefaults, setLoadingDefaults] = useState(false)

  const exampleCalc = useMemo(() => {
    const taxaPerc = Number(form.taxa_percentual_pix || 0) / 100
    const taxaMin = Number(form.taxa_minima_pix || 0)
    const taxaFixa = Number(form.taxa_fixa_pix || 0)
    const valorExemplo = 2
    const taxaPercentualValor = valorExemplo * taxaPerc
    const maiorEntrePercEMin = Math.max(taxaPercentualValor, taxaMin)
    const taxaAplicada = maiorEntrePercEMin + taxaFixa
    return {
      taxaPerc: (taxaPerc * 100).toFixed(2),
      taxaMin: taxaMin.toFixed(2),
      taxaFixa: taxaFixa.toFixed(2),
      valorExemplo: valorExemplo.toFixed(2),
      taxaPercentualValor: taxaPercentualValor.toFixed(2),
      maiorEntrePercEMin: maiorEntrePercEMin.toFixed(2),
      taxaAplicada: taxaAplicada.toFixed(2),
    }
  }, [form.taxa_percentual_pix, form.taxa_minima_pix, form.taxa_fixa_pix])

  useEffect(() => {
    if (!user) return
    // O backend já retorna as taxas padrão quando o usuário não tem taxas personalizadas
    // Então usamos os valores diretamente
    const newForm = {
      // Depósito (backend já retorna taxas padrão se não houver personalizadas)
      taxa_percentual_deposito: user.taxa_percentual_deposito ?? 0,
      taxa_fixa_deposito: user.taxa_fixa_deposito ?? 0,
      valor_minimo_deposito: user.valor_minimo_deposito ?? 0,
      // Saque (backend já retorna taxas padrão se não houver personalizadas)
      taxa_percentual_pix: user.taxa_percentual_pix ?? 0,
      taxa_minima_pix: user.taxa_minima_pix ?? 0,
      taxa_fixa_pix: user.taxa_fixa_pix ?? 0,
      valor_minimo_saque: user.valor_minimo_saque ?? 0,
      // Limites e extras (backend já retorna taxas padrão se não houver personalizadas)
      limite_mensal_pf: user.limite_mensal_pf ?? 0,
      taxa_saque_api: user.taxa_saque_api ?? 0,
      taxa_saque_crypto: user.taxa_saque_crypto ?? 0,
      // Flexível (backend já retorna taxas padrão se não houver personalizadas)
      sistema_flexivel_ativo: !!user.sistema_flexivel_ativo,
      valor_minimo_flexivel: user.valor_minimo_flexivel ?? 0,
      taxa_fixa_baixos: user.taxa_fixa_baixos ?? 0,
      taxa_percentual_altos: user.taxa_percentual_altos ?? 0,
      // Manter flag de taxas personalizadas
      taxas_personalizadas_ativas: user.taxas_personalizadas_ativas ?? false,
      // Observações
      observacoes_taxas: user.observacoes_taxas ?? '',
    }
    setForm(newForm)

    // Inicializar valores locais formatados
    // Para campos monetários (taxa_fixa_deposito e taxa_fixa_pix), usar formato brasileiro (0,00)
    const taxaFixaDepositoCents = Math.round(
      (newForm.taxa_fixa_deposito as number) * 100,
    )
    const taxaFixaPixCents = Math.round((newForm.taxa_fixa_pix as number) * 100)

    setLocalValues({
      taxa_percentual_deposito: formatNumber(
        newForm.taxa_percentual_deposito as number,
        0,
      ),
      taxa_fixa_deposito: formatCurrencyInput(taxaFixaDepositoCents.toString()),
      valor_minimo_deposito: formatNumber(
        newForm.valor_minimo_deposito as number,
        0,
      ),
      taxa_percentual_pix: formatNumber(
        newForm.taxa_percentual_pix as number,
        0,
      ),
      taxa_minima_pix: formatNumber(newForm.taxa_minima_pix as number, 0),
      taxa_fixa_pix: formatCurrencyInput(taxaFixaPixCents.toString()),
      valor_minimo_saque: formatNumber(newForm.valor_minimo_saque as number, 0),
      limite_mensal_pf: formatNumber(newForm.limite_mensal_pf as number, 0),
      taxa_saque_api: formatNumber(newForm.taxa_saque_api as number, 0),
      taxa_saque_crypto: formatNumber(newForm.taxa_saque_crypto as number, 0),
      valor_minimo_flexivel: formatNumber(
        newForm.valor_minimo_flexivel as number,
        0,
      ),
      taxa_fixa_baixos: formatNumber(newForm.taxa_fixa_baixos as number, 0),
      taxa_percentual_altos: formatNumber(
        newForm.taxa_percentual_altos as number,
        0,
      ),
    })
  }, [user])

  const handleChange = useCallback((key: keyof UpdateUserData, value: any) => {
    setForm((p) => ({ ...p, [key]: value }))
  }, [])

  // Handler para inputs monetários com máscara
  const handleCurrencyChange = useCallback(
    (key: keyof UpdateUserData, value: string) => {
      // Remover todos os caracteres não numéricos
      const cleaned = value.replace(/\D/g, '')

      // Limitar a 8 dígitos (para valores até 999.999,99)
      const limitedCleaned = cleaned.slice(0, 8)

      // Formatar como moeda brasileira (0,00)
      const formatted = formatCurrencyInput(limitedCleaned)

      // Atualizar valor local formatado
      setLocalValues((prev) => ({ ...prev, [key]: formatted }))

      // Converter para número (em centavos) e depois para reais
      const numValue = parseCurrencyInput(limitedCleaned) / 100

      // Atualizar form com valor numérico
      handleChange(key, numValue)
    },
    [handleChange],
  )

  // Handler para onBlur de campos monetários
  const handleCurrencyBlur = useCallback(
    (key: keyof UpdateUserData) => {
      const currentFormValue = form[key] as number | undefined

      // Se não houver valor, formatar como 0,00
      if (currentFormValue === undefined || currentFormValue === 0) {
        setLocalValues((prev) => ({ ...prev, [key]: '0,00' }))
        handleChange(key, 0)
      } else {
        // Converter valor numérico para centavos e formatar
        const cents = Math.round(currentFormValue * 100)
        const formatted = formatCurrencyInput(cents.toString())
        setLocalValues((prev) => ({ ...prev, [key]: formatted }))
      }
    },
    [form, handleChange],
  )

  const handleSave = useCallback(async () => {
    if (!user?.id) return
    try {
      // Preparar dados para envio: garantir que observacoes_taxas seja enviado corretamente
      const dataToSend: UpdateUserData = {
        ...form,
        // Converter string vazia para null em observacoes_taxas (campo nullable)
        observacoes_taxas:
          form.observacoes_taxas && form.observacoes_taxas.trim() !== ''
            ? form.observacoes_taxas.trim()
            : null,
      }
      await onSubmit(user.id, dataToSend)
    } catch (error) {
      console.error('Erro ao salvar taxas:', error)
    }
  }, [user, form, onSubmit])

  // Handler para confirmar e salvar taxas globais
  const handleConfirmUseGlobalFees = useCallback(async () => {
    if (!user?.id) return

    setLoadingDefaults(true)
    try {
      // Buscar taxas padrão do sistema
      const response = await adminUsersAPI.getDefaultFees()

      if (!response.success || !response.data.fees) {
        throw new Error('Erro ao buscar taxas padrão')
      }

      const defaultFees = response.data.fees

      // Preparar dados para envio com taxas globais
      const dataToSend: UpdateUserData = {
        // Taxas de depósito
        taxa_percentual_deposito: defaultFees.taxa_percentual_deposito,
        taxa_fixa_deposito: defaultFees.taxa_fixa_deposito,
        valor_minimo_deposito: defaultFees.valor_minimo_deposito,
        // Taxas de saque
        taxa_percentual_pix: defaultFees.taxa_percentual_pix,
        taxa_minima_pix: defaultFees.taxa_minima_pix,
        taxa_fixa_pix: defaultFees.taxa_fixa_pix,
        valor_minimo_saque: defaultFees.valor_minimo_saque,
        // Limites e extras
        limite_mensal_pf: defaultFees.limite_mensal_pf,
        taxa_saque_api: defaultFees.taxa_saque_api,
        taxa_saque_crypto: defaultFees.taxa_saque_crypto,
        // Sistema flexível
        sistema_flexivel_ativo: defaultFees.sistema_flexivel_ativo,
        valor_minimo_flexivel: defaultFees.valor_minimo_flexivel,
        taxa_fixa_baixos: defaultFees.taxa_fixa_baixos,
        taxa_percentual_altos: defaultFees.taxa_percentual_altos,
        // Desativar taxas personalizadas (usar globais)
        taxas_personalizadas_ativas: false,
        // Observações - manter as existentes ou null
        observacoes_taxas:
          form.observacoes_taxas && form.observacoes_taxas.trim() !== ''
            ? form.observacoes_taxas.trim()
            : null,
      }

      await onSubmit(user.id, dataToSend)

      setShowConfirmModal(false)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar taxas globais:', error)
    } finally {
      setLoadingDefaults(false)
    }
  }, [user, form, onSubmit, onClose])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Configuração de Taxas${user?.name ? ` - ${user.name}` : ''}`}
      size="xl"
      footer={
        <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setShowConfirmModal(true)}
          >
            Usar taxas globais
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto col-span-2 sm:col-span-1"
          >
            {isSaving ? 'Salvando...' : 'Salvar taxas'}
          </Button>
        </div>
      }
    >
      {!user ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Usuário:</p>
              <p className="font-medium">{user?.name || user?.username}</p>
            </div>
            <div>
              <p className="text-gray-500">CPF/CNPJ:</p>
              <p className="font-medium">{user?.cpf_cnpj || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Configurações de Depósito</p>
              <p className="font-medium">&nbsp;</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Configurações de Depósito
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 items-start">
              <Input
                label="TAXA PERCENTUAL DEPÓSITO (%)"
                value={formatNumber(form.taxa_percentual_deposito as number, 0)}
                onChange={(e) =>
                  handleChange(
                    'taxa_percentual_deposito',
                    Number(e.target.value),
                  )
                }
              />
              <Input
                label="TAXA FIXA DEPÓSITO (R$)"
                type="text"
                inputMode="decimal"
                value={
                  localValues.taxa_fixa_deposito ??
                  (() => {
                    const cents = Math.round(
                      ((form.taxa_fixa_deposito as number) || 0) * 100,
                    )
                    return formatCurrencyInput(cents.toString())
                  })()
                }
                onChange={(e) =>
                  handleCurrencyChange('taxa_fixa_deposito', e.target.value)
                }
                onBlur={() => handleCurrencyBlur('taxa_fixa_deposito')}
              />
              <Input
                label="VALOR MÍNIMO DEPÓSITO (R$)"
                value={formatNumber(form.valor_minimo_deposito as number, 0)}
                onChange={(e) =>
                  handleChange('valor_minimo_deposito', Number(e.target.value))
                }
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Configurações de Saque
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-3 text-sm text-blue-900">
              <p className="font-semibold mb-1">
                Como funciona o cálculo de taxa de saque PIX:
              </p>
              <p>Taxa percentual PIX: {exampleCalc.taxaPerc}%</p>
              <p>Taxa mínima PIX: R$ {exampleCalc.taxaMin}</p>
              <p>Taxa fixa PIX: R$ {exampleCalc.taxaFixa} (sempre somada)</p>
              <p>
                Aplicada: maior valor entre taxa percentual e taxa mínima + taxa
                fixa
              </p>
              <p>
                Exemplo: R$ {exampleCalc.valorExemplo} → 2% = R${' '}
                {exampleCalc.taxaPercentualValor} × Min = R${' '}
                {exampleCalc.maiorEntrePercEMin} + Fixa R${' '}
                {exampleCalc.taxaFixa} = R$ {exampleCalc.taxaAplicada}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2 items-start">
              <Input
                label="TAXA % PIX"
                value={formatNumber(form.taxa_percentual_pix as number, 0)}
                onChange={(e) =>
                  handleChange('taxa_percentual_pix', Number(e.target.value))
                }
              />
              <Input
                label="TAXA MÍNIMA PIX (R$)"
                value={formatNumber(form.taxa_minima_pix as number, 0)}
                onChange={(e) =>
                  handleChange('taxa_minima_pix', Number(e.target.value))
                }
              />
              <Input
                label="TAXA FIXA PIX (R$)"
                type="text"
                inputMode="decimal"
                value={
                  localValues.taxa_fixa_pix ??
                  (() => {
                    const cents = Math.round(
                      ((form.taxa_fixa_pix as number) || 0) * 100,
                    )
                    return formatCurrencyInput(cents.toString())
                  })()
                }
                onChange={(e) =>
                  handleCurrencyChange('taxa_fixa_pix', e.target.value)
                }
                onBlur={() => handleCurrencyBlur('taxa_fixa_pix')}
              />
              <Input
                label="VALOR MÍNIMO DE SAQUE (R$)"
                value={formatNumber(form.valor_minimo_saque as number, 0)}
                onChange={(e) =>
                  handleChange('valor_minimo_saque', Number(e.target.value))
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 items-start">
              <Input
                label="LIMITE MENSAL PESSOA FÍSICA (R$)"
                value={formatNumber(form.limite_mensal_pf as number, 0)}
                onChange={(e) =>
                  handleChange('limite_mensal_pf', Number(e.target.value))
                }
              />
              <Input
                label="TAXA SAQUE VIA API (%)"
                value={formatNumber(form.taxa_saque_api as number, 0)}
                onChange={(e) =>
                  handleChange('taxa_saque_api', Number(e.target.value))
                }
              />
              <Input
                label="TAXA SAQUE CRIPTOMOEDAS (%)"
                value={formatNumber(form.taxa_saque_crypto as number, 0)}
                onChange={(e) =>
                  handleChange('taxa_saque_crypto', Number(e.target.value))
                }
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Sistema de Taxas Flexível para Depósitos
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Switch
                checked={!!form.sistema_flexivel_ativo}
                onCheckedChange={(checked) =>
                  handleChange('sistema_flexivel_ativo', checked)
                }
              />
              <span className="text-sm text-gray-700">
                Ativar Sistema de Taxas Flexível
              </span>
            </div>
            {form.sistema_flexivel_ativo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 items-start">
                <Input
                  label="VALOR MÍNIMO (R$)"
                  value={formatNumber(form.valor_minimo_flexivel as number, 0)}
                  onChange={(e) =>
                    handleChange(
                      'valor_minimo_flexivel',
                      Number(e.target.value),
                    )
                  }
                />
                <Input
                  label="TAXA FIXA PARA VALORES BAIXOS (R$)"
                  value={formatNumber(form.taxa_fixa_baixos as number, 0)}
                  onChange={(e) =>
                    handleChange('taxa_fixa_baixos', Number(e.target.value))
                  }
                />
                <Input
                  label="TAXA % PARA VALORES ALTOS (%)"
                  value={formatNumber(form.taxa_percentual_altos as number, 0)}
                  onChange={(e) =>
                    handleChange(
                      'taxa_percentual_altos',
                      Number(e.target.value),
                    )
                  }
                />
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Observações
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                rows={3}
                placeholder="Observações sobre as taxas configuradas..."
                value={form.observacoes_taxas || ''}
                onChange={(e) =>
                  handleChange('observacoes_taxas', e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar uso de taxas globais"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loadingDefaults || isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmUseGlobalFees}
              disabled={loadingDefaults || isSaving}
            >
              {loadingDefaults || isSaving
                ? 'Processando...'
                : 'Confirmar e Salvar'}
            </Button>
          </div>
        }
      >
        {loadingDefaults ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Você está prestes a resetar todas as taxas personalizadas deste
              usuário para os valores padrão do sistema.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ⚠️ Atenção:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>
                  Todas as taxas personalizadas serão substituídas pelos valores
                  padrão
                </li>
                <li>
                  O sistema de taxas flexível será desativado (se estiver ativo)
                </li>
                <li>As taxas personalizadas serão desativadas</li>
                <li>Esta ação não pode ser desfeita facilmente</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">Deseja continuar?</p>
          </div>
        )}
      </Dialog>
    </Dialog>
  )
})
