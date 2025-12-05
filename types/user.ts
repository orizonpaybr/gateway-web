export type Gender = 'male' | 'female'

/**
 * Constante com as opções de gênero para formulários
 * @description Usado em selects e dropdowns
 */
export const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Masculino' },
  { value: 'female' as const, label: 'Feminino' },
] as const

export type GenderOption = (typeof GENDER_OPTIONS)[number]

/**
 * Interface completa do usuário
 * @description Estrutura completa dos dados do usuário
 */
export interface User {
  id: string
  name: string
  email: string
  username: string
  gender?: Gender | null
  status?: number
  status_text?: string
  agency?: string
  balance?: number
  phone?: string
  cnpj?: string
  twofa_enabled?: boolean
  twofa_configured?: boolean
  permission?: number // 3 = admin, 2 = gerente, 1 = usuario
}

/**
 * Dados de registro de usuário
 * @description Estrutura dos dados enviados no cadastro
 */
export interface RegisterData {
  username: string
  name: string
  email: string
  telefone: string
  cpf_cnpj: string
  password: string
  gender: Gender
  ref?: string
}
