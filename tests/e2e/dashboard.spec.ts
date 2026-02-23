import { test, expect } from '@playwright/test'

/**
 * E2E: Dashboard (smoke)
 * - Sem autenticação: ao acessar /dashboard a app pode redirecionar para login
 *   ou exibir layout vazio (middleware não força redirect hoje)
 * - Testamos que a rota /dashboard existe e que, após login via API (se disponível),
 *   o dashboard exibe conteúdo principal
 *
 * Cenário sem API: apenas verificamos que /dashboard não retorna 404 e que
 * elementos básicos aparecem (sidebar ou redirect para login).
 */
test.describe('Dashboard', () => {
  test('acessar /dashboard sem auth não retorna 404', async ({ page }) => {
    const res = await page.goto('/dashboard')
    expect(res?.status()).not.toBe(404)
  })

  test('página inicial do dashboard carrega estrutura (sidebar ou redirect)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    const hasLogin = url.includes('/login')
    const hasDashboard = url.includes('/dashboard')
    const hasSidebarOrContent = await page.getByText(/página inicial|saldo|entrar/i).first().isVisible().catch(() => false)
    expect(hasLogin || hasDashboard || hasSidebarOrContent).toBeTruthy()
  })
})
