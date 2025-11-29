'use client'

import React, { memo } from 'react'
import { Manager } from '@/lib/api'
import { formatDateBR } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Edit, Trash2, Users, Search } from 'lucide-react'
import { TablePagination } from '@/components/admin/users/TablePagination'
import { Input } from '@/components/ui/Input'

interface ManagersTableProps {
  managers: Manager[]
  isLoading: boolean
  onEdit: (manager: Manager) => void
  onDelete: (manager: Manager) => void
  onViewClients: (manager: Manager) => void
  search?: string
  onSearchChange?: (value: string) => void
  pagination?: {
    currentPage: number
    lastPage: number
    total: number
    perPage: number
    onPageChange: (page: number) => void
  }
}

export const ManagersTable = memo(function ManagersTable({
  managers,
  isLoading,
  onEdit,
  onDelete,
  onViewClients,
  search,
  onSearchChange,
  pagination,
}: ManagersTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Gerentes
            </h3>
          </div>
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
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-gray-500">Carregando gerentes...</p>
        </div>
      </div>
    )
  }

  if (!managers || managers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Gerentes
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total: 0 gerente(s)</p>
          </div>
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
        <div className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Nenhum gerente encontrado
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Gerentes
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: {pagination?.total || managers.length} gerente(s)
          </p>
        </div>
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nome
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                CPF/CNPJ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Telefone
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Data Cadastro
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {managers.map((manager) => (
              <tr key={manager.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-[200px] text-sm font-medium text-gray-900 truncate">
                    {manager.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-[220px] truncate">{manager.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-[160px] truncate">
                    {manager.cpf_cnpj || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-[160px] truncate">
                    {manager.telefone || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      manager.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {manager.status === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {manager.created_at ? formatDateBR(manager.created_at) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Users size={16} />}
                      onClick={() => onViewClients(manager)}
                      title="Ver Clientes"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={16} />}
                      onClick={() => onEdit(manager)}
                      title="Editar"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => onDelete(manager)}
                      className="text-red-600 hover:text-red-700"
                      title="Excluir"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <TablePagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          total={pagination.total}
          perPage={pagination.perPage}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  )
})
