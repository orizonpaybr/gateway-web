import { useState, useEffect } from 'react'

/**
 * Hook para gerenciar dados no localStorage com suporte a eventos
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // State para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Aguardar um pouco para garantir que o localStorage está disponível
      const item = window.localStorage.getItem(key)

      // Se item é null ou string vazia, retorna valor inicial
      if (!item || item === 'null' || item === 'undefined') {
        if (key === 'token' || key === 'user') {
        }
        return initialValue
      }

      // Para strings simples (incluindo JWT tokens), retorna diretamente
      if (
        typeof initialValue === 'string' &&
        !item.startsWith('{') &&
        !item.startsWith('[')
      ) {
        return item as T
      }

      // Para objetos, tenta fazer parse JSON
      try {
        const parsed = JSON.parse(item)
        return parsed
      } catch (parseError) {
        // Se falhar no parse, retorna como string
        return item as T
      }
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error)
      // Não remover o item automaticamente para evitar perda de dados
      return initialValue
    }
  })

  // Retorna uma versão "wrapped" da função useState's setter
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que o valor seja uma função (como o useState)
      const valueToStore =
        value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        // Para strings, armazena diretamente; para objetos, usa JSON.stringify
        if (typeof valueToStore === 'string') {
          window.localStorage.setItem(key, valueToStore)
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }

        // Disparar evento customizado para notificar mudanças
        window.dispatchEvent(
          new CustomEvent('localStorage-changed', {
            detail: { key, value: valueToStore },
          }),
        )
      }
    } catch (error) {
      console.error(`❌ useLocalStorage - Erro ao armazenar "${key}":`, error)
    }
  }

  // Escutar mudanças no localStorage de outras abas/janelas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        // Se o valor foi removido (null), não atualizar o estado
        if (
          e.newValue === null ||
          e.newValue === 'null' ||
          e.newValue === 'undefined'
        )
          return
        try {
          const newValue =
            typeof initialValue === 'string' &&
            !e.newValue.startsWith('{') &&
            !e.newValue.startsWith('[')
              ? (e.newValue as T)
              : JSON.parse(e.newValue)

          setStoredValue(newValue)
        } catch (error) {
          console.error(
            `Error parsing localStorage change for key "${key}":`,
            error,
          )
        }
      }
    }

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener(
        'localStorage-changed',
        handleCustomStorageChange as EventListener,
      )
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener(
          'localStorage-changed',
          handleCustomStorageChange as EventListener,
        )
      }
    }
  }, [key, initialValue])

  return [storedValue, setValue]
}
