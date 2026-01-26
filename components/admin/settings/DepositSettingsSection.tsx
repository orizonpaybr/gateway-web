import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
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
                Taxa fixa aplicada sobre cada depósito (valor em centavos)
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800 font-medium mb-2">
              💡 Como funciona o cálculo de taxa de depósito:
            </p>
            <ul className="text-sm text-cyan-700 space-y-1 list-disc list-inside">
              <li>
                <strong>Taxa fixa:</strong> R${' '}
                {settings.taxa_fixa_deposito.toFixed(2)}
              </li>
              <li>
                <strong>Exemplo:</strong> Depósito de R$ 100,00 → Taxa = R${' '}
                {settings.taxa_fixa_deposito.toFixed(2)} → Líquido = R${' '}
                {(100 - settings.taxa_fixa_deposito).toFixed(2)}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
