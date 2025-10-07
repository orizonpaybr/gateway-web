// Tipos globais do sistema

export interface User {
  id: string
  fullName: string
  username: string
  email: string
  phone: string
  cpf: string
  city: string
}

export interface Company {
  id: string
  name: string
  cnpj: string
  tradeName: string
  phone: string
  email: string
}

export interface Transaction {
  id: string
  description: string
  value: number
  date: string
  type: 'entrada' | 'saida'
  status: 'concluída' | 'pendente' | 'falhou'
  endToEndId?: string
  reference?: string
}

export interface QRCode {
  id: string
  reference: string
  value: number
  status: 'paid' | 'pending' | 'expired'
  createdAt: string
  paidAt: string | null
}

export interface Infracao {
  id: string
  description: string
  value: number
  date: string
  endToEnd: string
  status: 'ativa' | 'resolvida' | 'em_analise'
}

export interface Level {
  name: string
  color: string
  minDeposit: number
}

export interface ApiCredentials {
  clientKey: string
  clientSecret: string
  ipsAutorizados: string[]
}

export interface AccountSettings {
  taxas: {
    depositoPercentual: number
    saquePercentual: number
    afiliadoPercentual: number
    limiteDeposito: number
    limiteSaque: number
    retencaoPercentual: number
  }
  funcionalidades: {
    saqueAutomatico: boolean
    saqueDashboard: boolean
    saqueAPI: boolean
  }
}

export interface NotificationSettings {
  whatsapp: boolean
  push: boolean
}
