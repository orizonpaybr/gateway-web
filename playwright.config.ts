import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para testes E2E
 * Foca em: Login, Cadastro, Performance, Escalabilidade e Concorrência
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000, // 60 segundos de timeout por teste
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, // 10 segundos para ações
    navigationTimeout: 30000, // 30 segundos para navegação
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [
        /auth\.setup\.ts/,
        /dashboard-logado\.spec\.ts/,
        /extrato\.spec\.ts/,
        /pix\.spec\.ts/,
        /conta\.spec\.ts/,
        /admin\.spec\.ts/,
        /configuracoes\.spec\.ts/,
      ],
    },
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: [
        /dashboard-logado\.spec\.ts/,
        /extrato\.spec\.ts/,
        /pix\.spec\.ts/,
        /conta\.spec\.ts/,
        /admin\.spec\.ts/,
        /configuracoes\.spec\.ts/,
      ],
    },
  ],

  webServer: process.env.CI
    ? {
        command: 'yarn start',
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 60 * 1000,
      }
    : undefined,
})
