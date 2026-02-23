import { test, expect } from '@playwright/test'

/**
 * E2E: PIX (depositar e chave) — fluxo crítico de entrada de dinheiro.
 * Garante que as telas carregam e exibem formulário ou instruções.
 */
test.describe('PIX', () => {
  test.skip(
    !process.env.E2E_LOGIN_USER,
    'Requer E2E_LOGIN_USER e E2E_LOGIN_PASSWORD',
  )

  test('página Depositar via PIX carrega', async ({ page }) => {
    const res = await page.goto('/dashboard/pix/depositar')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard\/pix\/depositar/)
    await expect(
      page.getByRole('heading', { name: /depositar via pix/i }),
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByText(/como funciona|gerar qr code|escolha o valor/i).first(),
    ).toBeVisible()
  })

  test('página Chave PIX carrega', async ({ page }) => {
    const res = await page.goto('/dashboard/pix/chave')
    expect(res?.status()).not.toBe(404)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard\/pix\/chave/)
    await expect(
      page.getByText(/chave pix|pix|chave/i).first(),
    ).toBeVisible({ timeout: 10000 })
  })
})
