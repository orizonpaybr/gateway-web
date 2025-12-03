'use client'

import { useRef } from 'react'

interface MemoizedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>
}

export function useGlobalMemo<T extends (...args: unknown[]) => unknown>(
  fn: T,
  deps: React.DependencyList,
): MemoizedFunction<T> {
  const depsRef = useRef<React.DependencyList>([])
  const fnRef = useRef<T>(fn)
  const memoizedFnRef = useRef<T>(fn)

  if (!areEqual(depsRef.current, deps) || fnRef.current !== fn) {
    depsRef.current = deps
    fnRef.current = fn
    memoizedFnRef.current = fn
  }

  const cacheRef = useRef(new Map<string, ReturnType<T>>())
  const callbackRef = useRef<MemoizedFunction<T>>()

  if (!callbackRef.current) {
    callbackRef.current = ((...args: Parameters<T>) => {
      const key = JSON.stringify(args)

      const cached = cacheRef.current.get(key)
      if (cached !== undefined) {
        return cached
      }

      const result = fnRef.current(...args) as ReturnType<T>
      cacheRef.current.set(key, result)

      // Limitar cache para evitar vazamentos de memória
      if (cacheRef.current.size > 100) {
        const firstKey = cacheRef.current.keys().next().value
        if (firstKey !== undefined) {
          cacheRef.current.delete(firstKey)
        }
      }

      return result
    }) as MemoizedFunction<T>
  }

  return callbackRef.current
}

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
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  _deps: React.DependencyList,
): T {
  const callbackRef = useRef<T>(callback)
  const stableCallbackRef = useRef<T>()

  if (callbackRef.current !== callback || !stableCallbackRef.current) {
    callbackRef.current = callback
    stableCallbackRef.current = ((...args: Parameters<T>) => {
      return callbackRef.current(...args)
    }) as T
  }

  return stableCallbackRef.current
}
