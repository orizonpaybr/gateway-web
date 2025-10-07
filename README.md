# HorsePay - Sistema de Pagamentos

Sistema completo de gestão financeira e pagamentos desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **Lucide React** - Ícones
- **Recharts** - Gráficos (para integração futura)
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
# Instalar dependências
yarn install

# Executar em modo de desenvolvimento
yarn dev

# Build para produção
yarn build

# Iniciar servidor de produção
yarn start
```

## 🏗️ Estrutura do Projeto

```
gateway-web/
├── app/
│   ├── (auth)/           # Páginas de autenticação
│   │   ├── login/
│   │   └── cadastro/
│   ├── (dashboard)/      # Páginas do dashboard
│   │   └── dashboard/
│   │       ├── page.tsx              # Dashboard principal
│   │       ├── jornada/              # Jornada HorsePay
│   │       ├── buscar/               # Buscar transações
│   │       ├── extrato/              # Extrato
│   │       ├── pix/                  # Transferências Pix
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
│   ├── ui/               # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── dashboard/        # Componentes do dashboard
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   └── utils.ts          # Funções utilitárias
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 📋 Funcionalidades

### Autenticação

- ✅ Login com validação
- ✅ Cadastro multi-etapas com validação Zod
- ✅ Recuperação de senha (UI pronta)

### Dashboard

- ✅ Visão geral com estatísticas
- ✅ Gráficos de movimentação (estrutura pronta para integração)
- ✅ Transações recentes
- ✅ Ações rápidas

### Jornada HorsePay

- ✅ Sistema de níveis (Bronze, Prata, Ouro, Safira, Diamante)
- ✅ Progresso visual
- ✅ Conquistas e marcos

### Transações

- ✅ Busca por ID ou EndToEndID
- ✅ Visualização detalhada
- ✅ Extrato com filtros
- ✅ Exportação de dados (preparado para API)

### Pix

- ✅ Transferência via chave Pix
- ✅ Validação de limites
- ✅ Confirmação em múltiplas etapas

### QR Codes

- ✅ Listagem de cobranças
- ✅ Filtros por status
- ✅ Estatísticas

### Infrações

- ✅ Listagem e detalhamento
- ✅ Alertas visuais
- ✅ Exportação (preparado para API)

### Transações Pendentes

- ✅ Listagem com filtros
- ✅ Ações de aprovação/rejeição (preparado para API)

### Configurações

- ✅ Dados pessoais e da empresa
- ✅ Taxas e limites
- ✅ Funcionalidades ativas
- ✅ Troca de senha
- ✅ Credenciais da API
- ✅ Notificações (WhatsApp e Push)

### Suporte e Documentação

- ✅ Múltiplos canais de contato
- ✅ FAQ interativo
- ✅ Documentação da API
- ✅ Exemplos de código

## 🎨 Design

O sistema segue um padrão de cores consistente:

- **Primário**: #4845d2 (Roxo/Azul)
- **Secundário**: #8b88dd (Roxo claro)
- **Background**: #f5f5f5 (Cinza claro)

## 🔌 Integração com API

Todas as páginas estão preparadas para integração com o backend. Os pontos de integração incluem:

- Autenticação e autorização
- CRUD de transações
- Transferências Pix
- Geração de QR Codes
- Consulta de saldo e extrato
- Webhooks e notificações

## 📱 Responsividade

O sistema é totalmente responsivo e se adapta a diferentes tamanhos de tela:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔒 Segurança

- Validação de formulários com Zod
- Tipos TypeScript em todo o projeto
- Preparado para autenticação JWT
- Proteção de rotas (a implementar com API)

## 🚧 Próximos Passos

1. Integrar com o backend/API
2. Implementar autenticação real com JWT
3. Adicionar gráficos interativos com Recharts
4. Implementar websockets para notificações em tempo real
5. Adicionar testes unitários e de integração
6. Implementar PWA (Progressive Web App)

## 📄 Licença

Este projeto é proprietário da HorsePay.

## 👥 Suporte

Para suporte, entre em contato através de:

- Email: suporte@horsepay.com
- WhatsApp: (11) 99999-9999
- Telefone: (11) 3333-3333
