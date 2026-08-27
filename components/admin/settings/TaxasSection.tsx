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
  getDisplayValue,
  handleChange,
  handleBlur,
}: TaxasSectionProps) {
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
            Comissão paga ao afiliado por transação indicada. Pode ser
            personalizada por afiliado.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="taxa_minima_fixa"
            className="min-h-[40px] leading-tight flex items-end pb-1"
          >
            Piso Mínimo — Fixo (R$)
          </Label>
          <Input
            id="taxa_minima_fixa"
            type="text"
            inputMode="decimal"
            value={getDisplayValue('taxa_minima_fixa')}
            onChange={handleChange('taxa_minima_fixa')}
            onBlur={handleBlur('taxa_minima_fixa')}
          />
          <p className="text-sm text-gray-500 mt-1">
            Mínimo que a Coratri sempre cobra por transação. Regra própria,
            independente de adquirente.
          </p>
        </div>
        <div>
          <Label
            htmlFor="taxa_minima_percentual"
            className="min-h-[40px] leading-tight flex items-end pb-1"
          >
            Piso Mínimo — Percentual (%)
          </Label>
          <Input
            id="taxa_minima_percentual"
            type="text"
            inputMode="decimal"
            value={getDisplayValue('taxa_minima_percentual')}
            onChange={handleChange('taxa_minima_percentual')}
            onBlur={handleBlur('taxa_minima_percentual')}
          />
          <p className="text-sm text-gray-500 mt-1">
            Piso percentual sobre o valor (ex.: 0,5 = 0,5%). 0 = sem piso
            percentual.
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
        <p className="text-sm text-cyan-800 font-medium mb-2">
          Piso da taxa (proteção)
        </p>
        <p className="text-sm text-cyan-700">
          A taxa efetiva cobrada do cliente nunca fica abaixo de dois pisos: o
          piso mínimo da plataforma (acima, nossa regra) e o custo real da
          adquirente ativa naquela transação. Assim nunca cobramos menos do que
          pagamos — seja qual for a adquirente.
        </p>
      </div>
    </div>
  )
}
