'use client'

import React, { memo } from 'react'

import { Users, DollarSign, Search } from 'lucide-react'

import { TablePagination } from '@/components/admin/users/TablePagination'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import type { Manager, AdminUser } from '@/lib/api'
import { formatCurrency } from '@/lib/currency'

interface ManagerClientsModalProps {
  open: boolean
  onClose: () => void
  manager: Manager | null
  clients: AdminUser[]
  isLoading: boolean
  pagination?: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
  search?: string
  onSearchChange?: (value: string) => void
  onPageChange?: (page: number) => void
}

export const ManagerClientsModal = memo(
  ({
    open,
    onClose,
    manager,
    clients,
    isLoading,
    pagination,
    search,
    onSearchChange,
    onPageChange,
  }: ManagerClientsModalProps) => {
    if (!manager) {
      return null
    }

    const totalBalance = clients.reduce(
      (sum, client) => sum + (client.saldo || 0),
      0,
    )
    const totalTransactions = clients.reduce(
      (sum, client) => sum + (client.total_transacoes || 0),
      0,
    )

    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={`Clientes de ${manager.name}`}
        size="xl"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Users size={18} />
                <span className="text-sm font-medium">Total de Clientes</span>
              </div>
              {isLoading ? (
                <div className="h-8 w-12 bg-blue-100 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-blue-900">
                  {pagination?.total || clients.length || 0}
                </p>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign size={18} />
                <span className="text-sm font-medium">Saldo Total</span>
              </div>
              {isLoading ? (
                <div className="h-8 w-20 bg-green-100 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(totalBalance)}
                </p>
              )}
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <DollarSign size={18} />
                <span className="text-sm font-medium">Transações</span>
              </div>
              {isLoading ? (
                <div className="h-8 w-12 bg-purple-100 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-purple-900">
                  {totalTransactions === 0
                    ? '0'
                    : totalTransactions.toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Lista de Clientes
              </h4>
              {onSearchChange && (
                <div className="w-full lg:w-80 xl:w-96">
                  <Input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou CPF/CNPJ"
                    value={search ?? ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    icon={<Search size={18} />}
                  />
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>Nenhum cliente vinculado a este gerente</p>
              </div>
            ) : (
              <>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                            Nome
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                            Email
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                            Saldo
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                            Transações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="max-w-[200px] truncate">
                                {client.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="max-w-[220px] truncate">
                                {client.email}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                              {formatCurrency(client.saldo || 0)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                              {client.total_transacoes || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {pagination && onPageChange && (
                  <TablePagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    total={pagination.total}
                    perPage={pagination.per_page}
                    onPageChange={onPageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </Dialog>
    )
  },
)
