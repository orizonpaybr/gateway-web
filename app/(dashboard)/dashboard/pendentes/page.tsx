'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Clock, CheckCircle, XCircle, Search } from 'lucide-react'

export default function PendentesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const transacoesPendentes = [
    {
      id: '1',
      description: 'Recebimento - Aguardando confirmação',
      reference: 'REF-2025-010',
      value: 1450.0,
      date: '07/10/2025 15:30',
      type: 'entrada',
      reason: 'Aguardando confirmação do banco',
    },
    {
      id: '2',
      description: 'Saque - Em processamento',
      reference: 'REF-2025-011',
      value: -800.0,
      date: '07/10/2025 14:20',
      type: 'saida',
      reason: 'Processamento bancário',
    },
    {
      id: '3',
      description: 'Transferência Pix - Análise',
      reference: 'REF-2025-012',
      value: -250.0,
      date: '07/10/2025 11:15',
      type: 'saida',
      reason: 'Em análise de segurança',
    },
  ]

  const filteredTransacoes = transacoesPendentes.filter((transacao) =>
    searchTerm
      ? transacao.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transacao.reference.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  )

  const valorTotal = transacoesPendentes.reduce(
    (acc, t) => acc + Math.abs(t.value),
    0,
  )

  const handleApprove = (id: string) => {
    console.log('Aprovar transação:', id)
    alert('Funcionalidade será implementada com a integração da API')
  }

  const handleReject = (id: string) => {
    console.log('Rejeitar transação:', id)
    alert('Funcionalidade será implementada com a integração da API')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Transações Pendentes
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Gerencie transações que aguardam aprovação ou processamento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Transações Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {transacoesPendentes.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Valor Total Pendente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {valorTotal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Input
          placeholder="Buscar por descrição ou referência..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </Card>

      {filteredTransacoes.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma transação pendente!
            </h3>
            <p className="text-gray-600">
              Todas as suas transações foram processadas.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransacoes.map((transacao) => (
            <Card key={transacao.id} hover>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                    <Clock size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {transacao.description}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          transacao.type === 'entrada'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transacao.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Referência: {transacao.reference}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Valor: </span>
                        <span
                          className={`font-semibold ${
                            transacao.value > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transacao.value > 0 ? '+' : ''}
                          {transacao.value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Data: </span>
                        <span className="text-gray-900">{transacao.date}</span>
                      </div>
                    </div>
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                      <p className="text-xs text-yellow-800">
                        <span className="font-medium">Motivo: </span>
                        {transacao.reason}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <Button
                    size="sm"
                    icon={<CheckCircle size={16} />}
                    onClick={() => handleApprove(transacao.id)}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<XCircle size={16} />}
                    onClick={() => handleReject(transacao.id)}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
