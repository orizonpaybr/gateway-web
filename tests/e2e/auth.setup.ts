import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const authFile = path.join(process.cwd(), '.auth', 'user.json')

/**
 * Setup de autenticação para testes E2E que precisam de usuário logado.
 * Roda uma vez; salva o estado em .auth/user.json para o projeto "with-auth".
 * Se E2E_LOGIN_USER e E2E_LOGIN_PASSWORD não estiverem definidos, salva estado vazio
 * para o arquivo existir e os specs com login usam test.skip().
 */
setup('autenticar e salvar estado', async ({ page }) => {
  const user = process.env.E2E_LOGIN_USER
  const password = process.env.E2E_LOGIN_PASSWORD

  const dir = path.dirname(authFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!user || !password) {
    await page.goto('/')
    await page.context().storageState({ path: authFile })
    return
  }

  await page.goto('/login')
  await page.getByPlaceholder(/digite seu usuário ou email/i).fill(user)
  await page.getByPlaceholder(/digite sua senha/i).fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  await page.context().storageState({ path: authFile })
})
