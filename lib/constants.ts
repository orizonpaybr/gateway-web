// Status de usuário
export const USER_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

// Permissões de usuário
export const USER_PERMISSION = {
  CLIENT: 1,
  MANAGER: 2,
  ADMIN: 3,
} as const

export type UserPermission =
  (typeof USER_PERMISSION)[keyof typeof USER_PERMISSION]

// Labels para status
export const USER_STATUS_LABELS: Record<number, string> = {
  [USER_STATUS.INACTIVE]: 'Inativo',
  [USER_STATUS.ACTIVE]: 'Aprovado',
  [USER_STATUS.PENDING]: 'Pendente',
}

// Status adicional para bloqueado
export const USER_STATUS_BLOCKED = 'Bloqueado'

// Labels para permissões
export const USER_PERMISSION_LABELS: Record<number, string> = {
  [USER_PERMISSION.CLIENT]: 'Cliente',
  [USER_PERMISSION.MANAGER]: 'Gerente',
  [USER_PERMISSION.ADMIN]: 'Administrador',
}

// Opções de status para Select
export const USER_STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  {
    label: USER_STATUS_LABELS[USER_STATUS.ACTIVE],
    value: String(USER_STATUS.ACTIVE),
  },
  {
    label: USER_STATUS_LABELS[USER_STATUS.PENDING],
    value: String(USER_STATUS.PENDING),
  },
  {
    label: USER_STATUS_LABELS[USER_STATUS.INACTIVE],
    value: String(USER_STATUS.INACTIVE),
  },
]

// Opções de permissão para Select
export const USER_PERMISSION_OPTIONS = [
  {
    label: USER_PERMISSION_LABELS[USER_PERMISSION.CLIENT],
    value: USER_PERMISSION.CLIENT,
  },
  {
    label: USER_PERMISSION_LABELS[USER_PERMISSION.MANAGER],
    value: USER_PERMISSION.MANAGER,
  },
  {
    label: USER_PERMISSION_LABELS[USER_PERMISSION.ADMIN],
    value: USER_PERMISSION.ADMIN,
  },
]
