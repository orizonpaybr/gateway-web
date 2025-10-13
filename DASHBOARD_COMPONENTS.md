# Componentes do Dashboard Orizon

Este documento descreve os componentes de gráficos e visualização implementados no dashboard principal do Orizon.

## 📊 Componentes Implementados

### 1. TransactionChart

Componente de gráfico de linha interativo que exibe a movimentação de depósitos e saques ao longo do tempo.

**Localização:** `components/dashboard/TransactionChart.tsx`

**Características:**

- Gráfico de linha responsivo com Recharts
- Controle de zoom (50% a 200%)
- Seleção de período (Hoje, Ontem, 7 dias, 30 dias)
- Tooltip customizado com valores formatados
- Estatísticas em tempo real abaixo do gráfico
- Design responsivo para mobile

**Props:**

```typescript
interface TransactionChartProps {
  data?: Array<{
    time: string
    depositos: number
    saques: number
  }>
  period?: 'today' | 'week' | '7days' | '30days'
  onPeriodChange?: (period: 'today' | 'week' | '7days' | '30days') => void
}
```

**Exemplo de uso:**

```tsx
<TransactionChart
  data={chartData}
  period={chartPeriod}
  onPeriodChange={setChartPeriod}
/>
```

---

### 2. TransactionSummary

Componente de cards resumindo estatísticas de transações.

**Localização:** `components/dashboard/TransactionSummary.tsx`

**Características:**

- 8 cards de estatísticas diferentes
- Design com gradientes e ícones coloridos
- Formatação de valores monetários e percentuais
- Grid responsivo (1 coluna mobile → 4 colunas desktop)

**Cards inclusos:**

1. **Quantidade de Transações** - Depósitos e Saques
2. **Tarifa Cobrada** - Soma das taxas
3. **QR Codes** - Pagos/Gerados
4. **Índice de Conversão** - Taxa de conversão
5. **Ticket Médio** - Médias de depósitos e saques
6. **Valor Mínimo/Máximo** - Valores extremos
7. **Infrações** - Quantidade de bloqueios
8. **% de Infrações** - Percentual e valor total

**Props:**

```typescript
interface TransactionSummaryData {
  quantidadeTransacoes: {
    depositos: number
    saques: number
  }
  tarifaCobrada: number
  qrCodes: {
    pagos: number
    gerados: number
  }
  indiceConversao: number
  ticketMedio: {
    depositos: number
    saques: number
  }
  valorMinMax: {
    depositos: { min: number; max: number }
    saques: { min: number; max: number }
  }
  infracoes: number
  percentualInfracoes: {
    percentual: number
    valorTotal: number
  }
}
```

**Exemplo de uso:**

```tsx
<TransactionSummary data={summaryData} />
```

---

### 3. RecentTransactions

Componente de tabela exibindo as últimas transações.

**Localização:** `components/dashboard/RecentTransactions.tsx`

**Características:**

- Tabela responsiva com overflow horizontal
- Badges coloridos por tipo de transação
- Botão de copiar ID da transação
- Toast de confirmação ao copiar
- Design limpo e organizado

**Props:**

```typescript
interface Transaction {
  id: string
  type: 'deposito' | 'saque'
  valor: number
  descricao: string
  data: string
  hora: string
}

interface RecentTransactionsProps {
  transactions?: Transaction[]
  onViewExtract?: () => void
}
```

**Exemplo de uso:**

```tsx
<RecentTransactions
  transactions={recentTransactions}
  onViewExtract={() => router.push('/dashboard/extrato')}
/>
```

---

## 🎨 Design System

### Cores Utilizadas

- **Verde** (#10b981): Depósitos, valores positivos
- **Vermelho** (#ef4444): Saques, valores negativos
- **Azul** (#3b82f6): Informações gerais
- **Amarelo** (#eab308): Tarifas, avisos
- **Roxo** (#a855f7): QR Codes
- **Laranja** (#f97316): Infrações

### Responsividade

Todos os componentes seguem breakpoints do Tailwind CSS:

- **Mobile**: 1 coluna
- **Tablet (sm: 640px)**: 2 colunas
- **Desktop (lg: 1024px)**: 3-4 colunas

### Tipografia

- **Títulos**: font-bold, text-xl/2xl
- **Subtítulos**: font-semibold, text-lg
- **Valores**: font-bold, text-2xl
- **Labels**: font-medium, text-sm
- **Descrições**: text-xs/sm, text-gray-600

---

## 🔧 Integração no Dashboard

Os componentes foram integrados na página principal do dashboard em:
`app/(dashboard)/dashboard/page.tsx`

**Ordem de exibição:**

1. Cards de Estatísticas (Saldo, Entradas, Saídas, Splits)
2. Ações Rápidas (Pix, Buscar, Extrato)
3. Gráfico de Movimentação Interativa
4. Resumo de Transações (8 cards)
5. Últimas Transações (tabela)

---

## 📱 Mobile First

Todos os componentes foram desenvolvidos com abordagem **mobile-first**:

- Grid adaptativo com breakpoints responsivos
- Overflow horizontal em tabelas
- Botões e controles touch-friendly
- Tooltips e modais otimizados para telas pequenas

---

## ♻️ Princípios DRY

- Componentes reutilizáveis e desacoplados
- Props tipadas com TypeScript
- Funções de formatação compartilhadas
- Uso consistente do design system

---

## 🚀 Próximos Passos

Para conectar com dados reais da API:

1. Criar hooks customizados para buscar dados:

   - `useDashboardStats()` - Estatísticas gerais
   - `useTransactionChart()` - Dados do gráfico
   - `useTransactionSummary()` - Resumo de transações
   - `useRecentTransactions()` - Transações recentes

2. Implementar loading states e skeleton screens

3. Adicionar error boundaries para tratamento de erros

4. Implementar cache com React Query ou SWR

---

## 📚 Dependências

- **recharts**: ^2.12.7 - Biblioteca de gráficos
- **lucide-react**: ^0.400.0 - Ícones
- **sonner**: ^2.0.7 - Toast notifications
- **tailwindcss**: ^3.4.4 - Estilização

---

Desenvolvido com ❤️ para o projeto Orizon
