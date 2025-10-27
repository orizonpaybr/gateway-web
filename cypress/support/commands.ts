/// <reference types="cypress" />

/**
 * Comando customizado para login
 */
Cypress.Commands.add(
  'login',
  (email = 'test@orizon.com', password = 'password123') => {
    cy.visit('/login')

    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()

    // Aguardar redirecionamento
    cy.url().should('include', '/dashboard')

    // Aguardar carregamento do dashboard
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible')
  },
)

/**
 * Comando customizado para logout
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click()
  cy.contains('Sair').click()
  cy.url().should('include', '/login')
})

/**
 * Comando customizado para visitar dashboard
 */
Cypress.Commands.add('visitDashboard', () => {
  cy.visit('/dashboard')
  cy.contains('Dashboard', { timeout: 10000 }).should('be.visible')
})

/**
 * Comando customizado para visitar configurações de integração
 */
Cypress.Commands.add('visitIntegrationSettings', () => {
  cy.visit('/dashboard')
  cy.contains('Configurações de Integração', { timeout: 10000 }).click()
  cy.url().should('include', '/dashboard#integracao')
})

// Prevent TypeScript from reading file as legacy script
export {}
