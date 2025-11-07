/**
 * Helpers para status e permissões de usuário
 * Centraliza lógica de status (DRY)
 * Similar ao UserStatusHelper do backend
 */

import { AdminUser } from '@/lib/api'
import {
  USER_STATUS,
  USER_PERMISSION,
  USER_STATUS_LABELS,
  USER_PERMISSION_LABELS,
} from '@/lib/constants'

/**
 * Obter label de status do usuário
 *
 * Regras:
 * - "Bloqueado" se banido = true
 * - "Inativo" se status = INACTIVE e banido = false (excluído)
 * - Caso contrário, usar texto padrão do status
 */
export function getStatusLabel(user: AdminUser): string {
  // Se tem status_text do backend, usar ele (já vem "Bloqueado" ou "Inativo" correto)
  if (user.status_text) {
    return user.status_text
  }

  // Se está bloqueado, sempre mostrar "Bloqueado"
  if (user.banido) {
    return 'Bloqueado'
  }

  // Se está inativo e não banido, é um usuário excluído
  if (user.status === USER_STATUS.INACTIVE && !user.banido) {
    return 'Inativo'
  }

  // Caso contrário, usar texto padrão do status
  return USER_STATUS_LABELS[user.status] || 'INATIVO'
}

/**
 * Obter cor de status do usuário (classes Tailwind)
 */
export function getStatusColor(user: AdminUser): string {
  // Se está bloqueado, cor vermelha
  if (user.banido) {
    return 'bg-red-50 text-red-700'
  }

  // Se está inativo (excluído), cor cinza
  if (user.status === USER_STATUS.INACTIVE && !user.banido) {
    return 'bg-gray-100 text-gray-600'
  }

  // Status normal
  if (user.status === USER_STATUS.ACTIVE) {
    return 'bg-green-50 text-green-700'
  }
  if (user.status === USER_STATUS.PENDING) {
    return 'bg-yellow-50 text-yellow-700'
  }

  return 'bg-gray-100 text-gray-600'
}

/**
 * Obter label de permissão
 */
export function getPermissionLabel(permission?: number): string {
  if (permission === undefined || permission === null) {
    return 'CLIENTE'
  }
  return USER_PERMISSION_LABELS[permission] || 'CLIENTE'
}

/**
 * Obter cor de permissão (classes Tailwind)
 */
export function getPermissionColor(permission?: number): string {
  if (permission === undefined || permission === null) {
    return 'bg-gray-100 text-gray-600'
  }
  if (permission === USER_PERMISSION.ADMIN) {
    return 'bg-red-50 text-red-700'
  }
  if (permission === USER_PERMISSION.MANAGER) {
    return 'bg-blue-50 text-blue-700'
  }
  return 'bg-gray-100 text-gray-600'
}

/**
 * Verificar se usuário está bloqueado
 */
export function isBlocked(user: AdminUser): boolean {
  return Boolean(user.banido)
}

/**
 * Verificar se usuário está excluído (inativo)
 */
export function isDeleted(user: AdminUser): boolean {
  return user.status === USER_STATUS.INACTIVE && !user.banido
}

/**
 * Verificar se usuário pode fazer login
 * (Não está bloqueado nem excluído)
 */
export function canLogin(user: AdminUser): boolean {
  return !isBlocked(user) && !isDeleted(user)
}
