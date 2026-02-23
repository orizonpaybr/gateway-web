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
    await page.getByPlaceholder(/usuario/i).fill('user123')
    await page.getByPlaceholder(/email@exemplo/i).fill('email@test.com')
    await page.getByRole('button', { name: /selecione seu gênero/i }).click()
    await page.getByRole('button', { name: /masculino/i }).click()
    await page.getByRole('button', { name: /próximo/i }).click()
    await expect(page.getByText(/nome completo é obrigatório|mínimo 3/i)).toBeVisible({ timeout: 3000 })
  })

  test('link "Fazer login" leva para /login', async ({ page }) => {
    await page.getByRole('link', { name: /fazer login/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('link termos na página de cadastro leva para /termos', async ({ page }) => {
    await page.getByRole('link', { name: /termos de uso/i }).click()
    await expect(page).toHaveURL(/\/termos/)
  })
})
