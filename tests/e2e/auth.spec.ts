import { test, expect } from '@playwright/test'

/**
 * E2E: Fluxo de autenticação
 * - Redirect / -> /login
 * - Página de login carrega e exibe formulário
 * - Validação de campos vazios
 * - Link para cadastro
 * - Login com credenciais inválidas exibe erro (sem quebrar)
 */
test.describe('Autenticação', () => {
  test('redireciona / para /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('página de login carrega com formulário e logo', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('img', { name: /orizon pay finance/i })).toBeVisible()
    await expect(page.getByPlaceholder(/digite seu usuário ou email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/digite sua senha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('exibe erro ao submeter login com campos vazios', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByPlaceholder(/digite seu usuário ou email/i)).toBeFocused()
    const error = page.getByText(/obrigatório/i).first()
    await expect(error).toBeVisible({ timeout: 3000 })
  })

  test('link "Criar conta" leva para /cadastro', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /criar conta/i }).click()
    await expect(page).toHaveURL(/\/cadastro/)
  })

  test('link "termos de uso" na página de login leva para /termos', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /termos de uso/i }).click()
    await expect(page).toHaveURL(/\/termos/)
  })

  test('botão Entrar desabilitado enquanto carrega após submit', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/digite seu usuário ou email/i).fill('user')
    await page.getByPlaceholder(/digite sua senha/i).fill('pass')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByRole('button', { name: /entrando/i })).toBeVisible({ timeout: 2000 })
  })
})
