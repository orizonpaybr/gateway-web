'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authAPI, accountAPI, RegisterData } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  username: string
  status?: number
  status_text?: string
  agency?: string
  balance?: number
  phone?: string
  cnpj?: string
  twofa_enabled?: boolean
  twofa_configured?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  show2FAModal: boolean
  tempToken: string | null
  login: (
    username: string,
    password: string,
  ) => Promise<{ requires2FA?: boolean; tempToken?: string }>
  verify2FA: (tempToken: string, code: string) => Promise<void>
  logout: () => Promise<void>
  register: (
    data: RegisterData,
    documents?: {
      documentoFrente?: File
      documentoVerso?: File
      selfieDocumento?: File
    },
  ) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      // Early return se não há token ou dados de usuário
      if (!token || !userStr) {
        setIsLoading(false)
        return
      }

      // Tentar validar o token com a API
      const result = await authAPI.verifyToken()

      // Usar dados validados ou fallback do localStorage
      const userData =
        result.success && result.data?.user
          ? result.data.user
          : JSON.parse(userStr)

      try {
        const profileResult = (await accountAPI.getProfile()) as any
        if (profileResult.success && profileResult.data) {
          setUser({
            id: profileResult.data.id,
            name: profileResult.data.name,
            email: profileResult.data.email,
            username: profileResult.data.username,
            status: profileResult.data.status,
            status_text: profileResult.data.status_text,
            agency: profileResult.data.agency,
            balance: profileResult.data.balance,
            phone: profileResult.data.phone,
            cnpj: profileResult.data.cnpj,
          })
        } else {
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            username: userData.username,
            agency: userData.agency,
          })
        }
      } catch (profileError) {
        console.error('Erro ao buscar perfil:', profileError)
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.username,
          agency: userData.agency,
        })
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      // Limpar dados em caso de erro
      authAPI.logout()
    } finally {
      setIsLoading(false)
    }
  }

  // Helper para extrair dados do usuário
  const extractUserData = (userData: any): User => ({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    username: userData.username,
    status: userData.status,
    status_text: userData.status_text,
  })

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password)

    // Para 2FA, definir usuário temporário e redirecionar para dashboard
    if (response.requires_2fa && response.temp_token) {
      setTempToken(response.temp_token)
      // Definir usuário temporário para permitir acesso ao dashboard
      if (response.data?.user) {
        setUser(extractUserData(response.data.user))
      }
      // Redirecionar para dashboard onde o modal de verificação aparecerá
      router.push('/dashboard')
      return {
        requires2FA: true,
        tempToken: response.temp_token,
      }
    }

    // Definir usuário se disponível
    response.data?.user && setUser(extractUserData(response.data.user))

    return {}
  }

  const verify2FA = async (tempToken: string, code: string) => {
    const response = await authAPI.verify2FA(tempToken, code)

    if (response.success && response.data?.user) {
      setUser(extractUserData(response.data.user))
      setShow2FAModal(false)
      setTempToken(null)

      toast.success('Login realizado com sucesso!', {
        description: 'Bem-vindo de volta!',
      })

      // Só redirecionar se não estivermos já no dashboard
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/dashboard')
      ) {
        router.push('/dashboard')
      }
    } else {
      toast.error('Código inválido', {
        description: 'Verifique o código e tente novamente',
      })
      throw new Error('Código 2FA inválido')
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()

      // Mostrar toast de sucesso
      toast.success('Saída realizada com sucesso!', {
        description: 'Até logo!',
        duration: 2000,
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)

      // Mostrar toast de erro
      toast.error('Erro no logout', {
        description: 'Houve um problema ao sair da conta',
        duration: 3000,
      })
    } finally {
      setUser(null)
      router.push('/login')
    }
  }

  const register = async (
    data: RegisterData,
    documents?: {
      documentoFrente?: File
      documentoVerso?: File
      selfieDocumento?: File
    },
  ) => {
    const response = await authAPI.register(data, documents)
    response.data?.user && setUser(extractUserData(response.data.user))
    return response
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        show2FAModal,
        tempToken,
        login,
        verify2FA,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
