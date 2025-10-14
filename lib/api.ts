// Configuração base para chamadas à API
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://playgameoficial.com.br/api'

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
    const response = await fetch(`${BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temp_token: tempToken, code }),
    })

    const data = await response.json()

    // Guard clause para erro
    if (!data.success) {
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
}

export const transactionsAPI = {
  list: async (filters?: any) => {
    // const params = new URLSearchParams(filters)
    // return apiRequest(`/transactions?${params}`)
    throw new Error('API não implementada')
  },

  getById: async (id: string) => {
    // return apiRequest(`/transactions/${id}`)
    throw new Error('API não implementada')
  },
}

export const pixAPI = {
  transfer: async (data: any) => {
    // return apiRequest('/pix/transfer', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // })
    throw new Error('API não implementada')
  },
}

export const qrCodeAPI = {
  generate: async (data: any) => {
    // return apiRequest('/qrcode/generate', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // })
    throw new Error('API não implementada')
  },

  list: async (filters?: any) => {
    // return apiRequest('/qrcode')
    throw new Error('API não implementada')
  },
}

export const accountAPI = {
  getBalance: async () => {
    // return apiRequest('/account/balance')
    throw new Error('API não implementada')
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
