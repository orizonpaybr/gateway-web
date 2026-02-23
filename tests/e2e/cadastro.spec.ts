import { test, expect } from '@playwright/test'

/**
 * E2E: Página de cadastro (step 1)
 * - Página carrega com etapa 1 (Dados Pessoais)
 * - Campos e botão Próximo visíveis
 * - Validação de campos (nome, email, etc.)
 * - Link para login
 */
test.describe('Cadastro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cadastro')
  })

  test('página de cadastro carrega com etapa 1 (Dados Pessoais)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dados pessoais/i })).toBeVisible()
    await expect(page.getByPlaceholder(/seu nome completo/i)).toBeVisible()
    await expect(page.getByPlaceholder(/usuario/i)).toBeVisible()
    await expect(page.getByPlaceholder(/email@exemplo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /próximo/i })).toBeVisible()
    await expect(page.getByText(/etapa 1 de 3/i)).toBeVisible()
  })

  test('validação do step 1: nome curto exibe erro', async ({ page }) => {
    await page.getByPlaceholder(/seu nome completo/i).fill('Ab')
    // Validação é em onChange; o botão Próximo fica desabilitado quando o form é inválido
    await expect(
      page.getByText(/nome completo é obrigatório|mínimo 3/i),
    ).toBeVisible({ timeout: 5000 })
  })

  test('link "Fazer login" leva para /login', async ({ page }) => {
    await page.getByRole('link', { name: /fazer login/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('link termos na página de cadastro leva para /termos', async ({ page }) => {
    const link = page.getByRole('link', { name: /termos de uso/i })
    await link.scrollIntoViewIfNeeded()
    await link.click()
    await expect(page).toHaveURL(/\/termos/, { timeout: 10000 })
  })
})
