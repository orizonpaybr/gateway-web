// Configuração base para chamadas à API
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const BASE_URL = API_URL
// ============================================
// API de Configurações do Gateway (Admin)
// ============================================

export const gatewaySettingsAPI = {
  getSettings: async (): Promise<{
    success: boolean
    data: Record<string, unknown>
  }> => {
    return apiRequest('/admin/settings')
  },

  updateSettings: async (
    payload: Record<string, unknown>,
  ): Promise<{
    success: boolean
    message: string
    data: Record<string, unknown>
  }> => {
    return apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

// Interface para dados de autenticação armazenados
export interface AuthData {
  token: string
  api_token?: string // Opcional - enviado pelo backend mas não usado
  api_secret?: string // Opcional - enviado pelo backend mas não usado
  user: {
    id: string
    username: string
    email: string
    name: string
  }
}

// Função auxiliar para fazer requisições autenticadas
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Tratamento centralizado de erros
  if (!response.ok) {
    // 401: limpar credenciais e emitir evento global para UI reagir (logout/redirect)
    if (response.status === 401) {
      try {
        clearAuthData()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-unauthorized'))
        }
      } catch {
        // Ignorar erros ao limpar autenticação
      }
    }

    const errorPayload = await response.json().catch(() => ({}))
    const message =
      errorPayload?.message ||
      (response.status === 401
        ? 'Não autorizado. Faça login novamente.'
        : 'Erro na requisição')

    throw new Error(message)
  }

  return response.json()
}

// Interface para resposta de login/registro
interface AuthResponse {
  success: boolean
  message: string
  data?: AuthData
  requires_2fa?: boolean
  temp_token?: string
  errors?: Record<string, string[]>
}

// Interface para dados de registro - importada de types/user.ts
import type { RegisterData as RegisterDataType } from '@/types/user'
export type RegisterData = RegisterDataType

// Helper para armazenar dados de autenticação
const storeAuthData = (data: AuthData): void => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  // Armazenar também credenciais do middleware check.token.secret, quando fornecidas
  if (data.api_token) {
    localStorage.setItem('api_token', data.api_token)
  }
  if (data.api_secret) {
    localStorage.setItem('api_secret', data.api_secret)
  }

  // Disparar evento customizado para notificar componentes que o token foi armazenado
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-token-stored'))
  }
}

// Helper para limpar dados de autenticação
const clearAuthData = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('2fa_verified') // Limpar verificação 2FA da sessão
}

// Funções de autenticação
export const authAPI = {
  /**
   * Login de usuário
   */
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    // Early return para 2FA - NÃO armazenar token ainda
    if (!data.success && data.requires_2fa) {
      return data
    }

    // Guard clause para erro
    if (!data.success) {
      throw new Error(data.message || 'Erro ao fazer login')
    }

    // Só armazenar token se login foi bem-sucedido E não requer 2FA
    if (data.success && data.data && !data.requires_2fa) {
      storeAuthData(data.data)
    }

    return data
  },

  /**
   * Verificação 2FA
   */
  verify2FA: async (tempToken: string, code: string): Promise<AuthResponse> => {
    const payload = { temp_token: tempToken, code }

    const response = await fetch(`${BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    // Guard clause para erro
    if (!data.success) {
      console.error('❌ Erro na verificação 2FA:', data)
      throw new Error(data.message || 'Código 2FA inválido')
    }

    // Armazenar tokens se disponíveis
    if (data.data) {
      storeAuthData(data.data)
    }

    return data
  },

  /**
   * Registro de novo usuário
   */
  register: async (
    data: RegisterData,
    documents?: {
      documentoFrente?: File
      documentoVerso?: File
      selfieDocumento?: File
    },
  ): Promise<AuthResponse> => {
    const formData = new FormData()

    // Adicionar dados do formulário
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    // Adicionar documentos se fornecidos
    if (documents?.documentoFrente) {
      formData.append('documentoFrente', documents.documentoFrente)
    }
    if (documents?.documentoVerso) {
      formData.append('documentoVerso', documents.documentoVerso)
    }
    if (documents?.selfieDocumento) {
      formData.append('selfieDocumento', documents.selfieDocumento)
    }

    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData,
      // Não enviar Content-Type quando usar FormData, o browser define automaticamente com o boundary
    })

    const result = await response.json()

    // Guard clause para erro
    if (!result.success) {
      const errorMessage = result.errors
        ? Object.values(result.errors).flat().join(', ')
        : result.message || 'Erro ao criar conta'

      throw new Error(errorMessage)
    }

    // Armazenar tokens se disponíveis
    if (result.data) {
      storeAuthData(result.data)
    }

    return result
  },

  /**
   * Verificar token válido
   */
  verifyToken: async (): Promise<{
    success: boolean
    data?: { user: Record<string, unknown> }
  }> => {
    const token = localStorage.getItem('token')

    // Early return se não há token
    if (!token) {
      return { success: false }
    }

    try {
      return await apiRequest('/auth/verify', { method: 'GET' })
    } catch {
      clearAuthData()
      return { success: false }
    }
  },

  validateRegistrationData: async (data: {
    username: string
    email: string
    telefone?: string
    cpf_cnpj?: string
  }): Promise<{
    success: boolean
    message: string
    errors?: Record<string, string>
  }> => {
    const response = await fetch(`${BASE_URL}/auth/validate-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    return result
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      clearAuthData()
    }
  },

  /**
   * Trocar senha do usuário
   * Requer 2FA PIN para confirmar a operação
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string,
    twoFAPin: string, // PIN de 2FA obrigatório
  ): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${
          typeof window !== 'undefined'
            ? localStorage.getItem('token') || ''
            : ''
        }`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
        twofa_pin: twoFAPin, // Enviar PIN de 2FA
      }),
    })

    const data = await response.json()

    // Guard clause para erro
    if (!data.success) {
      throw new Error(data.message || 'Erro ao trocar senha')
    }

    return data
  },
}

export const transactionsAPI = {
  list: async (filters?: {
    page?: number
    limit?: number
    tipo?: 'deposito' | 'saque'
    status?: string
    busca?: string
    data_inicio?: string
    data_fim?: string
  }): Promise<{
    success: boolean
    data: {
      data: Array<{
        id: number
        transaction_id: string
        tipo: 'deposito' | 'saque'
        amount: number
        valor_liquido: number
        taxa: number
        status: string
        status_legivel: string
        data: string
        created_at: string
        nome_cliente: string
        documento: string
        adquirente: string
        descricao: string
      }>
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.tipo) {
      params.append('tipo', filters.tipo)
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/transactions?${params.toString()}`)
  },

  getById: async (
    id: string,
  ): Promise<{
    success: boolean
    data: {
      id: number
      transaction_id: string
      tipo: 'deposito' | 'saque'
      metodo: string
      movimento: string
      amount: number
      valor_liquido: number
      taxa: number
      status: string
      status_legivel: string
      data: string
      created_at: string
      updated_at: string
      origem: {
        nome: string
        documento: string
      }
      destino: {
        nome: string
        documento: string
      }
      adquirente: string
      codigo_autenticacao: string
      descricao: string
      qrcode?: string
      pix_key?: string
      pix_key_type?: string
      end_to_end?: string
    }
  }> => {
    return apiRequest(`/transactions/${id}`)
  },
}

// Tipos para Chaves PIX
export type PixKeyType = 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria'

export interface PixKey {
  id: number
  key_type: PixKeyType
  key_type_label: string
  key_value: string
  key_value_formatted: string
  key_label: string | null
  is_active: boolean
  is_default: boolean
  icon: string
  verified_at: string | null
  created_at: string
}

export interface CreatePixKeyData {
  key_type: PixKeyType
  key_value: string
  key_label?: string
  is_default?: boolean
}

export interface UpdatePixKeyData {
  key_label?: string
  is_default?: boolean
  is_active?: boolean
}

export interface PixWithdrawData {
  key_id?: number
  key_type?: PixKeyType
  key_value?: string
  amount: number
  description?: string
}

export interface PixDepositData {
  amount: number
  description?: string
}

export interface PixDepositResponse {
  success: boolean
  data: {
    idTransaction?: string
    transaction_id?: string
    qrcode?: string // PIX Copia e Cola
    qr_code?: string // PIX Copia e Cola (formato alternativo)
    qrCodeImage?: string // Base64 da imagem do QR Code
    qr_code_image_url?: string // Base64 da imagem (formato alternativo)
    amount: number
    status?: string
    externalReference?: string
  }
}

export const pixAPI = {
  transfer: async (_data: Record<string, unknown>) => {
    // return apiRequest('/pix/transfer', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // })
    throw new Error('API não implementada')
  },

  // Gerar QR Code para depósito
  generateDeposit: async (
    data: PixDepositData,
  ): Promise<PixDepositResponse> => {
    return apiRequest('/pix/generate-qr', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Verificar status do depósito
  checkDepositStatus: async (
    idTransaction: string,
  ): Promise<{
    success: boolean
    status: string
  }> => {
    return apiRequest(`/transactions/${idTransaction}`)
  },

  // ===== GERENCIAMENTO DE CHAVES PIX =====

  // Listar todas as chaves PIX do usuário
  listKeys: async (): Promise<{
    success: boolean
    data: PixKey[]
  }> => {
    return apiRequest('/pix/keys')
  },

  // Criar nova chave PIX
  createKey: async (
    data: CreatePixKeyData,
  ): Promise<{
    success: boolean
    message: string
    data: PixKey
  }> => {
    return apiRequest('/pix/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Buscar chave PIX específica
  getKey: async (
    id: number,
  ): Promise<{
    success: boolean
    data: PixKey
  }> => {
    return apiRequest(`/pix/keys/${id}`)
  },

  // Atualizar chave PIX
  updateKey: async (
    id: number,
    data: UpdatePixKeyData,
  ): Promise<{
    success: boolean
    message: string
    data: PixKey
  }> => {
    return apiRequest(`/pix/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Deletar chave PIX
  deleteKey: async (
    id: number,
  ): Promise<{
    success: boolean
    message: string
  }> => {
    return apiRequest(`/pix/keys/${id}`, {
      method: 'DELETE',
    })
  },

  // Definir chave como padrão
  setDefaultKey: async (
    id: number,
  ): Promise<{
    success: boolean
    message: string
  }> => {
    return apiRequest(`/pix/keys/${id}/set-default`, {
      method: 'POST',
    })
  },

  // Realizar saque com chave PIX
  withdrawWithKey: async (
    data: PixWithdrawData,
  ): Promise<{
    success: boolean
    message: string
    data: {
      transaction_id: string
      amount: number
      key_type: string
      key_value: string
      description: string
      status: string
      estimated_time: string
      created_at: string
      adquirente: string
    }
  }> => {
    return apiRequest('/pix/withdraw-with-key', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // ===== INFRAÇÕES PIX =====

  // Listar infrações do Pix
  listInfracoes: async (filters?: {
    page?: number
    limit?: number
    status?: string
    busca?: string
    data_inicio?: string
    data_fim?: string
  }): Promise<{
    success: boolean
    data: {
      data: Array<{
        id: number
        status: string
        data_criacao: string
        data_limite: string
        valor: number
        end_to_end: string
        tipo: string
        descricao: string
        created_at: string
        updated_at: string
      }>
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/pix/infracoes?${params.toString()}`)
  },

  // Buscar detalhes de uma infração específica
  getInfracao: async (
    id: string,
  ): Promise<{
    success: boolean
    data: {
      id: number
      status: string
      data_criacao: string
      data_limite: string
      valor: number
      end_to_end: string
      tipo: string
      descricao: string
      detalhes: string
      transacao_relacionada?: {
        id: number
        transaction_id: string
        valor: number
        data: string
      }
      created_at: string
      updated_at: string
    }
  }> => {
    return apiRequest(`/pix/infracoes/${id}`)
  },
}

export const qrCodeAPI = {
  list: async (filters?: {
    page?: number
    limit?: number
    status?: string
    busca?: string
    data_inicio?: string
    data_fim?: string
  }): Promise<{
    success: boolean
    data: {
      data: Array<{
        id: number
        nome: string
        descricao: string
        valor: number
        tipo: 'cobranca' | 'doacao'
        status: 'ativo' | 'inativo' | 'expirado'
        data_criacao: string
        expires_at: string
        transaction_id: string
        qr_code: string
        qr_code_image_url: string
        created_at: string
        updated_at: string
      }>
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/qrcodes?${params.toString()}`)
  },
}

export const extratoAPI = {
  // Buscar extrato completo com paginação e filtros
  list: async (filters?: {
    page?: number
    limit?: number
    periodo?: 'hoje' | '7d' | '30d' | 'custom'
    data_inicio?: string
    data_fim?: string
    busca?: string
    tipo?: 'entrada' | 'saida'
  }): Promise<{
    success: boolean
    data: {
      data: Array<{
        id: number
        transaction_id: string
        tipo: 'entrada' | 'saida'
        descricao: string
        valor: number
        valor_liquido: number
        taxa: number
        status: string
        status_legivel: string
        data: string
        created_at: string
        nome_cliente: string
        documento: string
        adquirente: string
        end_to_end?: string
      }>
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
      resumo: {
        total_entradas: number
        total_entradas_liquidas: number
        total_taxas_entradas: number
        total_saidas: number
        total_saidas_liquidas: number
        total_taxas_saidas: number
        saldo_atual: number
        saldo_periodo: number
      }
      periodo: string
      data_inicio: string
      data_fim: string
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.periodo) {
      params.append('periodo', filters.periodo)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.tipo) {
      params.append('tipo', filters.tipo)
    }

    return apiRequest(`/extrato?${params.toString()}`)
  },

  // Buscar resumo do extrato (sem paginação)
  getSummary: async (filters?: {
    periodo?: 'hoje' | '7d' | '30d' | 'custom'
    data_inicio?: string
    data_fim?: string
  }): Promise<{
    success: boolean
    data: {
      resumo: {
        total_entradas: number
        total_entradas_liquidas: number
        total_taxas_entradas: number
        total_saidas: number
        total_saidas_liquidas: number
        total_taxas_saidas: number
        saldo_atual: number
        saldo_periodo: number
      }
      periodo: string
      data_inicio: string
      data_fim: string
    }
  }> => {
    const params = new URLSearchParams()
    params.append('limit', '1') // Apenas para obter o resumo
    if (filters?.periodo) {
      params.append('periodo', filters.periodo)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/extrato?${params.toString()}`)
  },
}

export const accountAPI = {
  getBalance: async (): Promise<{
    success: boolean
    data: {
      current: number
      totalInflows: number
      totalOutflows: number
    }
  }> => {
    return apiRequest('/balance')
  },

  getProfile: async () => {
    return apiRequest('/user/profile')
  },

  updateProfile: async (_data: Record<string, unknown>) => {
    // return apiRequest('/account/profile', {
    //   method: 'PUT',
    //   body: JSON.stringify(data),
    // })
    throw new Error('API não implementada')
  },
}

// API de dashboard
export const dashboardAPI = {
  // Buscar estatísticas do dashboard
  getStats: async (): Promise<{
    success: boolean
    data: {
      saldo_disponivel: number
      entradas_mes: number
      saidas_mes: number
      splits_mes: number
      periodo: {
        inicio: string
        fim: string
      }
    }
  }> => {
    return apiRequest('/dashboard/stats')
  },

  // Buscar dados para movimentação interativa
  getInteractiveMovement: async (
    periodo: string = 'hoje',
  ): Promise<{
    success: boolean
    data: {
      periodo: string
      data_inicio: string
      data_fim: string
      cards: {
        total_depositos: number
        qtd_depositos: number
        total_saques: number
        qtd_saques: number
      }
      chart: Array<{
        periodo: string
        depositos: number
        saques: number
      }>
    }
  }> => {
    return apiRequest(`/dashboard/interactive-movement?periodo=${periodo}`)
  },

  // Buscar resumo de transações (8 cards)
  getTransactionSummary: async (
    periodo: string = 'hoje',
  ): Promise<{
    success: boolean
    data: {
      periodo: string
      data_inicio: string
      data_fim: string
      quantidadeTransacoes: {
        depositos: number
        saques: number
      }
      tarifaCobrada: number
      qrCodes: {
        pagos: number
        gerados: number
      }
      indiceConversao: number
      ticketMedio: {
        depositos: number
        saques: number
      }
      valorMinMax: {
        depositos: {
          min: number
          max: number
        }
      }
      infracoes: number
      percentualInfracoes: {
        percentual: number
        valorTotal: number
      }
    }
  }> => {
    return apiRequest(`/dashboard/transaction-summary?periodo=${periodo}`)
  },
}

// API de autenticação de dois fatores
export const twoFactorAPI = {
  // Verificar status do 2FA
  getStatus: async (): Promise<{
    success: boolean
    enabled: boolean
    configured: boolean
  }> => {
    return apiRequest('/2fa/status')
  },

  // Gerar QR Code para configuração
  generateQRCode: async (): Promise<{
    success: boolean
    qr_code: string
    secret: string
    manual_entry_key: string
    message?: string
  }> => {
    return apiRequest('/2fa/generate-qr', { method: 'POST' })
  },

  // Verificar código 2FA
  verifyCode: async (
    code: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },

  // Ativar 2FA
  enable: async (
    code: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },

  // Desativar 2FA
  disable: async (
    code: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },
}

// Tipos para Saques/Withdrawals
export interface Withdrawal {
  id: number
  transaction_id: string
  user_id: string
  username: string
  email: string
  nome_cliente: string
  documento: string
  pix_key: string
  pix_type: string
  amount: number
  taxa: number
  valor_liquido: number
  status:
    | 'PENDING'
    | 'COMPLETED'
    | 'PAID_OUT'
    | 'CANCELLED'
    | 'FAILED'
    | 'PROCESSING'
  status_legivel: string
  tipo_processamento: 'Manual' | 'Automático'
  executor?: string
  data: string
  created_at: string
  updated_at: string
  descricao: string
  end_to_end?: string
}

export interface WithdrawalDetails extends Withdrawal {
  id_transaction_gateway?: string
  descricao_externa?: string
  callback?: string
  user_balance: number
}

export interface WithdrawalStats {
  periodo: string
  data_inicio: string
  data_fim: string
  total_pendentes: number
  total_aprovados: number
  total_rejeitados: number
  valor_total: number
  valor_aprovado: number
  saques_manuais: number
  saques_automaticos: number
}

export interface WithdrawalFilters {
  page?: number
  limit?: number
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'all'
  tipo?: 'manual' | 'automatico' | 'all'
  busca?: string
  data_inicio?: string
  data_fim?: string
}

// API de gerenciamento de saques (Admin)
export const withdrawalsAPI = {
  // Listar saques com filtros e paginação
  list: async (
    filters?: WithdrawalFilters,
  ): Promise<{
    success: boolean
    data: {
      data: Withdrawal[]
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.tipo) {
      params.append('tipo', filters.tipo)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/admin/withdrawals?${params.toString()}`)
  },

  // Buscar detalhes de um saque específico
  getById: async (
    id: number,
  ): Promise<{
    success: boolean
    data: WithdrawalDetails
  }> => {
    return apiRequest(`/admin/withdrawals/${id}`)
  },

  // Aprovar saque
  approve: async (
    id: number,
  ): Promise<{
    success: boolean
    message: string
  }> => {
    return apiRequest(`/admin/withdrawals/${id}/approve`, {
      method: 'POST',
    })
  },

  // Rejeitar saque
  reject: async (
    id: number,
  ): Promise<{
    success: boolean
    message: string
  }> => {
    return apiRequest(`/admin/withdrawals/${id}/reject`, {
      method: 'POST',
    })
  },

  // Obter estatísticas de saques
  getStats: async (
    periodo: string = 'hoje',
  ): Promise<{
    success: boolean
    data: WithdrawalStats
  }> => {
    return apiRequest(`/admin/withdrawals/stats?periodo=${periodo}`)
  },

  // Obter configurações de saque
  getConfig: async (): Promise<{
    success: boolean
    data: {
      saque_automatico: boolean
      limite_saque_automatico: number | null
    }
  }> => {
    return apiRequest('/admin/withdrawals/config')
  },

  // Atualizar configurações de saque
  updateConfig: async (data: {
    saque_automatico: boolean
    limite_saque_automatico?: number | null
  }): Promise<{
    success: boolean
    message: string
    data: {
      saque_automatico: boolean
      limite_saque_automatico: number | null
    }
  }> => {
    return apiRequest('/admin/withdrawals/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ============================================
// API do Módulo Financeiro
// ============================================

export interface FinancialTransaction {
  id: number
  tipo: 'deposito' | 'saque'
  meio: string
  cliente_id: string
  transacao_id: string
  valor_total: number
  valor_liquido: number
  status: string
  status_legivel: string
  data: string
  created_at: string
}

export interface FinancialTransactionStats {
  transacoes_aprovadas: number
  lucro_liquido_hoje: number
  lucro_liquido_mes: number
  lucro_liquido_total: number
  lucro_liquido_periodo: number
}

export interface Wallet {
  id: number
  user_id: string
  name: string
  username: string
  email: string
  telefone: string | null
  saldo: number
  total_transacoes: number
  valor_sacado: number
  status: string
  permission: number
  created_at: string
}

export interface Top3User {
  id: number
  user_id: string
  name: string
  username: string
  email: string
  telefone: string | null
  saldo: number
  total_transacoes: number
  valor_sacado: number
}

export interface WalletStats {
  total_carteiras: number
  saldo_total: number
  carteiras_ativas: number
  valor_medio_carteira: number
  top_3_usuarios: Top3User[]
}

export interface Deposit {
  id: number
  meio: string
  cliente_id: string
  cliente_nome: string
  transacao_id: string
  valor_total: number
  valor_liquido: number
  taxa: number
  status: string
  status_legivel: string
  data: string
  created_at: string
}

export interface DepositStats {
  total_depositos_geral: number
  depositos_aprovados_geral: number
  valor_total_geral: number
  depositos_aprovados_hoje: number
  valor_total_hoje: number
  depositos_aprovados_mes: number
  valor_total_mes: number
}

export interface FinancialWithdrawal {
  id: number
  meio: string
  cliente_id: string
  cliente_nome: string
  pix_key: string
  pix_type: string
  transacao_id: string
  valor_total: number
  valor_liquido: number
  taxa: number
  status: string
  status_legivel: string
  data: string
  created_at: string
}

export interface WithdrawalStatsFinancial {
  // Estatísticas gerais
  total_saques_geral: number
  saques_aprovados_geral: number
  valor_total_geral: number
  lucro_total_geral: number
  // Estatísticas de hoje
  saques_aprovados_hoje: number
  valor_total_hoje: number
  lucro_total_hoje: number
  // Estatísticas do mês
  saques_aprovados_mes: number
  valor_total_mes: number
  lucro_total_mes: number
  // Pendentes
  saques_pendentes_geral: number
  // Compatibilidade (mantido para código antigo)
  total_saques: number
  saques_aprovados: number
  saques_pendentes: number
  valor_total: number
  lucro_saques: number
}

export interface FinancialFilters {
  page?: number
  limit?: number
  status?: string
  meio?: string
  tipo?: string
  busca?: string
  data_inicio?: string
  data_fim?: string
  tipo_usuario?: string
  ordenar?: string
}

export const financialAPI = {
  // Transações - Todas (Depósitos + Saques)
  getAllTransactions: async (
    filters?: FinancialFilters,
  ): Promise<{
    success: boolean
    data: {
      data: FinancialTransaction[]
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.meio) {
      params.append('meio', filters.meio)
    }
    if (filters?.tipo) {
      params.append('tipo', filters.tipo)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/admin/financial/transactions?${params.toString()}`)
  },

  getTransactionsStats: async (
    periodo: string = 'hoje',
  ): Promise<{
    success: boolean
    data: FinancialTransactionStats
  }> => {
    return apiRequest(`/admin/financial/transactions/stats?periodo=${periodo}`)
  },

  // Carteiras
  getWallets: async (
    filters?: FinancialFilters,
  ): Promise<{
    success: boolean
    data: {
      data: Wallet[]
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.tipo_usuario) {
      params.append('tipo_usuario', filters.tipo_usuario)
    }
    if (filters?.ordenar) {
      params.append('ordenar', filters.ordenar)
    }

    return apiRequest(`/admin/financial/wallets?${params.toString()}`)
  },

  getWalletsStats: async (): Promise<{
    success: boolean
    data: WalletStats
  }> => {
    return apiRequest('/admin/financial/wallets/stats')
  },

  // Depósitos (Entradas)
  getDeposits: async (
    filters?: FinancialFilters,
  ): Promise<{
    success: boolean
    data: {
      data: Deposit[]
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.meio) {
      params.append('meio', filters.meio)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/admin/financial/deposits?${params.toString()}`)
  },

  getDepositsStats: async (
    periodo: string = 'hoje',
  ): Promise<{
    success: boolean
    data: DepositStats
  }> => {
    return apiRequest(`/admin/financial/deposits/stats?periodo=${periodo}`)
  },

  /**
   * Atualizar status de depósito
   * @param depositoId ID do depósito
   * @param status Novo status (PENDING, PAID_OUT, COMPLETED, CANCELLED, REJECTED)
   */
  updateDepositStatus: async (
    depositoId: number,
    status: string,
  ): Promise<{
    success: boolean
    data: {
      deposit: Deposit
      message: string
    }
  }> => {
    return apiRequest(`/admin/financial/deposits/${depositoId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  // Saques (Saídas)
  getWithdrawals: async (
    filters?: FinancialFilters,
  ): Promise<{
    success: boolean
    data: {
      data: FinancialWithdrawal[]
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }> => {
    const params = new URLSearchParams()
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.busca) {
      params.append('busca', filters.busca)
    }
    if (filters?.data_inicio) {
      params.append('data_inicio', filters.data_inicio)
    }
    if (filters?.data_fim) {
      params.append('data_fim', filters.data_fim)
    }

    return apiRequest(`/admin/financial/withdrawals?${params.toString()}`)
  },

  getWithdrawalsStats: async (
    periodo: string = 'hoje',
  ): Promise<{
    success: boolean
    data: WithdrawalStatsFinancial
  }> => {
    return apiRequest(`/admin/financial/withdrawals/stats?periodo=${periodo}`)
  },
}

// API de integração - Credenciais e IPs autorizados
export const integrationAPI = {
  getCredentials: async (): Promise<{
    success: boolean
    data: {
      client_key: string
      client_secret: string
      status: 'active' | 'inactive'
      created_at: string
    }
  }> => {
    return apiRequest('/integration/credentials')
  },

  regenerateSecret: async (
    pin?: string,
  ): Promise<{
    success: boolean
    message: string
    data: {
      client_key: string
      client_secret: string
    }
  }> => {
    return apiRequest('/integration/regenerate-secret', {
      method: 'POST',
      body: JSON.stringify(pin ? { pin } : {}),
    })
  },

  getAllowedIPs: async (): Promise<{
    success: boolean
    data: {
      ips: string[]
      count: number
    }
  }> => {
    return apiRequest('/integration/allowed-ips')
  },

  addAllowedIP: async (
    ip: string,
    pin?: string,
  ): Promise<{
    success: boolean
    message: string
    data: {
      ips: string[]
    }
  }> => {
    return apiRequest('/integration/allowed-ips', {
      method: 'POST',
      body: JSON.stringify(pin ? { ip, pin } : { ip }),
    })
  },

  removeAllowedIP: async (
    ip: string,
    pin?: string,
  ): Promise<{
    success: boolean
    message: string
    data: {
      ips: string[]
    }
  }> => {
    return apiRequest(`/integration/allowed-ips/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
      body: pin ? JSON.stringify({ pin }) : undefined,
    })
  },
}

// ========================================
// Notificações (listar, marcar como lida, stats)
// ========================================

export interface NotificationItem {
  id: number
  user_id: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  read_at?: string | null
  created_at: string
}

export interface NotificationsResponse {
  success: boolean
  data: {
    notifications: NotificationItem[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    unread_count: number
  }
}

export async function listNotifications(params: {
  page?: number
  limit?: number
  unread_only?: boolean
  token: string
  secret: string
}): Promise<NotificationsResponse> {
  const { token, secret, page = 1, limit = 20, unread_only = false } = params
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    unread_only: unread_only ? '1' : '0',
    token,
    secret,
  }).toString()
  return apiRequest(`/notifications?${qs}`, { method: 'GET' })
}

export async function markNotificationRead(
  id: number,
  token: string,
  secret: string,
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'POST',
    body: JSON.stringify({ token, secret }),
  })
}

export async function markAllNotificationsRead(
  token: string,
  secret: string,
): Promise<{ success: boolean; message: string }> {
  return apiRequest('/notifications/mark-all-read', {
    method: 'POST',
    body: JSON.stringify({ token, secret }),
  })
}

export async function getNotificationsStats(
  token: string,
  secret: string,
): Promise<{
  success: boolean
  data: { total: number; sent: number; unread: number; today: number }
}> {
  const qs = new URLSearchParams({ token, secret }).toString()
  return apiRequest(`/notifications/stats?${qs}`, { method: 'GET' })
}

// ========================================
// Notificações e Preferências
// ========================================

export interface NotificationPreferences {
  id?: number
  user_id: string
  notify_transactions: boolean
  notify_deposits: boolean
  notify_withdrawals: boolean
  notify_security: boolean
  notify_system: boolean
  created_at?: string
  updated_at?: string
}

export interface NotificationPreferencesResponse {
  success: boolean
  message?: string
  data: NotificationPreferences
}

/**
 * Obter preferências de notificação do usuário
 */
export async function getNotificationPreferences(
  token: string,
  secret: string,
): Promise<NotificationPreferencesResponse> {
  return apiRequest('/notification-preferences', {
    method: 'POST',
    body: JSON.stringify({ token, secret }),
  })
}

/**
 * Atualizar preferências de notificação
 */
export async function updateNotificationPreferences(
  token: string,
  secret: string,
  preferences: Partial<
    Omit<
      NotificationPreferences,
      'id' | 'user_id' | 'created_at' | 'updated_at'
    >
  >,
): Promise<NotificationPreferencesResponse> {
  return apiRequest('/notification-preferences', {
    method: 'PUT',
    body: JSON.stringify({ token, secret, ...preferences }),
  })
}

/**
 * Alternar uma preferência específica
 */
export async function toggleNotificationPreference(
  token: string,
  secret: string,
  type:
    | 'notify_transactions'
    | 'notify_deposits'
    | 'notify_withdrawals'
    | 'notify_security'
    | 'notify_system',
): Promise<NotificationPreferencesResponse> {
  return apiRequest(`/notification-preferences/toggle/${type}`, {
    method: 'POST',
    body: JSON.stringify({ token, secret }),
  })
}

/**
 * Desabilitar todas as notificações
 */
export async function disableAllNotifications(
  token: string,
  secret: string,
): Promise<NotificationPreferencesResponse> {
  return apiRequest('/notification-preferences/disable-all', {
    method: 'POST',
    body: JSON.stringify({ token, secret }),
  })
}

/**
 * Habilitar todas as notificações
 */
export async function enableAllNotifications(
  token: string,
  secret: string,
): Promise<NotificationPreferencesResponse> {
  return apiRequest('/notification-preferences/enable-all', {
    method: 'POST',
    body: JSON.stringify({ token, secret }),
  })
}

// ============================================
// API do Dashboard Administrativo
// ============================================

export interface CacheMetrics {
  general: {
    redis_connected: boolean
    total_commands_processed: number
    keyspace_hits: number
    keyspace_misses: number
    used_memory_human: string
    used_memory: number
    cache_keys_count: number
    hit_rate: number
    error?: string
  }
  financial: {
    total_financial_keys: number
    wallets_keys: number
    stats_keys: number
    error?: string
  }
}

export interface AdminDashboardStats {
  periodo: {
    inicio: string
    fim: string
  }
  financeiro: {
    saldo_carteiras: number
    lucro_liquido: number
    lucro_depositos: number
    lucro_saques: number
    taxas_adquirentes: {
      entradas: number
      saidas: number
      total: number
    }
  }
  transacoes: {
    depositos: {
      quantidade: number
      valor_total: number
    }
    saques: {
      quantidade: number
      valor_total: number
    }
    total: {
      quantidade: number
      valor_total: number
    }
  }
  usuarios: {
    cadastrados: number
    pendentes: number
    aprovados: number
  }
  saques_pendentes: {
    quantidade: number
    valor_total: number
  }
}

export interface AdminUser {
  id: number
  user_id: string
  name: string
  email: string
  username: string
  cpf_cnpj?: string
  cpf?: string
  telefone?: string
  status: number
  status_text?: string
  saldo: number
  created_at: string
  total_transacoes: number
  transacoes_aproved: number
  transacoes_recused: number
  permission?: number // 1=cliente, 2=gerente, 3=admin
  aprovado_alguma_vez?: boolean
  data_nascimento?: string
  nome_fantasia?: string
  razao_social?: string
  cep?: string
  rua?: string
  estado?: string
  cidade?: string
  bairro?: string
  numero_residencia?: string
  complemento?: string
  media_faturamento?: number
  gerente_id?: number
  banido?: boolean
  saque_bloqueado?: boolean
  // Taxas personalizadas
  taxas_personalizadas_ativas?: boolean
  taxa_percentual_deposito?: number
  taxa_fixa_deposito?: number
  valor_minimo_deposito?: number
  taxa_percentual_pix?: number
  taxa_minima_pix?: number
  taxa_fixa_pix?: number
  valor_minimo_saque?: number
  limite_mensal_pf?: number
  // Afiliados
  is_affiliate?: boolean
  affiliate_percentage?: number
  affiliate_code?: string
  affiliate_link?: string
  // Campos adicionais para tabela
  permission_text?: string
  adquirente?: string
  vendas_7d?: number
  doc_status?: string
  // Campos adicionais do showUser
  token?: string
  secret?: string
  documents?: {
    rg_frente?: string
    rg_verso?: string
    selfie_rg?: string
  }
  // Campos de adquirente
  preferred_adquirente?: string
  adquirente_override?: boolean
  preferred_adquirente_card_billet?: string
  adquirente_card_billet_override?: boolean
  // Campos de taxas adicionais
  taxa_saque_api?: number
  taxa_saque_crypto?: number
  sistema_flexivel_ativo?: boolean
  valor_minimo_flexivel?: number
  taxa_fixa_baixos?: number
  taxa_percentual_altos?: number
  observacoes_taxas?: string | null
}

export interface CreateUserData {
  username: string
  name: string
  email: string
  password: string
  telefone?: string
  cpf_cnpj?: string
  cpf?: string
  data_nascimento?: string
  saldo?: number
  status?: number
  permission?: number
  nome_fantasia?: string
  razao_social?: string
  cep?: string
  rua?: string
  estado?: string
  cidade?: string
  bairro?: string
  numero_residencia?: string
  complemento?: string
  media_faturamento?: number
  indicador_ref?: string
  gerente_id?: number
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  telefone?: string | null
  cpf_cnpj?: string | null
  cpf?: string | null
  data_nascimento?: string | null
  saldo?: number
  status?: number
  permission?: number
  nome_fantasia?: string
  razao_social?: string
  cep?: string | null
  rua?: string | null
  estado?: string | null
  cidade?: string | null
  bairro?: string | null
  numero_residencia?: string | null
  complemento?: string | null
  media_faturamento?: number
  gerente_id?: number
  // Taxas personalizadas
  taxas_personalizadas_ativas?: boolean
  taxa_percentual_deposito?: number
  taxa_fixa_deposito?: number
  valor_minimo_deposito?: number
  taxa_percentual_pix?: number
  taxa_minima_pix?: number
  taxa_fixa_pix?: number
  valor_minimo_saque?: number
  limite_mensal_pf?: number
  // Campos de adquirente
  preferred_adquirente?: string
  adquirente_override?: boolean
  preferred_adquirente_card_billet?: string
  adquirente_card_billet_override?: boolean
  // Campos de taxas adicionais
  taxa_saque_api?: number
  taxa_saque_crypto?: number
  sistema_flexivel_ativo?: boolean
  valor_minimo_flexivel?: number
  taxa_fixa_baixos?: number
  taxa_percentual_altos?: number
  observacoes_taxas?: string | null
}

export interface AdjustBalanceData {
  amount: number
  type: 'add' | 'subtract'
  reason?: string
}

export interface AdminTransaction {
  id: number
  type: 'deposit' | 'withdraw'
  user: {
    id: number
    name: string
    username: string
  } | null
  amount: number
  taxa: number
  status: string
  date: string
  created_at: string
}

export interface ManualDeposit {
  id: number
  transaction_id: string
  amount: number
  valor_liquido: number
  taxa: number
  status: string
  descricao?: string | null
  created_at?: string
  user: {
    id: number
    user_id: string
    name: string
    username: string
  }
}

export interface ManualDepositPayload {
  user_id: string
  amount: number
  description?: string
}

export interface ManualDepositResponse {
  success: boolean
  message: string
  data: {
    deposit: ManualDeposit
  }
}

export interface ManualWithdrawal {
  id: number
  transaction_id: string
  amount: number
  valor_liquido: number
  taxa: number
  valor_total_descontado: number
  status: string
  descricao: string
  created_at: string
  user: {
    id: number
    user_id: string
    name: string
    username: string
  }
}

export interface ManualWithdrawalPayload {
  user_id: string
  amount: number
  description?: string
}

export interface ManualWithdrawalResponse {
  success: boolean
  message: string
  data: {
    withdrawal: ManualWithdrawal
  }
}

/**
 * API para Dashboard Administrativo
 * Apenas usuários com permission === 3 podem acessar
 */
export const adminDashboardAPI = {
  /**
   * Obter estatísticas de usuários para os cards
   */
  async getUserStats(): Promise<{
    success: boolean
    data: {
      total_registrations: number
      month_registrations: number
      pending_registrations: number
      banned_users: number
    }
  }> {
    return apiRequest('/admin/dashboard/users-stats')
  },
  /**
   * Obter estatísticas do dashboard administrativo
   *
   * @param periodo - 'hoje', 'ontem', '7dias', '30dias', 'mes_atual', 'mes_anterior', 'total' ou 'YYYY-MM-DD:YYYY-MM-DD'
   */
  async getStats(periodo: string = 'hoje'): Promise<{
    success: boolean
    data: AdminDashboardStats
  }> {
    return apiRequest(`/admin/dashboard/stats?periodo=${periodo}`)
  },

  /**
   * Obter lista de usuários com filtros e paginação
   *
   * @param params - Parâmetros de filtro e paginação
   */
  async getUsers(params?: {
    status?: number
    search?: string
    per_page?: number
    page?: number
    order_by?: string
    order_direction?: 'asc' | 'desc'
  }): Promise<{
    success: boolean
    data: AdminUser[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  }> {
    const queryParams = new URLSearchParams()

    if (params?.status !== undefined) {
      queryParams.append('status', params.status.toString())
    }
    if (params?.search) {
      queryParams.append('search', params.search)
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString())
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.order_by) {
      queryParams.append('order_by', params.order_by)
    }
    if (params?.order_direction) {
      queryParams.append('order_direction', params.order_direction)
    }

    const query = queryParams.toString()
    return apiRequest(`/admin/dashboard/users${query ? `?${query}` : ''}`)
  },

  /**
   * Obter transações recentes
   *
   * @param params - Parâmetros de filtro
   */
  async getTransactions(params?: {
    type?: 'deposit' | 'withdraw'
    status?: string
    limit?: number
  }): Promise<{
    success: boolean
    data: {
      transactions: AdminTransaction[]
    }
  }> {
    const queryParams = new URLSearchParams()

    if (params?.type) {
      queryParams.append('type', params.type)
    }
    if (params?.status) {
      queryParams.append('status', params.status)
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }

    const query = queryParams.toString()
    return apiRequest(
      `/admin/dashboard/transactions${query ? `?${query}` : ''}`,
    )
  },

  /**
   * Obter métricas de cache Redis
   */
  async getCacheMetrics(): Promise<{
    success: boolean
    data: CacheMetrics
  }> {
    return apiRequest('/admin/dashboard/cache-metrics')
  },
}

export const adminManualTransactionsAPI = {
  async createDeposit(
    payload: ManualDepositPayload,
  ): Promise<ManualDepositResponse> {
    return apiRequest('/admin/manual-transactions/deposits', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async createWithdrawal(
    payload: ManualWithdrawalPayload,
  ): Promise<ManualWithdrawalResponse> {
    return apiRequest('/admin/manual-transactions/withdrawal', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

/**
 * API para CRUD de Usuários (Admin)
 * Apenas usuários com permission === 3 podem acessar
 */
export const adminUsersAPI = {
  /**
   * Obter detalhes de um usuário específico
   *
   * @param userId - ID do usuário
   */
  async getUser(userId: number): Promise<{
    success: boolean
    data: {
      user: AdminUser
    }
  }> {
    return apiRequest(`/admin/users/${userId}`)
  },

  /**
   * Criar novo usuário
   *
   * @param data - Dados do usuário
   */
  async createUser(data: CreateUserData): Promise<{
    success: boolean
    data: {
      message: string
      user: AdminUser
    }
  }> {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualizar usuário existente
   *
   * @param userId - ID do usuário
   * @param data - Dados a atualizar
   */
  async updateUser(
    userId: number,
    data: UpdateUserData,
  ): Promise<{
    success: boolean
    data: {
      message: string
      user: AdminUser
    }
  }> {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deletar usuário
   *
   * @param userId - ID do usuário
   */
  async deleteUser(userId: number): Promise<{
    success: boolean
    data: {
      message: string
    }
  }> {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Aprovar usuário pendente
   *
   * @param userId - ID do usuário
   */
  async approveUser(userId: number): Promise<{
    success: boolean
    data: {
      message: string
      user: AdminUser
    }
  }> {
    return apiRequest(`/admin/users/${userId}/approve`, {
      method: 'POST',
    })
  },

  /**
   * Bloquear/desbloquear usuário
   *
   * @param userId - ID do usuário
   * @param block - true para bloquear, false para desbloquear
   */
  async toggleBlockUser(
    userId: number,
    block: boolean = true,
    approve: boolean = false,
  ): Promise<{
    success: boolean
    data: {
      message: string
      user: AdminUser
    }
  }> {
    return apiRequest(`/admin/users/${userId}/toggle-block`, {
      method: 'POST',
      body: JSON.stringify({ block, approve }),
    })
  },

  /**
   * Bloquear/desbloquear saque do usuário
   *
   * @param userId - ID do usuário
   * @param block - true para bloquear, false para desbloquear
   */
  async toggleWithdrawBlockUser(
    userId: number,
    block: boolean = true,
  ): Promise<{
    success: boolean
    data: {
      message: string
      user: AdminUser
    }
  }> {
    return apiRequest(`/admin/users/${userId}/toggle-withdraw-block`, {
      method: 'POST',
      body: JSON.stringify({ block }),
    })
  },

  /**
   * Ajustar saldo do usuário
   *
   * @param userId - ID do usuário
   * @param data - Dados do ajuste (amount, type, reason)
   */
  async adjustBalance(
    userId: number,
    data: AdjustBalanceData,
  ): Promise<{
    success: boolean
    data: {
      message: string
      user: AdminUser
    }
  }> {
    return apiRequest(`/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  /**
   * Listar gerentes (permission === 2)
   */
  async getManagers(): Promise<{
    success: boolean
    data: {
      managers: { id: number; name: string; username: string; email: string }[]
    }
  }> {
    return apiRequest('/admin/users-managers')
  },

  /**
   * Listar adquirentes ativos de PIX
   */
  async getPixAcquirers(): Promise<{
    success: boolean
    data: { acquirers: { name: string; referencia: string }[] }
  }> {
    return apiRequest('/admin/pix-acquirers')
  },

  /**
   * Salvar configurações de afiliados
   *
   * @param userId - ID do usuário
   * @param data - Dados de afiliado
   */
  async saveAffiliateSettings(
    userId: number,
    data: { is_affiliate: boolean; affiliate_percentage: number },
  ): Promise<{
    success: boolean
    data: {
      message: string
      user: {
        is_affiliate: boolean
        affiliate_percentage: number
        affiliate_code?: string
        affiliate_link?: string
      }
    }
  }> {
    return apiRequest(`/admin/users/${userId}/affiliate-settings`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Obter taxas padrão do sistema
   */
  async getDefaultFees(): Promise<{
    success: boolean
    data: {
      fees: {
        taxa_percentual_deposito: number
        taxa_fixa_deposito: number
        valor_minimo_deposito: number
        taxa_percentual_pix: number
        taxa_minima_pix: number
        taxa_fixa_pix: number
        valor_minimo_saque: number
        limite_mensal_pf: number
        taxa_saque_api: number
        taxa_saque_crypto: number
        sistema_flexivel_ativo: boolean
        valor_minimo_flexivel: number
        taxa_fixa_baixos: number
        taxa_percentual_altos: number
      }
    }
  }> {
    return apiRequest('/admin/default-fees')
  },

  /**
   * Gerenciamento de Níveis de Gamificação
   */

  /**
   * Listar todos os níveis
   */
  async getLevels(): Promise<{
    success: boolean
    data: {
      niveis: GamificationLevel[]
      niveis_ativo: boolean
    }
  }> {
    return apiRequest('/admin/levels')
  },

  /**
   * Obter um nível específico
   */
  async getLevel(id: number): Promise<{
    success: boolean
    data: GamificationLevel
  }> {
    return apiRequest(`/admin/levels/${id}`)
  },

  /**
   * Criar novo nível
   */
  async createLevel(data: CreateLevelData): Promise<{
    success: boolean
    message: string
    data: GamificationLevel
  }> {
    return apiRequest('/admin/levels', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualizar nível
   */
  async updateLevel(
    id: number,
    data: UpdateLevelData,
  ): Promise<{
    success: boolean
    message: string
    data: GamificationLevel
  }> {
    return apiRequest(`/admin/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deletar nível
   */
  async deleteLevel(id: number): Promise<{
    success: boolean
    message: string
  }> {
    return apiRequest(`/admin/levels/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Ativar/Desativar sistema de níveis
   */
  async toggleLevelsActive(niveis_ativo: boolean): Promise<{
    success: boolean
    message: string
    data: {
      niveis_ativo: boolean
    }
  }> {
    return apiRequest('/admin/levels/toggle-active', {
      method: 'POST',
      body: JSON.stringify({ niveis_ativo }),
    })
  },

  /**
   * Listar gerentes com paginação e busca
   */
  async listManagers(params?: {
    search?: string
    per_page?: number
    page?: number
  }): Promise<{
    success: boolean
    data: {
      managers: Manager[]
      pagination: {
        current_page: number
        per_page: number
        total: number
        last_page: number
      }
    }
  }> {
    const queryParams = new URLSearchParams()

    if (params?.search) {
      queryParams.append('search', params.search)
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString())
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }

    const query = queryParams.toString()
    return apiRequest(`/admin/users-managers${query ? `?${query}` : ''}`)
  },

  /**
   * Criar novo gerente
   */
  async createManager(data: CreateManagerData): Promise<{
    success: boolean
    data: {
      message: string
      user: Manager
    }
  }> {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        permission: 2, // Permission para gerente (MANAGER = 2)
      }),
    })
  },

  /**
   * Atualizar gerente
   */
  async updateManager(
    managerId: number,
    data: UpdateManagerData,
  ): Promise<{
    success: boolean
    data: {
      message: string
      user: Manager
    }
  }> {
    return apiRequest(`/admin/users/${managerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deletar gerente
   */
  async deleteManager(managerId: number): Promise<{
    success: boolean
    data: {
      message: string
    }
  }> {
    return apiRequest(`/admin/users/${managerId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Obter clientes vinculados a um gerente
   */
  async getManagerClients(
    managerId: number,
    params?: {
      search?: string
      per_page?: number
      page?: number
    },
  ): Promise<{
    success: boolean
    data: AdminUser[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  }> {
    const queryParams = new URLSearchParams({
      gerente_id: managerId.toString(),
      ...(params?.search && { search: params.search }),
      ...(params?.per_page && { per_page: params.per_page.toString() }),
      ...(params?.page && { page: params.page.toString() }),
    })
    return apiRequest(`/admin/dashboard/users?${queryParams.toString()}`)
  },

  /**
   * Listar adquirentes com filtros e paginação
   */
  async listAcquirers(params?: {
    search?: string
    status?: number | string | null
    per_page?: number
    page?: number
  }): Promise<{
    success: boolean
    data: {
      acquirers: Acquirer[]
      pagination: {
        current_page: number
        per_page: number
        total: number
        last_page: number
      }
    }
  }> {
    const queryParams = new URLSearchParams()

    if (params?.search) {
      queryParams.append('search', params.search)
    }
    if (params?.status !== undefined && params?.status !== null) {
      queryParams.append('status', params.status.toString())
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString())
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }

    const query = queryParams.toString()
    return apiRequest(`/admin/acquirers${query ? `?${query}` : ''}`)
  },

  /**
   * Alternar status do adquirente (ativar/desativar)
   */
  async toggleAcquirerStatus(acquirerId: number): Promise<{
    success: boolean
    data: {
      message: string
      acquirer: Acquirer
    }
  }> {
    return apiRequest(`/admin/acquirers/${acquirerId}/toggle-status`, {
      method: 'POST',
    })
  },
}

// Alias de compatibilidade para código legado
// (antigo gatewayApi agora aponta para adminUsersAPI, que concentra
// operações de usuários e níveis no painel admin)
export const gatewayApi = adminUsersAPI

// ==================== Interfaces de Gamificação ====================

export interface GamificationLevel {
  id: number
  nome: string
  cor: string
  icone: string | null
  minimo: number
  maximo: number
  created_at?: string
  updated_at?: string
}

export interface CreateLevelData {
  nome: string
  cor: string
  minimo: number
  maximo: number
  icone?: string
}

export interface UpdateLevelData {
  nome?: string
  cor?: string
  minimo?: number
  maximo?: number
  icone?: string
}

// ==================== Interfaces de Gerentes ====================

export interface Manager {
  id: number
  name: string
  email: string
  username: string
  cpf_cnpj?: string
  telefone?: string
  permission: number
  status: number
  created_at?: string
  total_clients?: number // Total de clientes vinculados
  gerente_percentage?: number
}

export interface CreateManagerData {
  name: string
  email: string
  password: string
  cpf_cnpj?: string
  telefone?: string
  gerente_percentage?: number
}

export interface UpdateManagerData {
  name?: string
  email?: string
  telefone?: string
  gerente_percentage?: number
  status?: number
}

// ==================== Interfaces de Adquirentes ====================

export interface Acquirer {
  id: number
  adquirente: string
  status: boolean | number
  url: string
  referencia: string
  is_default: boolean | number
  is_default_card_billet: boolean | number
  created_at?: string
  updated_at?: string
}
