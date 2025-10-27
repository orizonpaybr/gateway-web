import { memo, useState, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Key, Copy, Plus, X, AlertCircle, RefreshCw } from 'lucide-react'
import { integrationAPI } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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

  // Mutation para regenerar secret
  const regenerateSecretMutation = useMutation({
    mutationFn: integrationAPI.regenerateSecret,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['integration', 'credentials'],
      })
      alert(data.message || 'Client Secret regenerado com sucesso!')
    },
    onError: (error: Error) => {
      alert(`Erro ao regenerar secret: ${error.message}`)
    },
  })

  // Mutation para adicionar IP
  const addIPMutation = useMutation({
    mutationFn: integrationAPI.addAllowedIP,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['integration', 'allowed-ips'],
      })
      setNovoIP('')
      setIsAddingIP(false)
      alert(data.message || 'IP adicionado com sucesso!')
    },
    onError: (error: Error) => {
      alert(`Erro ao adicionar IP: ${error.message}`)
    },
  })

  // Mutation para remover IP
  const removeIPMutation = useMutation({
    mutationFn: integrationAPI.removeAllowedIP,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['integration', 'allowed-ips'],
      })
      alert(data.message || 'IP removido com sucesso!')
    },
    onError: (error: Error) => {
      alert(`Erro ao remover IP: ${error.message}`)
    },
  })

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copiado para a área de transferência!`)
  }, [])

  const handleAddIP = useCallback(() => {
    if (!novoIP.trim()) return

    // Validação básica de IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(novoIP)) {
      alert('Por favor, digite um IP válido (ex: 192.168.1.1)')
      return
    }

    // Verificar se já existe
    if (ipsData?.data.ips.includes(novoIP)) {
      alert('Este IP já está autorizado')
      return
    }

    addIPMutation.mutate(novoIP)
  }, [novoIP, ipsData, addIPMutation])

  const handleRemoveIP = useCallback(
    (ip: string) => {
      if (confirm('Tem certeza que deseja remover este IP?')) {
        removeIPMutation.mutate(ip)
      }
    },
    [removeIPMutation],
  )

  const handleRegenerateSecret = useCallback(() => {
    if (
      confirm(
        'ATENÇÃO: Ao regenerar o Client Secret, todas as integrações existentes serão desconectadas. Tem certeza que deseja continuar?',
      )
    ) {
      regenerateSecretMutation.mutate()
    }
  }, [regenerateSecretMutation])

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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <Key size={24} />
          </div>
          <div>
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
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900 border border-gray-200 break-all">
                {credentials?.client_key}
              </div>
              <Button
                variant="outline"
                icon={<Copy size={18} />}
                onClick={() =>
                  copyToClipboard(credentials?.client_key || '', 'Client Key')
                }
              >
                Copiar
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Client Secret
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900 border border-gray-200 break-all">
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
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                >
                  <span className="font-mono text-sm text-gray-900">{ip}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X size={16} />}
                    onClick={() => handleRemoveIP(ip)}
                    disabled={removeIPMutation.isPending}
                  >
                    Remover
                  </Button>
                </div>
              ))}

              {isAddingIP ? (
                <div className="flex gap-2">
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
                  />
                  <Button
                    onClick={handleAddIP}
                    disabled={addIPMutation.isPending}
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
                >
                  Adicionar IP
                </Button>
              )}
            </div>
          </div>

          {/* Alerta de Segurança */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle
                className="text-blue-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Importante - Segurança</p>
                <ul className="list-disc list-inside space-y-1">
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
    </div>
  )
})

ConfiguracoesIntegracaoTab.displayName = 'ConfiguracoesIntegracaoTab'
