# 🧪 Testes E2E com Cypress - Documentação

## 📋 Visão Geral

Este documento descreve como executar e desenvolver testes End-to-End (E2E) para o projeto Orizon Gateway usando Cypress.

## 🚀 Instalação

O Cypress já está instalado como dependência de desenvolvimento:

```bash
npm install
```

## 🎯 Scripts Disponíveis

### Abrir Cypress Interface

```bash
npm run cypress:open
```

Abre a interface gráfica do Cypress para desenvolvimento e debug.

### Executar Testes em Headless Mode

```bash
npm run cypress:run
```

Executa todos os testes E2E em modo headless (linha de comando).

### Executar Apenas Testes de Integração

```bash
npm run cypress:run:integration
```

Executa apenas os testes de integração de API.

### Atalho

```bash
npm run test:e2e
```

Alias para `cypress:run`.

## 📁 Estrutura de Diretórios

```
gateway-web/
├── cypress/
│   ├── e2e/                      # Testes E2E
│   │   ├── integration-api.cy.ts # Testes de Integração de API
│   │   └── ...                   # Outros testes
│   ├── fixtures/                 # Dados de teste (mock data)
│   ├── support/                  # Comandos customizados
│   │   ├── commands.ts           # Comandos Cypress personalizados
│   │   └── e2e.ts                # Configuração de suporte
│   └── downloads/                # Downloads dos testes
├── cypress.config.ts             # Configuração do Cypress
└── package.json                  # Scripts e dependências
```

## 🧪 Comandos Customizados

### Login

```typescript
cy.login(email?, password?)
```

Realiza login no sistema.

**Exemplo:**

```typescript
cy.login('test@example.com', 'password123')
```

### Logout

```typescript
cy.logout()
```

Realiza logout do sistema.

**Exemplo:**

```typescript
cy.logout()
```

### Visitar Dashboard

```typescript
cy.visitDashboard()
```

Navega para o dashboard.

**Exemplo:**

```typescript
cy.visitDashboard()
```

### Visitar Configurações de Integração

```typescript
cy.visitIntegrationSettings()
```

Navega para as configurações de integração de API.

**Exemplo:**

```typescript
cy.visitIntegrationSettings()
```

## 📝 Testes de Integração de API

### Cenários Testados

#### 1. Configurações de Integração

- ✅ Visualizar credenciais de API
- ✅ Copiar Client Key
- ✅ Copiar Client Secret
- ✅ Regenerar Client Secret
- ✅ Exibir warning ao regenerar

#### 2. Gerenciamento de IPs

- ✅ Exibir lista vazia inicialmente
- ✅ Adicionar IP autorizado
- ✅ Validar formato de IP inválido
- ✅ Remover IP autorizado
- ✅ Exibir contador de IPs

#### 3. Avisos de Segurança

- ✅ Exibir todos os avisos de segurança

#### 4. Loading States

- ✅ Exibir loading ao carregar credenciais

#### 5. Error Handling

- ✅ Exibir erro ao falhar carregamento

## 🛠️ Desenvolvendo Novos Testes

### 1. Criar Arquivo de Teste

```typescript
// cypress/e2e/my-feature.cy.ts
describe('Minha Funcionalidade', () => {
  beforeEach(() => {
    cy.login()
  })

  it('deve fazer algo', () => {
    cy.visit('/minha-rota')
    cy.contains('Texto esperado').should('be.visible')
  })
})
```

### 2. Usar Comandos Customizados

```typescript
cy.login('user@example.com', 'pass123')
cy.visitDashboard()
cy.logout()
```

### 3. Interceptar Requisições (Mock)

```typescript
cy.intercept('GET', '**/api/users', {
  statusCode: 200,
  body: { users: [] },
}).as('getUsers')

cy.wait('@getUsers')
```

### 4. Aguardar Elementos

```typescript
cy.contains('Texto', { timeout: 10000 }).should('be.visible')
```

## 🎨 Seletores de Elementos

### Prioridade de Seletores

1. **data-cy** (mais recomendado)

   ```typescript
   cy.get('[data-cy="client-key"]')
   ```

2. **ID**

   ```typescript
   cy.get('#my-element')
   ```

3. **Classes**

   ```typescript
   cy.get('.my-class')
   ```

4. **Tags**
   ```typescript
   cy.get('button')
   ```

## 🐛 Debugging

### Ver Logs

```typescript
cy.log('Mensagem de debug')
```

### Pausar Execução

```typescript
cy.pause()
```

### Screenshots

- Screenshots automáticos em caso de falha
- Vídeos gravados em `cypress/videos/`

### Debug Mode

```typescript
cy.get('element', { log: true })
```

## 📊 Relatórios

### Executar com Relatório HTML

```bash
npm run cypress:run -- --reporter html
```

### Executar com Mochawesome

```bash
npm install --save-dev mocha mochawesome mochawesome-merge mochawesome-report-generator
```

## ⚙️ Configuração

### cypress.config.ts

Principais configurações:

```typescript
{
  baseUrl: 'http://localhost:3000',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
}
```

## 🔒 Testes em Produção

### Variáveis de Ambiente

Criar arquivo `cypress.env.json`:

```json
{
  "API_BASE_URL": "http://localhost:8000",
  "TEST_USER_EMAIL": "test@orizon.com",
  "TEST_USER_PASSWORD": "password123"
}
```

### Usar Variáveis

```typescript
cy.visit(Cypress.env('API_BASE_URL'))
cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'))
```

## 📚 Recursos Adicionais

- [Documentação Cypress](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/commands)

## 🚨 Troubleshooting

### Erro: "Element is not visible"

```typescript
// Aguardar carregamento
cy.wait(1000)

// Ou usar force
cy.get('element').click({ force: true })
```

### Erro: "Timed out"

```typescript
// Aumentar timeout
cy.get('element', { timeout: 20000 })
```

### Erro: "Unauthenticated"

```typescript
// Verificar login
cy.login()
cy.visit('/protected-route')
```

## 📝 Checklist de Testes

Antes de fazer commit:

- [ ] Todos os testes passam
- [ ] Sem erros de lint
- [ ] Cobertura adequada
- [ ] Comandos customizados documentados
- [ ] Screenshots removidos (se aplicável)

## 🎯 Próximos Passos

1. Adicionar testes para outras funcionalidades
2. Criar fixtures para dados de teste
3. Configurar CI/CD
4. Adicionar visual regression testing
