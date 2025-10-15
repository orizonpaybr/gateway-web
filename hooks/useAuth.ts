import { useEffect, useState } from 'react'

/**
 * Hook para gerenciar autenticação e token
 */
export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const getToken = () => {
      const rawToken = localStorage.getItem('token')
      const validToken =
        rawToken === 'null' || rawToken === null || rawToken === ''
          ? null
          : rawToken
      setToken(validToken)
    }

    const handleAuthTokenStored = () => {
      getToken()
    }

    // Buscar token inicial
    getToken()

    // Escutar mudanças no token
    window.addEventListener('auth-token-stored', handleAuthTokenStored)

    return () => {
      window.removeEventListener('auth-token-stored', handleAuthTokenStored)
    }
  }, [isClient])

  return { token, isClient }
}
