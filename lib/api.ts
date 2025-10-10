// Configuração base para chamadas à API
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://playgameoficial.com.br/api'

export const BASE_URL = API_URL

// Interface para dados de autenticação armazenados
export interface AuthData {
  token: string
  api_token: string
  api_secret: string
  user: {
    id: string
    username: string
    email: string
    name: string
  }
}

// Helpers para verificação de endpoints
const ENDPOINTS_REQUIRING_TOKEN_SECRET = [
  '/balance',
  '/transactions',
  '/user/profile',
  '/pix/',
  '/statement',
] as const

const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'] as const

const requiresTokenSecret = (endpoint: string): boolean =>
  ENDPOINTS_REQUIRING_TOKEN_SECRET.some((path) => endpoint.includes(path))

const isMethodWithBody = (method?: string): boolean =>
  METHODS_WITH_BODY.includes(method as any)

// Função para adicionar tokens ao body
const addTokensToBody = (
  body: RequestInit['body'],
  apiToken: string,
  apiSecret: string,
): string => {
  const tokens = { token: apiToken, secret: apiSecret }

  if (!body) return JSON.stringify(tokens)

  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body
  return JSON.stringify({ ...parsedBody, ...tokens })
}

// Função para adicionar tokens como query params
const addTokensToEndpoint = (
  endpoint: string,
  apiToken: string,
  apiSecret: string,
): string => {
  const separator = endpoint.includes('?') ? '&' : '?'
  return `${endpoint}${separator}token=${apiToken}&secret=${apiSecret}`
}

// Função auxiliar para fazer requisições autenticadas
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const apiToken =
    typeof window !== 'undefined' ? localStorage.getItem('api_token') : null
  const apiSecret =
    typeof window !== 'undefined' ? localStorage.getItem('api_secret') : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const needsTokenSecret = requiresTokenSecret(endpoint)
  const hasCredentials = apiToken && apiSecret
  const method = options.method as string

  let body = options.body
  let finalEndpoint = endpoint

  // Processar tokens apenas se necessário e disponível
  if (needsTokenSecret && hasCredentials) {
    // GET: adicionar como query params
    if (method === 'GET') {
      finalEndpoint = addTokensToEndpoint(endpoint, apiToken, apiSecret)
    }
    // POST/PUT/PATCH: adicionar ao body
    else if (isMethodWithBody(method)) {
      body = addTokensToBody(body, apiToken, apiSecret)
    }
  }

  const response = await fetch(`${BASE_URL}${finalEndpoint}`, {
    ...options,
    headers,
    body,
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
  localStorage.setItem('api_token', data.api_token)
  localStorage.setItem('api_secret', data.api_secret)
  localStorage.setItem('user', JSON.stringify(data.user))
}

// Helper para limpar dados de autenticação
const clearAuthData = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('api_token')
  localStorage.removeItem('api_secret')
  localStorage.removeItem('user')
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

    // Early return para 2FA
    if (!data.success && data.requires_2fa) {
      return data
    }

    // Guard clause para erro
    if (!data.success) {
      throw new Error(data.message || 'Erro ao fazer login')
    }

    // Armazenar tokens se disponíveis
    data.data && storeAuthData(data.data)

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
    data.data && storeAuthData(data.data)

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
    // return apiRequest('/account/profile')
    throw new Error('API não implementada')
  },

  updateProfile: async (data: any) => {
    // return apiRequest('/account/profile', {
    //   method: 'PUT',
    //   body: JSON.stringify(data),
    // })
    throw new Error('API não implementada')
  },
}
