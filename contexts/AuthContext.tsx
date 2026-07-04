'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authAPI, accountAPI } from '@/lib/api'
import { clearAuthSession, syncAuthSession2FAPending } from '@/lib/auth-session-client'
import {
  clearTempToken,
  clear2FASetupPending,
  hasPending2FA,
  mark2FASetupPending,
  persistTempToken,
  readTempToken,
  TWO_FA_SETUP_CHECKED_KEY,
  TWO_FA_VERIFIED_KEY,
  has2FASetupPending,
} from '@/lib/config/auth'
import { queryClient } from '@/lib/queryClient'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { User as UserProfile, RegisterData } from '@/types/user'

type User = UserProfile
interface ProfileResponse {
  success: boolean
  data?: {
    id: string
    username: string
    email: string
    name: string
    gender?: 'male' | 'female' | null
    status?: number | string
    status_text?: string
    agency?: string
    balance?: number
    phone?: string
    cnpj?: string
    permission?: number
    [key: string]: unknown
  }
  message?: string
}
interface UserDataFromAPI {
  id: string
  username: string
  email: string
  name: string
  gender?: 'male' | 'female' | null
  status?: number
  status_text?: string
  agency?: string
  balance?: number
  phone?: string
  cnpj?: string
  permission?: number
  [key: string]: unknown
}
interface StoredUserData {
  id: string
  name: string
  email: string
  username: string
  gender?: 'male' | 'female' | null
  agency?: string
  permission?: number
  [key: string]: unknown
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  pending2FA: boolean
  pending2FASetup: boolean
  isLoading: boolean
  authReady: boolean
  show2FAModal: boolean
  tempToken: string | null
  login: (
    username: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<{ requires2FA?: boolean; requires2FASetup?: boolean; tempToken?: string }>
  verify2FA: (tempToken: string, code: string, turnstileToken?: string) => Promise<void>
  logout: () => Promise<void>
  register: (
    data: RegisterData,
    documents?: {
      documentoFrente?: File
      documentoVerso?: File
      selfieDocumento?: File
      turnstileToken?: string
    },
  ) => Promise<{
    success: boolean
    message: string
    data?: {
      user?: UserDataFromAPI
      token?: string
      api_token?: string
      api_secret?: string
      pending_approval?: boolean
    }
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('user', null)
  const [_token, setToken] = useLocalStorage<string | null>('token', null)
  const [isLoading, setIsLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? readTempToken() : null,
  )
  const router = useRouter()

  const pending2FA = useMemo(
    () => !!tempToken || hasPending2FA(),
    [tempToken],
  )

  const pending2FASetup = useMemo(
    () => pending2FA && has2FASetupPending(),
    [pending2FA],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const isPublicRoute =
          typeof window !== 'undefined' &&
          (window.location.pathname === '/' ||
            window.location.pathname.startsWith('/login') ||
            window.location.pathname.startsWith('/cadastro') ||
            window.location.pathname.startsWith('/termos'))

        const storedTempToken = readTempToken()
        if (storedTempToken) {
          setTempToken(storedTempToken)
        } else if (
          !localStorage.getItem('token') &&
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/dashboard')
        ) {
          await clearAuthSession()
          router.replace('/login')
          setIsLoading(false)
          return
        }

        if (
          typeof window !== 'undefined' &&
          localStorage.getItem('token') &&
          !isPublicRoute
        ) {
          await checkAuth()
        } else {
          setIsLoading(false)
          setAuthReady(false)
        }
      })()
    }, 100)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const storedUser =
        typeof window !== 'undefined' ? localStorage.getItem('user') : null

      if (!storedToken || !storedUser) {
        setIsLoading(false)
        return
      }

      const result = await authAPI.verifyToken()

      if (result.success) {
        try {
          const profileResult =
            (await accountAPI.getProfile()) as ProfileResponse
          if (profileResult.success && profileResult.data) {
            setUser({
              id: profileResult.data.id,
              name: profileResult.data.name,
              email: profileResult.data.email,
              username: profileResult.data.username,
              gender: profileResult.data.gender,
              status:
                typeof profileResult.data.status === 'number'
                  ? profileResult.data.status
                  : undefined,
              status_text: profileResult.data.status_text,
              agency: profileResult.data.agency,
              balance: profileResult.data.balance,
              phone: profileResult.data.phone,
              cnpj: profileResult.data.cnpj,
              permission: profileResult.data.permission,
            })
          } else {
            const userData = JSON.parse(storedUser) as StoredUserData
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              username: userData.username,
              gender: userData.gender,
              agency: userData.agency,
              permission: userData.permission,
            })
          }
        } catch (profileError) {
          console.error('Erro ao buscar perfil:', profileError)
          const userData = JSON.parse(storedUser) as StoredUserData
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            username: userData.username,
            gender: userData.gender,
            agency: userData.agency,
            permission: userData.permission,
          })
        }
      }
    } catch {
      // Mantém dados locais; logout manual se necessário
    } finally {
      setIsLoading(false)
      setAuthReady(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const extractUserData = (userData: UserDataFromAPI): User => ({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    username: userData.username,
    gender: userData.gender,
    status: userData.status,
    status_text: userData.status_text,
    permission: userData.permission,
  })

  const login = async (
    username: string,
    password: string,
    turnstileToken?: string,
  ) => {
    const response = await authAPI.login(username, password, turnstileToken)

    if (response.requires_2fa_setup && response.temp_token) {
      setTempToken(response.temp_token)
      persistTempToken(response.temp_token)
      mark2FASetupPending()
      await syncAuthSession2FAPending()

      if (response.data?.user) {
        setUser(extractUserData(response.data.user))
      }

      router.push('/dashboard')
      setAuthReady(false)
      return {
        requires2FASetup: true,
        tempToken: response.temp_token,
      }
    }

    if (response.requires_2fa && response.temp_token) {
      clear2FASetupPending()
      setTempToken(response.temp_token)
      persistTempToken(response.temp_token)
      await syncAuthSession2FAPending()

      if (response.data?.user) {
        setUser(extractUserData(response.data.user))
      }

      router.push('/dashboard')
      setAuthReady(false)
      return {
        requires2FA: true,
        tempToken: response.temp_token,
      }
    }

    if (response.data?.user) {
      setUser(extractUserData(response.data.user))
      setAuthReady(true)
    }

    if (response.data?.token) {
      setToken(response.data.token)
    }

    return {}
  }

  const verify2FA = async (
    tempTokenValue: string,
    code: string,
    turnstileToken?: string,
  ) => {
    const response = await authAPI.verify2FA(tempTokenValue, code, turnstileToken)

    if (!response.data?.user) {
      throw new Error('Resposta inválida ao verificar 2FA')
    }

    setUser(extractUserData(response.data.user))
    setShow2FAModal(false)
    setTempToken(null)
    clearTempToken()
    clear2FASetupPending()
    setAuthReady(true)

    if (response.data?.token) {
      setToken(response.data.token)
    }

    toast.success('Login realizado com sucesso!', {
      description: 'Bem-vindo de volta!',
    })

    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/dashboard')
    ) {
      router.push('/dashboard')
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()

      toast.success('Saída realizada com sucesso!', {
        description: 'Até logo!',
        duration: 2000,
      })
    } catch {
      toast.error('Erro no logout', {
        description: 'Houve um problema ao sair da conta',
        duration: 3000,
      })
    } finally {
      queryClient.clear()
      setUser(null)
      setToken(null)
      setTempToken(null)
      clearTempToken()
      clear2FASetupPending()
      sessionStorage.removeItem(TWO_FA_VERIFIED_KEY)
      sessionStorage.removeItem(TWO_FA_SETUP_CHECKED_KEY)
      router.push('/login')
    }
  }

  const register = async (
    data: RegisterData,
    documents?: {
      documentoFrente?: File
      documentoVerso?: File
      selfieDocumento?: File
      turnstileToken?: string
    },
  ) => {
    const response = await authAPI.register(data, documents)
    setTempToken(null)
    return response
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: authReady && !!user && !pending2FA,
        pending2FA,
        pending2FASetup,
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
