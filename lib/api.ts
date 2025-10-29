// Configuração base para chamadas à API
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const BASE_URL = API_URL

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

  // Guard clause para resposta não OK
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Erro na requisição')
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

// Interface para dados de registro
export interface RegisterData {
  username: string
  name: string
  email: string
  telefone: string
  cpf_cnpj: string
  password: string
  ref?: string
}

// Helper para armazenar dados de autenticação
const storeAuthData = (data: AuthData): void => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

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
    result.data && storeAuthData(result.data)

    return result
  },

  /**
   * Verificar token válido
   */
  verifyToken: async (): Promise<{
    success: boolean
    data?: { user: any }
  }> => {
    const token = localStorage.getItem('token')

    // Early return se não há token
    if (!token) return { success: false }

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
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.tipo) params.append('tipo', filters.tipo)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.busca) params.append('busca', filters.busca)
    if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio)
    if (filters?.data_fim) params.append('data_fim', filters.data_fim)

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

export const pixAPI = {
  transfer: async (data: any) => {
    // return apiRequest('/pix/transfer', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // })
    throw new Error('API não implementada')
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
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.busca) params.append('busca', filters.busca)
    if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio)
    if (filters?.data_fim) params.append('data_fim', filters.data_fim)

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
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.busca) params.append('busca', filters.busca)
    if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio)
    if (filters?.data_fim) params.append('data_fim', filters.data_fim)

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
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.periodo) params.append('periodo', filters.periodo)
    if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio)
    if (filters?.data_fim) params.append('data_fim', filters.data_fim)
    if (filters?.busca) params.append('busca', filters.busca)
    if (filters?.tipo) params.append('tipo', filters.tipo)

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
    if (filters?.periodo) params.append('periodo', filters.periodo)
    if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio)
    if (filters?.data_fim) params.append('data_fim', filters.data_fim)

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

  updateProfile: async (data: any) => {
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
