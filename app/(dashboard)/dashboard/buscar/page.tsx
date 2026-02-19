'use client'

import { useState, memo, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'

const searchSchema = z.object({
  transactionId: z.string().min(1, 'Digite um ID ou EndToEndID'),
})

type SearchFormData = z.infer<typeof searchSchema>

const BuscarPage = memo(() => {
  const router = useRouter()
  const { authReady } = useAuth()
  const [searchResult, setSearchResult] = useState<{
    id: string
    endToEndId: string
    description: string
    value: number
    date: string
    status: string
    type: string
    sender: { name: string; document: string; bank: string }
    receiver: { name: string; document: string; bank: string }
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [_searchValue, setSearchValue] = useState('')
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

  const onSubmit = useCallback(
    async (data: SearchFormData) => {
      if (!authReady) {
        return
      }

      setIsSearching(true)
      try {
        const params = new URLSearchParams()
        params.append('page', '1')
        params.append('limit', '1')
        if (selectedType) {
          params.append('tipo', selectedType)
        }
        params.append('busca', data.transactionId)

        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
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

        if (!res.ok) {
          throw new Error('Erro ao buscar transação')
        }
        const json = await res.json()

        if (json.success && json.data?.data?.length) {
          const t = json.data.data[0]
          router.push(`/dashboard/comprovante/${t.comprovante_id ?? `${t.tipo}-${t.id}`}`)
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
    },
    [authReady, selectedType, router],
  )

  const getStatusIcon = useCallback((status: string) => {
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
  }, [])

  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Buscar Transações
          </h1>
          <p className="text-sm text-gray-600">
            Pesquise transações por ID ou EndToEndID
          </p>
        </div>
      </div>

      <Card className="p-4">
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
        <Card className="p-4">
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
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  ID da Transação
                </div>
                <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">
                  {searchResult.id}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  EndToEndID
                </div>
                <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded break-all">
                  {searchResult.endToEndId}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  Descrição
                </div>
                <p className="text-sm text-gray-900 mt-1">
                  {searchResult.description}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(searchResult.value)}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  Data e Hora
                </div>
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
                    <div className="text-xs text-gray-600">Nome</div>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.sender.name}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Documento</div>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.sender.document}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Banco</div>
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
                    <div className="text-xs text-gray-600">Nome</div>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.receiver.name}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Documento</div>
                    <p className="text-sm font-medium text-gray-900">
                      {searchResult.receiver.document}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Banco</div>
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
})

export default BuscarPage
