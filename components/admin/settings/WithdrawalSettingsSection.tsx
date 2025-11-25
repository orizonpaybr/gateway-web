import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type {
  GatewaySettings,
  NumericSettingsField,
} from '@/types/gateway-settings'

interface WithdrawalSettingsSectionProps {
  settings: GatewaySettings
  isExpanded: boolean
  onToggle: () => void
  getDisplayValue: (field: NumericSettingsField) => string
  handleChange: (
    field: NumericSettingsField,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBlur: (
    field: NumericSettingsField,
  ) => (e: React.FocusEvent<HTMLInputElement>) => void
}

export function WithdrawalSettingsSection({
  settings,
  isExpanded,
  onToggle,
  getDisplayValue,
  handleChange,
  handleBlur,
}: WithdrawalSettingsSectionProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-4"
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
          Configurações de Saque
        </h3>
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <Label
                htmlFor="taxa_percentual_pix"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Percentual PIX (%)
              </Label>
              <Input
                id="taxa_percentual_pix"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_percentual_pix')}
                onChange={handleChange('taxa_percentual_pix')}
                onBlur={handleBlur('taxa_percentual_pix')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Taxa percentual aplicada sobre o valor do saque PIX
              </p>
            </div>

            <div>
              <Label
                htmlFor="taxa_minima_pix"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Mínima PIX (R$)
              </Label>
              <Input
                id="taxa_minima_pix"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_minima_pix')}
                onChange={handleChange('taxa_minima_pix')}
                onBlur={handleBlur('taxa_minima_pix')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Valor mínimo de taxa para saques PIX (sempre aplicado se maior
                que percentual)
              </p>
            </div>

            <div>
              <Label
                htmlFor="taxa_fixa_pix"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Fixa PIX (R$)
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
                Taxa fixa adicional aplicada sobre saques PIX (sempre somada à
                taxa principal)
              </p>
            </div>

            <div>
              <Label
                htmlFor="valor_minimo_saque"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Valor Mínimo de Saque (R$)
              </Label>
              <Input
                id="valor_minimo_saque"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('valor_minimo_saque')}
                onChange={handleChange('valor_minimo_saque')}
                onBlur={handleBlur('valor_minimo_saque')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Valor mínimo que o usuário pode sacar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            <div>
              <Label
                htmlFor="limite_mensal_pf"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Limite Mensal Pessoa Física (R$)
              </Label>
              <Input
                id="limite_mensal_pf"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('limite_mensal_pf')}
                onChange={handleChange('limite_mensal_pf')}
                onBlur={handleBlur('limite_mensal_pf')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Limite máximo de saques por mês para pessoa física
              </p>
            </div>

            <div>
              <Label
                htmlFor="taxa_saque_api"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Saque via API (%)
              </Label>
              <Input
                id="taxa_saque_api"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_saque_api')}
                onChange={handleChange('taxa_saque_api')}
                onBlur={handleBlur('taxa_saque_api')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Taxa percentual para saques realizados via API externa
              </p>
            </div>

            <div>
              <Label
                htmlFor="taxa_percentual_altos"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Saque Criptomoedas (%)
              </Label>
              <Input
                id="taxa_percentual_altos"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_percentual_altos')}
                onChange={handleChange('taxa_percentual_altos')}
                onBlur={handleBlur('taxa_percentual_altos')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Taxa percentual para saques em criptomoedas (Bitcoin, Ethereum,
                etc.)
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800 font-medium mb-2">
              💡 Como funciona o cálculo de taxa de saque PIX:
            </p>
            <ul className="text-sm text-cyan-700 space-y-1 list-disc list-inside">
              <li>
                <strong>Taxa percentual PIX:</strong>{' '}
                {settings.taxa_percentual_pix}% do valor
              </li>
              <li>
                <strong>Taxa mínima PIX:</strong> R${' '}
                {settings.taxa_minima_pix.toFixed(2)}
              </li>
              <li>
                <strong>Taxa fixa PIX:</strong> R${' '}
                {settings.taxa_fixa_pix.toFixed(2)} (sempre somada)
              </li>
              <li>
                <strong>Taxa aplicada:</strong> Maior valor entre taxa
                percentual e taxa mínima + taxa fixa
              </li>
              <li>
                <strong>Exemplo:</strong> R$ 2,00 → 2% = R$ 0,04 {'<'} R${' '}
                {settings.taxa_minima_pix.toFixed(2)} → Taxa = R${' '}
                {settings.taxa_minima_pix.toFixed(2)} + R${' '}
                {settings.taxa_fixa_pix.toFixed(2)} = R${' '}
                {(settings.taxa_minima_pix + settings.taxa_fixa_pix).toFixed(2)}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
