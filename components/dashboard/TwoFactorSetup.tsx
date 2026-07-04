'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TwoFactorModal } from '@/components/modals/TwoFactorModal'
import { useAuth } from '@/contexts/AuthContext'
import { twoFactorAPI } from '@/lib/api'
import { TWO_FA_SETUP_CHECKED_KEY, TWO_FA_VERIFIED_KEY } from '@/lib/config/auth'

export function TwoFactorSetup() {
  const [showModal, setShowModal] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [lastUserId, setLastUserId] = useState<string | null>(null)
  const { user, authReady, pending2FA } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const check2FAStatus = async () => {
      if (!user) {
        setHasInitialized(false)
        setLastUserId(null)
        setShowModal(false)
        setIsBlocking(false)
        return
      }

      if (!authReady || pending2FA) {
        return
      }

      if (lastUserId && lastUserId !== user.id) {
        setHasInitialized(false)
      }

      setLastUserId(user.id)

      const setupChecked = sessionStorage.getItem(TWO_FA_SETUP_CHECKED_KEY)
      const verified = sessionStorage.getItem(TWO_FA_VERIFIED_KEY)

      if (setupChecked === 'true' || verified === 'true') {
        setHasInitialized(true)
        return
      }

      if (!hasInitialized) {
        try {
          const response = await twoFactorAPI.getStatus()

          if (response.success) {
            const isFirstAccess = !response.enabled && !response.configured

            if (isFirstAccess) {
              setShowModal(true)
              setIsBlocking(false)
            } else {
              sessionStorage.setItem(TWO_FA_SETUP_CHECKED_KEY, 'true')
            }
          } else {
            sessionStorage.setItem(TWO_FA_SETUP_CHECKED_KEY, 'true')
          }
        } catch (error) {
          console.error('TwoFactorSetup - Erro ao verificar status 2FA:', error)
          sessionStorage.setItem(TWO_FA_SETUP_CHECKED_KEY, 'true')
        } finally {
          setHasInitialized(true)
        }
      }
    }

    void check2FAStatus()
  }, [user, authReady, pending2FA, hasInitialized, lastUserId])

  const handleSuccess = () => {
    setShowModal(false)
    setIsBlocking(false)
    sessionStorage.setItem(TWO_FA_SETUP_CHECKED_KEY, 'true')
    sessionStorage.setItem(TWO_FA_VERIFIED_KEY, 'true')
  }

  const handleClose = () => {
    if (isBlocking) {
      router.push('/login')
      return
    }
    setShowModal(false)
  }

  if (pending2FA || !authReady) {
    return null
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
