import { test, expect } from '@playwright/test'

/**
 * E2E: Página de Termos de Uso
 * - Página carrega com título e conteúdo
 * - Botão Voltar presente
 */
test.describe('Termos de Uso', () => {
  test('página de termos carrega com título e seções', async ({ page }) => {
    await page.goto('/termos')
    await expect(page.getByRole('heading', { name: /termos de uso/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /1\. definições/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /2\. aceitação dos termos/i })).toBeVisible()
  })

  test('exibe logo Orizon Pay', async ({ page }) => {
    await page.goto('/termos')
    await expect(page.getByRole('img', { name: /orizon pay finance/i })).toBeVisible()
  })

  test('botão Voltar está visível', async ({ page }) => {
    await page.goto('/termos')
    await expect(page.getByRole('button', { name: /voltar/i })).toBeVisible()
  })
})
