# Guia do Desenvolvedor - Orizon Pay

Este documento contém informações técnicas detalhadas para desenvolvedores trabalhando no projeto.

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Autenticação](#autenticação)
- [Hooks Customizados](#hooks-customizados)
- [Componentes Principais](#componentes-principais)
- [Integração com Backend](#integração-com-backend)
- [Padrões de Código](#padrões-de-código)
- [Performance](#performance)

## 🏗️ Arquitetura

### Estrutura de Pastas

```
gateway-web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo de rotas de autenticação
│   └── (dashboard)/        # Grupo de rotas do dashboard
├── components/            # Componentes React
│   ├── ui/               # Componentes reutilizáveis
│   ├── dashboard/        # Componentes específicos do dashboard
│   ├── modals/           # Modais
│   └── admin/            # Componentes administrativos
├── contexts/             # Contextos React (Auth, etc)
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários e configurações
│   ├── api.ts           # Funções de API
│   ├── constants/       # Constantes
│   └── helpers/         # Funções auxiliares
└── types/               # Tipos TypeScript
```

### Tecnologias Principais

- **Next.js 14**: App Router, Server Components, Middleware
- **TypeScript**: Tipagem estrita
- **React Query**: Cache e gerenciamento de estado assíncrono
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Tailwind CSS**: Estilização utility-first

## 🔐 Autenticação

### Fluxo de Autenticação

O sistema implementa autenticação JWT com suporte a 2FA:

1. **Login**: Usuário faz login → Backend retorna token ou `requires_2fa`
2. **2FA (se necessário)**: Modal exibido → Usuário digita PIN → Token final
3. **Armazenamento**: Token salvo no `localStorage`
4. **Requisições**: Token enviado no header `Authorization: Bearer {token}`

### Evento `auth-token-stored`

Quando o token é armazenado, um evento customizado é disparado para notificar componentes:

```typescript
// lib/api.ts
const storeAuthData = (data: AuthData): void => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-token-stored'))
  }
}
```

### Padrão para Componentes que Precisam de Autenticação

```typescript
useEffect(() => {
  const fetchData = async () => {
    // 1. Verificar token
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('Aguardando autenticação...')
      return
    }

    // 2. Fazer requisição
    try {
      const response = await api.getData()
      setData(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  // 3. Carregar inicialmente
  fetchData()

  // 4. Escutar evento de token armazenado
  const handleAuthTokenStored = () => {
    fetchData()
  }
  window.addEventListener('auth-token-stored', handleAuthTokenStored)

  // 5. Cleanup
  return () => {
    window.removeEventListener('auth-token-stored', handleAuthTokenStored)
  }
}, [])
```

### Tratamento de Erros 401

O sistema trata automaticamente erros 401 (Unauthorized):

```typescript
// lib/api.ts
if (response.status === 401) {
  clearAuthData()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-unauthorized'))
  }
}
```

## 🎣 Hooks Customizados

### useLocalStorage

Hook para gerenciar dados no localStorage de forma reativa:

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage'

const [user, setUser] = useLocalStorage<User | null>('user', null)
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
```

**Características:**
- ✅ Type-safe com TypeScript
- ✅ SSR safe (verifica `window`)
- ✅ Serialização JSON automática
- ✅ Reativo (atualiza componentes)

### useDebounce

Hook para debounce de valores, útil para otimizar buscas:

```typescript
import { useDebounce } from '@/hooks/useDebounce'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 300)

useEffect(() => {
  if (debouncedSearchTerm) {
    performSearch(debouncedSearchTerm)
  }
}, [debouncedSearchTerm])
```

**Uso recomendado:**
- Buscas: 300-500ms
- Validações: 500-1000ms
- Chamadas de API: 500-1000ms

### usePixDeposit

Hook para gerenciar depósitos PIX com polling automático:

```typescript
import { usePixDeposit } from '@/hooks/usePixDeposit'

const {
  depositData,
  isGenerating,
  isPolling,
  isPaid,
  generateDeposit,
  cancelDeposit,
  checkStatus,
} = usePixDeposit({
  enablePolling: true,
  pollingInterval: 5000,
  onSuccess: (data) => {
    toast.success('Depósito confirmado!')
  },
})
```

## 🧩 Componentes Principais

### TransactionChart

Componente de gráfico de linha interativo:

```typescript
<TransactionChart
  data={chartData}
  period={chartPeriod}
  onPeriodChange={setChartPeriod}
/>
```

**Props:**
- `data`: Array de dados de movimentação
- `period`: Período selecionado ('today' | 'week' | '7days' | '30days')
- `onPeriodChange`: Callback para mudança de período

### TransactionSummary

Componente de cards com resumo de transações:

```typescript
<TransactionSummary data={summaryData} />
```

**Dados incluídos:**
- Quantidade de transações
- Tarifa cobrada
- QR Codes (pagos/gerados)
- Índice de conversão
- Ticket médio
- Valores min/max
- Infrações

### PixDepositModal

Modal completo para depósitos PIX:

```typescript
<PixDepositModal
  isOpen={isOpen}
  onClose={handleClose}
  minAmount={1}
/>
```

**Features:**
- Formulário com validação
- Geração de QR Code
- Polling automático de status
- Feedback visual

## 🔌 Integração com Backend

### Função `apiRequest`

Função centralizada para fazer requisições autenticadas:

```typescript
import { apiRequest } from '@/lib/api'

const data = await apiRequest<ResponseType>('/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload),
})
```

**Características:**
- Adiciona token automaticamente no header
- Trata erros 401 automaticamente
- Type-safe com TypeScript

### Estrutura de APIs

As funções de API estão organizadas por módulo em `lib/api.ts`:

```typescript
// Autenticação
authAPI.login(username, password)
authAPI.register(data)
authAPI.verify2FA(tempToken, pin)

// Transações
transactionsAPI.list(filters)
transactionsAPI.getById(id)
transactionsAPI.search(query)

// PIX
pixAPI.transfer(data)
pixAPI.generateDeposit(data)
pixAPI.checkDepositStatus(id)

// Usuário
userAPI.getProfile()
userAPI.updateProfile(data)
userAPI.changePassword(data)
```

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/verify-2fa` - Verificar 2FA
- `POST /api/auth/logout` - Logout

#### Transações
- `GET /api/transactions` - Listar transações
- `GET /api/transactions/:id` - Obter transação
- `GET /api/transactions/search` - Buscar transações

#### PIX
- `POST /api/pix/transfer` - Transferência
- `POST /api/pix/generate-qr` - Gerar QR Code
- `GET /api/pix/deposit/:id` - Status do depósito

#### Usuário
- `GET /api/user/profile` - Perfil
- `PUT /api/user/profile` - Atualizar perfil
- `POST /api/user/change-password` - Trocar senha

## 📝 Padrões de Código

### Validação com Zod

Sempre use Zod para validação de formulários:

```typescript
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

### TypeScript Strict

Sempre defina tipos explícitos:

```typescript
interface User {
  id: string
  username: string
  email: string
}

const user: User = {
  id: '1',
  username: 'john',
  email: 'john@example.com',
}
```

### Componentes com memo

Use `memo` para componentes que não precisam re-renderizar frequentemente:

```typescript
import { memo } from 'react'

export const MyComponent = memo(() => {
  // ...
})
```

### Callbacks com useCallback

Memoize callbacks para evitar re-renders:

```typescript
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

### Loading States

Sempre mostre estados de loading:

```typescript
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <DataComponent data={data} />
```

### Toast Notifications

Use Sonner para notificações:

```typescript
import { toast } from 'sonner'

toast.success('Operação realizada com sucesso!')
toast.error('Erro ao processar solicitação')
toast.warning('Atenção: verifique os dados')
```

## ⚡ Performance

### React Query

Use React Query para cache e gerenciamento de estado assíncrono:

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['transactions'],
  queryFn: () => transactionsAPI.list(),
  staleTime: 30000, // 30 segundos
})
```

### Code Splitting

Next.js faz code splitting automaticamente por rota. Para componentes pesados:

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
})
```

### Memoization

Use `useMemo` para cálculos pesados:

```typescript
const filteredData = useMemo(() => {
  return expensiveFilterFunction(data, filters)
}, [data, filters])
```

### Debounce em Buscas

Sempre use debounce em campos de busca:

```typescript
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch)
  }
}, [debouncedSearch])
```

## 🎨 Design System

### Cores

Use as cores do tema Orizon definidas no Tailwind:

```typescript
// Primary
className="bg-primary text-white"
className="bg-primary-hover"

// Dark
className="text-dark"

// Accent
className="bg-accent text-white"

// Background
className="bg-background"
```

### Componentes UI

Use os componentes do sistema de design:

```typescript
import { Button, Input, Card, Badge } from '@/components/ui'

<Button variant="primary" size="md">Clique</Button>
<Input label="Email" placeholder="email@exemplo.com" />
<Card padding="md">Conteúdo</Card>
<Badge variant="success">Ativo</Badge>
```

## 🔒 Segurança

### Validação

- ✅ Valide dados no cliente (Zod)
- ✅ Valide dados no servidor (backend)
- ✅ Sanitize inputs
- ✅ Use tipos TypeScript

### Autenticação

- ✅ Tokens expiram em 24 horas
- ✅ Tratamento automático de 401
- ✅ Logout automático em caso de erro

### CORS

O backend deve estar configurado para aceitar requisições do frontend.

## 🧪 Testes

### Estrutura Recomendada

```
__tests__/
├── components/
├── hooks/
└── utils/
```

### Exemplo de Teste

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

## 📚 Recursos Adicionais

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zod Docs](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)

## 🆘 Troubleshooting

### Problema: Token desaparece após F5

**Solução**: O sistema implementa persistência automática. Verifique:
1. Se o token está sendo salvo no `localStorage`
2. Se o componente está escutando o evento `auth-token-stored`
3. Console do navegador para erros

### Problema: Componente não recarrega após login

**Solução**: Certifique-se de que o componente:
1. Verifica token antes de fazer requisição
2. Escuta o evento `auth-token-stored`
3. Faz cleanup do event listener

### Problema: Erro 401 em requisições

**Solução**:
1. Verifique se o token está sendo enviado no header
2. Verifique se o token não expirou
3. Faça logout e login novamente

---

**Última atualização**: Janeiro 2025
