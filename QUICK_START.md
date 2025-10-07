# Quick Start - HorsePay

## 🚀 Começar Rapidamente

### 1. Instalar e Executar

```bash
# Instalar dependências
yarn install

# Executar em desenvolvimento
yarn dev
```

Acesse: http://localhost:3000

### 2. Login/Cadastro

- **Login**: `/login`
- **Cadastro**: `/cadastro`

> ⚠️ Ainda sem backend integrado, use dados fictícios para testar

### 3. Navegação Principal

Após o login, você tem acesso a:

| Rota                       | Descrição                        |
| -------------------------- | -------------------------------- |
| `/dashboard`               | Página principal com visão geral |
| `/dashboard/jornada`       | Sistema de níveis e conquistas   |
| `/dashboard/buscar`        | Buscar transações                |
| `/dashboard/extrato`       | Extrato detalhado                |
| `/dashboard/pix`           | Transferências Pix               |
| `/dashboard/qr-codes`      | Gerenciar QR Codes               |
| `/dashboard/infracoes`     | Infrações e bloqueios            |
| `/dashboard/pendentes`     | Transações pendentes             |
| `/dashboard/conta`         | Dados da conta                   |
| `/dashboard/configuracoes` | Configurações gerais             |
| `/dashboard/suporte`       | Central de suporte               |
| `/dashboard/api-docs`      | Documentação da API              |

## 🎨 Componentes Disponíveis

### UI Components

```typescript
import { Button, Input, Card, Select, Badge, LoadingSpinner } from '@/components/ui'

// Botão
<Button variant="primary" size="md">Clique aqui</Button>

// Input
<Input label="Email" placeholder="seu@email.com" />

// Card
<Card padding="md">Conteúdo</Card>

// Select
<Select
  label="Opção"
  options={[
    { value: '1', label: 'Opção 1' },
    { value: '2', label: 'Opção 2' }
  ]}
/>

// Badge
<Badge variant="success">Ativo</Badge>

// Loading
<LoadingSpinner size="md" />
```

### Hooks Customizados

```typescript
import { useDebounce } from '@/hooks/useDebounce'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Debounce (útil para busca)
const debouncedSearch = useDebounce(searchTerm, 500)

// LocalStorage
const [value, setValue] = useLocalStorage('key', defaultValue)
```

## 📝 Formulários com Validação

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
})

const onSubmit = (data: FormData) => {
  console.log(data)
}
```

## 🎯 Próximos Passos

### Para Desenvolvedores

1. **Integrar Backend**

   - Atualizar `lib/api.ts` com endpoints reais
   - Implementar autenticação JWT
   - Conectar todas as páginas

2. **Adicionar Gráficos**

   - Usar Recharts no dashboard
   - Implementar gráficos de movimentação

3. **Melhorias de UX**
   - Adicionar toasts/notificações
   - Implementar skeleton loaders
   - Adicionar animações

### Para Designers

1. **Assets**

   - Adicionar logo oficial em `/public`
   - Adicionar favicon
   - Adicionar imagens ilustrativas

2. **Ajustes Visuais**
   - Revisar paleta de cores
   - Ajustar espaçamentos
   - Otimizar para mobile

## 🔧 Comandos Úteis

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

# Limpar cache
rm -rf .next node_modules yarn.lock
yarn install
```

## 📦 Estrutura de Pastas

```
app/                    # Páginas do Next.js
components/             # Componentes React
  ├── ui/              # Componentes reutilizáveis
  └── dashboard/       # Componentes do dashboard
contexts/              # Contextos React
hooks/                 # Hooks customizados
lib/                   # Funções utilitárias e API
types/                 # Tipos TypeScript
public/                # Arquivos estáticos
```

## 🎨 Cores do Tema

```css
Primary: #4845d2
Primary Hover: #3835b5
Secondary: #8b88dd
Background: #f5f5f5
Success: #10b981
Warning: #f59e0b
Error: #ef4444
Info: #3b82f6
```

## 📱 Responsividade

Todos os componentes são responsivos:

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## ❓ Dúvidas Frequentes

**Q: Como adicionar uma nova página?**

```bash
# Criar arquivo em app/(dashboard)/dashboard/nova-pagina/page.tsx
# Adicionar rota no Sidebar.tsx
```

**Q: Como mudar as cores?**

```bash
# Editar tailwind.config.ts
# Cores em: theme.extend.colors
```

**Q: Como adicionar validação em formulário?**

```typescript
// Usar Zod schema + React Hook Form
// Ver exemplos em app/(auth)/login/page.tsx
```

## 🆘 Problemas Comuns

**Erro: "Module not found"**

```bash
yarn install
```

**Erro: TypeScript**

```bash
yarn tsc --noEmit
# Verificar tipos em types/index.ts
```

**Página em branco**

```bash
# Verificar console do navegador
# Verificar terminal onde o yarn dev está rodando
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Lucide Icons](https://lucide.dev/)

---

**Pronto para começar! 🎉**

Execute `yarn dev` e abra http://localhost:3000
