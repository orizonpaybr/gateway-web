import { toast } from 'sonner'

export interface AuthApiError extends Error {
  requiresCaptcha?: boolean
  retryAfter?: number
  sessionTerminated?: boolean
  requiresLogin?: boolean
}

interface AuthErrorPayload {
  message?: string
  requires_captcha?: boolean
  retry_after?: number
  session_terminated?: boolean
  requires_login?: boolean
}

export function createAuthError(
  message: string,
  options: Omit<AuthApiError, keyof Error | 'name'> = {},
): AuthApiError {
  const error = new Error(message) as AuthApiError
  Object.assign(error, options)
  return error
}

export function isAuthApiError(error: unknown): error is AuthApiError {
  if (!(error instanceof Error)) {
    return false
  }
  const candidate = error as AuthApiError
  return (
    candidate.requiresCaptcha !== undefined ||
    candidate.retryAfter !== undefined ||
    candidate.sessionTerminated !== undefined ||
    candidate.requiresLogin !== undefined
  )
}

export function getAuthApiError(error: unknown): AuthApiError {
  if (error instanceof Error) {
    return error as AuthApiError
  }
  return createAuthError('Erro desconhecido')
}

export function authErrorFromResponse(
  data: AuthErrorPayload,
  fallbackMessage: string,
): AuthApiError {
  return createAuthError(data.message || fallbackMessage, {
    requiresCaptcha: data.requires_captcha,
    retryAfter: data.retry_after,
    sessionTerminated: data.session_terminated,
    requiresLogin: data.requires_login,
  })
}

export function formatRetryAfterWait(retryAfter: number): string {
  const totalSeconds = Math.max(1, retryAfter)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes > 0) {
    return seconds > 0
      ? `${minutes} minuto(s) e ${seconds} segundo(s)`
      : `${minutes} minuto(s)`
  }

  return `${seconds} segundo(s)`
}

export function showAuthErrorToast(
  error: unknown,
  options: {
    title?: string
    onRequiresCaptcha?: () => void
  } = {},
): void {
  const err = getAuthApiError(error)
  const title = options.title ?? 'Erro'

  if (err.requiresCaptcha) {
    options.onRequiresCaptcha?.()
  }

  if (err.retryAfter) {
    toast.error('Muitas tentativas', {
      description: `Aguarde ${formatRetryAfterWait(err.retryAfter)} e tente novamente.`,
      duration: 8000,
    })
    return
  }

  toast.error(title, {
    description: err.message,
    duration: 4000,
  })
}
