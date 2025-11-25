import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { GatewaySettings } from '@/types/gateway-settings'

interface ReportCustomizationSectionProps {
  settings: GatewaySettings
  isExpanded: boolean
  onToggle: () => void
  onSwitchChange: (field: keyof GatewaySettings) => void
}

export function ReportCustomizationSection({
  settings,
  isExpanded,
  onToggle,
  onSwitchChange,
}: ReportCustomizationSectionProps) {
  return (
    <div>
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
          Relatório de Entradas
        </h3>
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_meio}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_meio')
                }
              />
              <Label>Mostrar Meio</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_transacao_id}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_transacao_id')
                }
              />
              <Label>Mostrar Transação ID</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_valor}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_valor')
                }
              />
              <Label>Mostrar Valor</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_valor_liquido}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_valor_liquido')
                }
              />
              <Label>Mostrar Valor Líquido</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_nome}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_nome')
                }
              />
              <Label>Mostrar Nome</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_documento}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_documento')
                }
              />
              <Label>Mostrar Documento</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_status}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_status')
                }
              />
              <Label>Mostrar Status</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_data}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_data')
                }
              />
              <Label>Mostrar Data</Label>
            </div>

            <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
              <Switch
                checked={settings.relatorio_entradas_mostrar_taxa}
                onCheckedChange={() =>
                  onSwitchChange('relatorio_entradas_mostrar_taxa')
                }
              />
              <Label>Mostrar Taxa</Label>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ChevronUp className="h-5 w-5" />
              Relatório de Saídas
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_transacao_id}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_transacao_id')
                  }
                />
                <Label>Mostrar Transação ID</Label>
              </div>

              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_valor}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_valor')
                  }
                />
                <Label>Mostrar Valor</Label>
              </div>

              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_nome}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_nome')
                  }
                />
                <Label>Mostrar Nome</Label>
              </div>

              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_chave_pix}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_chave_pix')
                  }
                />
                <Label>Mostrar Chave PIX</Label>
              </div>

              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_tipo_chave}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_tipo_chave')
                  }
                />
                <Label>Mostrar Tipo Chave</Label>
              </div>

              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_status}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_status')
                  }
                />
                <Label>Mostrar Status</Label>
              </div>

              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_data}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_data')
                  }
                />
                <Label>Mostrar Data</Label>
              </div>

              <div className="flex items-center gap-3 max-[1024px]:flex-col max-[1024px]:items-start">
                <Switch
                  checked={settings.relatorio_saidas_mostrar_taxa}
                  onCheckedChange={() =>
                    onSwitchChange('relatorio_saidas_mostrar_taxa')
                  }
                />
                <Label>Mostrar Taxa</Label>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800 font-medium mb-2">
              💡 Como funciona:
            </p>
            <ul className="text-sm text-cyan-700 space-y-1 list-disc list-inside">
              <li>
                Desative os campos que você não quer que apareçam nos relatórios
                dos usuários
              </li>
              <li>
                Os campos desativados ficarão ocultos tanto na visualização
                quanto na exportação
              </li>
              <li>
                Esta configuração é global e afeta todos os usuários do sistema
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
