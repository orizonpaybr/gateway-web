import React, { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { AdminUser, UpdateUserData } from '@/lib/api'
import { formatNumber } from '@/lib/format'

interface UserFeesModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
  onSubmit: (userId: number, data: UpdateUserData) => Promise<void> | void
}

export const UserFeesModal = memo(function UserFeesModal({
  open,
  onClose,
  user,
  onSubmit,
}: UserFeesModalProps) {
  const [form, setForm] = useState<UpdateUserData>({})

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
    setForm({
      // Depósito
      taxa_percentual_deposito: user.taxa_percentual_deposito ?? 0,
      taxa_fixa_deposito: user.taxa_fixa_deposito ?? 0,
      valor_minimo_deposito: user.valor_minimo_deposito ?? 0,
      // Saque
      taxa_percentual_pix: user.taxa_percentual_pix ?? 0,
      taxa_minima_pix: user.taxa_minima_pix ?? 0,
      taxa_fixa_pix: user.taxa_fixa_pix ?? 0,
      valor_minimo_saque: user.valor_minimo_saque ?? 0,
      // Limites e extras
      limite_mensal_pf: user.limite_mensal_pf ?? 0,
      taxa_saque_api: user.taxa_saque_api ?? 0,
      taxa_saque_crypto: user.taxa_saque_crypto ?? 0,
      // Flexível
      sistema_flexivel_ativo: !!user.sistema_flexivel_ativo,
      valor_minimo_flexivel: user.valor_minimo_flexivel ?? 0,
      taxa_fixa_baixos: user.taxa_fixa_baixos ?? 0,
      taxa_percentual_altos: user.taxa_percentual_altos ?? 0,
    })
  }, [user])

  const handleChange = useCallback((key: keyof UpdateUserData, value: any) => {
    setForm((p) => ({ ...p, [key]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!user?.id) return
    await onSubmit(user.id, form)
  }, [user, form, onSubmit])

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
          <Button variant="outline" className="w-full sm:w-auto">
            Usar taxas globais
          </Button>
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto col-span-2 sm:col-span-1"
          >
            Salvar taxas
          </Button>
        </div>
      }
    >
      {!user ? (
        <p className="text-sm text-gray-600">Carregando...</p>
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
                value={formatNumber(form.taxa_fixa_deposito as number, 2)}
                onChange={(e) =>
                  handleChange('taxa_fixa_deposito', Number(e.target.value))
                }
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
                value={formatNumber(form.taxa_fixa_pix as number, 2)}
                onChange={(e) =>
                  handleChange('taxa_fixa_pix', Number(e.target.value))
                }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 items-start">
              <Input
                label="VALOR MÍNIMO (R$)"
                value={formatNumber(form.valor_minimo_flexivel as number, 0)}
                onChange={(e) =>
                  handleChange('valor_minimo_flexivel', Number(e.target.value))
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
                  handleChange('taxa_percentual_altos', Number(e.target.value))
                }
              />
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Observações
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                rows={3}
                placeholder="Observações sobre as taxas configuradas..."
              />
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
})
