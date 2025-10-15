'use client'

import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { useRouter } from 'next/navigation'

const searchSchema = z.object({
  transactionId: z.string().min(1, 'Digite um ID ou EndToEndID'),
})

type SearchFormData = z.infer<typeof searchSchema>

export default function BuscarPage() {
  const router = useRouter()
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'deposito' | 'saque' | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  })

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true)
    try {
      const params = new URLSearchParams()
      params.append('page', '1')
      params.append('limit', '1')
      if (selectedType) params.append('tipo', selectedType)
      params.append('busca', data.transactionId)

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'https://playgameoficial.com.br/api'
        }/transactions?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              typeof window !== 'undefined' && localStorage.getItem('token')
                ? `Bearer ${localStorage.getItem('token')}`
                : '',
          },
        },
      )

      if (!res.ok) throw new Error('Erro ao buscar transação')
      const json = await res.json()

      if (json.success && json.data?.data?.length) {
        const t = json.data.data[0]
        router.push(`/dashboard/comprovante/${t.id}`)
        setSearchResult({
          id: t.id,
          endToEndId: t.transaction_id,
          description: t.descricao,
          value: t.amount,
          date: t.data,
          status: t.status_legivel,
          type: t.tipo,
          sender: {
            name: t.nome_cliente,
            document: t.documento,
            bank: t.adquirente,
          },
          receiver: { name: 'Você', document: '', bank: 'Orizon' },
        })
      } else {
        setSearchResult(null)
      }
    } catch (e) {
      console.error('Erro ao buscar:', e)
      setSearchResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluída':
        return <CheckCircle className="text-green-500" size={24} />
      case 'pendente':
        return <Clock className="text-yellow-500" size={24} />
      case 'falhou':
        return <XCircle className="text-red-500" size={24} />
      default:
        return <Clock className="text-gray-500" size={24} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900">Buscar Transações</h1>
        <p className="text-gray-600 text-sm mt-1">
          Pesquise transações por ID ou EndToEndID
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setTypeModalOpen(true)
          }}
          className="space-y-4"
        >
          <Input
            {...register('transactionId')}
            label="ID OU ENDTOENDID"
            placeholder="Digite o ID ou EndToEndID da transação"
            error={errors.transactionId?.message}
            icon={<Search size={18} />}
            onChange={(e) => {
              setSearchValue(e.target.value)
              register('transactionId').onChange(e)
            }}
          />
          <Button
            type="submit"
            disabled={isSearching}
            icon={<Search size={18} />}
          >
            {isSearching ? 'Buscando...' : 'Buscar Transação'}
          </Button>
        </form>
      </Card>

      <Dialog
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        title="Selecione o tipo de transação"
        size="sm"
      >
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={async () => {
              setSelectedType('deposito')
              setTypeModalOpen(false)
              await handleSubmit(onSubmit)()
            }}
          >
            Depósito
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={async () => {
              setSelectedType('saque')
              setTypeModalOpen(false)
              await handleSubmit(onSubmit)()
            }}
          >
            Saque
          </Button>
        </div>
      </Dialog>

      {searchResult && (
        <Card className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            {getStatusIcon(searchResult.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Transação Encontrada
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Status:{' '}
                <span
                  className={`font-medium ${
                    searchResult.status === 'concluída'
                      ? 'text-green-600'
                      : searchResult.status === 'pendente'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {searchResult.status}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  ID da Transação
                </label>
                <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">
                  {searchResult.id}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  EndToEndID
                </label>
                <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded break-all">
                  {searchResult.endToEndId}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Descrição
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {searchResult.description}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {searchResult.value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Data e Hora
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {searchResult.date}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Dados do Pagador
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Nome</label>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.sender.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Documento</label>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.sender.document}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Banco</label>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.sender.bank}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Dados do Recebedor
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Nome</label>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.receiver.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Documento</label>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.receiver.document}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Banco</label>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.receiver.bank}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
