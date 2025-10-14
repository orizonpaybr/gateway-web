# 🔍 Debug: Token após F5

## 📝 **Problema Identificado**

Após F5, as chamadas de API não são feitas, apenas requisições do Next.js aparecem no Network tab.

## 🧪 **Como Debuggar**

### **1. Verificar Console do Browser**

Abra o DevTools (F12) → Console e procure por:

```
useLocalStorage - Inicializando para key "token"
useLocalStorage - Valor do localStorage para "token": [valor]
RecentTransactions - Token atual: [valor]
RecentTransactions - Token inválido, não fazendo chamada
```

### **2. Verificar localStorage**

No DevTools → Application → Local Storage → `http://localhost:3000`

Procure pela chave `token` e veja se:

- ✅ **Existe** e tem um valor válido
- ❌ **Não existe** ou está vazio
- ❌ **Tem valor inválido** (como "null" como string)

### **3. Teste Manual no Console**

Execute no console do browser:

```javascript
// Verificar se token existe
console.log('Token no localStorage:', localStorage.getItem('token'))

// Verificar se é válido
const token = localStorage.getItem('token')
console.log('Token válido?', token && token !== 'null' && token !== '')

// Simular mudança de token
window.dispatchEvent(new Event('auth-token-stored'))
```

## 🔧 **Possíveis Problemas**

### **1. Token não existe**

- **Causa:** Login não foi feito ou token expirou
- **Solução:** Fazer login novamente

### **2. Token como string "null"**

- **Causa:** Armazenamento incorreto do token
- **Solução:** Corrigir lógica de armazenamento

### **3. Hook não detecta mudanças**

- **Causa:** Problema na sincronização do hook
- **Solução:** Verificar eventos e dependências

### **4. Hidratação incorreta**

- **Causa:** Mismatch entre servidor e cliente
- **Solução:** Verificar se hook está funcionando após hidratação

## 📊 **Logs Esperados**

### **✅ Comportamento Correto:**

```
useLocalStorage - Inicializando para key "token"
useLocalStorage - Valor do localStorage para "token": "eyJ1c2VyX2lkIjoiYWRtaW4iLCJ0b2tlbiI6..."
useLocalStorage - Retornando string direta para "token": "eyJ1c2VyX2lkIjoiYWRtaW4iLCJ0b2tlbiI6..."
RecentTransactions - Token atual: "eyJ1c2VyX2lkIjoiYWRtaW4iLCJ0b2tlbiI6..."
RecentTransactions - Fazendo chamada para API
RecentTransactions - Dados carregados: 0 transações
```

### **❌ Comportamento Incorreto:**

```
useLocalStorage - Inicializando para key "token"
useLocalStorage - Item não encontrado, retornando valor inicial para "token"
RecentTransactions - Token atual: null
RecentTransactions - Token inválido, não fazendo chamada
```

## 🎯 **Próximos Passos**

1. **Execute o debug** seguindo os passos acima
2. **Compartilhe os logs** do console
3. **Identifique o problema** específico
4. **Implemente a correção** necessária

**Execute o debug e me informe os resultados! 🔍**
