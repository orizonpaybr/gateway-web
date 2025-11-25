import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type {
  GatewaySettings,
  NumericSettingsField,
} from '@/types/gateway-settings'

interface DepositSettingsSectionProps {
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

export function DepositSettingsSection({
  settings,
  isExpanded,
  onToggle,
  getDisplayValue,
  handleChange,
  handleBlur,
}: DepositSettingsSectionProps) {
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
          Configurações de Depósito
        </h3>
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <Label
                htmlFor="taxa_percentual_deposito"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Percentual (%)
              </Label>
              <Input
                id="taxa_percentual_deposito"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_percentual_deposito')}
                onChange={handleChange('taxa_percentual_deposito')}
                onBlur={handleBlur('taxa_percentual_deposito')}
              />
              <p className="text-sm text-gray-500 mt-1 min-h-[42px]">
                Taxa percentual aplicada sobre o valor do depósito
              </p>
            </div>

            <div>
              <Label
                htmlFor="taxa_fixa_deposito"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Fixa (R$)
              </Label>
              <Input
                id="taxa_fixa_deposito"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_fixa_deposito')}
                onChange={handleChange('taxa_fixa_deposito')}
                onBlur={handleBlur('taxa_fixa_deposito')}
              />
              <p className="text-sm text-gray-500 mt-1 min-h-[42px]">
                Taxa fixa adicional aplicada sobre depósitos (sempre somada)
              </p>
            </div>

            <div>
              <Label
                htmlFor="valor_minimo_deposito"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Valor Mínimo de Depósito (R$)
              </Label>
              <Input
                id="valor_minimo_deposito"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('valor_minimo_deposito')}
                onChange={handleChange('valor_minimo_deposito')}
                onBlur={handleBlur('valor_minimo_deposito')}
              />
              <p className="text-sm text-gray-500 mt-1 min-h-[42px]">
                Valor mínimo que o usuário pode depositar
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800 font-medium mb-2">
              💡 Como funciona o cálculo de taxa de depósito:
            </p>
            <ul className="text-sm text-cyan-700 space-y-1 list-disc list-inside">
              <li>
                <strong>Taxa percentual:</strong>{' '}
                {settings.taxa_percentual_deposito}% do valor
              </li>
              <li>
                <strong>Taxa fixa:</strong> R${' '}
                {settings.taxa_fixa_deposito.toFixed(2)} (sempre somada)
              </li>
              <li>
                <strong>Taxa aplicada:</strong> Taxa percentual + taxa fixa
              </li>
              <li>
                <strong>Exemplo:</strong> R$ 100,00 →{' '}
                {settings.taxa_percentual_deposito}% = R${' '}
                {((100 * settings.taxa_percentual_deposito) / 100).toFixed(2)} +
                R$ {settings.taxa_fixa_deposito.toFixed(2)} = R${' '}
                {(
                  (100 * settings.taxa_percentual_deposito) / 100 +
                  settings.taxa_fixa_deposito
                ).toFixed(2)}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
