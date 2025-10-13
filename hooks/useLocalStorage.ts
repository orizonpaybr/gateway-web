import { useState, useEffect } from 'react'

/**
 * Hook para gerenciar dados no localStorage
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
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      if (
        typeof initialValue === 'string' &&
        !item.startsWith('{') &&
        !item.startsWith('[')
      ) {
        return item as T
      }

      return JSON.parse(item)
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error)
      window.localStorage.removeItem(key)
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
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
