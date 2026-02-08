# 🚀 Configuração de CI/CD - GitHub Actions

Este documento explica como configurar a esteira de CI/CD para o projeto `gateway-web`.

## 📋 Workflows Disponíveis

### 1. **CI - Build & Test** (`.github/workflows/ci.yml`)
Executa verificações de qualidade e build em cada push e pull request.

**Jobs:**
- ✅ **Code Quality**: Type-check e lint
- 🏗️ **Build**: Compilação da aplicação Next.js
- 🧪 **E2E Tests**: Testes end-to-end com Playwright (opcional)

**Triggers:**
- Push para `main` ou `develop`
- Pull requests para `main` ou `develop`
- Execução manual (`workflow_dispatch`)

### 2. **Deploy to Production** (`.github/workflows/deploy.yml`)
Faz deploy automático para produção quando há push na branch `main`.

**Jobs:**
- ✅ **Pre-Deploy Checks**: Verificações antes do deploy
- 🚀 **Deploy**: Deploy para servidor de produção

**Triggers:**
- Push para `main`
- Execução manual (`workflow_dispatch`)

## 🔐 Configuração de Secrets no GitHub

Para que os workflows funcionem corretamente, você precisa configurar os seguintes secrets no repositório GitHub:

### Como adicionar secrets:

1. Acesse: `https://github.com/orizonpaybr/gateway-web/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Adicione cada secret abaixo:

### Secrets Necessários:

#### Para CI (Build & Test):
```bash
NEXT_PUBLIC_API_URL          # URL da API backend (ex: https://api.orizonpay.com.br)
```

#### Para Deploy:
```bash
SSH_PRIVATE_KEY              # Chave SSH privada para acesso ao servidor
SERVER_HOST                  # IP ou domínio do servidor (ex: 192.168.1.100 ou app.orizonpay.com.br)
SERVER_USER                  # Usuário SSH (ex: deploy ou ubuntu)
APP_DIR                     # Diretório da aplicação no servidor (ex: /var/www/gateway-web)
APP_URL                     # URL da aplicação em produção (ex: https://app.orizonpay.com.br)
NEXT_PUBLIC_API_URL         # URL da API backend em produção
```

## 🔑 Gerando Chave SSH para Deploy

Se você ainda não tem uma chave SSH configurada:

```bash
# Gerar nova chave SSH (não use senha para facilitar automação)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copiar a chave pública para o servidor
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub usuario@servidor

# Exibir a chave privada para copiar no GitHub Secrets
cat ~/.ssh/github_actions_deploy
```

**⚠️ IMPORTANTE**: 
- A chave privada (`github_actions_deploy`) vai no GitHub Secret `SSH_PRIVATE_KEY`
- A chave pública (`github_actions_deploy.pub`) deve estar no servidor (`~/.ssh/authorized_keys`)

## 🖥️ Configuração do Servidor

### Pré-requisitos no servidor:

1. **Node.js 20+** instalado
2. **Git** configurado
3. **PM2** ou **Systemd** para gerenciar o processo (opcional)
4. **Nginx** ou outro servidor web como reverse proxy (recomendado)

### Estrutura de diretórios sugerida:

```bash
/var/www/gateway-web/          # Diretório da aplicação
├── .next/                     # Build do Next.js (gerado)
├── .env                       # Variáveis de ambiente (não versionado)
├── node_modules/              # Dependências
├── package.json
└── ...
```

### Script de inicialização (opcional):

Crie um arquivo `ecosystem.config.js` para PM2:

```javascript
module.exports = {
  apps: [{
    name: 'gateway-web',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/gateway-web',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

E ajuste o workflow de deploy para usar PM2:

```yaml
pm2 restart gateway-web || pm2 start ecosystem.config.js
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` no servidor com as seguintes variáveis:

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://api.orizonpay.com.br

# Ambiente
NODE_ENV=production
PORT=3000

# Outras variáveis necessárias para sua aplicação
```

## 🧪 Testando os Workflows

### Testar CI localmente:

```bash
# Instalar dependências
npm ci

# Type check
npm run type-check

# Lint
npm run lint:strict

# Build
npm run build
```

### Testar deploy manualmente:

1. Vá em: `https://github.com/orizonpaybr/gateway-web/actions`
2. Selecione o workflow **"🚀 Deploy to Production"**
3. Clique em **"Run workflow"**
4. Selecione a branch `main`
5. Clique em **"Run workflow"**

## 🔍 Troubleshooting

### Build falha:
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que `NEXT_PUBLIC_API_URL` está definido

### Deploy falha:
- Verifique se a chave SSH está correta
- Confirme que o usuário SSH tem permissões no diretório
- Verifique os logs do workflow no GitHub Actions

### Testes E2E falham:
- Os testes podem ser desabilitados temporariamente editando `ci.yml`
- Adicione `if: false` no job `test-e2e`

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

## ✅ Checklist de Configuração

- [ ] Secrets configurados no GitHub
- [ ] Chave SSH configurada no servidor
- [ ] Node.js instalado no servidor
- [ ] Diretório da aplicação criado
- [ ] Variáveis de ambiente configuradas no servidor
- [ ] PM2/Systemd configurado (opcional)
- [ ] Nginx configurado como reverse proxy (recomendado)
- [ ] Teste de CI executado com sucesso
- [ ] Teste de deploy executado com sucesso
