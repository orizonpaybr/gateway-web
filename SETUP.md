# Guia de Configuração - HorsePay

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
# API Configuration
NEXT_PUBLIC_API_URL=https://api.horsepay.com
NEXT_PUBLIC_API_VERSION=v1

# Environment
NEXT_PUBLIC_ENV=development
```

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
├── lib/                # Utilitários
├── types/              # Definições de tipos TypeScript
├── public/             # Arquivos estáticos
└── ...configs          # Arquivos de configuração
```

## 🔧 Configurações Importantes

### Tailwind CSS

O projeto usa Tailwind CSS com configuração personalizada em `tailwind.config.ts`:

- Cores primárias customizadas
- Tema estendido
- Utilitários personalizados

### TypeScript

Configuração strict habilitada para maior segurança de tipos.

### Formulários

Todos os formulários usam:

- **React Hook Form** para gerenciamento
- **Zod** para validação de esquemas

## 🎯 Próximas Etapas

1. **Integrar com Backend**

   - Configurar cliente HTTP (axios/fetch)
   - Implementar serviços de API
   - Adicionar interceptors para autenticação

2. **Autenticação Real**

   - Implementar login com JWT
   - Proteção de rotas
   - Refresh token

3. **Estado Global** (opcional)

   - Considerar Zustand ou Context API
   - Gerenciar estado do usuário
   - Cache de dados

4. **Gráficos**
   - Integrar Recharts nos dashboards
   - Adicionar dados reais

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev

# Build
yarn build

# Produção
yarn start

# Lint
yarn lint
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

## 📞 Suporte

Para dúvidas sobre a implementação, consulte:

- README.md
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do Tailwind: https://tailwindcss.com/docs
