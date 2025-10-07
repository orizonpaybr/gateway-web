// Configuração base para chamadas à API
// Este arquivo será usado quando a API backend estiver disponível

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.horsepay.com'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'

export const BASE_URL = `${API_URL}/${API_VERSION}`

// Função auxiliar para fazer requisições autenticadas
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // TODO: Pegar token do localStorage ou cookie
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const clientSecret =
    typeof window !== 'undefined' ? localStorage.getItem('clientSecret') : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(clientSecret && { 'X-Client-Secret': clientSecret }),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Erro na requisição')
  }

  return response.json()
}

// Exemplos de funções de API (a serem implementadas)

export const authAPI = {
  login: async (email: string, password: string) => {
    // return apiRequest('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, password }),
    // })
    throw new Error('API não implementada')
  },

  register: async (data: any) => {
    // return apiRequest('/auth/register', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // })
    throw new Error('API não implementada')
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
