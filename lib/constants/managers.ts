// ==================== Validação ====================

/**
 * Regex para validação de email
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Regras de senha
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 255,
} as const

/**
 * Regras de percentual de gerente
 */
export const PERCENTAGE_RULES = {
  MIN: 0,
  MAX: 100,
  STEP: 0.01,
} as const

// ==================== Paginação ====================

/**
 * Configurações de paginação padrão
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PER_PAGE: 20,
  CLIENTS_PER_PAGE: 10,
  MAX_PER_PAGE: 100,
} as const

// ==================== Cache ====================

/**
 * Configurações de stale time para React Query
 */
export const CACHE_TIMES = {
  LIST: 1000 * 30,
  STATS: 1000 * 60,
  DETAILS: 1000 * 30,
} as const

// ==================== Mensagens ====================

/**
 * Mensagens de validação
 */
export const VALIDATION_MESSAGES = {
  REQUIRED_NAME: 'Nome é obrigatório',
  REQUIRED_EMAIL: 'Email é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  REQUIRED_PASSWORD: 'Senha é obrigatória',
  PASSWORD_MIN_LENGTH: `Senha deve ter no mínimo ${PASSWORD_RULES.MIN_LENGTH} caracteres`,
  PERCENTAGE_RANGE: `Percentual deve estar entre ${PERCENTAGE_RULES.MIN} e ${PERCENTAGE_RULES.MAX}`,
} as const

// ==================== Validação ====================

/**
 * Tipo para função de validação
 */
export type ValidationRule<T = Record<string, unknown>> = {
  field: string
  validate: (value: string, formData: T) => string | null
  condition?: (formData: T) => boolean
}

/**
 * Helper para criar regra de validação obrigatória
 */
export function requiredRule(field: string, message: string): ValidationRule {
  return {
    field,
    validate: (value: string) => {
      return value.trim() ? null : message
    },
  }
}

/**
 * Helper para criar regra de validação de email
 */
export function emailRule(message: string): ValidationRule {
  return {
    field: 'email',
    validate: (value: string) => {
      if (!value.trim()) {
        return null
      }
      return EMAIL_REGEX.test(value) ? null : message
    },
  }
}

/**
 * Helper para criar regra de validação de senha
 */
export function passwordRule(
  minLength: number,
  message: string,
): ValidationRule {
  return {
    field: 'password',
    validate: (value: string) => {
      if (!value.trim()) {
        return null
      }
      return value.length >= minLength ? null : message
    },
  }
}

/**
 * Helper para criar regra de validação de percentual
 */
export function percentageRule(
  min: number,
  max: number,
  message: string,
): ValidationRule {
  return {
    field: 'gerente_percentage',
    validate: (value: string) => {
      if (!value || !value.trim()) {
        return null
      }
      const normalizedValue = value.trim().replace(',', '.')
      const percentage = parseFloat(normalizedValue)
      if (isNaN(percentage) || percentage < min || percentage > max) {
        return message
      }
      return null
    },
  }
}

/**
 * Mensagens de sucesso/erro
 */
export const TOAST_MESSAGES = {
  CREATE_SUCCESS: 'Gerente criado com sucesso!',
  CREATE_ERROR: 'Erro ao criar gerente. Tente novamente.',
  UPDATE_SUCCESS: 'Gerente atualizado com sucesso!',
  UPDATE_ERROR: 'Erro ao atualizar gerente. Tente novamente.',
  DELETE_SUCCESS: 'Gerente excluído com sucesso!',
  DELETE_ERROR: 'Erro ao excluir gerente. Tente novamente.',
} as const
