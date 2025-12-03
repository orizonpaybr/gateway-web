import React, { memo, useMemo, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BASE_URL, type AdminUser } from '@/lib/api'
import { useFormatDate } from '@/lib/helpers/formatting'
import { getStatusLabel } from '@/lib/helpers/userStatus'
interface UserViewModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
}
interface DocumentImage {
  url: string
  title: string
  type: 'rg_frente' | 'rg_verso' | 'selfie_rg'
}

const DOCUMENT_TYPES = {
  RG_FRENTE: {
    type: 'rg_frente' as const,
    title: 'RG Frente',
    field: 'rg_frente' as const,
  },
  RG_VERSO: {
    type: 'rg_verso' as const,
    title: 'RG Verso',
    field: 'rg_verso' as const,
  },
  SELFIE_RG: {
    type: 'selfie_rg' as const,
    title: 'Selfie com RG',
    field: 'selfie_rg' as const,
  },
} as const

const buildImageUrl = (
  path: string | null | undefined,
  baseUrl: string,
): string | null => {
  if (!path) {
    return null
  }
  // Se já é uma URL completa, retornar como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Se é um caminho relativo, concatenar com a URL do backend
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export const UserViewModal = memo(
  ({ open, onClose, user }: UserViewModalProps) => {
    // Estado para modal de ampliação de imagem com carrossel
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
      null,
    )

    const formatDate = useFormatDate()

    const backendBaseUrl = useMemo(
      () => BASE_URL?.replace('/api', '') || 'http://localhost:8000',
      [],
    )

    const getImageUrl = useCallback(
      (path: string | null | undefined): string | null => {
        return buildImageUrl(path, backendBaseUrl)
      },
      [backendBaseUrl],
    )

    const availableImages = useMemo((): DocumentImage[] => {
      if (!user?.documents) {
        return []
      }

      const images: DocumentImage[] = []

      Object.values(DOCUMENT_TYPES).forEach((docType) => {
        const path = user.documents?.[docType.field]
        const url = getImageUrl(path)
        if (url) {
          images.push({
            url,
            title: docType.title,
            type: docType.type,
          })
        }
      })

      return images
    }, [user?.documents, getImageUrl])

    const selectedImage = useMemo(
      () =>
        selectedImageIndex !== null && availableImages[selectedImageIndex]
          ? availableImages[selectedImageIndex]
          : null,
      [selectedImageIndex, availableImages],
    )

    const statusText = useMemo(() => {
      if (!user) {
        return '-'
      }
      return getStatusLabel(user)
    }, [user])

    const openImageModal = useCallback(
      (url: string) => {
        const index = availableImages.findIndex((img) => img.url === url)
        setSelectedImageIndex(index >= 0 ? index : 0)
      },
      [availableImages],
    )

    const goToPrevious = useCallback(() => {
      if (selectedImageIndex !== null && availableImages.length > 0) {
        const prevIndex =
          selectedImageIndex > 0
            ? selectedImageIndex - 1
            : availableImages.length - 1
        setSelectedImageIndex(prevIndex)
      }
    }, [selectedImageIndex, availableImages.length])

    const goToNext = useCallback(() => {
      if (selectedImageIndex !== null && availableImages.length > 0) {
        const nextIndex =
          selectedImageIndex < availableImages.length - 1
            ? selectedImageIndex + 1
            : 0
        setSelectedImageIndex(nextIndex)
      }
    }, [selectedImageIndex, availableImages.length])

    useEffect(() => {
      if (selectedImageIndex === null || availableImages.length === 0) {
        return
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          goToPrevious()
        } else if (e.key === 'ArrowRight') {
          goToNext()
        } else if (e.key === 'Escape') {
          setSelectedImageIndex(null)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedImageIndex, availableImages.length, goToPrevious, goToNext])

    const DocumentThumbnail = memo(
      ({
        docType,
        imageUrl,
        onImageClick,
      }: {
        docType: (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES]
        imageUrl: string | null
        onImageClick: (url: string) => void
      }) => {
        if (imageUrl) {
          return (
            <div className="space-y-2">
              <div
                className="relative w-full h-64 rounded-lg border-2 border-gray-300 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group"
                onClick={() => onImageClick(imageUrl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onImageClick(imageUrl)
                  }
                }}
                aria-label={`Ampliar ${docType.title}`}
              >
                <Image
                  src={imageUrl}
                  alt={docType.title}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-sm px-4 py-2 rounded-lg shadow-lg text-center">
                    Clique para ampliar
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">
                {docType.title}
              </p>
            </div>
          )
        }

        return (
          <div className="space-y-2">
            <div className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <p className="text-gray-400 text-sm text-center">
                {docType.title} não disponível
              </p>
            </div>
            <p className="text-xs text-gray-600 text-center font-medium">
              {docType.title}
            </p>
          </div>
        )
      },
    )

    DocumentThumbnail.displayName = 'DocumentThumbnail'

    const NavigationButton = memo(
      ({
        direction,
        onClick,
        ariaLabel,
      }: {
        direction: 'prev' | 'next'
        onClick: () => void
        ariaLabel: string
      }) => {
        const isPrev = direction === 'prev'
        const positionClass = isPrev ? 'left-4' : 'right-4'
        return (
          <button
            onClick={onClick}
            className={`absolute ${positionClass} top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors`}
            aria-label={ariaLabel}
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isPrev ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>
        )
      },
    )

    NavigationButton.displayName = 'NavigationButton'

    const ImageIndicators = memo(
      ({
        total,
        current,
        onSelect,
      }: {
        total: number
        current: number
        onSelect: (index: number) => void
      }) => (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      ),
    )

    ImageIndicators.displayName = 'ImageIndicators'

    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Visualizar usuário"
        size="lg"
      >
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
                <p className="font-medium">
                  {user.cpf_cnpj || user.cpf || '-'}
                </p>
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
                <p className="font-mono text-xs break-all">
                  {user.token || '-'}
                </p>
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
                <p className="text-sm font-semibold text-gray-900 mb-4">
                  Documentação
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DocumentThumbnail
                    docType={DOCUMENT_TYPES.RG_FRENTE}
                    imageUrl={getImageUrl(user.documents.rg_frente)}
                    onImageClick={openImageModal}
                  />
                  <DocumentThumbnail
                    docType={DOCUMENT_TYPES.RG_VERSO}
                    imageUrl={getImageUrl(user.documents.rg_verso)}
                    onImageClick={openImageModal}
                  />
                  <DocumentThumbnail
                    docType={DOCUMENT_TYPES.SELFIE_RG}
                    imageUrl={getImageUrl(user.documents.selfie_rg)}
                    onImageClick={openImageModal}
                  />
                </div>
              </div>
            )}

            {selectedImage && availableImages.length > 0 && (
              <Dialog
                open={selectedImageIndex !== null}
                onClose={() => setSelectedImageIndex(null)}
                title={selectedImage.title}
                size="xl"
              >
                <div className="relative w-full max-h-[80vh] flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                  {availableImages.length > 1 && (
                    <NavigationButton
                      direction="prev"
                      onClick={goToPrevious}
                      ariaLabel="Imagem anterior"
                    />
                  )}

                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    width={1200}
                    height={800}
                    className="max-w-full max-h-[80vh] object-contain"
                    unoptimized
                    priority
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />

                  {availableImages.length > 1 && (
                    <NavigationButton
                      direction="next"
                      onClick={goToNext}
                      ariaLabel="Próxima imagem"
                    />
                  )}

                  {availableImages.length > 1 && (
                    <ImageIndicators
                      total={availableImages.length}
                      current={selectedImageIndex ?? 0}
                      onSelect={setSelectedImageIndex}
                    />
                  )}
                </div>
              </Dialog>
            )}
          </div>
        )}
      </Dialog>
    )
  },
)
