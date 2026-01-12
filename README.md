# Orizon Pay - Gateway de Pagamentos

Sistema completo de gestão financeira e pagamentos desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **Lucide React** - Ícones
- **Recharts** - Gráficos interativos
- **date-fns** - Manipulação de datas
- **Sonner** - Notificações toast
- **React Query** - Gerenciamento de estado e cache

## 📦 Instalação Rápida

```bash
# Instalar dependências
yarn install

# Executar em modo de desenvolvimento
yarn dev
```

Acesse: http://localhost:3000

Para mais detalhes, consulte [SETUP.md](./SETUP.md)

## 🏗️ Estrutura do Projeto

```
gateway-web/
├── app/
│   ├── (auth)/              # Páginas de autenticação
│   │   ├── login/
│   │   └── cadastro/
│   ├── (dashboard)/         # Páginas do dashboard
│   │   └── dashboard/
│   │       ├── page.tsx              # Dashboard principal
│   │       ├── jornada/              # Jornada Orizon (gamificação)
│   │       ├── buscar/               # Buscar transações
│   │       ├── extrato/              # Extrato
│   │       ├── pix/                  # Transferências e depósitos PIX
│   │       ├── qr-codes/             # QR Codes
│   │       ├── infracoes/            # Infrações
│   │       ├── pendentes/            # Transações pendentes
│   │       ├── conta/                # Dados da conta
│   │       ├── configuracoes/        # Configurações
│   │       ├── suporte/              # Suporte
│   │       └── api-docs/             # Documentação da API
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Componentes reutilizáveis
│   ├── dashboard/           # Componentes do dashboard
│   ├── modals/              # Modais
│   ├── financial/           # Componentes financeiros
│   └── admin/               # Componentes administrativos
├── contexts/                # Contextos React
├── hooks/                   # Hooks customizados
├── lib/                     # Utilitários e API
├── types/                   # Tipos TypeScript
└── public/                  # Arquivos estáticos
```

## 📋 Funcionalidades Principais

### Autenticação e Segurança

- ✅ Login com validação
- ✅ Cadastro multi-etapas
- ✅ Autenticação de dois fatores (2FA)
- ✅ Recuperação de senha
- ✅ Troca de senha
- ✅ Gerenciamento de sessões

### Dashboard

- ✅ Visão geral com estatísticas em tempo real
- ✅ Gráficos de movimentação interativos
- ✅ Transações recentes
- ✅ Resumo de transações (8 cards)
- ✅ Ações rápidas

### Transações

- ✅ Busca por ID ou EndToEndID
- ✅ Visualização detalhada
- ✅ Extrato com filtros avançados
- ✅ Exportação de dados
- ✅ Transações manuais (admin)

### PIX

- ✅ Transferência via chave PIX
- ✅ Depósito via QR Code PIX
- ✅ Validação de limites
- ✅ Confirmação em múltiplas etapas
- ✅ Polling automático de status

### QR Codes

- ✅ Geração de QR Codes
- ✅ Listagem de cobranças
- ✅ Filtros por status
- ✅ Estatísticas

### Gamificação

- ✅ Sistema de níveis (Bronze, Prata, Ouro, Safira, Diamante)
- ✅ Progresso visual
- ✅ Conquistas e marcos

### Configurações

- ✅ Dados pessoais e da empresa
- ✅ Taxas e limites
- ✅ Troca de senha
- ✅ Autenticação 2FA
- ✅ Credenciais da API
- ✅ IPs autorizados
- ✅ Notificações (WhatsApp, Push, Email)

### Administração

- ✅ Gestão de usuários
- ✅ Aprovação de contas
- ✅ Transações manuais
- ✅ Configurações do gateway

## 🎨 Design System

### Cores Orizon

- **Azul Orizon (Primary)**: `#007BC7`
- **Azul Escuro (Dark)**: `#0C243B`
- **Azul Secundário**: `#009EE0`
- **Laranja (Accent)**: `#FF8A00`
- **Branco (Background)**: `#FFFFFF`
- **Cinza Suave**: `#F3F3F3`

### Responsividade

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 🔌 Integração com Backend

O frontend está integrado com o backend Laravel através de API REST. Consulte [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) para detalhes técnicos.

### Endpoints Principais

- Autenticação: `/api/auth/*`
- Transações: `/api/transactions/*`
- PIX: `/api/pix/*`
- QR Codes: `/api/qrcode/*`
- Usuário: `/api/user/*`
- Admin: `/api/admin/*`

## 🔒 Segurança

- Validação de formulários com Zod
- Tipos TypeScript em todo o projeto
- Autenticação JWT
- Proteção de rotas com middleware
- Rate limiting
- Sanitização de inputs
- CORS configurado

## 📚 Documentação Adicional

- **[SETUP.md](./SETUP.md)** - Guia de configuração e instalação
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Guia técnico para desenvolvedores

## 🚧 Próximos Passos

1. Implementar testes unitários e de integração
2. Adicionar websockets para notificações em tempo real
3. Implementar PWA (Progressive Web App)
4. Melhorar acessibilidade (WCAG)
5. Otimizações de performance

## 📄 Licença

Este projeto é proprietário da Orizon Pay.

## 👥 Suporte

Para suporte técnico, consulte a documentação ou entre em contato com a equipe de desenvolvimento.
