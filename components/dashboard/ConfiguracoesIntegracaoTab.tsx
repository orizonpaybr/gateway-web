import { memo, useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Key, Copy, Eye, EyeOff, Plus, X, AlertCircle } from 'lucide-react'

interface IPAutorizado {
  id: string
  ip: string
}

export const ConfiguracoesIntegracaoTab = memo(() => {
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [ipsAutorizados, setIpsAutorizados] = useState<IPAutorizado[]>([
    { id: '1', ip: '192.168.1.1' },
    { id: '2', ip: '203.0.113.0' },
  ])
  const [novoIP, setNovoIP] = useState('')
  const [isAddingIP, setIsAddingIP] = useState(false)

  // Mock data - será substituído pela API
  const apiCredentials = useMemo(
    () => ({
      clientKey: 'hpk_live_1234567890abcdef',
      clientSecret: 'process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || ""',
    }),
    [],
  )

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copiado para a área de transferência!`)
  }, [])

  const toggleShowKeys = useCallback(() => {
    setShowApiKeys((prev) => !prev)
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
    if (ipsAutorizados.some((item) => item.ip === novoIP)) {
      alert('Este IP já está autorizado')
      return
    }

    const newIP: IPAutorizado = {
      id: Date.now().toString(),
      ip: novoIP,
    }

    setIpsAutorizados((prev) => [...prev, newIP])
    setNovoIP('')
    setIsAddingIP(false)

    // TODO: Integrar com API
    alert('IP adicionado com sucesso!')
  }, [novoIP, ipsAutorizados])

  const handleRemoveIP = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja remover este IP?')) {
      setIpsAutorizados((prev) => prev.filter((item) => item.id !== id))
      // TODO: Integrar com API
      alert('IP removido com sucesso!')
    }
  }, [])

  const handleRegenerateSecret = useCallback(() => {
    if (
      confirm(
        'ATENÇÃO: Ao regenerar o Client Secret, todas as integrações existentes serão desconectadas. Tem certeza que deseja continuar?',
      )
    ) {
      // TODO: Integrar com API
      alert('Client Secret regenerado com sucesso!')
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
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
          <Button
            variant="outline"
            size="sm"
            icon={showApiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
            onClick={toggleShowKeys}
          >
            {showApiKeys ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Client Key */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Client Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900 border border-gray-200">
                {showApiKeys
                  ? apiCredentials.clientKey
                  : '••••••••••••••••••••••••'}
              </div>
              <Button
                variant="outline"
                icon={<Copy size={18} />}
                onClick={() =>
                  copyToClipboard(apiCredentials.clientKey, 'Client Key')
                }
              >
                Copiar
              </Button>
            </div>
          </div>

          {/* Client Secret */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Client Secret
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900 border border-gray-200">
                {showApiKeys
                  ? apiCredentials.clientSecret
                  : '••••••••••••••••••••••••••••••••'}
              </div>
              <Button
                variant="outline"
                icon={<Copy size={18} />}
                onClick={() =>
                  copyToClipboard(apiCredentials.clientSecret, 'Client Secret')
                }
              >
                Copiar
              </Button>
            </div>
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateSecret}
              >
                Regenerar Secret
              </Button>
            </div>
          </div>

          {/* IPs Autorizados */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              IPs Autorizados
            </label>
            <div className="space-y-2">
              {ipsAutorizados.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                >
                  <span className="font-mono text-sm text-gray-900">
                    {item.ip}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X size={16} />}
                    onClick={() => handleRemoveIP(item.id)}
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
                  />
                  <Button onClick={handleAddIP}>Adicionar</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingIP(false)
                      setNovoIP('')
                    }}
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
