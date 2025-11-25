import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type {
  GatewaySettings,
  NumericSettingsField,
} from '@/types/gateway-settings'

interface FlexibleTaxSystemSectionProps {
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
  onSwitchChange: (field: keyof GatewaySettings) => void
}

export function FlexibleTaxSystemSection({
  settings,
  isExpanded,
  onToggle,
  getDisplayValue,
  handleChange,
  handleBlur,
  onSwitchChange,
}: FlexibleTaxSystemSectionProps) {
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
          Sistema de Taxas Flexível para Depósitos
        </h3>
      </button>

      {isExpanded && (
        <>
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:justify-between w-full">
              <div>
                <Label className="font-medium">
                  Ativar Sistema de Taxas Flexível
                </Label>
                <p className="text-sm text-gray-500">
                  Quando ativado, o sistema aplicará taxas diferentes baseadas
                  no valor do depósito
                </p>
              </div>
              <Switch
                checked={settings.sistema_flexivel_ativo}
                onCheckedChange={() => onSwitchChange('sistema_flexivel_ativo')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            <div>
              <Label
                htmlFor="valor_minimo_flexivel"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Valor Mínimo (R$)
              </Label>
              <Input
                id="valor_minimo_flexivel"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('valor_minimo_flexivel')}
                onChange={handleChange('valor_minimo_flexivel')}
                onBlur={handleBlur('valor_minimo_flexivel')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Depósitos abaixo deste valor terão taxa fixa
              </p>
            </div>

            <div>
              <Label
                htmlFor="taxa_fixa_baixos"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Fixa para Valores Baixos (R$)
              </Label>
              <Input
                id="taxa_fixa_baixos"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_fixa_baixos')}
                onChange={handleChange('taxa_fixa_baixos')}
                onBlur={handleBlur('taxa_fixa_baixos')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Taxa fixa para depósitos abaixo do valor mínimo
              </p>
            </div>

            <div>
              <Label
                htmlFor="taxa_percentual_altos_flex"
                className="min-h-[40px] leading-tight flex items-end pb-1"
              >
                Taxa Percentual para Valores Altos (%)
              </Label>
              <Input
                id="taxa_percentual_altos_flex"
                type="text"
                inputMode="decimal"
                value={getDisplayValue('taxa_percentual_altos')}
                onChange={handleChange('taxa_percentual_altos')}
                onBlur={handleBlur('taxa_percentual_altos')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Taxa percentual para depósitos acima do valor mínimo
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800 font-medium mb-2">
              💡 Como funciona:
            </p>
            <ul className="text-sm text-cyan-700 space-y-1 list-disc list-inside">
              <li>
                <strong>
                  Depósitos abaixo de R$ {settings.valor_minimo_flexivel}:
                </strong>{' '}
                Taxa fixa de R$ {settings.taxa_fixa_baixos.toFixed(2)}
              </li>
              <li>
                <strong>
                  Depósitos acima de R$ {settings.valor_minimo_flexivel}:
                </strong>{' '}
                Taxa percentual de {settings.taxa_percentual_altos}%
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
