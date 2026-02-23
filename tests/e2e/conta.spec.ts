import { test, expect } from '@playwright/test'

/**
 * E2E: Conta — dados do usuário e área sensível.
 * Garante que a tela de conta carrega sem 404.
 */
test.describe('Conta', () => {
  test.skip(
    !process.env.E2E_LOGIN_USER,
    'Requer E2E_LOGIN_USER e E2E_LOGIN_PASSWORD',
  )

  test('página de conta carrega', async ({ page }) => {
    const res = await page.goto('/dashboard/conta')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard\/conta/)
    await expect(
      page.getByText(/conta|dados|perfil|usuário/i).first(),
    ).toBeVisible({ timeout: 10000 })
  })
})
