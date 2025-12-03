import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { isValidIPv4, maskIPInput } from '@/lib/helpers/ip-utils'

interface SecurityIPsSectionProps {
  globalIps: string[]
  onAddIP: (ip: string) => void
  onRemoveIP: (ip: string) => void
}

export function SecurityIPsSection({
  globalIps,
  onAddIP,
  onRemoveIP,
}: SecurityIPsSectionProps) {
  const [ipInput, setIpInput] = useState('')
  const [ipToDelete, setIpToDelete] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleInputChange = (value: string) => {
    const masked = maskIPInput(value)
    setIpInput(masked)
  }

  const handleAddIP = () => {
    const trimmedIp = ipInput.trim()

    if (!trimmedIp) {
      return
    }

    if (!isValidIPv4(trimmedIp)) {
      toast.error('IP inválido', {
        description:
          'Por favor, insira um endereço IP válido (ex: 192.168.1.1)',
      })
      return
    }

    if (globalIps.includes(trimmedIp)) {
      toast.error('IP já existe na lista')
      return
    }

    onAddIP(trimmedIp)
    setIpInput('')
    toast.success('IP adicionado com sucesso')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddIP()
    }
  }

  const handleRequestDelete = (ip: string) => {
    setIpToDelete(ip)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!ipToDelete) {
      return
    }
    onRemoveIP(ipToDelete)
    setIsConfirmOpen(false)
    setIpToDelete(null)
    toast.success('IP removido com sucesso')
  }

  return (
    <div>
      <Label htmlFor="ip-input">IPs Globais Autorizados</Label>
      <p className="text-sm text-gray-500 mb-2">
        IPs que são autorizados para TODOS os usuários
      </p>
      <p className="text-sm text-gray-500 mb-4">
        • Separe múltiplos IPs com vírgula
        <br />• Estes IPs funcionam para saques via interface web
      </p>

      <div className="flex gap-2">
        <Input
          id="ip-input"
          placeholder="192.168.1.1"
          value={ipInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleAddIP} variant="primary">
          Adicionar
        </Button>
      </div>

      {globalIps.length > 0 && (
        <div className="mt-4 space-y-2">
          {globalIps.map((ip, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="font-mono text-sm">{ip}</span>
              <Button
                onClick={() => handleRequestDelete(ip)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
        <p className="text-sm text-cyan-800 font-medium mb-2">
          💡 Dica: Adicione o IP atual do servidor aqui para que os saques via
          interface web funcionem automaticamente.
        </p>
        <p className="text-sm text-cyan-700">
          IP sugerido para testes: <strong>187.65.210.34</strong>
        </p>
      </div>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Remover IP autorizado"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700 hover:text-red-700"
              onClick={handleConfirmDelete}
            >
              Remover
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          Tem certeza que deseja remover o IP{' '}
          <span className="font-mono font-semibold">{ipToDelete}</span> da lista
          de IPs globais autorizados?
        </p>
      </Dialog>
    </div>
  )
}
