import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import type {
  GatewaySettings,
  NumericSettingsField,
} from '@/types/gateway-settings'

interface TaxasSectionProps {
  settings: GatewaySettings
  getDisplayValue: (field: NumericSettingsField) => string
  handleChange: (
    field: NumericSettingsField,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBlur: (
    field: NumericSettingsField,
  ) => (e: React.FocusEvent<HTMLInputElement>) => void
}

export function TaxasSection({
  settings,
  getDisplayValue,
  handleChange,
  handleBlur,
}: TaxasSectionProps) {
  const taxa = Number(settings.taxa_fixa_deposito) || Number(settings.taxa_fixa_pix) || 1
  const comissaoAfiliado = Number(settings.taxa_comissao_afiliado_padrao) || 0.5

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="taxa_fixa_deposito"
            className="min-h-[40px] leading-tight flex items-end pb-1"
          >
            Taxa Fixa Cash-in (R$)
          </Label>
          <Input
            id="taxa_fixa_deposito"
            type="text"
            inputMode="decimal"
            value={getDisplayValue('taxa_fixa_deposito')}
            onChange={handleChange('taxa_fixa_deposito')}
            onBlur={handleBlur('taxa_fixa_deposito')}
          />
          <p className="text-sm text-gray-500 mt-1">
            Taxa fixa aplicada sobre cada depósito (valor em reais)
          </p>
        </div>
        <div>
          <Label
            htmlFor="taxa_fixa_pix"
            className="min-h-[40px] leading-tight flex items-end pb-1"
          >
            Taxa Fixa Cash-out (R$)
          </Label>
          <Input
            id="taxa_fixa_pix"
            type="text"
            inputMode="decimal"
            value={getDisplayValue('taxa_fixa_pix')}
            onChange={handleChange('taxa_fixa_pix')}
            onBlur={handleBlur('taxa_fixa_pix')}
          />
          <p className="text-sm text-gray-500 mt-1">
            Taxa fixa aplicada sobre cada saque PIX (valor em reais)
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="taxa_comissao_afiliado_padrao"
            className="min-h-[40px] leading-tight flex items-end pb-1"
          >
            Comissão Global de Afiliado (R$)
          </Label>
          <Input
            id="taxa_comissao_afiliado_padrao"
            type="text"
            inputMode="decimal"
            value={getDisplayValue('taxa_comissao_afiliado_padrao')}
            onChange={handleChange('taxa_comissao_afiliado_padrao')}
            onBlur={handleBlur('taxa_comissao_afiliado_padrao')}
          />
          <p className="text-sm text-gray-500 mt-1">
            Comissão paga ao afiliado por transação indicada. Pode ser personalizada por afiliado.
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
        <p className="text-sm text-cyan-800 font-medium mb-2">
          Como funcionam cash-in e cash-out
        </p>
        <p className="text-sm text-cyan-700">
          Exemplo: saque de R$ 100,00, taxa R$ {taxa.toFixed(2)} — R$ 0,02 para a
          Treeal, R$ {comissaoAfiliado.toFixed(2)} para o afiliado (se houver) e R${' '}
          {Math.max(0, taxa - 0.02 - comissaoAfiliado).toFixed(2)} para a Orizon.
        </p>
      </div>
    </div>
  )
}
