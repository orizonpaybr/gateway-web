import { useEffect, useState } from 'react'

/**
 * Hook para garantir que o componente está rodando no cliente
 * Útil para evitar problemas de hidratação com localStorage
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
