# Layout de Configurações

## Visão Geral

O layout de configurações foi completamente refatorado para utilizar navegação por tabs, melhorando a organização e experiência do usuário.

## Estrutura

### Componentes Principais

#### 1. **Página Principal** (`app/(dashboard)/dashboard/configuracoes/page.tsx`)

- Componente raiz que gerencia as tabs
- Utiliza o componente `Tabs` reutilizável
- Implementa otimizações de performance com `memo` e `useCallback`

#### 2. **Aba CONTA** (`components/dashboard/ConfiguracoesContaTab.tsx`)

Funcionalidades:

- **Trocar Senha**: Formulário completo com validação usando Zod
  - Senha atual
  - Nova senha (mínimo 8 caracteres)
  - Confirmação de senha
- **Autenticação de Dois Fatores (2FA)**:
  - Toggle para ativar/desativar
  - QR Code para configuração inicial
  - Código manual para backup
  - Campo de verificação para confirmar ativação
  - Estados visuais claros (ativo/inativo)

#### 3. **Aba INTEGRAÇÃO** (`components/dashboard/ConfiguracoesIntegracaoTab.tsx`)

Funcionalidades:

- **Credenciais API**:
  - Client Key (público)
  - Client Secret (privado)
  - Botão para mostrar/ocultar credenciais
  - Copiar credenciais para clipboard
  - Regenerar Client Secret
- **IPs Autorizados**:

  - Lista de IPs autorizados
  - Adicionar novo IP com validação
  - Remover IP existente
  - Validação de formato IP

- **Alertas de Segurança**: Informações importantes sobre uso das credenciais

#### 4. **Aba NOTIFICAÇÕES** (`components/dashboard/ConfiguracoesNotificacoesTab.tsx`)

Funcionalidades:

- **Canais de Notificação**:
  - WhatsApp (com edição de telefone)
  - Push (com solicitação de permissão do navegador)
  - Email
- **Preferências de Notificação**:
  - Transações
  - Depósitos
  - Saques
  - Segurança
  - Marketing

### Componentes Reutilizáveis Criados

#### 1. **Tabs** (`components/ui/Tabs.tsx`)

Sistema completo de tabs com:

- `Tabs`: Container principal
- `TabsList`: Lista de triggers
- `TabsTrigger`: Botão individual de tab
- `TabsContent`: Conteúdo de cada tab

Características:

- Context API para gerenciamento de estado
- Acessibilidade (ARIA roles)
- Animações suaves
- Responsivo

#### 2. **Switch** (`components/ui/Switch.tsx`)

Toggle switch reutilizável:

- Estados visuais claros
- Acessibilidade completa
- Suporte a disabled
- Animações suaves

## Otimizações de Performance

### 1. **Memoization**

Todos os componentes utilizam `memo()` para evitar re-renders desnecessários:

```typescript
export const ConfiguracoesContaTab = memo(() => {
  // ...
})
```

### 2. **Callbacks Otimizados**

Handlers são memoizados com `useCallback`:

```typescript
const handleTabChange = useCallback((value: string) => {
  setActiveTab(value)
}, [])
```

### 3. **useMemo para Dados Estáticos**

Dados que não mudam são memoizados:

```typescript
const notificationTypes = useMemo(
  () => [
    // array de configurações
  ],
  [],
)
```

### 4. **Lazy Loading**

Cada aba só renderiza quando ativa (implementado no componente Tabs)

## Padrões de Código

### 1. **Validação com Zod**

```typescript
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
})
```

### 2. **React Hook Form**

Para gerenciamento de formulários complexos:

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(passwordSchema),
})
```

### 3. **TypeScript Strict**

Todas as interfaces tipadas:

```typescript
interface NotificationSettings {
  whatsapp: {
    enabled: boolean
    phone: string
  }
  push: {
    enabled: boolean
  }
}
```

## Integração Futura com Backend

### Endpoints Necessários

#### 1. Trocar Senha

```
POST /api/user/change-password
Body: { currentPassword, newPassword }
```

#### 2. 2FA

```
POST /api/user/2fa/enable
Response: { qrCode, secret }

POST /api/user/2fa/verify
Body: { code }

DELETE /api/user/2fa/disable
```

#### 3. API Credentials

```
GET /api/user/credentials
POST /api/user/credentials/regenerate
```

#### 4. IPs Autorizados

```
GET /api/user/authorized-ips
POST /api/user/authorized-ips
Body: { ip }

DELETE /api/user/authorized-ips/:id
```

#### 5. Notificações

```
GET /api/user/notification-settings
PUT /api/user/notification-settings
Body: { settings, preferences }
```

## UI/UX

### Design System

- **Cores**: Sistema consistente com o resto da aplicação
- **Espaçamento**: 6 unidades de espaçamento entre seções
- **Cards**: Todos os blocos de conteúdo em cards com padding consistente
- **Ícones**: Lucide React para consistência
- **Estados**: Visuais claros para ativo/inativo/loading

### Responsividade

- Tabs empilham em mobile
- Formulários adaptam-se ao tamanho da tela
- Botões ajustam tamanho em dispositivos menores

### Acessibilidade

- ARIA roles em todos os componentes interativos
- Labels descritivos
- Feedback visual para todas as ações
- Suporte a navegação por teclado

## Próximos Passos

### Backend (Próxima Fase)

1. Implementar endpoints de API
2. Adicionar autenticação e autorização
3. Implementar lógica de 2FA no servidor
4. Configurar envio de notificações (WhatsApp, Email, Push)
5. Implementar whitelist de IPs

### Melhorias Futuras

1. Logs de atividade de segurança
2. Sessões ativas
3. Dispositivos conectados
4. Backup codes para 2FA
5. Histórico de alterações de configurações

## Estrutura de Arquivos

```
gateway-web/
├── app/(dashboard)/dashboard/configuracoes/
│   └── page.tsx                          # Página principal com tabs
├── components/
│   ├── dashboard/
│   │   ├── ConfiguracoesContaTab.tsx     # Aba CONTA
│   │   ├── ConfiguracoesIntegracaoTab.tsx # Aba INTEGRAÇÃO
│   │   └── ConfiguracoesNotificacoesTab.tsx # Aba NOTIFICAÇÕES
│   └── ui/
│       ├── Tabs.tsx                      # Componente Tabs
│       ├── Switch.tsx                    # Componente Switch
│       └── index.ts                      # Exports
└── CONFIGURACOES_LAYOUT.md               # Esta documentação
```

## Tecnologias Utilizadas

- **React 18**: Hooks, Context API
- **TypeScript**: Tipagem estrita
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Lucide React**: Biblioteca de ícones
- **Tailwind CSS**: Estilização
