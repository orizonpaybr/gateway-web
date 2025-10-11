'use client'

import { Info } from 'lucide-react'

export function NotificationBanner() {
  return (
    <div className="mx-6 mt-4 mb-4">
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                🚀 Versão Beta - Painel em Teste
              </span>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">
              Este painel está em versão de{' '}
              <span className="font-semibold">beta-teste</span>. Novas
              funcionalidades podem estar em desenvolvimento e algumas
              características podem sofrer alterações. Agradecemos seu feedback
              para melhorarmos a experiência!
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Atenciosamente, <span className="font-semibold">OrizonPay</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
