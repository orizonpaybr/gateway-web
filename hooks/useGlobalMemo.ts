// hooks/useGlobalMemo.ts
'use client'

import { useMemo, useRef, useCallback } from 'react'

interface MemoizedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>
}

export function useGlobalMemo<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList,
): MemoizedFunction<T> {
  const memoizedFn = useMemo(() => fn, deps)
  const cacheRef = useRef(new Map<string, ReturnType<T>>())

  return useCallback(
    (...args: Parameters<T>) => {
      const key = JSON.stringify(args)

      if (cacheRef.current.has(key)) {
        return cacheRef.current.get(key)!
      }

      const result = memoizedFn(...args)
      cacheRef.current.set(key, result)

      // Limitar cache para evitar vazamentos de memória
      if (cacheRef.current.size > 100) {
        const firstKey = cacheRef.current.keys().next().value
        if (firstKey !== undefined) {
          cacheRef.current.delete(firstKey)
        }
      }

      return result
    },
    [memoizedFn],
  )
}

// Hook para memoizar objetos complexos
export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()

  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }

  return ref.current.value
}

function areEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}

// Hook para memoizar callbacks com dependências estáveis
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T {
  const stableDeps = useStableMemo(() => deps, deps)
  return useCallback(callback, stableDeps)
}
