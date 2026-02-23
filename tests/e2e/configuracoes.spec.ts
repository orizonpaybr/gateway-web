import { test, expect } from '@playwright/test'

/**
 * E2E: Configurações — área sensível.
 * Garante que a tela de configurações carrega sem 404.
 */
test.describe('Configurações', () => {
  test.skip(
    !process.env.E2E_LOGIN_USER,
    'Requer E2E_LOGIN_USER e E2E_LOGIN_PASSWORD',
  )

  test('página de configurações carrega', async ({ page }) => {
    const res = await page.goto('/dashboard/configuracoes')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard\/configuracoes/)
    await expect(
      page.getByText(/configurações|configuração/i).first(),
    ).toBeVisible({ timeout: 10000 })
  })
})
