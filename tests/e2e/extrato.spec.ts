import { test, expect } from '@playwright/test'

/**
 * E2E: Extrato (depósitos e saques) — área sensível para o usuário.
 * Garante que as telas carregam sem 404 e exibem título e estrutura.
 */
test.describe('Extrato', () => {
  test.skip(
    !process.env.E2E_LOGIN_USER,
    'Requer E2E_LOGIN_USER e E2E_LOGIN_PASSWORD',
  )

  test('página de depósitos carrega', async ({ page }) => {
    const res = await page.goto('/dashboard/extrato/depositos')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard\/extrato\/depositos/)
    await expect(
      page.getByRole('heading', { name: /extrato da conta/i }),
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByPlaceholder(/buscar depósitos/i),
    ).toBeVisible()
  })

  test('página de saques carrega', async ({ page }) => {
    const res = await page.goto('/dashboard/extrato/saques')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard\/extrato\/saques/)
    await expect(
      page.getByRole('heading', { name: /saques/i }),
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByPlaceholder(/buscar por saques/i),
    ).toBeVisible()
  })
})
