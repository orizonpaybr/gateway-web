'use client'

import React from 'react'
import {
  Building2,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Globe,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type { Acquirer } from '@/lib/api'

interface AcquirerDetailCardProps {
  acquirer: Acquirer
  onToggleStatus: (acquirer: Acquirer) => void
}

export function AcquirerDetailCard({
  acquirer,
  onToggleStatus,
}: AcquirerDetailCardProps) {
    const isActive = acquirer.status === 1 || acquirer.status === true
    const isDefaultPix =
      acquirer.is_default === 1 || acquirer.is_default === true
    const isDefaultCardBillet =
      acquirer.is_default_card_billet === 1 ||
      acquirer.is_default_card_billet === true

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isActive
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isActive ? 'bg-green-100' : 'bg-gray-200'
              }`}
            >
              <Building2
                className={`w-6 h-6 ${
                  isActive ? 'text-green-600' : 'text-gray-500'
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {acquirer.adquirente}
              </h3>
              <p className="text-sm text-gray-600">
                Referência:{' '}
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {acquirer.referencia}
                </code>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            title={isActive ? 'Desativar adquirente' : 'Ativar adquirente'}
            onClick={() => onToggleStatus(acquirer)}
            icon={
              isActive ? (
                <ToggleRight size={18} className="text-green-600" />
              ) : (
                <ToggleLeft size={18} className="text-gray-400" />
              )
            }
            className={
              isActive
                ? 'border-green-200 hover:bg-green-50'
                : 'border-gray-200 hover:bg-gray-50'
            }
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <LinkIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">URL da API</p>
              <p className="text-sm text-gray-600 break-all">{acquirer.url}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Configurações
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {isDefaultPix ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isDefaultPix ? (
                      <span className="font-medium text-blue-700">
                        Adquirente padrão para PIX
                      </span>
                    ) : (
                      'Não é padrão para PIX'
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isDefaultCardBillet ? (
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isDefaultCardBillet ? (
                      <span className="font-medium text-purple-700">
                        Adquirente padrão para Cartão/Boleto
                      </span>
                    ) : (
                      'Não é padrão para Cartão/Boleto'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {acquirer.created_at && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Adicionado em:{' '}
                {new Date(acquirer.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    )
}
