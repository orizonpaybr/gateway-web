import { memo, useState, useCallback, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Activity, AlertCircle, CheckCircle, Copy, X } from 'lucide-react'
import { useUtmify } from '@/hooks/useUtmify'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { TwoFactorModal } from '@/components/modals/TwoFactorModal'
import { useQuery } from '@tanstack/react-query'
import { twoFactorAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface UtmifyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UtmifyModal = memo(function UtmifyModal({
  isOpen,
  onClose,
}: UtmifyModalProps) {
  const { authReady } = useAuth()
  const [utmifyApiKey, setUtmifyApiKey] = useState('')
  const [isEditingUtmify, setIsEditingUtmify] = useState(false)
  const [showUtmifyConfirm, setShowUtmifyConfirm] = useState(false)
  const [showUtmify2FA, setShowUtmify2FA] = useState(false)
  const [utmifyPendingAction, setUtmifyPendingAction] = useState<
    'save' | 'delete' | 'start-edit' | null
  >(null)

  // Verificar status 2FA
  const { data: twoFAStatus, refetch: refetchTwoFA } = useQuery({
    queryKey: ['twofa-status'],
    queryFn: twoFactorAPI.getStatus,
    enabled: authReady,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })

  // Hook Utmify
  const {
    config: utmifyConfig,
    isLoading: isLoadingUtmify,
    isSaving: isSavingUtmify,
    isDeleting: isDeletingUtmify,
    isTesting: isTestingUtmify,
    saveApiKey: saveUtmifyApiKey,
    removeApiKey: removeUtmifyApiKey,
    testConnection: testUtmifyConnection,
    isPending2FA,
    retryWith2FA,
  } = useUtmify()

  // Funções Utmify
  const handleSaveUtmify = useCallback(() => {
    if (!utmifyApiKey.trim()) {
      toast.error('API Key inválida', {
        description: 'Por favor, insira uma API Key válida',
      })
      return
    }

    // Se 2FA estiver ativo, pedir PIN
    if (twoFAStatus?.enabled) {
      setUtmifyPendingAction('save')
      setShowUtmify2FA(true)
    } else {
      saveUtmifyApiKey(utmifyApiKey)
      setIsEditingUtmify(false)
      setUtmifyApiKey('')
    }
  }, [utmifyApiKey, twoFAStatus?.enabled, saveUtmifyApiKey])

  const handleRemoveUtmify = useCallback(() => {
    setShowUtmifyConfirm(true)
  }, [])

  const handleConfirmRemoveUtmify = useCallback(() => {
    setShowUtmifyConfirm(false)

    // Se 2FA estiver ativo, pedir PIN
    if (twoFAStatus?.enabled) {
      setUtmifyPendingAction('delete')
      setShowUtmify2FA(true)
    } else {
      removeUtmifyApiKey()
    }
  }, [twoFAStatus?.enabled, removeUtmifyApiKey])

  const handleUtmify2FASuccess = useCallback(
    (pin?: string) => {
      setShowUtmify2FA(false)

      if (utmifyPendingAction === 'save') {
        saveUtmifyApiKey(utmifyApiKey, pin)
        setIsEditingUtmify(false)
        setUtmifyApiKey('')
      } else if (utmifyPendingAction === 'delete') {
        removeUtmifyApiKey(pin)
      }

      setUtmifyPendingAction(null)
    },
    [utmifyPendingAction, utmifyApiKey, saveUtmifyApiKey, removeUtmifyApiKey],
  )

  const copyUtmifyKey = useCallback(() => {
    if (utmifyConfig?.api_key) {
      navigator.clipboard.writeText(utmifyConfig.api_key)
      toast.success('API Key copiada para a área de transferência!')
    }
  }, [utmifyConfig?.api_key])

  const handleClose = useCallback(() => {
    setUtmifyApiKey('')
    setIsEditingUtmify(false)
    onClose()
  }, [onClose])

  // Sempre sincronizar status 2FA ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      refetchTwoFA()
    }
  }, [isOpen, refetchTwoFA])

  // Se o backend exigir PIN (hook detecta), exibir modal 2FA automaticamente
  useEffect(() => {
    if (isPending2FA) {
      setShowUtmify2FA(true)
    }
  }, [isPending2FA])

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        size="md"
        showCloseButton={false}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Integração Utmify
                </h2>
                <p className="text-xs text-gray-600">
                  Configure sua API Key para rastreamento
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          {isLoadingUtmify ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle
                    className="text-purple-600 flex-shrink-0 mt-0.5"
                    size={18}
                  />
                  <div className="text-xs text-purple-800 min-w-0 flex-1">
                    <p className="font-semibold mb-0.5 break-words">
                      O que é a Utmify?
                    </p>
                    <p className="break-words">
                      Utmify é uma plataforma de rastreamento de conversões.
                      Configure sua API Key para rastrear automaticamente seus
                      pedidos PIX e campanhas de marketing.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  API Key da Utmify
                </label>

                {utmifyConfig?.enabled && !isEditingUtmify ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg font-mono text-sm text-gray-900 border border-gray-200 break-all min-w-0">
                        {utmifyConfig.api_key}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Copy size={18} />}
                        onClick={copyUtmifyKey}
                        className="shrink-0 w-full sm:w-auto"
                      >
                        Copiar
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (twoFAStatus?.enabled) {
                            setUtmifyPendingAction('start-edit')
                            setShowUtmify2FA(true)
                          } else {
                            setIsEditingUtmify(true)
                            setUtmifyApiKey(utmifyConfig.api_key || '')
                          }
                        }}
                        className="w-full sm:w-auto py-2"
                      >
                        Editar API Key
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testUtmifyConnection}
                        disabled={isTestingUtmify}
                        className="w-full sm:w-auto py-2"
                      >
                        {isTestingUtmify ? 'Testando...' : 'Testar Conexão'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveUtmify}
                        disabled={isDeletingUtmify}
                        className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 py-2 col-span-2"
                      >
                        {isDeletingUtmify
                          ? 'Removendo...'
                          : 'Remover Integração'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Input
                        type="text"
                        placeholder="Cole sua API Key aqui..."
                        value={utmifyApiKey}
                        onChange={(e) => setUtmifyApiKey(e.target.value)}
                        className="w-full h-9"
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-2">
                      <Button
                        onClick={handleSaveUtmify}
                        disabled={isSavingUtmify || !utmifyApiKey.trim()}
                        size="sm"
                        className="w-full sm:w-auto py-2"
                      >
                        {isSavingUtmify ? 'Salvando...' : 'Salvar API Key'}
                      </Button>
                      {isEditingUtmify && utmifyConfig?.enabled && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingUtmify(false)
                            setUtmifyApiKey('')
                          }}
                          disabled={isSavingUtmify}
                          size="sm"
                          className="w-full sm:w-auto py-2"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600">
                      Você encontra sua API Key no painel da Utmify em
                      Configurações → API
                    </p>
                  </div>
                )}
              </div>

              {utmifyConfig?.enabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className="text-green-600 flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <div className="text-xs text-gray-700 min-w-0 flex-1">
                      <p className="font-semibold mb-1.5 text-green-900">
                        Integração Ativa
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-600">
                        <li>Pedidos PIX serão rastreados automaticamente</li>
                        <li>Dados de conversão enviados em tempo real</li>
                        <li>Relatórios disponíveis no painel da Utmify</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>

      <Dialog
        open={showUtmifyConfirm}
        onClose={() => setShowUtmifyConfirm(false)}
        size="sm"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Remover Integração Utmify
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Tem certeza que deseja remover a integração com a Utmify? O
            rastreamento de pedidos será desativado.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowUtmifyConfirm(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRemoveUtmify}
              disabled={isDeletingUtmify}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingUtmify ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </div>
      </Dialog>

      <TwoFactorModal
        isOpen={showUtmify2FA}
        onClose={() => {
          setShowUtmify2FA(false)
          setUtmifyPendingAction(null)
        }}
        onSuccess={(pin?: string) => {
          if (pin) {
            retryWith2FA(pin)
          }
          if (utmifyPendingAction === 'start-edit') {
            setIsEditingUtmify(true)
            setUtmifyApiKey(utmifyConfig?.api_key || '')
            setUtmifyPendingAction(null)
            setShowUtmify2FA(false)
            return
          }
          handleUtmify2FASuccess(pin)
        }}
        mode="change-password"
      />
    </>
  )
})
