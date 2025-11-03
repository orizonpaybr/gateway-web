# Integração Utmify - Documentação

## Visão Geral

A integração com Utmify permite rastrear automaticamente pedidos PIX e campanhas de marketing, fornecendo análises detalhadas de conversões e performance de campanhas.

## Componentes Implementados

### Backend

#### 1. **Controller** (`app/Http/Controllers/Api/UtmifyController.php`)

Controller completo para gerenciar a integração com Utmify:

- **GET `/api/utmify/config`** - Obter configuração atual
  - Cache Redis: 5 minutos
  - Rate limit: 60 req/min
  
- **POST `/api/utmify/config`** - Salvar/atualizar API Key
  - Validação de campos
  - Suporte a 2FA com PIN
  - Rate limit: 10 req/min
  
- **DELETE `/api/utmify/config`** - Remover API Key
  - Suporte a 2FA com PIN
  - Rate limit: 10 req/min
  
- **POST `/api/utmify/test`** - Testar conexão
  - Rate limit: 5 req/min

**Features:**
- ✅ Cache Redis para performance
- ✅ Validação de 2FA quando ativo
- ✅ Logs detalhados
- ✅ Rate limiting por endpoint
- ✅ Tratamento de erros robusto

#### 2. **Trait** (`app/Traits/UtmfyTrait.php`)

Trait existente que envia dados para a API da Utmify:
- Chamado automaticamente quando um pedido PIX é gerado
- Verifica se o usuário tem `integracao_utmfy` configurado
- Envia dados de conversão em tempo real

#### 3. **Model** (`app/Models/User.php`)

Campo `integracao_utmfy` já existente na tabela users para armazenar a API Key.

#### 4. **Rotas** (`routes/api.php`)

```php
// Integração Utmify - Rastreamento e conversões
Route::get('utmify/config', [UtmifyController::class, 'getConfig'])
Route::post('utmify/config', [UtmifyController::class, 'saveConfig'])
Route::delete('utmify/config', [UtmifyController::class, 'deleteConfig'])
Route::post('utmify/test', [UtmifyController::class, 'testConnection'])
```

### Frontend

#### 1. **Hook Customizado** (`hooks/useUtmify.ts`)

Hook otimizado com React Query:

```tsx
const {
  config,           // Configuração atual
  isLoading,        // Estado de carregamento
  isSaving,         // Salvando configuração
  isDeleting,       // Removendo configuração
  isTesting,        // Testando conexão
  saveApiKey,       // Salvar API Key
  removeApiKey,     // Remover API Key
  testConnection,   // Testar conexão
  retryWith2FA,     // Retry com 2FA
} = useUtmify()
```

**Features:**
- ✅ Cache automático com React Query (5 minutos)
- ✅ Invalidação inteligente de cache
- ✅ Suporte a 2FA
- ✅ Tratamento de erros com toast
- ✅ Estados de loading separados

#### 2. **API Client** (`lib/api.ts`)

```typescript
export const utmifyAPI = {
  getConfig: async () => {...},
  saveConfig: async (apiKey, pin?) => {...},
  deleteConfig: async (pin?) => {...},
  testConnection: async () => {...},
}
```

**Features:**
- ✅ Tipagem TypeScript completa
- ✅ Integração com apiRequest base
- ✅ Suporte a 2FA opcional

#### 3. **Componente UI** (`components/dashboard/ConfiguracoesIntegracaoTab.tsx`)

Interface completa na aba "Integração" das configurações:

**Features:**
- ✅ Card dedicado para Utmify
- ✅ Badge de status (Ativo/Inativo)
- ✅ Info box explicativo
- ✅ Formulário para adicionar/editar API Key
- ✅ Visualização da API Key configurada
- ✅ Botão copiar API Key
- ✅ Botão testar conexão
- ✅ Botão remover integração
- ✅ Modal de confirmação para remoção
- ✅ Modal 2FA quando necessário
- ✅ Estados de loading em todos os botões
- ✅ Responsive design
- ✅ Feedback visual de status

## Fluxo de Funcionamento

### Configuração Inicial

1. Usuário acessa Dashboard → Configurações → Integração
2. Rola até a seção "Integração Utmify"
3. Clica para adicionar API Key
4. Cola a API Key obtida do painel da Utmify
5. Clica em "Salvar API Key"
6. Se 2FA estiver ativo, insere o PIN
7. API Key é salva no banco de dados
8. Badge "Ativo" aparece no card

### Rastreamento Automático

1. Quando um pedido PIX é gerado (qualquer gateway):
   - Sistema verifica se `integracao_utmfy` está configurado
   - Se sim, chama `UtmfyTrait::gerarUTM()`
   - Envia dados do pedido para a API da Utmify
   - Dados incluem: cliente, valor, método, status, etc.

2. Gateways suportados:
   - ✅ EfiTrait (Efí Pay)
   - ✅ XgateTrait
   - ✅ XDPagTrait
   - ✅ BSPayTrait
   - ✅ WitetecTrait
   - ✅ PixupTrait
   - ✅ WooviTrait
   - ✅ AsaasTrait

### Edição e Remoção

**Editar:**
1. Clica em "Editar API Key"
2. Input aparece com valor atual
3. Modifica e salva
4. Se 2FA ativo, insere PIN
5. API Key atualizada

**Remover:**
1. Clica em "Remover Integração"
2. Modal de confirmação aparece
3. Confirma remoção
4. Se 2FA ativo, insere PIN
5. Integração desativada

**Testar:**
1. Clica em "Testar Conexão"
2. Sistema faz requisição à API
3. Toast mostra resultado

## Performance e Otimizações

### Backend
- ✅ **Redis Cache**: Configurações em cache por 5 minutos
- ✅ **Rate Limiting**: Proteção contra abuso
- ✅ **Logs estruturados**: Facilita debugging
- ✅ **Validação robusta**: Previne dados inválidos

### Frontend
- ✅ **React Query**: Cache automático e sincronização
- ✅ **Hook customizado**: Reutilizável e otimizado
- ✅ **Memoização**: Callbacks e componentes memoizados
- ✅ **Estados granulares**: Loading states separados
- ✅ **Lazy loading**: Componente só carrega quando necessário

## Segurança

### Backend
- ✅ Autenticação obrigatória (middleware auth:sanctum)
- ✅ Validação de 2FA quando ativo
- ✅ CORS configurado (middleware secure.cors)
- ✅ Rate limiting por endpoint
- ✅ Validação de entrada de dados
- ✅ Logs de auditoria

### Frontend
- ✅ API Key nunca exposta em logs
- ✅ Modal de confirmação para ações críticas
- ✅ Validação de 2FA integrada
- ✅ HTTPS obrigatório em produção
- ✅ Tokens armazenados de forma segura

## Testando a Integração

### 1. Testar Backend

```bash
# Obter configuração
curl -X GET http://localhost:8000/api/utmify/config \
  -H "Authorization: Bearer {token}"

# Salvar API Key
curl -X POST http://localhost:8000/api/utmify/config \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"api_key": "sua-api-key-aqui"}'

# Testar conexão
curl -X POST http://localhost:8000/api/utmify/test \
  -H "Authorization: Bearer {token}"

# Remover configuração
curl -X DELETE http://localhost:8000/api/utmify/config \
  -H "Authorization: Bearer {token}"
```

### 2. Testar Frontend

1. Acesse: http://localhost:3000/dashboard/configuracoes
2. Navegue até a aba "Integração"
3. Role até "Integração Utmify"
4. Configure uma API Key de teste
5. Teste a conexão
6. Verifique os logs no console
7. Teste edição e remoção

### 3. Testar Rastreamento

1. Configure a API Key da Utmify
2. Crie um pedido PIX no sistema
3. Verifique logs do backend:
   ```bash
   tail -f storage/logs/laravel.log | grep UTMIFY
   ```
4. Acesse painel da Utmify para verificar dados recebidos

## Monitoramento

### Logs Backend

```bash
# Ver logs da Utmify
grep "UTMIFY" storage/logs/laravel.log

# Ver configurações consultadas
grep "Configuração consultada" storage/logs/laravel.log

# Ver API Keys configuradas
grep "API Key configurada" storage/logs/laravel.log

# Ver erros
grep "ERROR.*UTMIFY" storage/logs/laravel.log
```

### Cache Redis

```bash
# Ver cache da configuração
redis-cli KEYS "utmify:*"

# Ver conteúdo do cache
redis-cli GET "utmify:config_{username}"

# Limpar cache
redis-cli DEL "utmify:config_{username}"
```

## Troubleshooting

### Problema: API Key não salva

**Possíveis causas:**
1. 2FA ativo mas PIN não fornecido
2. Validação falhando
3. Problema de autenticação

**Solução:**
```bash
# Ver logs
tail -f storage/logs/laravel.log | grep UTMIFY

# Verificar se usuário está autenticado
# Verificar se PIN 2FA está correto (se aplicável)
```

### Problema: Pedidos não sendo rastreados

**Possíveis causas:**
1. API Key não configurada
2. API Key inválida
3. Trait não sendo chamado

**Solução:**
```bash
# Verificar se API Key está configurada
SELECT username, integracao_utmfy FROM users WHERE username = 'seu_usuario';

# Verificar logs quando pedido é criado
tail -f storage/logs/laravel.log | grep -E "UTMIFY|PIX"
```

### Problema: Cache não atualizando

**Solução:**
```bash
# Limpar cache manualmente
php artisan cache:clear

# Ou via Redis
redis-cli FLUSHDB
```

## Manutenção

### Adicionar novo gateway

Para adicionar suporte a um novo gateway de pagamento:

1. Edite o Trait do gateway (ex: `NovoGatewayTrait.php`)
2. Após criar o pedido, adicione:

```php
// UTMfy integration
if (!is_null($user->integracao_utmfy)) {
    $ip = $request->header('X-Forwarded-For') ?
        $request->header('X-Forwarded-For') : ($request->header('CF-Connecting-IP') ?
            $request->header('CF-Connecting-IP') :
            $request->ip());

    $msg = "PIX Gerado " . env('APP_NAME');
    \App\Traits\UtmfyTrait::gerarUTM('pix', 'waiting_payment', $solicitacao->toArray(), $user->integracao_utmfy, $ip, $msg);
}
```

### Atualizar tempo de cache

Edite `UtmifyController.php`:
```php
private const CACHE_TTL = 300; // 5 minutos (altere conforme necessário)
```

### Adicionar novos endpoints

1. Adicione método no `UtmifyController.php`
2. Adicione rota em `routes/api.php`
3. Adicione função no `utmifyAPI` em `lib/api.ts`
4. Atualize hook `useUtmify.ts` se necessário

## Arquivos Criados/Modificados

### Criados
- ✅ `gateway-backend/app/Http/Controllers/Api/UtmifyController.php`
- ✅ `gateway-web/hooks/useUtmify.ts`
- ✅ `gateway-web/UTMIFY_INTEGRATION.md`

### Modificados
- ✅ `gateway-backend/routes/api.php` (adicionadas rotas)
- ✅ `gateway-web/lib/api.ts` (adicionado utmifyAPI)
- ✅ `gateway-web/components/dashboard/ConfiguracoesIntegracaoTab.tsx` (adicionada seção Utmify)

### Já Existentes (utilizados)
- ✅ `gateway-backend/app/Traits/UtmfyTrait.php`
- ✅ `gateway-backend/app/Models/User.php` (campo integracao_utmfy)
- ✅ `gateway-backend/database/migrations/2025_07_23_172358_add_field_utmfy_in_table_users.php`

## Próximos Passos (Opcional)

1. **Analytics Dashboard**: Criar página dedicada para visualizar dados da Utmify
2. **Webhooks**: Receber notificações da Utmify sobre eventos
3. **Múltiplas API Keys**: Suportar diferentes chaves por tipo de campanha
4. **Relatórios**: Gerar relatórios de conversão dentro do sistema
5. **Testes automatizados**: Adicionar testes unitários e E2E

## Suporte

Para dúvidas sobre a Utmify:
- Site: https://utmify.com.br
- Documentação API: https://api.utmify.com.br/docs

Para problemas com a integração:
- Verificar logs do backend
- Verificar console do navegador
- Contatar equipe de desenvolvimento

