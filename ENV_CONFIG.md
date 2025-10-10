# Configuração de Variáveis de Ambiente - Frontend Next.js

## 📝 Instruções

Crie um arquivo `.env.local` na raiz do projeto `gateway-web` com o seguinte conteúdo:

```env
# Configurações da API Backend Laravel
NEXT_PUBLIC_API_URL=https://playgameoficial.com.br/api

# URL do Frontend (para redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Ambiente de execução
NEXT_PUBLIC_ENV=development
```

## ⚠️ Importante sobre JWT_SECRET

**NÃO é necessário configurar JWT_SECRET no frontend!**

### Por quê?

O backend Laravel já gerencia toda a validação de tokens. O frontend apenas:

1. **Armazena** o token retornado pelo backend no localStorage
2. **Envia** o token nas requisições via `Authorization: Bearer {token}`
3. **Armazena** também `api_token` e `api_secret` para rotas que usam o middleware `check.token.secret`

### Como funciona a autenticação?

```
┌─────────────┐                          ┌─────────────┐
│  Frontend   │                          │   Backend   │
│  (Next.js)  │                          │  (Laravel)  │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       │  POST /api/auth/login                  │
       │  {username, password}                  │
       ├───────────────────────────────────────>│
       │                                        │
       │  Backend valida credenciais,           │
       │  gera token base64 e retorna           │
       │<───────────────────────────────────────┤
       │  {token, api_token, api_secret, user}  │
       │                                        │
       │  Frontend armazena no localStorage     │
       │  localStorage.setItem('token', ...)    │
       │  localStorage.setItem('api_token', ...)│
       │  localStorage.setItem('api_secret',...) │
       │                                        │
       │  Requisições autenticadas              │
       │  GET /api/balance                      │
       │  Headers: {                            │
       │    Authorization: Bearer {token}       │
       │  }                                     │
       │  Body: {token, secret}                 │
       ├───────────────────────────────────────>│
       │                                        │
       │  Backend valida token e retorna dados  │
       │<───────────────────────────────────────┤
       │                                        │
```

### Estrutura do Token

O token retornado pelo backend é um JSON base64 encoded:

```json
{
  "user_id": "username_do_usuario",
  "token": "uuid-token-from-users-key",
  "secret": "uuid-secret-from-users-key",
  "expires_at": 1234567890
}
```

### Validação no Backend

O backend Laravel valida os tokens de duas formas:

1. **auth:sanctum** - Para rotas que usam Sanctum
2. **check.token.secret** - Middleware customizado que valida `token` e `secret` da tabela `users_key`

## 🔐 Segurança

- Todos os tokens expiram em **24 horas**
- O backend valida a expiração em cada requisição
- O frontend deve tratar erros 401 (Unauthorized) e fazer logout automático
- Tokens são armazenados no localStorage (apenas lado cliente)
- Nunca exponha `api_secret` em logs ou console
