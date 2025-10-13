# Hooks Customizados - Gateway Orizon

Este documento descreve os hooks customizados implementados no projeto Gateway Orizon e como utilizá-los corretamente.

## 📋 Índice

- [useLocalStorage](#uselocalstorage)
- [useDebounce](#usedebounce)
- [Exemplos de Uso](#exemplos-de-uso)
- [Boas Práticas](#boas-práticas)

## 🔧 useLocalStorage

### Descrição

Hook para gerenciar dados no localStorage de forma reativa e type-safe.

### Características

- ✅ **Type Safety**: Totalmente tipado com TypeScript
- ✅ **SSR Safe**: Verifica se `window` está disponível
- ✅ **Error Handling**: Tratamento de erros automático
- ✅ **Reactive**: Atualiza componentes quando o valor muda
- ✅ **JSON Serialization**: Serialização/deserialização automática

### Sintaxe

```typescript
const [value, setValue] = useLocalStorage<T>(key: string, initialValue: T)
```

### Parâmetros

- `key`: Chave única no localStorage
- `initialValue`: Valor inicial caso não exista no localStorage

### Retorno

- `value`: Valor atual armazenado
- `setValue`: Função para atualizar o valor

### Exemplo Básico

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage'

function MyComponent() {
  const [user, setUser] = useLocalStorage<User | null>('user', null)
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')

  return (
    <div>
      <p>Usuário: {user?.name}</p>
      <button onClick={() => setTheme('dark')}>Modo Escuro</button>
    </div>
  )
}
```

### Implementação no Projeto

**Arquivo**: `contexts/AuthContext.tsx`

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('user', null)
  const [token, setToken] = useLocalStorage<string | null>('token', null)

  // ... resto da implementação
}
```

---

## ⏱️ useDebounce

### Descrição

Hook para debounce de valores, útil para otimizar requisições e evitar múltiplas chamadas.

### Características

- ✅ **Performance**: Evita múltiplas requisições desnecessárias
- ✅ **Configurável**: Delay personalizável
- ✅ **Type Safe**: Suporte completo ao TypeScript
- ✅ **Memory Safe**: Cleanup automático de timeouts

### Sintaxe

```typescript
const debouncedValue = useDebounce<T>(value: T, delay?: number)
```

### Parâmetros

- `value`: Valor a ser debounced
- `delay`: Delay em milissegundos (padrão: 500ms)

### Retorno

- `debouncedValue`: Valor com debounce aplicado

### Exemplo Básico

```typescript
import { useDebounce } from '@/hooks/useDebounce'

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Fazer busca apenas após 300ms de inatividade
      performSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar..."
    />
  )
}
```

### Implementação no Projeto

#### 1. Página de Extrato

**Arquivo**: `app/(dashboard)/dashboard/extrato/page.tsx`

```typescript
export default function ExtratoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const typeMatch = filterType === 'all' || transaction.type === filterType
      const searchMatch =
        debouncedSearchTerm === '' ||
        transaction.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        transaction.endToEndId
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())

      return typeMatch && searchMatch
    })
  }, [transactions, filterType, debouncedSearchTerm])

  // ... resto da implementação
}
```

#### 2. Página de Busca

**Arquivo**: `app/(dashboard)/dashboard/buscar/page.tsx`

```typescript
export default function BuscarPage() {
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 500)

  // ... resto da implementação
}
```

---

## 📚 Exemplos de Uso

### 1. Gerenciamento de Estado de Autenticação

```typescript
// contexts/AuthContext.tsx
const [user, setUser] = useLocalStorage<User | null>('user', null)
const [token, setToken] = useLocalStorage<string | null>('token', null)

// Logout
const logout = () => {
  setUser(null)
  setToken(null)
  // Redirecionar para login
}
```

### 2. Busca com Debounce

```typescript
// components/SearchInput.tsx
function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    onSearch(debouncedSearchTerm)
  }, [debouncedSearchTerm, onSearch])

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Digite para buscar..."
    />
  )
}
```

### 3. Filtros de Lista

```typescript
// components/TransactionList.tsx
function TransactionList() {
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>(
    'all',
  )
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const typeMatch = filterType === 'all' || transaction.type === filterType
      const searchMatch =
        debouncedSearchTerm === '' ||
        transaction.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())

      return typeMatch && searchMatch
    })
  }, [transactions, filterType, debouncedSearchTerm])

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Filtrar transações..."
      />
      {filteredTransactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  )
}
```

---

## ✅ Boas Práticas

### useLocalStorage

1. **Chaves Únicas**: Use chaves descritivas e únicas
2. **Tipos Específicos**: Sempre especifique o tipo genérico
3. **Valores Iniciais**: Defina valores iniciais apropriados
4. **Cleanup**: Limpe dados sensíveis no logout

```typescript
// ✅ Bom
const [user, setUser] = useLocalStorage<User | null>('orizon_user', null)
const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
  'user_preferences',
  defaultPreferences,
)

// ❌ Evitar
const [data, setData] = useLocalStorage('data', null) // Sem tipo
const [user, setUser] = useLocalStorage('user', {}) // Objeto vazio como inicial
```

### useDebounce

1. **Delays Apropriados**: Use delays menores para UI, maiores para API
2. **Dependências**: Inclua todas as dependências no useMemo/useEffect
3. **Performance**: Combine com useMemo para cálculos pesados

```typescript
// ✅ Bom
const debouncedSearchTerm = useDebounce(searchTerm, 300) // UI rápida
const debouncedApiCall = useDebounce(searchTerm, 1000) // API mais lenta

const filteredData = useMemo(() => {
  return expensiveFilterFunction(data, debouncedSearchTerm)
}, [data, debouncedSearchTerm]) // Dependências corretas

// ❌ Evitar
const debouncedValue = useDebounce(value, 0) // Sem delay
const result = expensiveCalculation(debouncedValue) // Sem useMemo
```

### Casos de Uso Recomendados

#### useLocalStorage

- ✅ Configurações do usuário
- ✅ Dados de autenticação
- ✅ Preferências de UI
- ✅ Estado de formulários
- ❌ Dados sensíveis (use sessionStorage)
- ❌ Dados grandes (use IndexedDB)

#### useDebounce

- ✅ Campos de busca
- ✅ Filtros em tempo real
- ✅ Validação de formulários
- ✅ Chamadas de API
- ❌ Valores que precisam de resposta imediata
- ❌ Estados de loading/spinner

---

## 🔍 Debugging

### useLocalStorage

```typescript
// Verificar valor no localStorage
console.log('Valor atual:', localStorage.getItem('minha_chave'))

// Limpar valor específico
localStorage.removeItem('minha_chave')

// Limpar tudo
localStorage.clear()
```

### useDebounce

```typescript
// Debug do debounce
const debouncedValue = useDebounce(value, 500)

useEffect(() => {
  console.log('Valor original:', value)
  console.log('Valor com debounce:', debouncedValue)
}, [value, debouncedValue])
```

---

## 📝 Notas de Implementação

1. **SSR Compatibility**: Ambos os hooks são compatíveis com SSR
2. **Error Handling**: Tratamento automático de erros de serialização
3. **Memory Leaks**: Cleanup automático de listeners e timeouts
4. **Type Safety**: Suporte completo ao TypeScript
5. **Performance**: Otimizados para evitar re-renders desnecessários

---

_Documentação atualizada em: Janeiro 2025_
_Versão: 1.0.0_
