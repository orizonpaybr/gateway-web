import { test, expect } from '@playwright/test'

/**
 * E2E: Admin — área muito sensível (usuários, aprovar saques).
 * Garante que as rotas existem; para não-admin pode redirecionar ou exibir acesso negado.
 */
test.describe('Admin', () => {
  test.skip(
    !process.env.E2E_LOGIN_USER,
    'Requer E2E_LOGIN_USER e E2E_LOGIN_PASSWORD',
  )

  test('rota admin/usuários não retorna 404', async ({ page }) => {
    const res = await page.goto('/dashboard/admin/usuarios')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    const url = page.url()
    const onAdmin = url.includes('/admin/usuarios')
    const hasContent =
      (await page.getByText(/usuários|usuarios|acesso negado|não autorizado/i).first().isVisible().catch(() => false)) ||
      (await page.getByRole('heading').first().isVisible().catch(() => false))
    expect(onAdmin || hasContent).toBeTruthy()
  })

  test('rota admin/aprovar-saques não retorna 404', async ({ page }) => {
    const res = await page.goto('/dashboard/admin/aprovar-saques')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    const url = page.url()
    const onAdmin = url.includes('/admin/aprovar-saques')
    const hasContent =
      (await page.getByText(/aprovar|saques|acesso negado|não autorizado/i).first().isVisible().catch(() => false)) ||
      (await page.getByRole('heading').first().isVisible().catch(() => false))
    expect(onAdmin || hasContent).toBeTruthy()
  })
})
