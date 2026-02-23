import { test, expect } from '@playwright/test'

/**
 * E2E: Dashboard com usuário logado (área essencial).
 * Garante que a página inicial do dashboard carrega e exibe conteúdo principal.
 * Requer E2E_LOGIN_USER e E2E_LOGIN_PASSWORD; caso contrário os testes são pulados.
 */
test.describe('Dashboard (logado)', () => {
  test.skip(
    !process.env.E2E_LOGIN_USER,
    'Requer E2E_LOGIN_USER e E2E_LOGIN_PASSWORD',
  )

  test('exibe página inicial com Saldo e Acesso Rápido', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(
      page.getByRole('heading', { name: /acesso rápido/i }),
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByText(/saldo|entradas|saídas|splits/i).first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('acesso rápido tem link para PIX e Buscar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: /pix com chave/i })).toBeVisible({
      timeout: 10000,
    })
    await expect(
      page.getByRole('button', { name: /buscar transações/i }),
    ).toBeVisible()
  })
})
