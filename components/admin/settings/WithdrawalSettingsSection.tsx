import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                Taxa fixa aplicada sobre cada saque PIX (valor em reais, ex.: 1 =
                R$ 1,00)
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800 font-medium mb-2">
              💡 Como funciona o cálculo de taxa de saque (cash-out):
            </p>
            <ul className="text-sm text-cyan-700 space-y-1 list-disc list-inside">
              <li>
                <strong>Taxa fixa cash-out:</strong> R${' '}
                {Number(settings.taxa_fixa_pix).toFixed(2)}
              </li>
              <li>
                <strong>Exemplo:</strong> Saque de R$ 100,00 → Taxa = R${' '}
                {Number(settings.taxa_fixa_pix).toFixed(2)} → Total descontado =
                R$ {(100 + Number(settings.taxa_fixa_pix)).toFixed(2)}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
