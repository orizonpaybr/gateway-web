'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAffiliateLink } from '@/hooks/useAffiliateQuery'
import { Copy, Check, Share2, ExternalLink } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { toast } from 'sonner'

const SUPPORT_WHATSAPP_URL = 'https://wa.me/5549988906647'

export function AffiliateLink() {
  const { data: response, isLoading, error } = useAffiliateLink()
  const [copiedLink, setCopiedLink] = useState(false)

  const data = response?.data

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      toast.error('Erro ao copiar')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar link de afiliado</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Share2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Seu Link de Indicação
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="affiliate-link"
            className="text-sm font-medium text-gray-700"
          >
            Seu link para indicar:
          </label>
          <div className="flex items-center gap-2">
            <div
              id="affiliate-link"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 overflow-x-auto whitespace-nowrap"
            >
              {data.affiliate_link}
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => copyToClipboard(data.affiliate_link)}
              icon={
                copiedLink ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )
              }
              aria-label="Copiar link"
            >
              {copiedLink ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 text-sm text-blue-800">
              <p className="font-medium mb-1">Como funciona?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>
                  Compartilhe seu link com amigos (WhatsApp, redes sociais,
                  etc.)
                </li>
                <li>
                  Quando se cadastrarem pelo link, você ganha R$ 0,50 por
                  transação.
                </li>
                <li>As comissões são creditadas automaticamente.</li>
                <li>Você pode sacar pelo PIX normalmente.</li>
              </ul>
              <p className="font-medium mt-3 mb-2 text-blue-800">
                Em caso de dúvidas, entre em contato:
              </p>
              <a
                href={SUPPORT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-blue-200 text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <WhatsAppIcon size={28} />
                <div className="text-left">
                  <span className="block font-medium text-sm">Suporte</span>
                  <span className="block text-xs text-primary">
                    Fale conosco no WhatsApp
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
