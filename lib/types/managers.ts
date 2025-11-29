/**
 * Type definitions para o módulo de Gerentes
 *
 * Segue padrões:
 * - Type Safety
 * - Documentação inline
 * - Reutilização de tipos
 * - Separação de concerns
 */

// ==================== Base Types ====================

/**
 * Interface base para um Gerente
 */
export interface Manager {
  id: number
  name: string
  email: string
  username: string
  cpf_cnpj?: string
  telefone?: string
  permission: number
  status: number
  gerente_percentage?: string | number
  created_at?: string
  total_clients?: number
}

/**
 * Dados para criar um novo gerente
 */
export interface CreateManagerData {
  name: string
  email: string
  password: string
  cpf_cnpj?: string
  telefone?: string
  gerente_percentage?: number
}

/**
 * Dados para atualizar um gerente existente
 * Todos os campos são opcionais exceto os que não podem ser mudados
 */
export interface UpdateManagerData {
  name?: string
  email?: string
  telefone?: string
  gerente_percentage?: number
}

// ==================== API Response Types ====================

/**
 * Response da API para lista de gerentes
 */
export interface ManagersListResponse {
  success: boolean
  data: {
    managers: Manager[]
    pagination: PaginationData
  }
}

/**
 * Response da API para estatísticas de gerentes
 */
export interface ManagersStatsResponse {
  success: boolean
  data: {
    total_managers: number
    active_managers: number
    inactive_managers: number
  }
}

/**
 * Response da API para operações de criar/atualizar gerente
 */
export interface ManagerMutationResponse {
  success: boolean
  data: {
    message: string
    user: Manager
  }
}

/**
 * Response da API para deletar gerente
 */
export interface ManagerDeleteResponse {
  success: boolean
  data: {
    message: string
  }
}

// ==================== Helper Types ====================

/**
 * Dados de paginação padrão
 */
export interface PaginationData {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

/**
 * Parâmetros para filtrar lista de gerentes
 */
export interface ManagerFilters {
  search?: string
  per_page?: number
  page?: number
}

/**
 * Parâmetros para filtrar clientes de um gerente
 */
export interface ManagerClientsFilters {
  search?: string
  per_page?: number
  page?: number
}

/**
 * Props para componente de paginação
 */
export interface PaginationProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

// ==================== Component Props Types ====================

/**
 * Props para ManagersTable
 */
export interface ManagersTableProps {
  managers: Manager[]
  isLoading: boolean
  onEdit: (manager: Manager) => void
  onDelete: (manager: Manager) => void
  onViewClients: (manager: Manager) => void
  search?: string
  onSearchChange?: (value: string) => void
  pagination?: PaginationProps
}

/**
 * Props para ManagerEditModal
 */
export interface ManagerEditModalProps {
  open: boolean
  onClose: () => void
  manager: Manager | null
  onSubmit: (data: CreateManagerData | UpdateManagerData) => Promise<void>
  isSaving: boolean
}

/**
 * Props para ManagerFilters
 */
export interface ManagerFiltersProps {
  onChange: (filters: { search?: string }) => void
}

/**
 * Props para ManagerSummaryCards
 */
export interface ManagerSummaryCardsProps {
  totalManagers: number
  activeManagers: number
  inactiveManagers: number
  isLoading: boolean
}

// ==================== Error Types ====================

/**
 * Estrutura de erro da API
 */
export interface ApiError {
  message: string
  success: false
  errors?: Record<string, string[]>
  status?: number
}

/**
 * Type guard para verificar se é um ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  )
}

/**
 * Extrair mensagem de erro de forma segura
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string,
): string {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}
