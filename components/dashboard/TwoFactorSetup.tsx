'use client'

import { useState, useEffect, useRef } from 'react'
import { Setup2FAModal } from '@/components/modals/Setup2FAModal'
import { twoFactorAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function TwoFactorSetup() {
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isBlocking, setIsBlocking] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const hasChecked = useRef(false)

  useEffect(() => {
    if (user && !hasChecked.current) {
      hasChecked.current = true
      checkTwoFactorStatus()
    }
  }, [user])

  const checkTwoFactorStatus = async () => {
    console.log('🔍 TwoFactorSetup - Verificando status...', {
      user: user?.username,
    })

    if (!user) {
      console.log('❌ TwoFactorSetup - Sem usuário')
      setIsChecking(false)
      return
    }

    try {
      const response = await twoFactorAPI.getStatus()

      // Se o 2FA não está habilitado, mostrar modal e bloquear acesso
      if (response.success && !response.enabled) {
        console.log('🔐 TwoFactorSetup - 2FA não habilitado - mostrando modal')
        setShowModal(true)
        setIsBlocking(true)
      } else {
        console.log(
          '✅ TwoFactorSetup - 2FA habilitado ou erro - não bloqueando',
        )
      }
    } catch (error) {
      console.error('❌ TwoFactorSetup - Erro ao verificar status 2FA:', error)
      // Se não conseguir verificar, mostrar modal por segurança
      setShowModal(true)
      setIsBlocking(true)
    } finally {
      console.log('🏁 TwoFactorSetup - Finalizando verificação')
      setIsChecking(false)
    }
  }

  const handleSuccess = () => {
    setShowModal(false)
    setIsBlocking(false)
    // Não recarregar página - apenas fechar modal
    // O status será verificado automaticamente nos próximos logins
  }

  const handleClose = () => {
    // Se está bloqueando (primeira vez), não permitir fechar sem configurar
    if (isBlocking) {
      // Fazer logout e redirecionar
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
