'use client'

import React, { useMemo, useState, useCallback, memo } from 'react'
import { Plus } from 'lucide-react'
import { ManagerEditModal } from '@/components/admin/managers/ManagerEditModal'
import { ManagersTable } from '@/components/admin/managers/ManagersTable'
import { ManagerSummaryCards } from '@/components/admin/managers/ManagerSummaryCards'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useAuth } from '@/contexts/AuthContext'
import {
  useManagersList,
  useManagersStats,
  useCreateManager,
  useUpdateManager,
  useDeleteManager,
} from '@/hooks/useManagers'
import type { Manager, CreateManagerData, UpdateManagerData } from '@/lib/api'
import { USER_PERMISSION } from '@/lib/constants'
import { PAGINATION_CONFIG } from '@/lib/constants/managers'

const ManagersPage = memo(() => {
  const { user, isLoading: authLoading } = useAuth()
  const [filters, setFilters] = useState<{ search?: string }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editManager, setEditManager] = useState<Manager | null>(null)
  const [deleteManager, setDeleteManager] = useState<Manager | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const isAdmin = useMemo(
    () =>
      !!user &&
      Number(user.permission) === USER_PERMISSION.ADMIN &&
      !authLoading,
    [user, authLoading],
  )

  const { data, isLoading } = useManagersList(
    {
      ...filters,
      per_page: PAGINATION_CONFIG.DEFAULT_PER_PAGE,
      page: currentPage,
    },
    isAdmin,
  )

  const { data: stats, isLoading: statsLoading } = useManagersStats(isAdmin)

  const createMutation = useCreateManager()
  const updateMutation = useUpdateManager()
  const deleteMutation = useDeleteManager()

  // Memorizar managers derivado
  const managers = useMemo(() => data?.managers || [], [data?.managers])

  // Memorizar pagination object
  const pagination = useMemo(
    () =>
      data?.pagination
        ? {
            currentPage: data.pagination.current_page,
            lastPage: data.pagination.last_page,
            total: data.pagination.total,
            perPage: data.pagination.per_page,
            onPageChange: (page: number) => {
              setCurrentPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            },
          }
        : undefined,
    [data?.pagination],
  )

  const handleCreate = useCallback(() => {
    setEditManager(null)
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((manager: Manager) => {
    setEditManager(manager)
    setIsFormOpen(true)
  }, [])

  const handleDeleteRequest = useCallback((manager: Manager) => {
    setDeleteManager(manager)
    setIsDeleteOpen(true)
  }, [])

  const handleSubmit = useCallback(
    async (data: CreateManagerData | UpdateManagerData) => {
      if (editManager) {
        await updateMutation.mutateAsync({
          managerId: editManager.id,
          data,
        })
      } else {
        await createMutation.mutateAsync(data as CreateManagerData)
      }
      setIsFormOpen(false)
      setEditManager(null)
      setCurrentPage(1)
    },
    [editManager, updateMutation, createMutation],
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteManager) {
      return
    }
    try {
      await deleteMutation.mutateAsync(deleteManager.id)
      setIsDeleteOpen(false)
      setDeleteManager(null)
      setCurrentPage(1)
    } catch {
      // Error já é tratado pelo hook
    }
  }, [deleteManager, deleteMutation])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Gerentes
          </h1>
          <p className="text-gray-600 mt-1">Gerencie os gerentes do sistema</p>
        </div>
        <Button
          icon={<Plus size={20} />}
          onClick={handleCreate}
          className="w-full lg:w-auto"
        >
          Novo Gerente
        </Button>
      </div>

      <ManagerSummaryCards
        totalManagers={stats?.total_managers || 0}
        activeManagers={stats?.active_managers || 0}
        inactiveManagers={stats?.inactive_managers || 0}
        isLoading={statsLoading}
      />
      <ManagersTable
        managers={managers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        search={filters.search || ''}
        onSearchChange={(value) => {
          setFilters({ search: value || undefined })
          setCurrentPage(1)
        }}
        pagination={pagination}
      />

      <ManagerEditModal
        key={isFormOpen ? `modal-${editManager?.id || 'new'}` : 'modal-closed'}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditManager(null)
        }}
        manager={editManager}
        onSubmit={handleSubmit}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Excluir gerente"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir o gerente{' '}
          <span className="font-medium text-gray-900">
            {deleteManager?.name}
          </span>
          ? Esta ação não pode ser desfeita.
        </p>
      </Dialog>
    </div>
  )
})

export default ManagersPage
