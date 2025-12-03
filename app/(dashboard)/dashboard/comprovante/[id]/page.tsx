'use client'

import { useState, useEffect, memo, useCallback } from 'react'

import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { transactionsAPI } from '@/lib/api'
import {
  formatCurrencyBRL,
  formatDateTimeBR,
  formatDocumentBR,
} from '@/lib/format'

interface TransactionDetails {
  id: number
  transaction_id: string
  tipo: 'deposito' | 'saque'
  metodo: string
  movimento: string
  amount: number
  valor_liquido: number
  taxa: number
  status: string
  status_legivel: string
  data: string
  created_at: string
  updated_at: string
  origem: {
    nome: string
    documento: string
  }
  destino: {
    nome: string
    documento: string
  }
  adquirente: string
  codigo_autenticacao: string
  descricao: string
  qrcode?: string
  pix_key?: string
  pix_key_type?: string
  end_to_end?: string
}

const ComprovantePage = memo(() => {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [transaction, setTransaction] = useState<TransactionDetails | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  // Usar AuthContext para token
  const { user } = useAuth()

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!user) {
        toast.error('Você precisa estar autenticado')
        router.push('/login')
        return
      }

      setIsLoading(true)
      try {
        const response = await transactionsAPI.getById(id)
        if (response.success) {
          setTransaction(response.data)
        } else {
          toast.error('Transação não encontrada')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Erro ao buscar transação:', error)
        toast.error('Erro ao carregar comprovante')
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransaction()
  }, [id, user, router])

  const formatCurrency = useCallback(formatCurrencyBRL, [])
  const formatDate = useCallback(formatDateTimeBR, [])
  const formatDocument = useCallback(formatDocumentBR, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID_OUT':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
      case 'WAITING_FOR_APPROVAL':
        return 'bg-yellow-100 text-yellow-700'
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    )
  }

  if (!transaction) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          icon={<ArrowLeft size={18} />}
          onClick={() => router.back()}
        >
          Voltar
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">
          Comprovante {transaction.tipo === 'deposito' ? 'Depósito' : 'Saque'}
        </h1>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/LOGO-ORIZON.png"
                alt="Orizon Pay"
                width={120}
                height={40}
                className="w-10 h-10 rounded-lg object-contain bg-white"
              />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  ORIZON PAY
                </h2>
                <p className="text-xs text-gray-600">Gateway de Pagamentos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">VALOR:</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Tipo:
              </p>
              <p className="text-base font-medium text-gray-900">
                {transaction.metodo}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Status:
              </p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  transaction.status,
                )}`}
              >
                {transaction.status_legivel}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Método de Iniciação:
              </p>
              <p className="text-base font-medium text-gray-900">
                {transaction.tipo === 'deposito'
                  ? 'QRCode Dinâmico'
                  : 'Chave PIX'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Identificador:
              </p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {transaction.transaction_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Liquidação:
              </p>
              <p className="text-base font-medium text-gray-900">
                {formatDate(transaction.data)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Movimento:
              </p>
              <p className="text-base font-medium text-gray-900">
                {transaction.movimento}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Origem:</h3>
              </div>

              <div className="space-y-3 pl-10">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">
                    Nome:
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.origem.nome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">
                    CPF / CNPJ:
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDocument(transaction.origem.documento)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Destino:
                </h3>
              </div>

              <div className="space-y-3 pl-10">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">
                    Nome:
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.destino.nome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-0.5">
                    CPF / CNPJ:
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDocument(transaction.destino.documento)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 text-center">
              Código de Autenticação:
            </p>
            <p className="text-base font-mono text-gray-900 text-center break-all bg-gray-50 p-4 rounded-lg">
              {transaction.codigo_autenticacao}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor Bruto:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa:</span>
                <span className="text-sm font-semibold text-red-600">
                  - {formatCurrency(transaction.taxa)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">
                  Valor Líquido
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(transaction.valor_liquido)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Processado por: {transaction.adquirente}</p>
            <p className="mt-1">{transaction.descricao}</p>
            <p className="mt-2 font-mono">
              ID da Transação: {transaction.transaction_id}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
})

export default ComprovantePage
