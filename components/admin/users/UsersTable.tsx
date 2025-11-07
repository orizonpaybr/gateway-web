import React, { memo } from 'react'
import { AdminUser } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import {
  Eye,
  DollarSign,
  Users,
  CheckCircle2,
  Ban,
  Unlock,
  Pencil,
  Trash2,
  User,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { TablePagination } from './TablePagination'
import { USER_STATUS } from '@/lib/constants'
import {
  getStatusLabel,
  getStatusColor,
  getPermissionLabel,
  getPermissionColor,
} from '@/lib/helpers/userStatus'
import { useFormatDate, useFormatCurrency } from '@/lib/helpers/formatting'

interface UsersTableProps {
  users: AdminUser[]
  isLoading?: boolean
  onView?: (user: AdminUser) => void
  onFees?: (user: AdminUser) => void
  onAffiliate?: (user: AdminUser) => void
  onApprove?: (user: AdminUser) => void
  onToggleBlock?: (user: AdminUser) => void
  onEdit?: (user: AdminUser) => void
  onDelete?: (user: AdminUser) => void
  pagination?: {
    currentPage: number
    lastPage: number
    total: number
    perPage: number
    onPageChange: (page: number) => void
  }
}

export const UsersTable = memo(function UsersTable({
  users,
  isLoading,
  onView,
  onFees,
  onAffiliate,
  onApprove,
  onToggleBlock,
  onEdit,
  onDelete,
  pagination,
}: UsersTableProps) {
  // Usar hooks de formatação
  const formatDate = useFormatDate()
  const formatCurrency = useFormatCurrency()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-3">Usuário</th>
            <th className="text-left px-4 py-3">CPF/CNPJ</th>
            <th className="text-left px-4 py-3">Permissão</th>
            <th className="text-left px-4 py-3">Adquirente</th>
            <th className="text-left px-4 py-3 whitespace-nowrap">Vendas 7d</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Criado</th>
            <th className="text-right px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            return (
              <tr
                key={u.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {u.name || u.username}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.cpf_cnpj || '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getPermissionColor(
                      u.permission,
                    )}`}
                  >
                    {u.permission_text || getPermissionLabel(u.permission)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {u.adquirente || 'Padrão'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {formatCurrency(u.vendas_7d)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      u,
                    )}`}
                  >
                    {getStatusLabel(u)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatDate(u.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                    {u.status === USER_STATUS.PENDING && !u.banido && (
                      <Button
                        size="sm"
                        onClick={() => onApprove?.(u)}
                        className="px-2 sm:px-3"
                        title="Aprovar"
                      >
                        <CheckCircle2 size={16} />
                      </Button>
                    )}
                    {u.banido ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggleBlock?.(u)}
                        className="px-2 sm:px-3 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                        title={
                          u.aprovado_alguma_vez
                            ? 'Desbloquear'
                            : 'Desbloquear e Aprovar'
                        }
                      >
                        <Unlock size={16} />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggleBlock?.(u)}
                        className="px-2 sm:px-3 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Bloquear"
                      >
                        <Ban size={16} />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView?.(u)}
                      className="px-2 sm:px-3"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(u)}
                      className="px-2 sm:px-3"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFees?.(u)}
                      className="px-2 sm:px-3"
                    >
                      <DollarSign size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAffiliate?.(u)}
                      className="px-2 sm:px-3"
                    >
                      <Users size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 px-2 sm:px-3"
                      onClick={() => onDelete?.(u)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
