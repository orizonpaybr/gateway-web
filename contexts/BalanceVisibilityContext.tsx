'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface BalanceVisibilityContextType {
  isBalanceHidden: boolean
  toggleBalanceVisibility: () => void
  hideBalance: () => void
  showBalance: () => void
}

const BalanceVisibilityContext = createContext<
  BalanceVisibilityContextType | undefined
>(undefined)

export function BalanceVisibilityProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev)
  }

  const hideBalance = () => {
    setIsBalanceHidden(true)
  }

  const showBalance = () => {
    setIsBalanceHidden(false)
  }

  return (
    <BalanceVisibilityContext.Provider
      value={{
        isBalanceHidden,
        toggleBalanceVisibility,
        hideBalance,
        showBalance,
      }}
    >
      {children}
    </BalanceVisibilityContext.Provider>
  )
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext)
  if (context === undefined) {
    throw new Error(
      'useBalanceVisibility deve ser usado dentro de um BalanceVisibilityProvider',
    )
  }
  return context
}
