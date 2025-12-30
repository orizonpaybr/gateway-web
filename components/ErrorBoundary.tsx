'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface WindowWithAPM extends Window {
  __APM__?: {
    captureException: (
      error: Error,
      options?: { extra?: Record<string, unknown> },
    ) => void
  }
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  router?: ReturnType<typeof useRouter>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    if (typeof window !== 'undefined') {
      const windowWithAPM = window as WindowWithAPM
      if (windowWithAPM.__APM__) {
        try {
          windowWithAPM.__APM__.captureException(error, {
            extra: {
              componentStack: errorInfo.componentStack,
            },
          })
        } catch (e) {
          console.warn('Erro ao enviar para APM:', e)
        }
      }
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = (): void => {
    if (this.props.router) {
      this.props.router.push('/dashboard')
    } else if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
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
                  Ocorreu um erro inesperado. Nossa equipe foi notificada e está
                  trabalhando para resolver o problema.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Detalhes do erro (apenas em desenvolvimento):
                  </p>
                  <pre className="text-xs text-red-600 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  icon={<RefreshCw size={18} />}
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
                <Button onClick={this.handleGoHome} icon={<Home size={18} />}>
                  Ir para Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Wrapper funcional do ErrorBoundary que integra useRouter do Next.js
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
}: {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}) {
  const router = useRouter()

  return (
    <ErrorBoundary router={router} fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

/**
 * Hook para usar Error Boundary de forma funcional
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
