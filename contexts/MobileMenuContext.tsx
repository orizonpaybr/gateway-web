'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface MobileMenuContextType {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  openMobileMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(
  undefined,
)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true)
  }

  return (
    <MobileMenuContext.Provider
      value={{
        isMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        openMobileMenu,
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (context === undefined) {
    throw new Error(
      'useMobileMenu deve ser usado dentro de um MobileMenuProvider',
    )
  }
  return context
}
