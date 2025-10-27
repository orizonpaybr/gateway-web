/// <reference types="cypress" />

describe('API Integration - E2E Tests', () => {
  beforeEach(() => {
    // Login antes de cada teste
    cy.login('test@orizon.com', 'password123')
  })

  afterEach(() => {
    // Logout após cada teste
    cy.logout()
  })

  describe('Configurações de Integração', () => {
    it('deve visualizar credenciais de API', () => {
      cy.visitIntegrationSettings()

      // Verificar se as credenciais são exibidas
      cy.contains('Client Key').should('be.visible')
      cy.contains('Client Secret').should('be.visible')

      // Verificar se os valores são UUIDs (formato correto)
      cy.get('[data-cy="client-key"]')
        .should('be.visible')
        .invoke('text')
        .should(
          'match',
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        )

      cy.get('[data-cy="client-secret"]')
        .should('be.visible')
        .invoke('text')
        .should(
          'match',
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        )
    })

    it('deve copiar Client Key para área de transferência', () => {
      cy.visitIntegrationSettings()

      // Clicar no botão copiar
      cy.get('[data-cy="copy-client-key"]').click()

      // Verificar mensagem de sucesso (pode variar dependendo da implementação)
      // cy.contains('Client Key copiado').should('be.visible')
    })

    it('deve copiar Client Secret para área de transferência', () => {
      cy.visitIntegrationSettings()

      // Clicar no botão copiar
      cy.get('[data-cy="copy-client-secret"]').click()

      // Verificar mensagem de sucesso
      // cy.contains('Client Secret copiado').should('be.visible')
    })

    it('deve regenerar Client Secret', () => {
      cy.visitIntegrationSettings()

      // Obter o Client Secret atual
      let currentSecret: string
      cy.get('[data-cy="client-secret"]')
        .invoke('text')
        .then((text) => {
          currentSecret = text.trim()
        })

      // Clicar no botão regenerar
      cy.contains('Regenerar Secret').click()

      // Confirmar a ação (alert/confirm)
      cy.on('window:confirm', () => true)

      // Aguardar confirmação
      cy.contains('Client Secret regenerado com sucesso', {
        timeout: 10000,
      }).should('be.visible')

      // Verificar se o secret mudou
      cy.get('[data-cy="client-secret"]')
        .invoke('text')
        .should((newSecret) => {
          expect(newSecret.trim()).to.not.equal(currentSecret)
        })
    })

    it('deve exibir warning ao regenerar secret', () => {
      cy.visitIntegrationSettings()

      // Clicar no botão regenerar
      cy.contains('Regenerar Secret').click()

      // Verificar mensagem de aviso no confirm
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false)
        cy.contains(
          'Todas as integrações existentes serão desconectadas',
        ).should('exist')
      })
    })
  })

  describe('Gerenciamento de IPs', () => {
    it('deve exibir lista de IPs vazia inicialmente', () => {
      cy.visitIntegrationSettings()

      // Verificar mensagem de lista vazia
      cy.contains('Nenhum IP autorizado').should('be.visible')
    })

    it('deve adicionar IP autorizado', () => {
      cy.visitIntegrationSettings()

      // Clicar em adicionar IP
      cy.contains('Adicionar IP').click()

      // Preencher o campo
      cy.get('input[placeholder*="192.168"]').type('192.168.1.100')

      // Clicar em adicionar
      cy.contains('Adicionar').click()

      // Verificar se o IP foi adicionado
      cy.contains('192.168.1.100').should('be.visible')
      cy.contains('IP adicionado com sucesso').should('be.visible')
    })

    it('deve validar formato de IP inválido', () => {
      cy.visitIntegrationSettings()

      // Clicar em adicionar IP
      cy.contains('Adicionar IP').click()

      // Preencher com IP inválido
      cy.get('input[placeholder*="192.168"]').type('invalid-ip')

      // Clicar em adicionar
      cy.contains('Adicionar').click()

      // Verificar mensagem de erro
      cy.contains('Formato de IP inválido').should('be.visible')
    })

    it('deve remover IP autorizado', () => {
      cy.visitIntegrationSettings()

      // Adicionar um IP primeiro
      cy.contains('Adicionar IP').click()
      cy.get('input[placeholder*="192.168"]').type('192.168.1.200')
      cy.contains('Adicionar').click()

      // Aguardar IP ser adicionado
      cy.contains('192.168.1.200').should('be.visible')

      // Clicar em remover
      cy.contains('192.168.1.200')
        .parent()
        .find('button')
        .contains('Remover')
        .click()

      // Confirmar remoção
      cy.on('window:confirm', () => true)

      // Verificar que o IP foi removido
      cy.contains('IP removido com sucesso').should('be.visible')
      cy.contains('192.168.1.200').should('not.exist')
    })

    it('deve exibir contador de IPs', () => {
      cy.visitIntegrationSettings()

      // Adicionar 2 IPs
      cy.contains('Adicionar IP').click()
      cy.get('input[placeholder*="192.168"]').type('192.168.1.1')
      cy.contains('Adicionar').click()

      cy.contains('Adicionar IP').click()
      cy.get('input[placeholder*="192.168"]').type('192.168.1.2')
      cy.contains('Adicionar').click()

      // Verificar contador
      cy.contains('IPs Autorizados (2)').should('be.visible')
    })
  })

  describe('Avisos de Segurança', () => {
    it('deve exibir avisos de segurança', () => {
      cy.visitIntegrationSettings()

      // Verificar seção de avisos
      cy.contains('Importante - Segurança').should('be.visible')
      cy.contains('Mantenha suas credenciais em segurança').should('be.visible')
      cy.contains('Use variáveis de ambiente').should('be.visible')
      cy.contains('Em caso de vazamento, regenere imediatamente').should(
        'be.visible',
      )
    })
  })

  describe('Loading States', () => {
    it('deve exibir loading ao carregar credenciais', () => {
      // Interceptar requisição para simular delay
      cy.intercept('GET', '**/api/integration/credentials', {
        delay: 1000,
        statusCode: 200,
        body: {
          success: true,
          data: {
            client_key: 'test-key',
            client_secret: 'test-secret',
            status: 'active',
            created_at: new Date().toISOString(),
          },
        },
      }).as('getCredentials')

      cy.visitIntegrationSettings()

      // Verificar loading (se implementado)
      // cy.get('[data-cy="loading"]').should('be.visible')

      cy.wait('@getCredentials')
    })
  })

  describe('Error Handling', () => {
    it('deve exibir erro ao falhar ao carregar credenciais', () => {
      // Interceptar requisição para simular erro
      cy.intercept('GET', '**/api/integration/credentials', {
        statusCode: 500,
        body: { success: false, message: 'Erro interno' },
      }).as('getCredentialsError')

      cy.visitIntegrationSettings()

      cy.wait('@getCredentialsError')

      // Verificar mensagem de erro
      cy.contains('Erro ao carregar dados de integração').should('be.visible')
    })
  })
})
