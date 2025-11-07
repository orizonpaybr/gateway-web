'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authAPI, accountAPI, RegisterData } from '@/lib/api'
import { useLocalStorage } from '@/hooks/useLocalStorage'

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
  permission?: number // 3 = admin, 2 = gerente, 1 = usuario
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  authReady: boolean
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
  const [user, setUser] = useLocalStorage<User | null>('user', null)
  const [token, setToken] = useLocalStorage<string | null>('token', null)
  const [isLoading, setIsLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    // Aguardar um pouco para garantir que o localStorage está disponível
    const timer = setTimeout(() => {
      // Só executar checkAuth se houver token no localStorage E não estivermos na página de login ou cadastro
      if (
        typeof window !== 'undefined' &&
        localStorage.getItem('token') &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/cadastro')
      ) {
        checkAuth()
      } else {
        setIsLoading(false)
        // Sem token: ainda não autenticado (aguardando 2FA ou login)
        setAuthReady(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, []) // ✅ Executar apenas uma vez na montagem

  // Removido useEffect que causava loop infinito
  // O checkAuth já é executado no useEffect inicial quando há token

  const checkAuth = async () => {
    try {
      // Aguardar um pouco mais para garantir que o localStorage está disponível
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Verificar diretamente no localStorage se os dados estão disponíveis
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const storedUser =
        typeof window !== 'undefined' ? localStorage.getItem('user') : null

      // Early return se não há token ou dados de usuário no localStorage
      if (!storedToken || !storedUser) {
        setIsLoading(false)
        return
      }

      // Tentar validar o token com a API
      const result = await authAPI.verifyToken()

      if (result.success) {
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
              permission: profileResult.data.permission,
            })
          } else {
            // Usar dados do localStorage se API falhar
            const userData = JSON.parse(storedUser)
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              username: userData.username,
              agency: userData.agency,
              permission: userData.permission,
            })
          }
        } catch (profileError) {
          console.error('Erro ao buscar perfil:', profileError)
          // Usar dados do localStorage como fallback
          const userData = JSON.parse(storedUser)
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            username: userData.username,
            agency: userData.agency,
            permission: userData.permission,
          })
        }
      } else {
        console.log(
          '❌ checkAuth - Token inválido, mas mantendo dados do localStorage',
        )
        // Manter dados do localStorage mesmo se token for inválido
        // O usuário pode fazer logout manual se necessário
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      // Não limpar dados automaticamente - deixar o usuário fazer logout manual
    } finally {
      setIsLoading(false)
      setAuthReady(true)
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
    permission: userData.permission,
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
      // Ainda não pronto para carregar dados protegidos
      setAuthReady(false)
      return {
        requires2FA: true,
        tempToken: response.temp_token,
      }
    }

    // Definir usuário se disponível
    if (response.data?.user) {
      setUser(extractUserData(response.data.user))
      // Login sem 2FA: pronto para carregar dados
      setAuthReady(true)
    }

    return {}
  }

  const verify2FA = async (tempToken: string, code: string) => {
    const response = await authAPI.verify2FA(tempToken, code)

    if (response.success && response.data?.user) {
      setUser(extractUserData(response.data.user))
      setShow2FAModal(false)
      setTempToken(null)
      // Agora com token definitivo, liberar carregamentos
      setAuthReady(true)

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

      toast.success('Saída realizada com sucesso!', {
        description: 'Até logo!',
        duration: 2000,
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)

      toast.error('Erro no logout', {
        description: 'Houve um problema ao sair da conta',
        duration: 3000,
      })
    } finally {
      setUser(null)
      setToken(null)
      sessionStorage.removeItem('2fa_verified')
      sessionStorage.removeItem('2fa_setup_checked')
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
    if (response.data?.user) {
      setUser(extractUserData(response.data.user))
      // Usuários pendentes podem acessar o dashboard normalmente
      // Eles podem fazer requisições, configurar 2FA, etc.
      setAuthReady(true)
    }
    // Limpar tempToken ao registrar novo usuário
    // Evita que TwoFactorVerify mostre modal quando não deve
    setTempToken(null)
    return response
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authReady,
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
