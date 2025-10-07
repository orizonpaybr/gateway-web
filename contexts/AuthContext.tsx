'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface User {
  id: string
  fullName: string
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // TODO: Validar token com a API
        // const userData = await authAPI.validateToken(token)
        // setUser(userData)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implementar login real com a API
      // const response = await authAPI.login(email, password)
      // localStorage.setItem('token', response.token)
      // setUser(response.user)

      // Mock temporário
      const mockUser: User = {
        id: '1',
        fullName: 'Usuário Teste',
        email,
        username: '@usuario',
      }
      setUser(mockUser)
      localStorage.setItem('token', 'mock-token')
    } catch (error) {
      throw new Error('Falha no login')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('clientSecret')
    // Redirecionar para login
    window.location.href = '/login'
  }

  const register = async (data: any) => {
    try {
      // TODO: Implementar registro real com a API
      // const response = await authAPI.register(data)
      // localStorage.setItem('token', response.token)
      // setUser(response.user)

      console.log('Dados de registro:', data)
      throw new Error('Registro ainda não implementado')
    } catch (error) {
      throw new Error('Falha no registro')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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
