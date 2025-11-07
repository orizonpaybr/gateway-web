import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AdminUser } from '@/lib/api'
import { getStatusLabel } from '@/lib/helpers/userStatus'
import { useFormatDate } from '@/lib/helpers/formatting'

interface UserViewModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
}

export const UserViewModal = memo(function UserViewModal({
  open,
  onClose,
  user,
}: UserViewModalProps) {
  // Usar hooks de formatação
  const formatDate = useFormatDate()

  // Memorizar status text usando helper
  const statusText = useMemo(() => {
    if (!user) return '-'
    return getStatusLabel(user)
  }, [user])

  return (
    <Dialog open={open} onClose={onClose} title="Visualizar usuário" size="lg">
      {!user ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Usuário:</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-gray-500">Nome:</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Telefone:</p>
              <p className="font-medium">{user.telefone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Razão Social:</p>
              <p className="font-medium">{user.razao_social || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Nome Fantasia:</p>
              <p className="font-medium">{user.nome_fantasia || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">CPF/CNPJ:</p>
              <p className="font-medium">{user.cpf_cnpj || user.cpf || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Data de Nascimento:</p>
              <p className="font-medium">{user.data_nascimento || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Status:</p>
              <p className="font-medium">{statusText}</p>
            </div>
            <div>
              <p className="text-gray-500">Token:</p>
              <p className="font-mono text-xs break-all">{user.token || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Secret:</p>
              <p className="font-mono text-xs break-all">
                {user.secret || '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Data de Cadastro:</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>

          {user.documents && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Documentação
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.documents.rg_frente ? (
                  <div className="relative w-full h-48 rounded-lg border overflow-hidden bg-gray-100">
                    <Image
                      src={user.documents.rg_frente}
                      alt="RG Frente"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
                      RG Frente
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-400 text-sm">
                      RG Frente não disponível
                    </p>
                  </div>
                )}
                {user.documents.rg_verso ? (
                  <div className="relative w-full h-48 rounded-lg border overflow-hidden bg-gray-100">
                    <Image
                      src={user.documents.rg_verso}
                      alt="RG Verso"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
                      RG Verso
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-400 text-sm">
                      RG Verso não disponível
                    </p>
                  </div>
                )}
                {user.documents.selfie_rg ? (
                  <div className="relative w-full h-48 rounded-lg border overflow-hidden bg-gray-100">
                    <Image
                      src={user.documents.selfie_rg}
                      alt="Selfie"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
                      Selfie
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-400 text-sm">
                      Selfie não disponível
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  )
})
