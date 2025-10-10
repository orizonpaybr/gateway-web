# ✅ Integração de Autenticação Completa

A integração entre o backend Laravel e o frontend Next.js foi finalizada com sucesso!

## 🎉 O que foi implementado

### Backend Laravel

1. **Nova rota de API para registro** (`POST /api/auth/register`)

   - Endpoint criado no `AuthController`
   - Validação completa de dados
   - Criação automática de chaves de API (token e secret)
   - Suporte a sistema de afiliados e gerentes
   - Criação automática de splits internos

2. **Rotas de autenticação existentes**
   - `POST /api/auth/login` - Login de usuário
   - `POST /api/auth/verify-2fa` - Verificação 2FA (Google Authenticator)
   - `GET /api/auth/verify` - Verificar token válido
   - `POST /api/auth/logout` - Logout

### Frontend Next.js

1. **Cliente de API completo** (`lib/api.ts`)

   - Função `apiRequest` que gerencia automaticamente tokens
   - `authAPI.login()` - Login com suporte a 2FA
   - `authAPI.verify2FA()` - Verificação de código 2FA
   - `authAPI.register()` - Registro de novo usuário
   - `authAPI.verifyToken()` - Validação de token
   - `authAPI.logout()` - Logout

2. **Context de Autenticação** (`contexts/AuthContext.tsx`)

   - Gerenciamento global de estado de autenticação
   - Verificação automática de token ao carregar aplicação
   - Persistência de sessão no localStorage
   - Suporte completo a 2FA

3. **Páginas de autenticação atualizadas**

   - **Login** (`app/(auth)/login/page.tsx`)

     - Integração com API real
     - Suporte a 2FA com interface dedicada
     - Tratamento de erros
     - Validação de formulário com Zod

   - **Cadastro** (`app/(auth)/cadastro/page.tsx`)
     - Fluxo em 2 etapas
     - Integração com API real
     - Validação de senha forte
     - Tratamento de erros
     - Redirecionamento automático após sucesso

## 📋 Como usar

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto `gateway-web`:

```env
NEXT_PUBLIC_API_URL=https://playgameoficial.com.br/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
```

### 2. Instalar dependências

```bash
cd gateway-web
yarn install
```

### 3. Executar o projeto

```bash
yarn dev
```

O frontend estará disponível em `http://localhost:3000`

## 🔐 Como funciona a autenticação

### Fluxo de Login

1. Usuário acessa `/login` e digita username/email e senha
2. Frontend envia `POST /api/auth/login`
3. Backend valida credenciais
4. Se usuário tem 2FA ativo:
   - Backend retorna `{ requires_2fa: true, temp_token: '...' }`
   - Frontend exibe campo para código 2FA
   - Usuário digita código de 6 dígitos
   - Frontend envia `POST /api/auth/verify-2fa`
5. Backend retorna dados de autenticação:
   ```json
   {
     "success": true,
     "data": {
       "user": { "id", "username", "email", "name" },
       "token": "base64_encoded_token",
       "api_token": "uuid",
       "api_secret": "uuid"
     }
   }
   ```
6. Frontend armazena no localStorage:
   - `token` - Token de autenticação (expira em 24h)
   - `api_token` - Token para middleware check.token.secret
   - `api_secret` - Secret para middleware check.token.secret
   - `user` - Dados do usuário
7. Usuário é redirecionado para `/dashboard`

### Fluxo de Registro

1. Usuário acessa `/cadastro`
2. Preenche dados pessoais (nome, username, email) - Etapa 1
3. Preenche senha e telefone - Etapa 2
4. Frontend envia `POST /api/auth/register`
5. Backend:
   - Valida dados
   - Cria usuário no banco
   - Cria chaves de API (UsersKey)
   - Atribui gerente automaticamente
   - Cria splits internos se aplicável
6. Backend retorna mesmos dados do login
7. Frontend armazena tokens e redireciona para `/dashboard`

### Persistência de Sessão

- Ao carregar a aplicação, o `AuthContext` verifica se existe token no localStorage
- Se existe, tenta validar com `GET /api/auth/verify`
- Se válido, restaura sessão do usuário
- Se inválido, limpa localStorage e exige novo login

### Logout

- Usuário clica em "Sair"
- Frontend chama `authAPI.logout()`
- Envia `POST /api/auth/logout` para backend
- Limpa todos os dados do localStorage
- Redireciona para `/login`

## 🔑 Estrutura do Token

O token retornado pelo backend é um JSON base64 encoded:

```json
{
  "user_id": "username_do_usuario",
  "token": "uuid-da-tabela-users-key",
  "secret": "uuid-da-tabela-users-key",
  "expires_at": 1234567890
}
```

## 📡 Requisições Autenticadas

Para fazer requisições autenticadas, o frontend utiliza dois métodos:

### 1. Bearer Token (Sanctum)

```javascript
headers: {
  'Authorization': 'Bearer {token}'
}
```

Usado em:

- `GET /api/auth/verify`
- `POST /api/auth/logout`

### 2. Token + Secret no body/query (Middleware check.token.secret)

```javascript
// POST/PUT/PATCH
body: {
  ...dados,
  token: 'uuid-token',
  secret: 'uuid-secret'
}

// GET
?token=uuid-token&secret=uuid-secret
```

Usado em:

- `GET /api/balance`
- `GET /api/transactions`
- `GET /api/user/profile`
- `POST /api/pix/generate-qr`
- E outras rotas protegidas

A função `apiRequest` no `lib/api.ts` adiciona automaticamente token e secret conforme necessário.

## ⚠️ Importante sobre JWT_SECRET

**NÃO é necessário configurar `JWT_SECRET` no frontend!**

O backend Laravel é responsável por toda a validação e segurança dos tokens. O frontend apenas:

- Armazena os tokens recebidos
- Envia os tokens nas requisições
- Remove os tokens no logout

A segurança é totalmente gerenciada pelo backend.

## 🧪 Testando a integração

### Teste de Registro

1. Acesse `http://localhost:3000/cadastro`
2. Preencha os dados:
   - Nome completo
   - Nome de usuário (apenas letras)
   - Email válido
3. Próxima etapa:
   - Senha (mín. 8 caracteres, com maiúscula, minúscula, número e especial)
   - Confirmar senha
   - Telefone (mín. 10 dígitos)
4. Clique em "Criar Conta"
5. Deve ser redirecionado para `/dashboard` automaticamente

### Teste de Login

1. Acesse `http://localhost:3000/login`
2. Digite username ou email
3. Digite senha
4. Se tiver 2FA ativo, digite o código
5. Deve ser redirecionado para `/dashboard`

### Teste de Persistência

1. Faça login
2. Recarregue a página (F5)
3. Sessão deve ser mantida
4. Feche e abra o navegador novamente
5. Sessão ainda deve estar ativa (até expirar em 24h)

### Teste de Logout

1. Estando logado, clique em "Sair" (implementar botão no dashboard)
2. Deve ser redirecionado para `/login`
3. Tente acessar `/dashboard` diretamente
4. Deve ser redirecionado para `/login` (implementar middleware de proteção)

## 📝 Próximos passos sugeridos

1. **Middleware de proteção de rotas**

   - Criar middleware no Next.js (`middleware.ts`)
   - Proteger rotas `/dashboard/*` para apenas usuários autenticados
   - Redirecionar para `/login` se não autenticado

2. **Botão de logout no Dashboard**

   - Adicionar botão "Sair" no header/sidebar
   - Chamar `logout()` do `useAuth()`

3. **Tratamento de token expirado**

   - Interceptar erros 401
   - Fazer logout automático
   - Mostrar mensagem "Sessão expirada"

4. **Upload de documentos**

   - Criar página para envio de documentos
   - Integrar com endpoint existente `/enviar-docs/{id}`

5. **Recuperação de senha**

   - Tela de "Esqueci minha senha"
   - Integrar com rotas existentes:
     - `POST /forgot-password`
     - `POST /reset-password`

6. **Perfil do usuário**
   - Página de perfil
   - Integrar com `GET /api/user/profile`
   - Permitir edição de dados

## 🐛 Troubleshooting

### Erro: "CORS blocked"

- Verifique se o backend está configurado com CORS para permitir requisições do frontend
- As rotas de autenticação já têm headers CORS configurados

### Erro: "Token ou Secret inválidos"

- Verifique se o usuário tem chaves de API criadas na tabela `users_key`
- Ao registrar, as chaves são criadas automaticamente

### Erro: "Usuário sem chaves de API configuradas"

- O usuário foi criado mas não tem entrada na tabela `users_key`
- Execute manualmente:
  ```sql
  INSERT INTO users_key (user_id, token, secret)
  VALUES ('username', UUID(), UUID());
  ```

### Sessão não persiste após recarregar

- Verifique se o localStorage está salvando os dados
- Abra DevTools > Application > Local Storage
- Deve ter: `token`, `api_token`, `api_secret`, `user`

### Senha não aceita na criação de conta

- Senha deve ter no mínimo 8 caracteres
- Pelo menos uma letra minúscula
- Pelo menos uma letra maiúscula
- Pelo menos um número
- Pelo menos um caractere especial: `@$!%*?&+#^~` etc.

## 📚 Arquivos modificados/criados

### Backend

- ✅ `gateway-backend/app/Http/Controllers/Api/AuthController.php` - Adicionado método `register()`
- ✅ `gateway-backend/routes/api.php` - Adicionada rota `POST /api/auth/register`

### Frontend

- ✅ `gateway-web/lib/api.ts` - Implementado cliente de API completo
- ✅ `gateway-web/contexts/AuthContext.tsx` - Atualizado para usar API real
- ✅ `gateway-web/app/(auth)/login/page.tsx` - Integração com API + suporte 2FA
- ✅ `gateway-web/app/(auth)/cadastro/page.tsx` - Integração com API
- ✅ `gateway-web/ENV_CONFIG.md` - Documentação de configuração
- ✅ `gateway-web/INTEGRATION_COMPLETE.md` - Este arquivo

## 🎓 Boas práticas implementadas

1. ✅ Validação de formulários com Zod
2. ✅ Tratamento de erros com mensagens amigáveis
3. ✅ Loading states em botões
4. ✅ Suporte a 2FA completo
5. ✅ Persistência de sessão segura
6. ✅ Tokens armazenados no localStorage (apenas lado cliente)
7. ✅ Código TypeScript com tipos bem definidos
8. ✅ Arquitetura limpa com separação de concerns
9. ✅ Reutilização de código com hooks e contexts
10. ✅ Documentação completa

---

🚀 **A integração está completa e pronta para uso!**

Se tiver dúvidas ou problemas, consulte este documento ou os comentários no código.
