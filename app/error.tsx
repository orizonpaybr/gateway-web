'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('GlobalError capturou um erro:', error)
  }, [error])

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Ops! Algo deu errado
                </h1>
                <p className="text-gray-600 mb-4">
                  Ocorreu um erro inesperado ao carregar a página. Nossa equipe
                  foi notificada e está trabalhando para resolver o problema.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Detalhes do erro (apenas em desenvolvimento):
                  </p>
                  <pre className="text-xs text-red-600 overflow-auto">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                    {error.digest && `\n\nDigest: ${error.digest}`}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={reset}
                  icon={<RefreshCw size={18} />}
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
                <Button onClick={handleGoHome} icon={<Home size={18} />}>
                  Ir para Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </body>
    </html>
  )
}
