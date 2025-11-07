'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { UsersTable } from '@/components/admin/users/UsersTable'
import { UserFilters } from '@/components/admin/users/UserFilters'
import { UserEditModal } from '@/components/admin/users/UserEditModal'
import { Dialog } from '@/components/ui/Dialog'
import {
  useAdminUsersList,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useApproveUser,
  useToggleBlockUser,
  useAdminUser,
} from '@/hooks/useAdminUsers'
import { UserViewModal } from '@/components/admin/users/UserViewModal'
import { UserFeesModal } from '@/components/admin/users/UserFeesModal'
import { UserAffiliateModal } from '@/components/admin/users/UserAffiliateModal'
import { UserSummaryCards } from '@/components/admin/users/UserSummaryCards'
import { useUserStats } from '@/hooks/useAdminUsers'
import { AdminUser, UpdateUserData } from '@/lib/api'
import { USER_PERMISSION } from '@/lib/constants'

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [filters, setFilters] = useState<{ search?: string; status?: number }>(
    {},
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [viewUserId, setViewUserId] = useState<number | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isFeesOpen, setIsFeesOpen] = useState(false)
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false)

  const isAdmin = useMemo(
    () =>
      !!user &&
      Number(user.permission) === USER_PERMISSION.ADMIN &&
      !authLoading,
    [user, authLoading],
  )

  const { data, isLoading } = useAdminUsersList(
    {
      ...filters,
      per_page: 20,
      page: currentPage,
    },
    isAdmin,
  )

  const { data: userStats, isLoading: statsLoading } = useUserStats(isAdmin)

  const approveMutation = useApproveUser()
  const toggleBlockMutation = useToggleBlockUser()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const { data: viewUserData } = useAdminUser(
    viewUserId,
    isViewOpen || isFeesOpen || isFormOpen || isAffiliateOpen,
  )

  // Memorizar users derivado
  const users = useMemo(() => data?.users || [], [data?.users])

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

  // Handlers memorizados
  const handleApprove = useCallback(
    async (u: AdminUser) => {
      try {
        await approveMutation.mutateAsync(u.id)
        setCurrentPage(1)
      } catch {
        // Error já é tratado pelo hook
      }
    },
    [approveMutation],
  )

  const handleToggleBlock = useCallback(
    async (u: AdminUser) => {
      try {
        const isBlocked = u.banido ?? false

        if (isBlocked) {
          // Se está bloqueado, desbloquear
          // Se nunca foi aprovado, desbloquear e aprovar
          const shouldApprove = !(u.aprovado_alguma_vez ?? false)

          await toggleBlockMutation.mutateAsync({
            userId: u.id,
            block: false,
            approve: shouldApprove,
          })
        } else {
          // Se não está bloqueado, bloquear
          await toggleBlockMutation.mutateAsync({
            userId: u.id,
            block: true,
            approve: false,
          })
        }
        setCurrentPage(1)
      } catch {
        // Error já é tratado pelo hook
      }
    },
    [toggleBlockMutation],
  )

  const handleUpdate = useCallback(
    async (userId: number, data: UpdateUserData) => {
      try {
        await updateMutation.mutateAsync({ userId, data })
        setIsFormOpen(false)
        setEditUser(null)
        setViewUserId(null) // Limpar viewUserId após atualização
      } catch {
        // Error já é tratado pelo hook
      }
    },
    [updateMutation],
  )

  // Handler específico para atualização de taxas
  const handleUpdateFees = useCallback(
    async (userId: number, data: UpdateUserData) => {
      try {
        await updateMutation.mutateAsync({ userId, data })
        // Fechar modal de taxas após sucesso
        setIsFeesOpen(false)
        setViewUserId(null) // Limpar viewUserId após atualização
      } catch {
        // Error já é tratado pelo hook (toast será exibido)
      }
    },
    [updateMutation],
  )

  const handleDeleteRequest = useCallback((u: AdminUser) => {
    setDeleteUser(u)
    setIsDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteUser) return
    try {
      await deleteMutation.mutateAsync(deleteUser.id)
      setIsDeleteOpen(false)
      setDeleteUser(null)
      setCurrentPage(1)
    } catch {
      // Error já é tratado pelo hook
    }
  }, [deleteUser, deleteMutation])

  // Handler memorizado para filtros
  const handleFiltersChange = useCallback(
    (newFilters: { search?: string; status?: number | undefined }) => {
      setFilters(newFilters)
      setCurrentPage(1)
    },
    [],
  )

  // Handlers memorizados para modais
  const handleView = useCallback((u: AdminUser) => {
    setViewUserId(u.id)
    setIsViewOpen(true)
  }, [])

  const handleFees = useCallback((u: AdminUser) => {
    setViewUserId(u.id)
    setIsFeesOpen(true)
  }, [])

  const handleAffiliate = useCallback((u: AdminUser) => {
    setViewUserId(u.id)
    setIsAffiliateOpen(true)
  }, [])

  const handleEdit = useCallback((u: AdminUser) => {
    // Definir viewUserId para buscar dados completos do usuário (incluindo telefone e data_nascimento)
    setViewUserId(u.id)
    setEditUser(u)
    setIsFormOpen(true)
  }, [])

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie os usuários do sistema</p>
        </div>
      </div>

      <UserSummaryCards
        totalRegistrations={userStats?.total_registrations || 0}
        monthRegistrations={userStats?.month_registrations || 0}
        pendingRegistrations={userStats?.pending_registrations || 0}
        bannedUsers={userStats?.banned_users || 0}
        isLoading={statsLoading}
      />

      <UserFilters onChange={handleFiltersChange} />

      <UsersTable
        users={users}
        isLoading={isLoading}
        onView={handleView}
        onFees={handleFees}
        onAffiliate={handleAffiliate}
        onApprove={handleApprove}
        onToggleBlock={handleToggleBlock}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        pagination={pagination}
      />

      <UserEditModal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setViewUserId(null) // Limpar viewUserId ao fechar
          setEditUser(null)
        }}
        // Priorizar viewUserData quando disponível (tem dados completos), senão usar editUser
        user={viewUserData ?? editUser}
        onSubmit={handleUpdate}
      />

      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Excluir usuário"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir o usuário{' '}
          <span className="font-medium text-gray-900">
            {deleteUser?.name || deleteUser?.username}
          </span>
          ? Esta ação não pode ser desfeita.
        </p>
      </Dialog>

      <UserViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        user={viewUserData}
      />

      <UserFeesModal
        open={isFeesOpen}
        onClose={() => {
          setIsFeesOpen(false)
          setViewUserId(null) // Limpar viewUserId ao fechar
        }}
        user={viewUserData}
        onSubmit={handleUpdateFees}
        isSaving={updateMutation.isPending}
      />

      <UserAffiliateModal
        open={isAffiliateOpen}
        onClose={() => setIsAffiliateOpen(false)}
        user={viewUserData}
      />
    </div>
  )
}
