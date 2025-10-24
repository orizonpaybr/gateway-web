'use client'

import { useState, useEffect, useRef } from 'react'
import { twoFactorAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { TwoFactorModal } from '@/components/modals/TwoFactorModal'

export function TwoFactorSetup() {
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [lastUserId, setLastUserId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const check2FAStatus = async () => {
      if (!user) {
        // Usuário fez logout - resetar estado para próximo login
        setHasInitialized(false)
        setLastUserId(null)
        setShowModal(false)
        setIsChecking(false)
        setIsBlocking(false)
        return
      }

      // Se é um usuário diferente, resetar hasInitialized
      if (lastUserId && lastUserId !== user.id) {
        setHasInitialized(false)
      }

      setLastUserId(user.id)

      const setupChecked = sessionStorage.getItem('2fa_setup_checked')
      const verified = sessionStorage.getItem('2fa_verified')

      if (setupChecked === 'true' || verified === 'true') {
        setIsChecking(false)
        setHasInitialized(true)
        return
      }

      if (!hasInitialized) {
        setIsChecking(true)

        try {
          const response = await twoFactorAPI.getStatus()

          // LÓGICA CORRIGIDA:
          // 1. Se 2FA nunca foi configurado (enabled=false E configured=false) → FORÇAR configuração
          // 2. Se 2FA está desativado mas já foi configurado (enabled=false E configured=true) → Permitir acesso
          // 3. Se 2FA está ativado (enabled=true) → Permitir acesso (já configurado)

          if (response.success) {
            const isFirstAccess = !response.enabled && !response.configured

            if (isFirstAccess) {
              // Primeiro acesso - FORÇAR configuração obrigatória
              setShowModal(true)
              setIsBlocking(true) // BLOQUEAR acesso até configurar
            } else {
              // 2FA já foi configurado (ativado ou desativado pelo usuário)
              sessionStorage.setItem('2fa_setup_checked', 'true')
            }
          } else {
            // Erro na API - permitir acesso para não bloquear usuário
            sessionStorage.setItem('2fa_setup_checked', 'true')
          }
        } catch (error) {
          console.error(
            '❌ TwoFactorSetup - Erro ao verificar status 2FA:',
            error,
          )
          // Em caso de erro, não forçar configuração - deixar usuário acessar
          sessionStorage.setItem('2fa_setup_checked', 'true')
        } finally {
          setIsChecking(false)
          setHasInitialized(true)
        }
      }
    }

    check2FAStatus()
  }, [user, hasInitialized])

  const handleSuccess = () => {
    setShowModal(false)
    setIsBlocking(false)
    sessionStorage.setItem('2fa_setup_checked', 'true')
    sessionStorage.setItem('2fa_verified', 'true')
  }

  const handleClose = () => {
    if (isBlocking) {
      router.push('/login')
      return
    }
    setShowModal(false)
  }

  return (
    <>
      {isBlocking && showModal && (
        <div className="fixed inset-0 bg-black/80 z-40" />
      )}

      <TwoFactorModal
        isOpen={showModal}
        onClose={handleClose}
        onSuccess={handleSuccess}
        mode="initial-setup"
        isBlocking={isBlocking}
      />
    </>
  )
}
