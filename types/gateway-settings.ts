export interface GatewaySettings {
  // Taxas fixas (em centavos)
  taxa_fixa_deposito: number
  taxa_fixa_pix: number
  limite_mensal_pf: number

  // Personalização de Relatórios - Entradas
  relatorio_entradas_mostrar_meio: boolean
  relatorio_entradas_mostrar_transacao_id: boolean
  relatorio_entradas_mostrar_valor: boolean
  relatorio_entradas_mostrar_valor_liquido: boolean
  relatorio_entradas_mostrar_nome: boolean
  relatorio_entradas_mostrar_documento: boolean
  relatorio_entradas_mostrar_status: boolean
  relatorio_entradas_mostrar_data: boolean
  relatorio_entradas_mostrar_taxa: boolean

  // Personalização de Relatórios - Saídas
  relatorio_saidas_mostrar_transacao_id: boolean
  relatorio_saidas_mostrar_valor: boolean
  relatorio_saidas_mostrar_nome: boolean
  relatorio_saidas_mostrar_chave_pix: boolean
  relatorio_saidas_mostrar_tipo_chave: boolean
  relatorio_saidas_mostrar_status: boolean
  relatorio_saidas_mostrar_data: boolean
  relatorio_saidas_mostrar_taxa: boolean

  // Configurações de Segurança
  global_ips: string[]
}

export type NumericSettingsField =
  | 'taxa_fixa_deposito'
  | 'taxa_fixa_pix'
  | 'limite_mensal_pf'

export type BooleanSettingsField = keyof Pick<
  GatewaySettings,
  | 'relatorio_entradas_mostrar_meio'
  | 'relatorio_entradas_mostrar_transacao_id'
  | 'relatorio_entradas_mostrar_valor'
  | 'relatorio_entradas_mostrar_valor_liquido'
  | 'relatorio_entradas_mostrar_nome'
  | 'relatorio_entradas_mostrar_documento'
  | 'relatorio_entradas_mostrar_status'
  | 'relatorio_entradas_mostrar_data'
  | 'relatorio_entradas_mostrar_taxa'
  | 'relatorio_saidas_mostrar_transacao_id'
  | 'relatorio_saidas_mostrar_valor'
  | 'relatorio_saidas_mostrar_nome'
  | 'relatorio_saidas_mostrar_chave_pix'
  | 'relatorio_saidas_mostrar_tipo_chave'
  | 'relatorio_saidas_mostrar_status'
  | 'relatorio_saidas_mostrar_data'
  | 'relatorio_saidas_mostrar_taxa'
>

export interface GatewaySettingsResponse {
  success: boolean
  data: GatewaySettings
  message?: string
}

export interface GatewaySettingsUpdate extends Partial<GatewaySettings> {}
