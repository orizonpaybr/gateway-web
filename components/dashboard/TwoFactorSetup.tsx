'use client'

import { useState, useEffect, useRef } from 'react'
import { twoFactorAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Setup2FAModal } from '@/components/modals/Setup2FAModal'

export function TwoFactorSetup() {
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const check2FAStatus = async () => {
      if (!user) {
        setIsChecking(false)
        setHasInitialized(true)
        return
      }

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

          if (response.success && (!response.enabled || !response.configured)) {
            setShowModal(true)
            setIsBlocking(true)
          } else {
            sessionStorage.setItem('2fa_setup_checked', 'true')
          }
        } catch (error) {
          console.error(
            '❌ TwoFactorSetup - Erro ao verificar status 2FA:',
            error,
          )
          setShowModal(true)
          setIsBlocking(true)
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

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando segurança...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isBlocking && showModal && (
        <div className="fixed inset-0 bg-black/80 z-40" />
      )}

      <Setup2FAModal
        isOpen={showModal}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </>
  )
}
