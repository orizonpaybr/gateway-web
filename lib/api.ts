// Configuração base para chamadas à API
import type { RegisterData as RegisterDataType } from '@/types/user'
import { authErrorFromResponse } from '@/lib/auth-errors'
import {
  clearTempToken,
  TWO_FA_VERIFIED_KEY,
} from '@/lib/config/auth'
import { clearAuthSession, syncAuthSessionToken } from '@/lib/auth-session-client'

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
        void clearAuthData()
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

// Função para fazer requisições com api_token/api_secret
export async function apiRequestWithCredentials<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const apiToken =
    typeof window !== 'undefined' ? localStorage.getItem('api_token') : null
  const apiSecret =
    typeof window !== 'undefined' ? localStorage.getItem('api_secret') : null

  if (!apiToken || !apiSecret) {
    throw new Error('Credenciais API não encontradas. Faça login novamente.')
  }

  const headers = {
    'Content-Type': 'application/json',
    'api-token': apiToken,
    'api-secret': apiSecret,
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Tratamento centralizado de erros
  if (!response.ok) {
    // 401: limpar credenciais e emitir evento
    if (response.status === 401) {
      try {
        void clearAuthData()
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

/** Requisição autenticada com Bearer explícito (ex.: temp_token no setup 2FA). */
export async function apiRequestWithBearer<T>(
  endpoint: string,
  bearerToken: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${bearerToken}`,
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    const message = errorPayload?.message || 'Erro na requisição'
    throw new Error(message)
  }

  return response.json()
}
interface AuthResponse {
  success: boolean
  message: string
  data?: AuthData
  requires_2fa?: boolean
  requires_captcha?: boolean
  requires_2fa_setup?: boolean
  requires_totp_migration?: boolean
  twofa_method?: 'pin' | 'totp'
  temp_token?: string
  retry_after?: number
  locked_until?: string
  session_terminated?: boolean
  requires_login?: boolean
  errors?: Record<string, string[]>
}

// Interface para dados de registro - importada de types/user.ts
export type RegisterData = RegisterDataType

// Helper para armazenar dados de autenticação
const storeAuthData = async (data: AuthData): Promise<void> => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  await syncAuthSessionToken(data.token)
  clearTempToken()

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
const clearAuthData = async (): Promise<void> => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem(TWO_FA_VERIFIED_KEY)
  await clearAuthSession()
  clearTempToken()
}

// Funções de autenticação
export const authAPI = {
  /**
   * Login de usuário
   */
  login: async (
    username: string,
    password: string,
    turnstileToken?: string,
  ): Promise<AuthResponse> => {
    const body: Record<string, string> = { username, password }
    if (turnstileToken) {
      body.turnstile_token = turnstileToken
    }

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.status === 429) {
      throw authErrorFromResponse(
        data,
        'Muitas tentativas. Tente novamente mais tarde.',
      )
    }

    if (response.status === 403 && data.account_banned) {
      throw authErrorFromResponse(
        data,
        'Conta bloqueada permanentemente. Entre em contato com o suporte.',
      )
    }
    if (!data.success && data.requires_2fa) {
      return data
    }

    if (!data.success && data.requires_2fa_setup) {
      return data
    }

    // Guard clause para erro
    if (!data.success) {
      throw authErrorFromResponse(data, 'Erro ao fazer login')
    }

    // Só armazenar token se login foi bem-sucedido E não requer 2FA
    if (data.success && data.data && !data.requires_2fa) {
      await storeAuthData(data.data)
    }

    return data
  },

  /**
   * Verificação 2FA
   */
  verify2FA: async (
    tempToken: string,
    code: string,
    turnstileToken?: string,
  ): Promise<AuthResponse> => {
    const payload: Record<string, string> = { temp_token: tempToken, code }
    if (turnstileToken) {
      payload.turnstile_token = turnstileToken
    }

    const response = await fetch(`${BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (response.status === 429) {
      throw authErrorFromResponse(
        data,
        'Muitas tentativas. Faça login novamente.',
      )
    }

    if (response.status === 403 && data.account_banned) {
      throw authErrorFromResponse(
        data,
        'Conta bloqueada permanentemente. Entre em contato com o suporte.',
      )
    }

    if (!data.success) {
      throw authErrorFromResponse(data, 'Código 2FA inválido')
    }

    // Armazenar tokens se disponíveis
    if (data.data) {
      await storeAuthData(data.data)
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
      turnstileToken?: string
    },
  ): Promise<AuthResponse> => {
    const formData = new FormData()

    // Adicionar dados do formulário
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    if (documents?.turnstileToken) {
      formData.append('turnstile_token', documents.turnstileToken)
    }

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

    if (response.status === 429) {
      throw authErrorFromResponse(result, 'Muitas tentativas. Tente novamente.')
    }

    if (!result.success) {
      const errorMessage = result.errors
        ? Object.values(result.errors).flat().join(', ')
        : result.message || 'Erro ao criar conta'

      throw authErrorFromResponse(
        {
          message: errorMessage,
          requires_captcha: result.requires_captcha,
        },
        'Erro ao criar conta',
      )
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
      await clearAuthData()
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
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      await clearAuthData()
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
        twofa_code: twoFAPin,
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
    only_processed?: boolean
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
    if (filters?.only_processed === true) {
      params.append('only_processed', '1')
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
  debtor_name?: string
  debtor_document_number?: string
  email?: string
  phone?: string
  postback?: string
  split_email?: string
  split_percentage?: number
}

interface DepositPaymentResponse {
  status: 'success' | 'error'
  message: string
  transaction_id?: string
  idTransaction?: string
  amount?: number
  qr_code?: string
  qrcode?: string
  qr_code_image_url?: string
  expires_at?: string | null
  data?: {
    idTransaction?: string
    transaction_id?: string
    qr_code?: string
    qrcode?: string
    qr_code_image_url?: string
  }
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

  // Gerar QR Code para depósito (PIX)
  generateDeposit: async (
    data: PixDepositData,
  ): Promise<PixDepositResponse> => {
    const response = await apiRequestWithCredentials<DepositPaymentResponse>(
      '/wallet/deposit/payment',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )

    const nested = response.data
    const transactionId =
      response.transaction_id ??
      response.idTransaction ??
      nested?.idTransaction ??
      nested?.transaction_id ??
      null

    const qrCode =
      response.qr_code ??
      response.qrcode ??
      nested?.qr_code ??
      nested?.qrcode

    const qrImage =
      response.qr_code_image_url ?? nested?.qr_code_image_url

    return {
      success: response.status === 'success',
      data: {
        idTransaction: transactionId ?? undefined,
        transaction_id: transactionId ?? undefined,
        qrcode: qrCode,
        qr_code: qrCode,
        qr_code_image_url: qrImage,
        qrCodeImage: qrImage,
        amount: response.amount ?? data.amount,
        status: response.status,
      },
    }
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
      withdrawal_id?: number
      amount: number
      key_type: string
      key_value: string
      description: string
      status: string
      tipo_processamento?: string
      motivo_manual?: string
      observacao?: string
      estimated_time?: string
      created_at: string
      adquirente?: string
      taxa_cash_out?: number
      taxa_adquirente?: number
      taxa_aplicacao?: number
      valor_liquido?: number
      valor_total_descontar?: number
    }
  }> => {
    return apiRequest('/pix/withdraw-with-key', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // ===== INFRAÇÕES PIX (MED — Mecanismo Especial de Devolução) =====

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

    const qs = params.toString()
    return apiRequest(`/pix/infracoes${qs ? `?${qs}` : ''}`)
  },

  getInfracao: async (
    id: string,
  ): Promise<{
    success: boolean
    data: {
      id: number
      status: string
      desfecho_titulo?: string | null
      desfecho_mensagem?: string | null
      favoravel_lojista?: boolean | null
      data_criacao: string
      data_limite: string
      valor: number
      end_to_end: string
      tipo: string
      tipo_legivel?: string
      descricao: string
      detalhes: string
      detalhes_adicionais?: Array<{ label: string; value: string }>
      pode_apresentar_defesa?: boolean
      defesa_enviada_para?: string
      provider?: string
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

  /**
   * Envia uma defesa contra a infração (MED) para a adquirente.
   * Aceita texto e anexos opcionais (multipart/form-data).
   */
  defenderInfracao: async (
    id: string | number,
    defense: string,
    files: File[] = [],
  ): Promise<{ success: boolean; message?: string; data?: unknown }> => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const formData = new FormData()
    formData.append('defense', defense)
    files.forEach((file) => {
      formData.append('files[]', file)
    })

    const response = await fetch(`${BASE_URL}/pix/infracoes/${id}/defense`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Sem Content-Type: o browser define o boundary do multipart.
      },
      body: formData,
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Falha ao enviar defesa da infração.')
    }

    return result
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
      saldo_bruto: number
      saldo_em_mediacao: number
      qtd_em_mediacao: number
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
    method?: 'pin' | 'totp'
    requires_totp_migration?: boolean
  }> => {
    return apiRequest('/2fa/status')
  },

  generateQRCode: async (
    authToken?: string,
  ): Promise<{
    success: boolean
    data?: {
      qr_svg: string
    }
    message?: string
  }> => {
    if (authToken) {
      return apiRequestWithBearer('/2fa/generate-qr', authToken, {
        method: 'POST',
      })
    }
    return apiRequest('/2fa/generate-qr', { method: 'POST' })
  },

  enable: async (
    code: string,
    authToken?: string,
  ): Promise<{ success: boolean; message: string }> => {
    const options = {
      method: 'POST',
      body: JSON.stringify({ code }),
    }
    if (authToken) {
      return apiRequestWithBearer('/2fa/enable', authToken, options)
    }
    return apiRequest('/2fa/enable', options)
  },

  verifyCode: async (
    code: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/2fa/verify', {
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
  adquirente_ref?: string | null
  executor_ordem?: string | null
  pode_estornar?: boolean
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

  /**
   * Estorno de depósito PIX (Simpay) — admin
   */
  refundDeposit: async (
    depositoId: number,
    reason?: string,
  ): Promise<{
    success: boolean
    data: {
      deposit: Deposit
      message: string
    }
  }> => {
    return apiRequest(`/admin/financial/deposits/${depositoId}/refund`, {
      method: 'POST',
      body: JSON.stringify(reason ? { reason } : {}),
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
    return apiRequest('/integration/allowed-ips', {
      method: 'DELETE',
      body: JSON.stringify(pin ? { ip, pin } : { ip }),
    })
  },
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
  // Taxas fixas (em centavos)
  taxas_personalizadas_ativas?: boolean
  taxa_fixa_deposito?: number
  taxa_fixa_pix?: number
  // Modo percentual (exclusivo da taxa fixa) + percentuais por usuário (em %)
  taxa_modo_percentual?: boolean
  taxa_percentual_deposito?: number
  taxa_percentual_pix?: number
  limite_mensal_pf?: number
  observacoes_taxas?: string | null
  // Afiliados
  is_affiliate?: boolean
  affiliate_percentage?: number
  affiliate_code?: string
  affiliate_link?: string
  // Comissão de afiliado personalizada
  comissao_afiliado_personalizada?: boolean
  taxa_comissao_afiliado?: number
  // Config de saque por usuário
  saque_config_personalizada?: boolean
  saque_automatico_usuario?: boolean
  limite_saque_automatico_usuario?: number | null
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
}

export interface CreateUserData {
  username: string
  name: string
  email: string
  password: string
  telefone?: string
  cpf_cnpj?: string
  cpf?: string
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
  // Taxas fixas (em reais). null = usar padrão da aplicação
  taxas_personalizadas_ativas?: boolean
  taxa_fixa_deposito?: number | null
  taxa_fixa_pix?: number | null
  // Modo percentual (exclusivo da taxa fixa) + percentuais por usuário (em %)
  taxa_modo_percentual?: boolean
  taxa_percentual_deposito?: number | null
  taxa_percentual_pix?: number | null
  limite_mensal_pf?: number
  observacoes_taxas?: string | null
  // Comissão de afiliado personalizada
  comissao_afiliado_personalizada?: boolean
  taxa_comissao_afiliado?: number | null
  // Config de saque por usuário
  saque_config_personalizada?: boolean
  saque_automatico_usuario?: boolean
  limite_saque_automatico_usuario?: number | null
  // Campos de adquirente
  preferred_adquirente?: string
  adquirente_override?: boolean
  preferred_adquirente_card_billet?: string
  adquirente_card_billet_override?: boolean
}

export interface AdjustBalanceData {
  amount: number
  type: 'add' | 'subtract'
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
   * @param periodo - 'hoje' | 'ontem' | '7dias' | '30dias' | 'tudo' (todo o período) ou 'YYYY-MM-DD:YYYY-MM-DD' (custom)
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
   * @param data - Dados do ajuste (amount, type)
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
    data: {
      acquirers: { name: string; referencia: string; is_default: number }[]
    }
  }> {
    return apiRequest('/admin/pix-acquirers')
  },

  /**
   * Obter taxas padrão do sistema (apenas taxas fixas em centavos)
   */
  async getDefaultFees(): Promise<{
    success: boolean
    data: {
      fees: {
        taxa_fixa_deposito: number
        taxa_fixa_pix: number
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
   * Definir adquirente como a Global (is_default PIX) do sistema
   */
  async setDefaultAcquirer(acquirerId: number): Promise<{
    success: boolean
    data: {
      message: string
      acquirer: Acquirer
    }
  }> {
    return apiRequest(`/admin/acquirers/${acquirerId}/set-default`, {
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
}

export interface CreateManagerData {
  name: string
  email: string
  password: string
  cpf_cnpj?: string
  telefone?: string
}

export interface UpdateManagerData {
  name?: string
  email?: string
  telefone?: string
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

// ============================================
// API de Relatório de Conciliação (Admin)
// ============================================

export interface ReconciliationRow {
  data: string
  user_id: string
  nome: string
  saldo_inicial: number
  depositos_qtd: number
  depositos_bruto: number
  depositos_liquido: number
  saques_qtd: number
  saques_debitado: number
  saques_pago: number
  taxa_depositos: number
  taxa_saques: number
  lucro: number
  saldo_final: number
}

export interface ReconciliationReport {
  periodo: {
    inicio: string
    fim: string
  }
  resumo: {
    lucro_depositos: number
    lucro_saques: number
    lucro_total: number
    depositos: {
      quantidade: number
      valor_bruto: number
      valor_liquido: number
    }
    saques: {
      quantidade: number
      valor_debitado: number
      valor_pago: number
    }
    usuarios_ativos: number
  }
  linhas: ReconciliationRow[]
  observacao: string
}

export const adminReconciliationAPI = {
  /**
   * Obter relatório de conciliação diária por usuário
   *
   * @param periodo - 'hoje' | 'ontem' | '7dias' | '30dias' ou 'YYYY-MM-DD:YYYY-MM-DD'
   * @param userId - Filtrar por usuário específico (opcional)
   */
  async getReport(
    periodo: string = 'hoje',
    userId?: string,
  ): Promise<{ success: boolean; data: ReconciliationReport }> {
    const params = new URLSearchParams({ periodo })
    if (userId) {
      params.append('user_id', userId)
    }
    return apiRequest(`/admin/reports/reconciliation?${params.toString()}`)
  },

  /**
   * Baixar o relatório em CSV (compatível com Excel) e disparar o download.
   */
  async downloadCsv(periodo: string = 'hoje', userId?: string): Promise<void> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const params = new URLSearchParams({ periodo })
    if (userId) {
      params.append('user_id', userId)
    }

    const response = await fetch(
      `${BASE_URL}/admin/reports/reconciliation/export?${params.toString()}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}))
      throw new Error(errorPayload?.message || 'Erro ao exportar relatório')
    }

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition') || ''
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i)
    const today = new Date()
    const todayStamp = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('_')
    const filename =
      match?.[1]?.replace(/^\s*UTF-8''/i, '').trim() ||
      `coratri_${todayStamp}.csv`

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
