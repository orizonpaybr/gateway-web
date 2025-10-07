# Guia de Integração com Backend

Este documento descreve como integrar o frontend com a API backend do HorsePay.

## 📋 Estrutura de Arquivos Relevantes

```
gateway-web/
├── lib/
│   └── api.ts              # Funções de chamada à API
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticação
├── middleware.ts           # Middleware de proteção de rotas
├── types/
│   └── index.ts           # Tipos TypeScript
└── hooks/
    ├── useDebounce.ts     # Hook para debounce
    └── useLocalStorage.ts # Hook para localStorage
```

## 🔐 Autenticação

### 1. Implementar Login

No arquivo `lib/api.ts`, implemente a função de login:

```typescript
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
}
```

### 2. Atualizar AuthContext

No arquivo `contexts/AuthContext.tsx`:

```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await authAPI.login(email, password)
    localStorage.setItem('token', response.token)
    setUser(response.user)
  } catch (error) {
    throw new Error('Falha no login')
  }
}
```

### 3. Proteger Rotas

No arquivo `middleware.ts`, descomente e implemente:

```typescript
const token = request.cookies.get('token')?.value

if (isProtectedRoute && !token) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

## 📡 Endpoints a Implementar

### Autenticação

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Recuperar senha

### Conta

- `GET /account/profile` - Obter perfil
- `PUT /account/profile` - Atualizar perfil
- `GET /account/balance` - Consultar saldo
- `GET /account/settings` - Obter configurações
- `PUT /account/settings` - Atualizar configurações

### Transações

- `GET /transactions` - Listar transações
- `GET /transactions/:id` - Obter transação por ID
- `GET /transactions/search?query=` - Buscar transação

### Pix

- `POST /pix/transfer` - Realizar transferência
- `GET /pix/limits` - Obter limites
- `POST /pix/validate-key` - Validar chave Pix

### QR Codes

- `POST /qrcode/generate` - Gerar QR Code
- `GET /qrcode` - Listar QR Codes
- `GET /qrcode/:id` - Obter QR Code específico
- `DELETE /qrcode/:id` - Cancelar QR Code

### Infrações

- `GET /infractions` - Listar infrações
- `GET /infractions/:id` - Obter infração específica
- `POST /infractions/:id/resolve` - Resolver infração

### Extrato

- `GET /extract?startDate=&endDate=&type=` - Obter extrato
- `GET /extract/export?format=pdf` - Exportar extrato

### Jornada

- `GET /journey/current` - Obter nível atual
- `GET /journey/history` - Histórico de progressão
- `GET /journey/achievements` - Conquistas

## 🔄 Fluxo de Integração

### Passo 1: Configurar Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=https://api.horsepay.com
NEXT_PUBLIC_API_VERSION=v1
```

### Passo 2: Implementar Funções da API

No arquivo `lib/api.ts`, implemente todas as funções removendo os `throw new Error()`.

### Passo 3: Atualizar Páginas

Em cada página, substitua os dados mockados por chamadas à API:

**Exemplo - Dashboard:**

```typescript
// Antes (mock)
const stats = {
  saldo: 25430,
  entradas: 45200,
  // ...
}

// Depois (API)
const [stats, setStats] = useState(null)

useEffect(() => {
  const fetchStats = async () => {
    const data = await accountAPI.getBalance()
    setStats(data)
  }
  fetchStats()
}, [])
```

### Passo 4: Implementar Loading States

Use o componente `LoadingSpinner`:

```typescript
if (isLoading) return <LoadingSpinner />
if (error) return <div>Erro: {error.message}</div>
return <YourComponent data={data} />
```

### Passo 5: Tratamento de Erros

Implemente tratamento de erros global:

```typescript
try {
  const data = await apiRequest('/endpoint')
  // sucesso
} catch (error) {
  // Exibir toast de erro
  console.error(error)
}
```

## 🎯 Checklist de Integração

### Autenticação

- [ ] Implementar login
- [ ] Implementar registro
- [ ] Implementar logout
- [ ] Implementar refresh token
- [ ] Proteger rotas no middleware
- [ ] Salvar token no cookie/localStorage

### Dashboard

- [ ] Buscar saldo e estatísticas
- [ ] Buscar transações recentes
- [ ] Implementar gráficos com dados reais

### Transações

- [ ] Listar transações com paginação
- [ ] Buscar transação por ID
- [ ] Filtrar por tipo e data
- [ ] Exportar extrato

### Pix

- [ ] Validar chave Pix
- [ ] Verificar limites
- [ ] Realizar transferência
- [ ] Confirmar transação

### QR Codes

- [ ] Gerar QR Code
- [ ] Listar QR Codes
- [ ] Atualizar status
- [ ] Cancelar QR Code

### Configurações

- [ ] Buscar dados da conta
- [ ] Atualizar perfil
- [ ] Trocar senha
- [ ] Gerenciar credenciais da API
- [ ] Configurar notificações

## 🔔 Webhooks (Backend → Frontend)

Configure webhooks para receber notificações em tempo real:

- Novo pagamento recebido
- Status de transação atualizado
- Limite atingido
- Nova infração
- QR Code pago

## 📊 Monitoramento

Considere adicionar:

- **Sentry** para tracking de erros
- **Google Analytics** para analytics
- **LogRocket** para session replay
- **Datadog** para APM

## 🧪 Testes

Implemente testes para:

- Componentes de UI
- Fluxos de autenticação
- Chamadas à API (mocks)
- Integração E2E

## 📝 Notas Importantes

1. **Segurança**: Nunca exponha secrets no frontend
2. **Performance**: Use cache e debounce em buscas
3. **UX**: Sempre mostre loading states
4. **Erros**: Implemente tratamento de erros amigável
5. **Validação**: Valide dados no cliente e servidor

## 🆘 Suporte

Para dúvidas sobre a integração:

- Consulte a documentação da API
- Entre em contato com a equipe de backend
- Veja exemplos em `lib/api.ts`
