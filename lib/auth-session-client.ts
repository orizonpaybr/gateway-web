export async function syncAuthSessionToken(token: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error('Falha ao sincronizar sessão autenticada')
  }
}

export async function syncAuthSession2FAPending(): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pending2FA: true }),
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error('Falha ao sincronizar sessão 2FA pendente')
  }
}

export async function clearAuthSession(): Promise<void> {
  await fetch('/api/auth/session', {
    method: 'DELETE',
    credentials: 'same-origin',
  })
}
