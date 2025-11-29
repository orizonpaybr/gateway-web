'use client'

import React, { useMemo, useState, useCallback, memo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { ManagersTable } from '@/components/admin/managers/ManagersTable'
import { ManagerEditModal } from '@/components/admin/managers/ManagerEditModal'
import { ManagerClientsModal } from '@/components/admin/managers/ManagerClientsModal'
import { ManagerSummaryCards } from '@/components/admin/managers/ManagerSummaryCards'
import { Dialog } from '@/components/ui/Dialog'
import {
  useManagersList,
  useManagersStats,
  useCreateManager,
  useUpdateManager,
  useDeleteManager,
  useManagerClients,
} from '@/hooks/useManagers'
import { Manager, CreateManagerData, UpdateManagerData } from '@/lib/api'
import { USER_PERMISSION } from '@/lib/constants'
import { PAGINATION_CONFIG } from '@/lib/constants/managers'
import { Plus } from 'lucide-react'

const ManagersPage = memo(function ManagersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [filters, setFilters] = useState<{ search?: string }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editManager, setEditManager] = useState<Manager | null>(null)
  const [deleteManager, setDeleteManager] = useState<Manager | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [viewClientsManager, setViewClientsManager] = useState<Manager | null>(
    null,
  )
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false)
  const [clientsSearch, setClientsSearch] = useState('')
  const [clientsPage, setClientsPage] = useState(1)

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

  const { data: clientsData, isLoading: clientsLoading } = useManagerClients(
    viewClientsManager?.id || null,
    isClientsModalOpen,
    {
      search: clientsSearch || undefined,
      per_page: PAGINATION_CONFIG.CLIENTS_PER_PAGE,
      page: clientsPage,
    },
  )

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

  /**
   * Handlers memorizados para operações CRUD
   * Memorizados para evitar re-renders desnecessários
   */
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

  const handleViewClients = useCallback((manager: Manager) => {
    setViewClientsManager(manager)
    setIsClientsModalOpen(true)
    setClientsSearch('')
    setClientsPage(1)
  }, [])

  const handleClientsSearchChange = useCallback((value: string) => {
    setClientsSearch(value)
    setClientsPage(1)
  }, [])

  const handleClientsPageChange = useCallback((page: number) => {
    setClientsPage(page)
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
    if (!deleteManager) return
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
          <p className="text-gray-600 mt-1">
            Gerencie os gerentes do sistema e seus clientes vinculados
          </p>
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
        onViewClients={handleViewClients}
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
        {deleteManager && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Os clientes vinculados a este gerente
              não serão excluídos, mas perderão o vínculo com o gerente.
            </p>
          </div>
        )}
      </Dialog>

      <ManagerClientsModal
        open={isClientsModalOpen}
        onClose={() => {
          setIsClientsModalOpen(false)
          setViewClientsManager(null)
          setClientsSearch('')
          setClientsPage(1)
        }}
        manager={viewClientsManager}
        clients={clientsData?.clients || []}
        isLoading={clientsLoading}
        pagination={clientsData?.pagination}
        search={clientsSearch}
        onSearchChange={handleClientsSearchChange}
        onPageChange={handleClientsPageChange}
      />
    </div>
  )
})

export default ManagersPage
