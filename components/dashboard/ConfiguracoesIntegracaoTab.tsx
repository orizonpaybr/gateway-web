import { memo, useState, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Key, Copy, Plus, Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import { integrationAPI } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Dialog } from '@/components/ui/Dialog'
import { TwoFactorModal } from '@/components/modals/TwoFactorModal'
import { twoFactorAPI } from '@/lib/api'
import { toast } from 'sonner'

export const ConfiguracoesIntegracaoTab = memo(() => {
  const [novoIP, setNovoIP] = useState('')
  const [isAddingIP, setIsAddingIP] = useState(false)
  const queryClient = useQueryClient()

  // Buscar credenciais
  const {
    data: credentialsData,
    isLoading: isLoadingCredentials,
    error: credentialsError,
  } = useQuery({
    queryKey: ['integration', 'credentials'],
    queryFn: integrationAPI.getCredentials,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  })

  // Buscar IPs autorizados
  const {
    data: ipsData,
    isLoading: isLoadingIPs,
    error: ipsError,
  } = useQuery({
    queryKey: ['integration', 'allowed-ips'],
    queryFn: integrationAPI.getAllowedIPs,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Verificar status 2FA
  const { data: twoFAStatus } = useQuery({
    queryKey: ['twofa-status'],
    queryFn: twoFactorAPI.getStatus,
    staleTime: 60_000,
  })

  // Mutation para regenerar secret
  const regenerateSecretMutation = useMutation({
    mutationFn: (pin?: string) => integrationAPI.regenerateSecret(pin),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['integration', 'credentials'],
      })
      toast.success('Client Secret regenerado', {
        description:
          'Suas credenciais foram atualizadas com sucesso. Atualize suas integrações.',
      })
    },
    onError: (error: Error) => {
      toast.error('Erro ao regenerar secret', {
        description: error.message,
      })
    },
  })

  // Mutation para adicionar IP
  const addIPMutation = useMutation({
    mutationFn: ({ ip, pin }: { ip: string; pin?: string }) =>
      integrationAPI.addAllowedIP(ip, pin),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['integration', 'allowed-ips'],
      })
      setNovoIP('')
      setIsAddingIP(false)
      toast.success('IP autorizado adicionado', {
        description: `O IP ${
          data.data?.ips?.[data.data.ips.length - 1] || 'adicionado'
        } foi autorizado com sucesso.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar IP', {
        description: error.message,
      })
    },
  })

  // Mutation para remover IP
  const removeIPMutation = useMutation({
    mutationFn: ({ ip, pin }: { ip: string; pin?: string }) =>
      integrationAPI.removeAllowedIP(ip, pin),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['integration', 'allowed-ips'],
      })
      toast.success('IP autorizado removido', {
        description: 'O IP foi removido da lista de autorizados com sucesso.',
      })
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover IP', {
        description: error.message,
      })
    },
  })

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado para a área de transferência!`)
  }, [])

  const handleAddIP = useCallback(() => {
    if (!novoIP.trim()) return

    // Validação básica de IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(novoIP)) {
      toast.error('Por favor, digite um IP válido (ex: 192.168.1.1)')
      return
    }

    // Verificar se já existe
    if (ipsData?.data.ips.includes(novoIP)) {
      toast.error('Este IP já está autorizado')
      return
    }

    // Se 2FA estiver ativo, pedir PIN
    if (twoFAStatus?.enabled) {
      setPendingAddIP(novoIP)
      setShow2FAModal(true)
    } else {
      addIPMutation.mutate({ ip: novoIP })
    }
  }, [novoIP, ipsData, twoFAStatus?.enabled, addIPMutation])

  const handleRemoveIP = useCallback(
    (ip: string) => {
      // Se 2FA estiver ativo, pedir PIN
      if (twoFAStatus?.enabled) {
        setPendingRemoveIP(ip)
        pendingRemoveIPRef.current = ip // Guardar também no ref
        setShow2FAModal(true)
      } else {
        if (confirm('Tem certeza que deseja remover este IP?')) {
          removeIPMutation.mutate({ ip })
        }
      }
    },
    [twoFAStatus?.enabled, removeIPMutation],
  )

  // ==== 2FA e Dialogs ====
  const [showConfirm, setShowConfirm] = useState(false)
  const [showConfirmRemoveIP, setShowConfirmRemoveIP] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [pendingRegenerate, setPendingRegenerate] = useState(false)
  const [pendingAddIP, setPendingAddIP] = useState<string | null>(null)
  const [pendingRemoveIP, setPendingRemoveIP] = useState<string | null>(null)
  const [pendingRemoveIPPin, setPendingRemoveIPPin] = useState<
    string | undefined
  >(undefined)

  // Refs para manter valores durante o fluxo (evita problemas de closure)
  const pendingRemoveIPRef = useRef<string | null>(null)
  const pendingRemoveIPPinRef = useRef<string | undefined>(undefined)

  const handleRegenerateSecret = useCallback(() => {
    setShowConfirm(true)
  }, [])

  const handleConfirmRegenerate = useCallback(() => {
    setShowConfirm(false)
    const enabled = twoFAStatus?.enabled
    if (enabled) {
      setShow2FAModal(true)
      setPendingRegenerate(true)
    } else {
      regenerateSecretMutation.mutate(undefined)
    }
  }, [twoFAStatus?.enabled, regenerateSecretMutation])

  const handleTwoFASuccess = useCallback(
    (pin?: string) => {
      setShow2FAModal(false)
      if (pendingRegenerate) {
        regenerateSecretMutation.mutate(pin)
        setPendingRegenerate(false)
      } else if (pendingAddIP) {
        addIPMutation.mutate({ ip: pendingAddIP, pin })
        setPendingAddIP(null)
      } else if (pendingRemoveIP) {
        // Guardar PIN e mostrar dialog de confirmação
        // Usar refs para garantir que os valores sejam preservados
        pendingRemoveIPRef.current = pendingRemoveIP
        pendingRemoveIPPinRef.current = pin
        setPendingRemoveIPPin(pin)
        setShowConfirmRemoveIP(true)
      }
    },
    [
      pendingRegenerate,
      pendingAddIP,
      pendingRemoveIP,
      regenerateSecretMutation,
      addIPMutation,
    ],
  )

  const handleConfirmRemoveIP = useCallback(() => {
    // Usar refs para garantir que temos os valores corretos
    const ipToRemove = pendingRemoveIPRef.current
    const pinToUse = pendingRemoveIPPinRef.current

    if (ipToRemove && pinToUse !== undefined) {
      setShowConfirmRemoveIP(false)
      removeIPMutation.mutate(
        { ip: ipToRemove, pin: pinToUse },
        {
          onSuccess: () => {
            setPendingRemoveIP(null)
            setPendingRemoveIPPin(undefined)
            pendingRemoveIPRef.current = null
            pendingRemoveIPPinRef.current = undefined
          },
          onError: () => {
            // Em caso de erro, manter os estados para tentar novamente
          },
        },
      )
    } else {
      setShowConfirmRemoveIP(false)
    }
  }, [removeIPMutation])

  // Loading state
  if (isLoadingCredentials || isLoadingIPs) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  // Error state
  if (credentialsError || ipsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Erro ao carregar dados de integração. Por favor, tente novamente.
        </p>
      </div>
    )
  }

  const credentials = credentialsData?.data
  const ips = ipsData?.data.ips || []

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600 shrink-0">
            <Key size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Integração com API
            </h2>
            <p className="text-sm text-gray-600">
              Credenciais para integração com sua aplicação
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Client Key
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div
                className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900 border border-gray-200 break-all min-w-0"
                data-cy="client-key"
                title={credentials?.client_key}
              >
                {credentials?.client_key}
              </div>
              <Button
                variant="outline"
                icon={<Copy size={18} />}
                onClick={() =>
                  copyToClipboard(credentials?.client_key || '', 'Client Key')
                }
                className="shrink-0 w-full sm:w-auto"
                data-cy="copy-client-key"
              >
                Copiar
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Client Secret
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div
                className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900 border border-gray-200 break-all min-w-0"
                data-cy="client-secret"
                title={credentials?.client_secret}
              >
                {credentials?.client_secret}
              </div>
              <Button
                variant="outline"
                icon={<Copy size={18} />}
                onClick={() =>
                  copyToClipboard(
                    credentials?.client_secret || '',
                    'Client Secret',
                  )
                }
                className="shrink-0 w-full sm:w-auto"
                data-cy="copy-client-secret"
              >
                Copiar
              </Button>
            </div>
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw size={16} />}
                onClick={handleRegenerateSecret}
                disabled={regenerateSecretMutation.isPending}
                data-cy="regenerate-secret"
              >
                {regenerateSecretMutation.isPending
                  ? 'Regenerando...'
                  : 'Regenerar Secret'}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              IPs Autorizados ({ips.length})
            </label>
            <div className="space-y-2">
              {ips.length === 0 && !isAddingIP && (
                <div className="bg-gray-50 px-4 py-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Nenhum IP autorizado. Adicione IPs para permitir acesso à
                    API.
                  </p>
                </div>
              )}

              {ips.map((ip) => (
                <div
                  key={ip}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 gap-2 flex-wrap"
                >
                  <span
                    className="font-mono text-sm text-gray-900 break-all flex-1 min-w-0"
                    data-cy={`allowed-ip-${ip}`}
                  >
                    {ip}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => handleRemoveIP(ip)}
                    disabled={removeIPMutation.isPending}
                    className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-cy={`remove-ip-${ip}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>Remover</span>
                      <Trash2 size={16} />
                    </span>
                  </Button>
                </div>
              ))}

              {isAddingIP ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    placeholder="Ex: 192.168.1.1"
                    value={novoIP}
                    onChange={(e) => setNovoIP(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddIP()
                      if (e.key === 'Escape') {
                        setIsAddingIP(false)
                        setNovoIP('')
                      }
                    }}
                    autoFocus
                    data-cy="new-ip-input"
                  />
                  <Button
                    onClick={handleAddIP}
                    disabled={addIPMutation.isPending}
                    className="w-full sm:w-auto shrink-0"
                    data-cy="add-ip"
                  >
                    {addIPMutation.isPending ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingIP(false)
                      setNovoIP('')
                    }}
                    disabled={addIPMutation.isPending}
                    className="w-full sm:w-auto shrink-0"
                    data-cy="cancel-add-ip"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus size={16} />}
                  onClick={() => setIsAddingIP(true)}
                  data-cy="start-add-ip"
                >
                  Adicionar IP
                </Button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle
                className="text-blue-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-blue-800 min-w-0 flex-1">
                <p className="font-semibold mb-1 break-words">
                  Importante - Segurança
                </p>
                <ul className="list-disc list-inside space-y-1 break-words">
                  <li>
                    Mantenha suas credenciais em segurança. Não compartilhe com
                    terceiros.
                  </li>
                  <li>
                    Use variáveis de ambiente para armazenar as credenciais em
                    sua aplicação.
                  </li>
                  <li>
                    A lista de IPs autorizados garante que apenas servidores
                    específicos possam acessar a API.
                  </li>
                  <li>
                    Em caso de vazamento, regenere imediatamente o Client
                    Secret.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        size="sm"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Regenerar Client Secret
          </h3>
          <p className="text-sm text-gray-700">
            ATENÇÃO: Ao regenerar o Client Secret, todas as integrações
            existentes serão desconectadas.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRegenerate}
              disabled={regenerateSecretMutation.isPending}
            >
              {regenerateSecretMutation.isPending
                ? 'Processando...'
                : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Dialog>

      <TwoFactorModal
        isOpen={show2FAModal}
        onClose={() => {
          setShow2FAModal(false)
          setPendingAddIP(null)
          setPendingRemoveIP(null)
        }}
        onSuccess={handleTwoFASuccess}
        mode="change-password"
      />

      <Dialog
        open={showConfirmRemoveIP}
        onClose={() => {
          setShowConfirmRemoveIP(false)
          setPendingRemoveIP(null)
          setPendingRemoveIPPin(undefined)
          pendingRemoveIPRef.current = null
          pendingRemoveIPPinRef.current = undefined
        }}
        size="sm"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Remover IP Autorizado
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Tem certeza que deseja remover o IP{' '}
            <span className="font-mono font-semibold">{pendingRemoveIP}</span>?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowConfirmRemoveIP(false)
                setPendingRemoveIP(null)
                setPendingRemoveIPPin(undefined)
                pendingRemoveIPRef.current = null
                pendingRemoveIPPinRef.current = undefined
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRemoveIP}
              disabled={removeIPMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {removeIPMutation.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
})

ConfiguracoesIntegracaoTab.displayName = 'ConfiguracoesIntegracaoTab'
