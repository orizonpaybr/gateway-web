# Análise Completa de Melhorias - Frontend

## 📊 Resumo Executivo

Análise detalhada de todos os arquivos do front-end relacionados a admin/users, verificando:
- ✅ NextJS Best Practices
- ✅ TypeScript/JavaScript
- ✅ Clean Code
- ✅ DRY (Don't Repeat Yourself)
- ✅ Manutenibilidade
- ✅ Escalabilidade
- ✅ Performance
- ✅ Uso correto de hooks nativos React/NextJS
- ✅ Uso dos hooks e utilitários disponíveis (@lib, @optimized, @hooks, @ui)

---

## 🔴 **PROBLEMAS CRÍTICOS (Performance e Bugs)**

### **1. UserFilters.tsx - Debounce Manual (Não usa hook)**
**Problema:** Implementa debounce manual com `useEffect` + `setTimeout` ao invés de usar `useDebounce` hook disponível.

**Impacto:** 
- ❌ Código duplicado
- ❌ Lógica de debounce espalhada
- ❌ Não segue padrão do projeto

**Arquivo:** `components/admin/users/UserFilters.tsx`

**Código Atual:**
```typescript
useEffect(() => {
    const handler = setTimeout(() => {
        onChange({ search: search || undefined, status })
    }, 300)
    return () => clearTimeout(handler)
}, [search, status])
```

**Solução:** Usar `useDebounce` hook disponível em `@hooks/useDebounce.ts`

---

### **2. UsersTable.tsx - Formatação de Data Duplicada**
**Problema:** Função `formatDate` definida dentro do `map()`, recriada a cada render.

**Impacto:**
- ❌ Performance: função recriada N vezes (N = número de usuários)
- ❌ Não usa utilitário `formatDateBR` disponível em `@lib/format.ts`
- ❌ Código duplicado

**Arquivo:** `components/admin/users/UsersTable.tsx`

**Código Atual:**
```typescript
{users.map((u) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    // ...
})}
```

**Solução:** 
- Mover função para fora do map
- Usar `formatDateBR` de `@lib/format.ts`
- Memorizar com `useCallback` ou `useMemo`

---

### **3. UsersTable.tsx - Formatação de Moeda Duplicada**
**Problema:** Formatação de moeda (`R$ ${Number(u.vendas_7d || 0).toFixed(2)}`) inline, não usa `formatCurrencyBRL`.

**Impacto:**
- ❌ Código duplicado
- ❌ Inconsistência de formatação
- ❌ Não usa utilitário disponível

**Arquivo:** `components/admin/users/UsersTable.tsx`

**Código Atual:**
```typescript
<td className="px-4 py-3 whitespace-nowrap text-gray-600">R$ {Number(u.vendas_7d || 0).toFixed(2)}</td>
```

**Solução:** Usar `formatCurrencyBRL` de `@lib/format.ts`

---

### **4. UserEditModal.tsx - Funções de Máscara Duplicadas**
**Problema:** Funções `formatCpfCnpj` e `formatPhone` definidas dentro do componente, duplicadas.

**Impacto:**
- ❌ Código duplicado (provavelmente existe em outros lugares)
- ❌ Não reutilizável
- ❌ Performance: recriadas a cada render

**Arquivo:** `components/admin/users/UserEditModal.tsx`

**Código Atual:**
```typescript
const formatCpfCnpj = (v: string) => { /* ... */ }
const formatPhone = (v: string) => { /* ... */ }
```

**Solução:** 
- Verificar se existe utilitário em `@lib/format.ts` ou `@lib/utils.ts`
- Criar utilitário centralizado se não existir
- Memorizar com `useCallback`

---

### **5. UserFeesModal.tsx - Função formatNumber Duplicada**
**Problema:** Função `formatNumber` definida dentro do componente, duplicada em `UserAffiliateModal.tsx`.

**Impacto:**
- ❌ Código duplicado
- ❌ Inconsistência
- ❌ Não reutilizável

**Arquivos:** 
- `components/admin/users/UserFeesModal.tsx`
- `components/admin/users/UserAffiliateModal.tsx`

**Solução:** Criar utilitário centralizado em `@lib/format.ts`

---

### **6. page.tsx - Múltiplos refetch() Desnecessários**
**Problema:** `refetch()` chamado após cada mutation, mesmo com cache invalidation automática.

**Impacto:**
- ❌ Requests duplicados
- ❌ Performance degradada
- ❌ React Query já faz invalidation automática

**Arquivo:** `app/(dashboard)/dashboard/admin/usuarios/page.tsx`

**Código Atual:**
```typescript
const handleApprove = async (u: any) => {
    await approveMutation.mutateAsync(u.id)
    refetch() // ❌ Desnecessário
    setCurrentPage(1)
}
```

**Solução:** Remover `refetch()` - React Query já invalida cache automaticamente

---

### **7. page.tsx - Falta useMemo para Dados Derivados**
**Problema:** `users` é derivado de `data?.users || []`, mas não é memorizado.

**Impacto:**
- ❌ Re-render desnecessário quando `data` muda
- ❌ Performance

**Arquivo:** `app/(dashboard)/dashboard/admin/usuarios/page.tsx`

**Solução:** Usar `useMemo` para `users`

---

### **8. UserFilters.tsx - Falta Dependência no useEffect**
**Problema:** `useEffect` não inclui `onChange` nas dependências, mas usa.

**Impacto:**
- ⚠️ Warning do ESLint
- ⚠️ Possível bug se `onChange` mudar

**Arquivo:** `components/admin/users/UserFilters.tsx`

**Solução:** Adicionar `onChange` nas dependências OU usar `useCallback` no parent

---

### **9. UserEditModal.tsx - Select onChange com Type Error**
**Problema:** `Select` onChange recebe `string`, mas código tenta converter para `number` sem verificar.

**Impacto:**
- ⚠️ Type safety
- ⚠️ Possível bug

**Arquivo:** `components/admin/users/UserEditModal.tsx`

**Código Atual:**
```typescript
onChange={(val) => handleChange('gerente_id', val ? Number(val) : undefined)}
```

**Solução:** Validar se `val` é válido antes de converter

---

### **10. UserFilters.tsx - Select onChange Type Inconsistente**
**Problema:** `Select` onChange passa `string`, mas código trata como `number`.

**Arquivo:** `components/admin/users/UserFilters.tsx`

**Código Atual:**
```typescript
onChange={(e) => setStatus(e.target.value ? Number(e.target.value) : undefined)}
```

**Problema:** `e` é `string`, não `Event`. Deveria ser `onChange={(val) => setStatus(val ? Number(val) : undefined)}`

---

## 🟡 **PROBLEMAS IMPORTANTES (Manutenibilidade e DRY)**

### **11. page.tsx - Handlers Não Memorizados**
**Problema:** Handlers criados inline ou sem `useCallback`, causando re-renders desnecessários.

**Arquivo:** `app/(dashboard)/dashboard/admin/usuarios/page.tsx`

**Código Atual:**
```typescript
const handleApprove = async (u: any) => { /* ... */ }
const handleToggleBlock = async (u: any) => { /* ... */ }
// etc...
```

**Solução:** Usar `useCallback` para memorizar handlers

---

### **12. UsersTable.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()` ou `React.memo()`, re-renderiza mesmo quando props não mudam.

**Impacto:**
- ❌ Performance: re-renders desnecessários
- ❌ Não segue padrão de outros componentes (ex: `RecentTransactions` usa `memo`)

**Arquivo:** `components/admin/users/UsersTable.tsx`

**Solução:** Envolver componente com `memo()`

---

### **13. UserViewModal.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/admin/users/UserViewModal.tsx`

**Solução:** Envolver com `memo()`

---

### **14. UserEditModal.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/admin/users/UserEditModal.tsx`

**Solução:** Envolver com `memo()`

---

### **15. UserFeesModal.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/admin/users/UserFeesModal.tsx`

**Solução:** Envolver com `memo()`

---

### **16. UserAffiliateModal.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/admin/users/UserAffiliateModal.tsx`

**Solução:** Envolver com `memo()`

---

### **17. UserSummaryCards.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/admin/users/UserSummaryCards.tsx`

**Solução:** Envolver com `memo()`

---

### **18. TablePagination.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/admin/users/TablePagination.tsx`

**Solução:** Envolver com `memo()`

---

### **19. UserFilters.tsx - Componente Não Memorizado**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/admin/users/UserFilters.tsx`

**Solução:** Envolver com `memo()`

---

### **20. page.tsx - Tipos `any` Usados**
**Problema:** Múltiplos usos de `any` ao invés de tipos específicos.

**Impacto:**
- ❌ Perda de type safety
- ❌ Possíveis bugs em runtime
- ❌ Não segue TypeScript best practices

**Arquivo:** `app/(dashboard)/dashboard/admin/usuarios/page.tsx`

**Código Atual:**
```typescript
const [editUser, setEditUser] = useState<any>(null)
const [deleteUser, setDeleteUser] = useState<any>(null)
const handleApprove = async (u: any) => { /* ... */ }
```

**Solução:** Usar `AdminUser` type de `@lib/api.ts`

---

### **21. UserViewModal.tsx - Tipo `any` para User**
**Problema:** Prop `user` usa `any` ao invés de `AdminUser`.

**Arquivo:** `components/admin/users/UserViewModal.tsx`

**Código Atual:**
```typescript
interface UserViewModalProps {
    user?: any | null
}
```

**Solução:** Usar `AdminUser` type

---

### **22. UserEditModal.tsx - Tipo `any` para User**
**Problema:** Prop `user` usa `any` ao invés de `AdminUser`.

**Arquivo:** `components/admin/users/UserEditModal.tsx`

**Solução:** Usar `AdminUser` type

---

### **23. UserFeesModal.tsx - Tipo `any` para User**
**Problema:** Prop `user` usa `any` ao invés de `AdminUser`.

**Arquivo:** `components/admin/users/UserFeesModal.tsx`

**Solução:** Usar `AdminUser` type

---

### **24. UserAffiliateModal.tsx - Tipo `any` para User**
**Problema:** Prop `user` usa `any` ao invés de `AdminUser`.

**Arquivo:** `components/admin/users/UserAffiliateModal.tsx`

**Solução:** Usar `AdminUser` type

---

### **25. useAdminUsers.ts - useSaveAffiliateSettings - Cache Update Inconsistente**
**Problema:** Cache update manual é complexo e pode estar incorreto.

**Arquivo:** `hooks/useAdminUsers.ts`

**Código Atual:**
```typescript
queryClient.setQueryData(['admin-user', userId], (oldData: any) => {
    if (!oldData) return oldData
    return {
        ...oldData,
        user: {
            ...oldData.user,
            // ...
        },
    }
})
```

**Problema:** Estrutura de `oldData` pode não ser a esperada (pode ser `AdminUser` diretamente, não `{ user: AdminUser }`)

**Solução:** Verificar estrutura real e corrigir

---

### **26. UsersTable.tsx - Magic Numbers para Status**
**Problema:** Números mágicos (`status === 1`, `status === 5`, `permission === 3`) ao invés de constants.

**Impacto:**
- ❌ Código difícil de manter
- ❌ Possível erro se valores mudarem
- ❌ Não segue padrão do backend (que usa constants)

**Arquivo:** `components/admin/users/UsersTable.tsx`

**Solução:** Criar constants ou usar enum

---

### **27. UserFilters.tsx - Magic Numbers para Status**
**Problema:** Números mágicos (`value: '1'`, `value: '5'`) ao invés de constants.

**Arquivo:** `components/admin/users/UserFilters.tsx`

**Solução:** Criar constants ou usar enum

---

### **28. page.tsx - Magic Numbers para Permission**
**Problema:** `Number(user.permission) === 3` hardcoded ao invés de constant.

**Arquivo:** `app/(dashboard)/dashboard/admin/usuarios/page.tsx`

**Solução:** Criar constant `USER_PERMISSION_ADMIN = 3`

---

### **29. UserFeesModal.tsx - Função formatNumber Pode Ser Utilitário**
**Problema:** `formatNumber` é duplicada e deveria ser utilitário.

**Solução:** Mover para `@lib/format.ts`

---

### **30. UserEditModal.tsx - Funções de Máscara Podem Ser Utilitários**
**Problema:** `formatCpfCnpj` e `formatPhone` são duplicadas e deveriam ser utilitários.

**Solução:** 
- Verificar se `formatDocumentBR` em `@lib/format.ts` já faz isso
- Criar `formatPhoneBR` se não existir

---

## 🟢 **MELHORIAS DE QUALIDADE (Clean Code e Escalabilidade)**

### **31. page.tsx - Falta useMemo para Filtros**
**Problema:** Objeto de filtros recriado a cada render.

**Solução:** Usar `useMemo` para `filters` object

---

### **32. page.tsx - Falta useCallback para Handlers Passados como Props**
**Problema:** Handlers passados para componentes filhos não são memorizados.

**Solução:** Usar `useCallback` para todos os handlers

---

### **33. UsersTable.tsx - Falta useMemo para Formatação de Data**
**Problema:** Função `formatDate` recriada a cada render.

**Solução:** 
- Mover para fora do componente
- Memorizar com `useCallback`
- Usar `formatDateBR` de `@lib/format.ts`

---

### **34. UserEditModal.tsx - Falta useMemo para Opções de Select**
**Problema:** Arrays de opções recriados a cada render.

**Código Atual:**
```typescript
const PERMISSION_OPTIONS = [ /* ... */ ] // ✅ OK, está fora do componente
```

**Verificar:** Se arrays são recriados dentro do componente

---

### **35. UserFeesModal.tsx - useMemo para exampleCalc está OK**
**Status:** ✅ Já usa `useMemo` corretamente

---

### **36. useAdminUsers.ts - Falta Retry Logic Customizado**
**Problema:** Alguns hooks não têm retry configurado, outros têm `retry: 2`.

**Solução:** Padronizar retry logic

---

### **37. useAdminUsers.ts - Falta Error Handling Customizado**
**Problema:** Erros genéricos, sem categorização (network, validation, etc.)

**Solução:** Criar error types e handling customizado

---

### **38. api.ts - Falta Type Safety em adminUsersAPI**
**Problema:** Verificar se todos os métodos têm tipos corretos.

**Solução:** Revisar e corrigir tipos

---

### **39. Dialog.tsx - Falta useCallback para handleEsc**
**Problema:** Handler de ESC recriado a cada render.

**Arquivo:** `components/ui/Dialog.tsx`

**Solução:** Usar `useCallback`

---

### **40. Select.tsx - Já usa memo, useCallback, useMemo ✅**
**Status:** ✅ Componente bem otimizado

---

### **41. Input.tsx - Falta memo()**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/ui/Input.tsx`

**Solução:** Envolver com `memo()`

---

### **42. Dialog.tsx - Falta memo()**
**Problema:** Componente não usa `memo()`, re-renderiza sempre.

**Arquivo:** `components/ui/Dialog.tsx`

**Solução:** Envolver com `memo()`

---

### **43. page.tsx - Falta useMemo para Pagination Object**
**Problema:** Objeto de paginação recriado a cada render.

**Código Atual:**
```typescript
pagination={data?.pagination ? {
    currentPage: data.pagination.current_page,
    // ...
} : undefined}
```

**Solução:** Usar `useMemo` para pagination object

---

### **44. UserFilters.tsx - Falta useCallback para onChange Wrapper**
**Problema:** Função passada para `onChange` não é memorizada.

**Solução:** Usar `useCallback` no parent (`page.tsx`)

---

### **45. useAdminUsers.ts - Falta Placeholder Data para Skeleton**
**Problema:** Não há placeholder data para loading states.

**Solução:** Criar placeholder data para melhor UX

---

## 📝 **RESUMO DE PROBLEMAS POR ARQUIVO**

### `app/(dashboard)/dashboard/admin/usuarios/page.tsx`
- ❌ Múltiplos `refetch()` desnecessários
- ❌ Falta `useMemo` para `users`
- ❌ Falta `useMemo` para `filters`
- ❌ Falta `useMemo` para `pagination`
- ❌ Falta `useCallback` para handlers
- ❌ Uso de `any` types
- ❌ Magic numbers para permission

### `components/admin/users/UsersTable.tsx`
- ❌ Função `formatDate` duplicada dentro do map
- ❌ Formatação de moeda inline
- ❌ Falta `memo()`
- ❌ Magic numbers para status/permission

### `components/admin/users/UserFilters.tsx`
- ❌ Debounce manual (não usa `useDebounce` hook)
- ❌ Falta dependência `onChange` no `useEffect`
- ❌ Falta `memo()`
- ❌ Magic numbers para status
- ❌ Bug: `onChange` recebe `string` mas trata como `Event`

### `components/admin/users/UserViewModal.tsx`
- ❌ Tipo `any` para `user`
- ❌ Falta `memo()`

### `components/admin/users/UserEditModal.tsx`
- ❌ Funções de máscara duplicadas
- ❌ Tipo `any` para `user`
- ❌ Falta `memo()`
- ❌ Falta `useCallback` para handlers

### `components/admin/users/UserFeesModal.tsx`
- ❌ Função `formatNumber` duplicada
- ❌ Tipo `any` para `user`
- ❌ Falta `memo()`
- ❌ Falta `useCallback` para handlers

### `components/admin/users/UserAffiliateModal.tsx`
- ❌ Função `formatNumber` duplicada
- ❌ Tipo `any` para `user`
- ❌ Falta `memo()`

### `components/admin/users/UserSummaryCards.tsx`
- ❌ Falta `memo()`

### `components/admin/users/TablePagination.tsx`
- ❌ Falta `memo()`

### `components/ui/Input.tsx`
- ❌ Falta `memo()`

### `components/ui/Dialog.tsx`
- ❌ Falta `memo()`
- ❌ Falta `useCallback` para `handleEsc`

### `hooks/useAdminUsers.ts`
- ⚠️ Cache update inconsistente em `useSaveAffiliateSettings`
- ⚠️ Falta retry logic padronizado
- ⚠️ Falta error handling customizado

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Correções Críticas:** Implementar todas as correções de performance
2. **Melhorias de Manutenibilidade:** Remover duplicação, adicionar memo
3. **Melhorias de Qualidade:** Type safety, constants, utilitários

---

**Total de Problemas Identificados:** 45
- 🔴 Críticos: 10
- 🟡 Importantes: 20
- 🟢 Qualidade: 15

---

**Data de Análise:** 2025-11-05

