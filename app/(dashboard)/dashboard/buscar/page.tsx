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

const searchSchema = z.object({
  transactionId: z.string().min(1, 'Digite um ID ou EndToEndID'),
})

type SearchFormData = z.infer<typeof searchSchema>

export default function BuscarPage() {
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  })

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSearchResult({
      id: data.transactionId,
      endToEndId: 'E1234567820251007123456789',
      description: 'Recebimento - Cliente ABC',
      value: 2500.0,
      date: '07/10/2025 14:35:22',
      status: 'concluída',
      type: 'entrada',
      sender: {
        name: 'João Silva',
        document: '123.456.789-00',
        bank: 'Banco do Brasil',
      },
      receiver: {
        name: 'Sua Empresa',
        document: '98.765.432/0001-10',
        bank: 'HorsePay',
      },
    })
    setIsSearching(false)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buscar Transações</h1>
        <p className="text-gray-600 text-sm mt-1">
          Pesquise transações por ID ou EndToEndID
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      {searchResult && (
        <Card>
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
