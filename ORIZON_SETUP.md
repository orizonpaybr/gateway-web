# Configuração Orizon Pay

Este documento descreve as configurações aplicadas ao projeto para refletir a identidade visual da Orizon.

## 🎨 Paleta de Cores Aplicada

As cores da Orizon foram configuradas no `tailwind.config.ts` e podem ser usadas em todo o projeto:

### Cores Principais

- **Azul Orizon (Primary)**: `#007BC7`

  - Uso: Logo, botões de ação
  - Classes: `bg-primary`, `text-primary`, `border-primary`
  - Hover: `#006BA8` - `bg-primary-hover`
  - Light: `#009EE0` - `bg-primary-light`

- **Azul Escuro (Dark)**: `#0C243B`

  - Uso: Textos e títulos
  - Classes: `text-dark`, `bg-dark`
  - Alternativa: `#000000` - `text-dark-alt`

- **Branco (Background)**: `#FFFFFF`
  - Uso: Fundo principal, caixas de login/formulários
  - Classes: `bg-background`

### Cores Secundárias

- **Azul Secundário (Secondary)**: `#009EE0` a `#00BFFF`

  - Uso: Gráficos, fundos secundários
  - Classes: `bg-secondary`, `bg-secondary-light`

- **Laranja (Accent)**: `#FF8A00`

  - Uso: Destaque, alertas importantes
  - Classes: `bg-accent`, `text-accent`
  - Hover: `#E67A00` - `bg-accent-hover`

- **Cinza Suave (Gray)**: `#F3F3F3` a `#EBEBEB`
  - Uso: Elementos secundários, bordas
  - Classes: `bg-gray-light`, `bg-gray-lighter`

## 📝 Exemplos de Uso das Cores

```tsx
// Botão principal
<button className="bg-primary hover:bg-primary-hover text-white">
  Confirmar
</button>

// Botão de destaque/alerta
<button className="bg-accent hover:bg-accent-hover text-white">
  Ação Importante
</button>

// Card/Container
<div className="bg-background border border-gray-lighter">
  <h2 className="text-dark">Título</h2>
</div>

// Link ou texto com cor secundária
<a className="text-secondary hover:text-primary">
  Ver mais
</a>
```

## 🔔 Sistema de Toast (Sonner)

O Sonner foi instalado e configurado para notificações toast em todo o projeto.

### Como Usar

```tsx
'use client'
import { toast } from 'sonner'

// Toast de sucesso
toast.success('Operação realizada com sucesso!')

// Toast de erro
toast.error('Erro ao processar solicitação')

// Toast de aviso
toast.warning('Atenção: verifique os dados')

// Toast com descrição
toast.success('Pagamento aprovado', {
  description: 'O pagamento de R$ 100,00 foi processado',
})

// Toast com ação
toast('Arquivo deletado', {
  action: {
    label: 'Desfazer',
    onClick: () => console.log('Desfazer'),
  },
})

// Toast para operações assíncronas
const myPromise = fetch('/api/data')
toast.promise(myPromise, {
  loading: 'Carregando...',
  success: 'Sucesso!',
  error: 'Erro ao carregar',
})
```

### Personalização

Os toasts já estão estilizados com as cores da Orizon:

- ✅ **Sucesso**: Borda azul Orizon (`#007BC7`)
- ❌ **Erro**: Borda laranja (`#FF8A00`)
- ⚠️ **Aviso**: Borda laranja (`#FF8A00`)
- ℹ️ **Info**: Borda azul secundário (`#009EE0`)

## 🖼️ Logo

A logo da Orizon (`LOGO-ORIZON-AZUL-PRETA.png`) foi integrada em:

- Página de login
- Página de cadastro
- Sidebar do dashboard

A logo está localizada em `/public/LOGO-ORIZON-AZUL-PRETA.png`

## 📦 Componentes Atualizados

### Páginas de Autenticação

- ✅ `app/(auth)/login/page.tsx`
- ✅ `app/(auth)/cadastro/page.tsx`

### Dashboard

- ✅ `components/dashboard/Sidebar.tsx`
- Menu item atualizado: "Jornada Orizon" (anteriormente "Jornada HorsePay")

### Layout

- ✅ `app/layout.tsx`
  - Título: "Orizon Pay - Finance"
  - Toaster configurado

### Estilos Globais

- ✅ `app/globals.css`
  - Scrollbar personalizada com cores Orizon
  - Estilos para toasts com cores da marca

## 🎯 Próximos Passos Recomendados

1. **Atualizar Componentes UI**: Revisar os componentes em `components/ui/` para usar as novas cores
2. **Revisar Cards e Badges**: Aplicar as cores Orizon em cards, badges e outros elementos visuais
3. **Testar Responsividade**: Verificar se a logo se adapta bem em diferentes tamanhos de tela
4. **Adicionar Favicon**: Criar e adicionar um favicon com as cores/logo da Orizon

## 🔍 Referência Rápida

**Arquivo de Configuração**: `tailwind.config.ts`  
**Exemplos de Toast**: `lib/toast.example.ts`  
**Estilos Globais**: `app/globals.css`  
**Logo**: `public/LOGO-ORIZON-AZUL-PRETA.png`

---

**Data de Atualização**: Outubro 2025  
**Versão**: 0.1.0
