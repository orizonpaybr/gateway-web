'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function NotificacoesContent() {
  const [page, setPage] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const highlightedRef = useRef<HTMLDivElement | null>(null)

  const {
    notifications,
    pagination,
    isLoading,
    isError,
    unreadCount,
    markAll,
    markOne,
    refetch,
  } = useNotifications({
    page,
    limit: 20,
    unreadOnly,
    pollIntervalMs: 30000,
  })

  // Scroll para notificação destacada quando vier do dropdown
  useEffect(() => {
    if (highlightId && highlightedRef.current) {
      const timeoutId = setTimeout(() => {
        highlightedRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [highlightId, notifications.length])

  const canPrev = page > 1
  const canNext = page < (pagination.lastPage || 1)

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-12 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-6 text-red-700 flex items-center gap-2">
            <AlertCircle size={18} /> Erro ao carregar notificações.
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={unreadOnly}
              onCheckedChange={(checked) => {
                setPage(1)
                setUnreadOnly(checked)
              }}
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">
              Mostrar apenas não lidas
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => markAll()}
            disabled={unreadCount === 0 || isLoading}
            className="w-full sm:w-auto"
          >
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <Card>
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-6 text-gray-600 text-center">
              Nenhuma notificação.
            </div>
          ) : (
            notifications.map((n) => {
              const isHighlighted = highlightId && String(n.id) === highlightId
              return (
                <div
                  key={n.id}
                  ref={isHighlighted ? highlightedRef : null}
                  className={`p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 transition-colors rounded-lg ${
                    isHighlighted
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : !n.read_at
                      ? 'bg-blue-50/40'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {n.read_at ? (
                      <CheckCircle2
                        className="text-green-600 flex-shrink-0 mt-0.5"
                        size={18}
                      />
                    ) : (
                      <Badge variant="success" className="flex-shrink-0">
                        Nova
                      </Badge>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 break-words">
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-700 break-words mt-1">
                        {n.body}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!n.read_at && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markOne(n.id)}
                      className="w-full sm:w-auto flex-shrink-0"
                    >
                      Marcar lida
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-sm text-gray-600 text-center xl:text-left">
            Itens por página:{' '}
            <span className="font-medium">{pagination.perPage}</span> • Total:{' '}
            <span className="font-medium">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => canNext && setPage((p) => p + 1)}
            >
              {'>'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function NotificacoesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Card>
            <div className="p-12 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </Card>
        </div>
      }
    >
      <NotificacoesContent />
    </Suspense>
  )
}
