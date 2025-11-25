export interface GatewaySettings {
  // Taxas de Depósito
  taxa_percentual_deposito: number
  taxa_fixa_deposito: number
  valor_minimo_deposito: number

  // Taxas de Saque PIX
  taxa_percentual_pix: number
  taxa_minima_pix: number
  taxa_fixa_pix: number
  valor_minimo_saque: number
  limite_mensal_pf: number
  taxa_saque_api: number
  taxa_saque_crypto: number

  // Sistema de Taxas Flexível
  sistema_flexivel_ativo: boolean
  valor_minimo_flexivel: number
  taxa_fixa_baixos: number
  taxa_percentual_altos: number

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
  | 'taxa_percentual_deposito'
  | 'taxa_fixa_deposito'
  | 'valor_minimo_deposito'
  | 'taxa_percentual_pix'
  | 'taxa_minima_pix'
  | 'taxa_fixa_pix'
  | 'valor_minimo_saque'
  | 'limite_mensal_pf'
  | 'taxa_saque_api'
  | 'valor_minimo_flexivel'
  | 'taxa_fixa_baixos'
  | 'taxa_percentual_altos'

export type BooleanSettingsField =
  | 'sistema_flexivel_ativo'
  | keyof Pick<
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
