# Guia de Configuração - Coratri

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Git

## 🚀 Instalação

### 1. Instalar Dependências

```bash
yarn install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações da API Backend Laravel
NEXT_PUBLIC_API_URL=https://playgameoficial.com.br/api

# URL do Frontend (para redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Ambiente de execução
NEXT_PUBLIC_ENV=development
```

> **Nota**: Não é necessário configurar `JWT_SECRET` no frontend. O backend Laravel gerencia toda a validação de tokens.

### 3. Executar em Desenvolvimento

```bash
yarn dev
```

O projeto estará disponível em `http://localhost:3000`

### 4. Build para Produção

```bash
yarn build
yarn start
```

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
yarn dev

# Build de produção
yarn build

# Executar produção
yarn start

# Verificar erros TypeScript
yarn tsc --noEmit

# Verificar problemas de lint
yarn lint

# Limpar cache e reinstalar
rm -rf .next node_modules yarn.lock
yarn install
```

## 🔐 Autenticação

### Como Funciona

1. **Login**: Usuário faz login → Backend retorna token
2. **Armazenamento**: Token é salvo no `localStorage`
3. **Requisições**: Token é enviado no header `Authorization: Bearer {token}`
4. **Validação**: Backend valida token em cada requisição

### Fluxo de Autenticação

```
Frontend                Backend
   |                       |
   |--POST /api/auth/login->|
   |   {username, password} |
   |                       |
   |<--{token, user}-------|
   |                       |
   |--Armazena no          |
   |  localStorage         |
   |                       |
   |--GET /api/balance---->|
   |  Headers:             |
   |  Authorization:       |
   |  Bearer {token}       |
   |                       |
   |<--{data}--------------|
```

### Autenticação 2FA

Se o usuário tiver 2FA ativado:

1. Login retorna `requires_2fa: true` e `temp_token`
2. Modal de 2FA é exibido
3. Usuário digita PIN
4. Backend valida e retorna token final
5. Token é armazenado e componentes recarregam dados

## 🎨 Configuração Visual

### Cores da marca

As cores estão configuradas no `tailwind.config.ts`:

- **Primary**: `#007BC7` (azul primário)
- **Primary Hover**: `#006BA8`
- **Dark**: `#0C243B`
- **Secondary**: `#009EE0`
- **Accent**: `#FF8A00` (Laranja)
- **Background**: `#FFFFFF`

### Logo

A logo está localizada em `/public/Logo Coratri Finance.png` (ou `Coratri - FINANCE v1.98.0.png`) e é usada em:
- Página de login
- Página de cadastro
- Sidebar do dashboard

## 📁 Estrutura de Pastas

```
gateway-web/
├── app/                  # App Router do Next.js
│   ├── (auth)/          # Rotas de autenticação
│   ├── (dashboard)/     # Rotas do dashboard
│   ├── globals.css      # Estilos globais
│   ├── layout.tsx       # Layout raiz
│   └── page.tsx         # Página inicial
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI
│   └── dashboard/      # Componentes do dashboard
├── contexts/            # Contextos React
├── hooks/               # Hooks customizados
├── lib/                # Utilitários e API
├── types/              # Definições de tipos TypeScript
└── public/             # Arquivos estáticos
```

## 🐛 Troubleshooting

### Erro: "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules .next yarn.lock
yarn install
```

### Erro de TypeScript

```bash
# Verificar tipos
yarn tsc --noEmit
```

### Problemas com Tailwind

```bash
# Rebuildar classes
yarn dev
```

### Token desaparece após F5

O sistema implementa persistência automática de token. Se o problema persistir:

1. Verifique se o token está sendo salvo no `localStorage`
2. Verifique o console do navegador para erros
3. Verifique se o backend está retornando o token corretamente

### Erro 401 (Unauthorized)

1. Verifique se o token está sendo enviado no header
2. Verifique se o token não expirou (tokens expiram em 24h)
3. Faça logout e login novamente

### Página em branco

1. Verifique o console do navegador
2. Verifique o terminal onde o `yarn dev` está rodando
3. Verifique se todas as dependências foram instaladas

## 🔍 Verificações de Configuração

### Verificar se está tudo configurado:

1. ✅ Arquivo `.env.local` existe
2. ✅ `NEXT_PUBLIC_API_URL` está configurado
3. ✅ Dependências instaladas (`yarn install`)
4. ✅ Servidor de desenvolvimento rodando (`yarn dev`)
5. ✅ Backend Laravel está acessível

## 📝 Notas Importantes

1. **SSR Compatibility**: Todos os hooks são compatíveis com SSR
2. **Token Storage**: Tokens são armazenados no `localStorage` (apenas lado cliente)
3. **CORS**: Backend deve estar configurado para aceitar requisições do frontend
4. **HTTPS em Produção**: Use HTTPS em produção para segurança

## 🆘 Suporte

Para dúvidas sobre configuração:

- Consulte [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) para detalhes técnicos
- Consulte [README.md](./README.md) para visão geral
- Verifique os logs do console do navegador
- Verifique os logs do terminal
