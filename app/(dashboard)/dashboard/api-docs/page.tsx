'use client'

import {
  Copy,
  Key,
  Shield,
  Globe,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Bell,
  AlertCircle,
  ListChecks,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  if (!apiUrl) {
    return 'https://api.coratri.com'
  }
  return apiUrl.replace(/\/api\/?$/, '')
}
const BASE_URL = getApiBaseUrl()

const ERRORS = [
  {
    code: '400',
    title: 'Bad Request',
    desc: 'Token ou Secret ausentes na requisição.',
  },
  {
    code: '401',
    title: 'Unauthorized',
    desc: 'Credenciais inválidas ou saldo insuficiente para o saque.',
  },
  {
    code: '403',
    title: 'Forbidden',
    desc: 'IP não autorizado (cash out) ou conta inativa/suspensa.',
  },
  {
    code: '422',
    title: 'Unprocessable Entity',
    desc: 'Erro de validação — algum campo obrigatório está ausente ou com formato incorreto.',
  },
  {
    code: '429',
    title: 'Too Many Requests',
    desc: 'Rate limit atingido. Aguarde alguns segundos e tente novamente.',
  },
  {
    code: '500',
    title: 'Internal Server Error',
    desc: 'Erro interno do servidor. Contate o suporte.',
  },
]

const cashInBody = `{
  "token": "{{CLIENT_KEY}}",
  "secret": "{{CLIENT_SECRET}}",
  "amount": 1,
  "debtor_name": "Nome do pagador",
  "email": "email@exemplo.com",
  "debtor_document_number": "00000000000",
  "phone": "11999999999",
  "postback": "https://seu-dominio.com/webhook/pix"
}`

const cashInResponse = `{
  "status": "success",
  "message": "QR Code gerado com sucesso",
  "transaction_id": "e2a3f1c8d94b...",
  "amount": 1,
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_image_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
  "expires_at": null
}`

const cashOutBody = `{
  "token": "{{CLIENT_KEY}}",
  "secret": "{{CLIENT_SECRET}}",
  "amount": 1,
  "pixKey": "chave-pix@exemplo.com",
  "pixKeyType": "email",
  "baasPostbackUrl": "https://seu-dominio.com/webhook/saque"
}`

const cashOutResponse = `{
  "status": "success",
  "message": "Saque PIX processado.",
  "data": {
    "transaction_id": "abc123...",
    "amount": 1,
    "pixKeyType": "email",
    "pixKey": "chave-pix@exemplo.com",
    "description": "Saque via API PIX",
    "status": "PROCESSING",
    "tipo_processamento": "Automático",
    "created_at": "2026-03-10T10:22:34.000000Z",
    "taxa_cash_out": 0.5,
    "taxa_aplicacao": 0.48,
    "valor_liquido": 0.5,
    "valor_total_descontado": 1.5
  }
}`

const balanceCurlExample = `curl --request GET \\
  --url 'https://seu-dominio.com/api/wallet/balance' \\
  --header 'accept: application/json' \\
  --header 'api-token: {{CLIENT_KEY}}' \\
  --header 'api-secret: {{CLIENT_SECRET}}'`

const balanceResponse = `{
  "status": "success",
  "data": {
    "moeda": "BRL",
    "saldo_disponivel": 299.47,
    "entradas_mes": 2.00,
    "saidas_mes": 1.00,
    "fluxo_liquido_mes": 1.00,
    "periodo": {
      "inicio": "2026-06-01",
      "fim": "2026-06-30"
    },
    "atualizado_em": "2026-06-10T13:06:00-03:00"
  }
}`

const statusBody = `{
  "idTransaction": "e2a3f1c8d94b..."
}`

const statusResponse = `{
  "status": "PAID_OUT"
}`

const webhookPayloadCashIn = `{
  "idTransaction": "e2a3f1c8d94b-xxx",
  "status": "PAID_OUT",
  "amount": 1.00,
  "paidAt": "2026-03-10T14:30:00.000-03:00",
  "typeTransaction": "PIX_IN",
  "payer": {
    "name": "Nome do pagador",
    "document": "00000000000",
    "email": "email@exemplo.com",
    "phone": "11999999999"
  },
  "receiver": {
    "user_id": "seu_user_id_coratri"
  },
  "endToEndId": "E1234567820260310143000abc",
  "message": "Depósito PIX recebido com sucesso."
}`

const webhookPayloadCashOut = `{
  "idTransaction": "PAYOUT_API_xxx...",
  "status": "PAID_OUT",
  "amount": 1.00,
  "paidAt": "2026-03-10T14:32:00.000-03:00",
  "typeTransaction": "PIX_OUT",
  "beneficiary": {
    "name": "Nome do beneficiário",
    "document": "00000000000",
    "pixKey": "chave-pix@exemplo.com"
  },
  "sender": {
    "user_id": "seu_user_id_coratri"
  },
  "endToEndId": "E1234567820260310143200xyz",
  "message": "Saque PIX liquidado com sucesso."
}`

const webhookPayloadInfraction = `{
  "idTransaction": "e2a3f1c8d94b-xxx",
  "status": "INFRACTION_OPEN",
  "amount": 1.00,
  "paidAt": "2026-03-12T09:15:00.000-03:00",
  "typeTransaction": "PIX_IN",
  "payer": {
    "name": "Nome do pagador",
    "document": "00000000000"
  },
  "receiver": {
    "user_id": "seu_user_id_coratri"
  },
  "endToEndId": "E1234567820260310143000abc",
  "message": "Infração (MED) aberta para esta transação. Valor retido em mediação."
}`

export default function ApiDocsPage() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Documentação da API
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Integre PIX Cash In, Cash Out e consulta de saldo ao seu negócio
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-lg bg-gray-100 text-gray-600">
            <Globe size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Base URL</h2>
            <p className="text-sm text-gray-500">
              URL raiz para todas as requisições
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
          <div className="min-w-0 flex-1 overflow-hidden rounded-lg bg-gray-900">
            <div className="overflow-x-auto p-3 font-mono text-sm text-green-400">
              {BASE_URL}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            icon={<Copy size={16} />}
            onClick={() => handleCopy(BASE_URL)}
          >
            Copiar
          </Button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Key size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Autenticação
            </h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Todas as requisições à API devem
              incluir seu <strong>Client Key</strong> e{' '}
              <strong>Client Secret</strong>. Você obtém essas credenciais em{' '}
              <a
                href="/dashboard/configuracoes"
                className="underline font-medium"
              >
                Configurações → Integração
              </a>
              . Não existe rota separada para &quot;gerar token&quot; — envie as
              credenciais em cada chamada (Cash In, Cash Out e consulta de
              saldo).
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Envie as credenciais{' '}
            <strong>no corpo (body) da requisição JSON</strong> — este é o
            método mais simples e recomendado:
          </p>

          <div className="space-y-3 mb-5">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Campo: token
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                &quot;token&quot;: &quot;SeuClientKey&quot;
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Campo: secret
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                &quot;secret&quot;: &quot;SeuClientSecret&quot;
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Alternativa via Headers HTTP:
          </p>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Header: api-token
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                api-token: SeuClientKey
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Header: api-secret
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                api-secret: SeuClientSecret
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <Shield size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              IPs Autorizados (Cash Out)
            </h2>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-orange-800">
              <strong>Obrigatório para Cash Out:</strong> A rota de saque PIX só
              aceita requisições vindas de IPs cadastrados previamente. Isto
              protege sua conta contra saques não autorizados mesmo em caso de
              vazamento de credenciais.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                1
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <p className="font-medium">Descubra o IP público do seu servidor</p>
                <p className="text-gray-600 text-sm">
                  A API aceita <strong>IPv4 e IPv6</strong> (incluindo ranges
                  CIDR como <code className="text-xs">2804:219c::/64</code>).
                  Cadastre <strong>ambos</strong> se a sua rede usar os dois —
                  muitos PCs e servidores saem pela internet com IPv6 mesmo
                  quando o IPv4 também existe.
                </p>
                <div className="grid gap-3">
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      IPv4 — Linux e Mac
                    </p>
                    <div className="min-w-0 overflow-hidden rounded bg-gray-900">
                      <pre className="overflow-x-auto px-3 py-2 text-sm font-mono text-green-400 whitespace-pre">
                        curl -4 https://api.ipify.org
                      </pre>
                    </div>
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      IPv4 — Windows (PowerShell)
                    </p>
                    <div className="min-w-0 overflow-hidden rounded bg-gray-900">
                      <pre className="max-w-full overflow-x-auto break-all whitespace-pre-wrap px-3 py-2 text-xs font-mono text-green-400">
                        (Invoke-WebRequest -Uri
                        &quot;https://api.ipify.org&quot;
                        -UseBasicParsing).Content.Trim()
                      </pre>
                    </div>
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      IPv6 — Linux, Mac ou PowerShell
                    </p>
                    <p className="mb-1.5 text-xs text-gray-600">
                      Recomendado cadastrar a faixa <strong>/64</strong> (ex.{' '}
                      <code className="text-xs">2804:219c:21c:3500::/64</code>
                      ) em vez do endereço completo — o sufixo pode mudar.
                    </p>
                    <div className="min-w-0 overflow-hidden rounded bg-gray-900">
                      <pre className="overflow-x-auto px-3 py-2 text-sm font-mono text-green-400 whitespace-pre">
                        curl -6 https://api64.ipify.org
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                2
              </span>
              <p>
                Vá em{' '}
                <strong>Configurações → Integração → IPs Autorizados</strong> e
                clique em
                <strong> + Adicionar IP</strong>.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-100 text-green-600">
            <ArrowDownToLine size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Cash In — Gerar QR Code PIX
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              POST /api/wallet/deposit/payment
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Gera um QR Code PIX para que o seu cliente efetue o pagamento. Após o
          pagamento ser confirmado pelo banco, a Coratri notifica a URL
          informada no campo{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">postback</code>.
        </p>

        <p className="text-sm text-gray-600 mb-4">
          <strong>Autenticação:</strong>{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">token</code> e{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">secret</code> são
          obrigatórios em cada chamada. Além do corpo JSON (como no exemplo),
          você pode enviá-los na query string ou nos cabeçalhos HTTP{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api_token</code> e{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api_secret</code>{' '}
          (também aceitos como{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api-token</code> e{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api-secret</code>).
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Request Body (JSON)
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(cashInBody)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code>{cashInBody}</code>
              </pre>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs text-gray-600">
              <div className="space-y-2">
                <p>
                  <span className="text-red-500 font-bold">*</span>{' '}
                  <strong>token</strong> e <strong>secret</strong> — obrigatórios
                  (veja «Autenticação» acima: JSON, query ou headers).
                </p>
                <p>
                  <span className="text-gray-400">○</span>{' '}
                  <strong>debtor_document_number</strong> — opcional na API; CPF
                  (11 dígitos) ou CNPJ (14 dígitos) do pagador (fortemente
                  recomendado para a cobrança PIX conforme regras vigentes)
                </p>
              </div>
              <p>
                <span className="text-red-500 font-bold">*</span>{' '}
                <strong>amount</strong>, <strong>debtor_name</strong>,{' '}
                <strong>email</strong> — obrigatórios.{' '}
                <strong>amount</strong> é o valor em reais (positivo); recomendamos
                no mínimo R$ 1,00 por conta das taxas e do uso prático do PIX — a
                API não rejeita valores menores por um número mínimo fixo neste
                endpoint.
              </p>
              <p>
                <span className="text-gray-400">○</span> <strong>phone</strong>{' '}
                — telefone do pagador (opcional)
              </p>
              <p>
                <span className="text-gray-400">○</span>{' '}
                <strong>postback</strong> — URL para receber o webhook quando o
                depósito for pago (recomendado). Veja a seção
                &quot;Webhook&quot; abaixo.
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Response 200
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(cashInResponse)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code>{cashInResponse}</code>
              </pre>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
              <p>
                <strong>status</strong> —{' '}
                <code className="bg-gray-100 px-1 rounded">success</code> quando
                a cobrança PIX foi criada (não indica pagamento recebido). O
                pagamento é confirmado via webhook.
              </p>
              <p>
                <strong>message</strong> — mensagem fixa de sucesso na criação
                (&quot;QR Code gerado com sucesso&quot;).
              </p>
              <p>
                <strong>transaction_id</strong> — ID único da transação.
                Guarde para consultar o status.
              </p>
              <p>
                <strong>amount</strong> — valor em reais solicitado no corpo da
                requisição (espelha o pedido).
              </p>
              <p>
                <strong>qr_code</strong> — código PIX Copia e Cola (BR Code).
              </p>
              <p>
                <strong>qr_code_image_url</strong> — URL para exibir o QR:
                pode vir do provedor PIX (incluindo data URL), ou ser gerada
                automaticamente pela API (serviço externo de QR) quando não houver
                imagem no retorno do provedor.
              </p>
              <p className="sm:col-span-2">
                <strong>expires_at</strong> — na resposta atual da API este campo
                é sempre <code className="bg-gray-100 px-1 rounded">null</code>;
                a validade prática da cobrança segue o ciclo de vida do PIX
                gerado.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <ArrowUpFromLine size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Cash Out — Enviar PIX
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              POST /api/pixout
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Envia um PIX para a chave informada. Tetos de valor e políticas da
          conta são definidos pela Coratri.
        </p>

        <p className="text-sm text-gray-600 mb-4">
          <strong>Autenticação:</strong> o middleware aceita credenciais no
          JSON, na query ou nos cabeçalhos{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api_token</code> /{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api_secret</code>.
          Nesta rota, porém, a validação exige{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">token</code> e{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">secret</code> no{' '}
          <strong>corpo JSON ou na query</strong> — caso contrário a API
          responde <strong>422</strong> (apenas headers não bastam).
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Request Body (JSON)
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(cashOutBody)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code>{cashOutBody}</code>
              </pre>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-600">
              <p>
                <span className="text-red-500 font-bold">*</span>{' '}
                <strong>token</strong>, <strong>secret</strong>,{' '}
                <strong>amount</strong>, <strong>pixKey</strong>,{' '}
                <strong>pixKeyType</strong>, <strong>baasPostbackUrl</strong> —
                obrigatórios. <strong>amount</strong> em reais (positivo);
                recomendamos no mínimo R$ 1,00 — a rota não exige mínimo fixo na
                validação, mas há limite máximo por saque (configurável no
                servidor).
              </p>
              <p>
                <strong>pixKeyType</strong> aceita exatamente (minúsculas):{' '}
                <code className="bg-gray-100 px-1 rounded">cpf</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">cnpj</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">email</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">telefone</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">phone</code> (tratado
                como telefone), <code className="bg-gray-100 px-1 rounded">aleatoria</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">random</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">crypto</code>.
              </p>
              <p className="sm:col-span-2">
                <strong>baasPostbackUrl</strong> — URL do seu servidor para
                receber o webhook quando o saque for processado (pago, cancelado
                ou estornado). Use{' '}
                <code className="bg-gray-100 px-1 rounded">web</code> se for
                apenas pela interface (não dispara webhook externo).
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Response 200
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(cashOutResponse)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code>{cashOutResponse}</code>
              </pre>
            </div>
            <div className="mt-3 space-y-2 text-xs text-gray-600">
              <p>
                <strong>status</strong> — <code className="bg-gray-100 px-1 rounded">success</code>{' '}
                quando a solicitação foi aceita. <strong>message</strong> — em
                sucesso, <code className="bg-gray-100 px-1 rounded">Saque PIX processado.</code>
              </p>
              <p>
                <strong>data</strong> — detalhes do saque. Use{' '}
                <strong>data.transaction_id</strong> no{' '}
                <code className="bg-gray-100 px-1 rounded">POST /api/status</code>{' '}
                e nos webhooks. Os campos de taxa (
                <code className="bg-gray-100 px-1 rounded">taxa_cash_out</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">valor_liquido</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">valor_total_descontado</code>, …)
                refletem o cálculo no momento da criação.
              </p>
              <p>
                <strong>data.status</strong> — andamento do PIX (ex.:{' '}
                <code className="bg-gray-100 px-1 rounded">PROCESSING</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">COMPLETED</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">CANCELLED</code>
                , …).
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Consultar Saldo
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              GET /api/wallet/balance
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Retorna o saldo disponível da sua conta e a movimentação do mês
          corrente (entradas, saídas e fluxo líquido).
        </p>

        <p className="text-sm text-gray-600 mb-4">
          <strong>Autenticação:</strong> envie{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api-token</code> e{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">api-secret</code> nos{' '}
          <strong>headers HTTP</strong>.
          Também aceitamos <code className="bg-gray-100 px-1 rounded text-xs">token</code> e{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">secret</code> na query string,
          apenas para testes rápidos.
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Exemplo cURL
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(balanceCurlExample)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre">
                <code>{balanceCurlExample}</code>
              </pre>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-600">
              <p>
                <span className="text-red-500 font-bold">*</span>{' '}
                <strong>api-token</strong> e <strong>api-secret</strong> — headers
                obrigatórios (Client Key / Client Secret).
              </p>
              <p>
                <span className="text-gray-400">○</span> Substitua{' '}
                <code className="bg-gray-100 px-1 rounded">seu-dominio.com</code>{' '}
                pela Base URL indicada no topo desta página.
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Response 200
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(balanceResponse)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code>{balanceResponse}</code>
              </pre>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-600">
              <p>
                <strong>saldo_disponivel</strong> — saldo principal + saldo de
                afiliados, disponível para saque (atualizado a cada cache de 10 s).
              </p>
              <p>
                <strong>entradas_mes</strong> / <strong>saidas_mes</strong> —
                totais de depósitos e saques pagos no mês (status{' '}
                <code className="bg-gray-100 px-1 rounded">PAID_OUT</code> ou{' '}
                <code className="bg-gray-100 px-1 rounded">COMPLETED</code>).
              </p>
              <p>
                <strong>fluxo_liquido_mes</strong> — entradas menos saídas no
                mês corrente.
              </p>
              <p>
                <strong>periodo</strong> — intervalo do mês corrente (
                <code className="bg-gray-100 px-1 rounded">inicio</code> /{' '}
                <code className="bg-gray-100 px-1 rounded">fim</code>).
              </p>
              <p className="sm:col-span-2">
                <strong>atualizado_em</strong> — timestamp ISO 8601 da consulta.
                A resposta inteira usa cache de 10 segundos por conta.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gray-100 text-gray-600">
            <Search size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Consultar Status da Transação
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              POST /api/status
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Consulte o status atual de qualquer transação (cash in ou cash out)
          pelo{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">
            idTransaction
          </code>{' '}
          retornado na criação. Não requer autenticação. Quando já houver
          tentativa de envio do webhook ao seu postback, a resposta pode incluir
          o objeto <code className="bg-gray-100 px-1 rounded text-xs">webhook</code>{' '}
          (entrega, HTTP status e corpo enviado).
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Request Body (JSON)
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(statusBody)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code>{statusBody}</code>
              </pre>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Response 200
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(statusResponse)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                <code>{statusResponse}</code>
              </pre>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Se a transação não for encontrada, a API retorna 200 com{' '}
          <code className="bg-gray-100 px-1 rounded">
            status: &quot;NOT_FOUND&quot;
          </code>
          . Valores possíveis: PAID_OUT, COMPLETED, PROCESSING, PENDING,
          CANCELLED, FAILED, NOT_FOUND, etc.
        </p>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 min-w-0">
          <div className="p-3 shrink-0 rounded-lg bg-purple-100 text-purple-600">
            <Bell size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">
              Webhook — Notificação de pagamento
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cash In e Cash Out: como configurar e o que você recebe
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Quando uma transação é confirmada (depósito pago ou saque processado),
          a Coratri envia um <strong>POST</strong> em JSON para a URL que você
          informou:
        </p>

        <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
          <li>
            <strong>Cash In (depósito):</strong> use o campo{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">postback</code>{' '}
            na requisição de geração do QR Code.
          </li>
          <li>
            <strong>Cash Out (saque):</strong> use o campo{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">
              baasPostbackUrl
            </code>{' '}
            na requisição de saque.
          </li>
        </ul>

        <p className="text-sm text-gray-600 mb-4">
          Você pode usar a <strong>mesma URL</strong> para os dois tipos. O
          corpo enviado inclui sempre <code className="bg-gray-100 px-1 rounded">idTransaction</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">status</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">amount</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">paidAt</code>,{' '}
          <code className="bg-gray-100 px-1 rounded">typeTransaction</code> (
          <code>PIX_IN</code> ou <code>PIX_OUT</code>) e{' '}
          <code className="bg-gray-100 px-1 rounded">message</code>. Além disso,
          a Coratri envia dados estruturados{' '}
          <strong>a partir dos dados da transação na sua conta</strong>:{' '}
          <code className="bg-gray-100 px-1 rounded">payer</code> e{' '}
          <code className="bg-gray-100 px-1 rounded">receiver</code> (depósito),{' '}
          <code className="bg-gray-100 px-1 rounded">beneficiary</code> e{' '}
          <code className="bg-gray-100 px-1 rounded">sender</code> (saque), e{' '}
          <code className="bg-gray-100 px-1 rounded">endToEndId</code> quando
          já houver identificador fim-a-fim registrado. Campos vazios são
          omitidos. Para auditar o JSON exato de cada entrega, use{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">POST /api/status</code> e o{' '}
          <code className="bg-gray-100 px-1 rounded">webhook.request_body</code>.
        </p>

        <div className="min-w-0 overflow-hidden rounded-lg border border-yellow-200 bg-yellow-50 p-3 mb-4 text-xs text-yellow-800">
          <strong>Importante:</strong> Seu servidor deve responder com HTTP{' '}
          <strong>200</strong> o mais rápido possível. Processe a lógica de
          negócio de forma assíncrona (fila) para não atrasar a resposta.
        </div>

        <div className="min-w-0 space-y-6 overflow-hidden">
          <div>
            <p className="text-sm font-medium text-gray-800 mb-2">
              Payload — Depósito confirmado (PIX IN)
            </p>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Estrutura do payload — Cash In (postback)
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(webhookPayloadCashIn)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap">
                <code>{webhookPayloadCashIn}</code>
              </pre>
            </div>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>
                <strong>amount</strong> — valor em reais.{' '}
                <strong>paidAt</strong> — data/hora ISO 8601.{' '}
                <strong>message</strong> — texto amigável conforme o status (ex.:
                depósito recebido, estornado).
              </p>
              <p>
                <strong>payer</strong> — dados informados na criação da cobrança.{' '}
                <strong>receiver.user_id</strong> — identificador da conta
                Coratri que recebe. <strong>endToEndId</strong> — quando já
                liquidado e registrado.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800 mb-2">
              Payload — Saque processado (PIX OUT)
            </p>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Estrutura do payload — Cash Out (baasPostbackUrl)
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(webhookPayloadCashOut)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap">
                <code>{webhookPayloadCashOut}</code>
              </pre>
            </div>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>
                <strong>beneficiary</strong> — chave e dados do recebedor
                informados no saque. <strong>sender.user_id</strong> — conta
                Coratri que solicitou. <strong>endToEndId</strong> — quando já
                registrado após liquidação.
              </p>
              <p>
                Em falhas ou cancelamentos, <strong>message</strong> pode
                descrever o motivo; detalhes adicionais podem constar na
                consulta <code className="bg-gray-100 px-1 rounded">POST /api/status</code>.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800 mb-2">
              Webhook de Infrações (MED — Mecanismo Especial de Devolução)
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Quando um pagador contesta um depósito (fraude ou falha
              operacional), o banco do pagador abre uma <strong>infração
              (MED)</strong> no Banco Central. A Coratri recebe essa notificação
              do provedor e <strong>repassa para a sua URL de webhook</strong>{' '}
              (a mesma do <code className="bg-gray-100 px-1 rounded text-xs">postback</code> do
              depósito), usando o mesmo formato de payload, com{' '}
              <code className="bg-gray-100 px-1 rounded text-xs">typeTransaction: PIX_IN</code> e
              um <code className="bg-gray-100 px-1 rounded text-xs">status</code> de
              infração. Enquanto a infração estiver aberta, o valor do depósito
              fica <strong>retido (em mediação)</strong> e não entra no saldo
              disponível para saque.
            </p>

            <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 mb-3">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="text-left font-semibold px-3 py-2">Status</th>
                    <th className="text-left font-semibold px-3 py-2">
                      O que significa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="px-3 py-2">
                      <code className="bg-gray-100 px-1 rounded">
                        INFRACTION_OPEN
                      </code>
                    </td>
                    <td className="px-3 py-2">
                      Infração aberta. Valor do depósito retido em mediação.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <code className="bg-gray-100 px-1 rounded">
                        INFRACTION_ACKNOWLEDGED
                      </code>
                    </td>
                    <td className="px-3 py-2">
                      Em análise pelo provedor/Banco Central (defesa em
                      andamento). Valor segue retido.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <code className="bg-gray-100 px-1 rounded">
                        INFRACTION_CLOSED
                      </code>
                    </td>
                    <td className="px-3 py-2">
                      Infração encerrada. Se a fraude for confirmada, o valor é
                      devolvido (depósito <strong>REFUNDED</strong> e saldo
                      debitado); se a defesa for aceita, o valor é liberado
                      (volta a <strong>COMPLETED</strong>).
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <code className="bg-gray-100 px-1 rounded">
                        INFRACTION_CANCELLED
                      </code>
                    </td>
                    <td className="px-3 py-2">
                      Infração cancelada. Valor liberado (volta a{' '}
                      <strong>COMPLETED</strong>).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Estrutura do payload — Infração (MED)
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => handleCopy(webhookPayloadInfraction)}
              >
                Copiar
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap">
                <code>{webhookPayloadInfraction}</code>
              </pre>
            </div>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>
                <strong>idTransaction</strong> e <strong>endToEndId</strong>{' '}
                identificam o mesmo depósito que originou a infração — use-os
                para localizar o pedido no seu sistema.{' '}
                <strong>amount</strong> é o valor sob disputa.
              </p>
              <p>
                Você só recebe o webhook de infração se a transação tiver um{' '}
                <code className="bg-gray-100 px-1 rounded">postback</code>{' '}
                cadastrado. Recomendamos tratar{' '}
                <code className="bg-gray-100 px-1 rounded">
                  INFRACTION_CLOSED
                </code>{' '}
                consultando o status final via{' '}
                <code className="bg-gray-100 px-1 rounded">POST /api/status</code>{' '}
                (o depósito ficará <strong>REFUNDED</strong> em caso de
                devolução).
              </p>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-800 mb-2">
              Como replicar no seu sistema
            </p>
            <ol className="list-decimal list-inside space-y-2 break-words text-gray-600">
              <li className="pl-0.5">
                Crie um endpoint público (ex.:{' '}
                <code className="break-all bg-gray-200 px-1 rounded">
                  https://seusite.com/webhook/coratri
                </code>
                ) que aceite POST e responda 200 rapidamente.
              </li>
              <li className="pl-0.5">
                No <strong>depósito</strong>, envie esse URL no campo{' '}
                <code className="break-words bg-gray-200 px-1 rounded">
                  postback
                </code>
                .
              </li>
              <li className="pl-0.5">
                No <strong>saque</strong>, envie esse URL no campo{' '}
                <code className="break-words bg-gray-200 px-1 rounded">
                  baasPostbackUrl
                </code>
                .
              </li>
              <li className="pl-0.5">
                No seu backend, use{' '}
                <code className="break-words bg-gray-200 px-1 rounded">
                  typeTransaction
                </code>{' '}
                (<code>PIX_IN</code> ou <code>PIX_OUT</code>) e{' '}
                <code className="break-words bg-gray-200 px-1 rounded">
                  idTransaction
                </code>{' '}
                para conciliar com sua base; confira valores com{' '}
                <code className="break-words bg-gray-200 px-1 rounded">
                  amount
                </code>{' '}
                e <code className="break-words bg-gray-200 px-1 rounded">status</code>.
              </li>
            </ol>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
            <ListChecks size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Mapeamento de Status
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Todos os status possíveis das transações PIX
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Abaixo estão os status que uma transação pode assumir. Use o campo{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">status</code> na
          consulta ou no webhook. Na coluna <strong>Webhook</strong>,{' '}
          <strong>Sim</strong> indica que a Coratri pode enviar POST ao seu URL
          de postback quando a transação passar a esse estado;{' '}
          <strong>—</strong> indica que não há notificação nesse passo (o status
          pode ainda assim aparecer na API).
        </p>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-800 mb-3">
            Status de Depósito (Cash In)
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                    Webhook
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      WAITING_FOR_APPROVAL
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    QR Code gerado, aguardando pagamento
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      PROCESSING
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Pagamento em processamento
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      PAID_OUT
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Pagamento confirmado e creditado
                  </td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">
                    Sim
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      CANCELLED
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Cobrança cancelada ou expirada
                  </td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">
                    Sim
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      FAILED
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Pagamento não realizado
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      REFUNDED
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Depósito estornado (valor total debitado)
                  </td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">
                    Sim
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-800 mb-3">
            Status de Saque (Cash Out)
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">
                    Webhook
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      PENDING
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Saque aguardando aprovação manual
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      PROCESSING
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    PIX enviado, aguardando liquidação
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      COMPLETED
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Saque liquidado com sucesso (status usado na confirmação PIX)
                  </td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">
                    Sim
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      CANCELLED
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Saque cancelado (ex: chave PIX inválida, saldo insuficiente)
                  </td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">
                    Sim
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      FAILED
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    Saque não realizado (falha no processamento)
                  </td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">
                    Sim
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">Fluxo típico de status</p>
          <div className="space-y-1.5 text-xs">
            <p>
              <strong>Depósito:</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">
                WAITING_FOR_APPROVAL
              </code>
              {' → '}
              <code className="bg-blue-100 px-1 rounded">
                PAID_OUT
              </code> (ou{' '}
              <code className="bg-blue-100 px-1 rounded">CANCELLED</code> se
              expirar)
            </p>
            <p>
              <strong>Saque:</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">PROCESSING</code>
              {' → '}
              <code className="bg-blue-100 px-1 rounded">COMPLETED</code> (ou{' '}
              <code className="bg-blue-100 px-1 rounded">CANCELLED</code> /{' '}
              <code className="bg-blue-100 px-1 rounded">FAILED</code> conforme o
              caso)
            </p>
            <p>
              <strong>Estorno (depósito / Cash In):</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">PAID_OUT</code>
              {' → '}
              <code className="bg-blue-100 px-1 rounded">REFUNDED</code>
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-red-100 text-red-600">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Códigos de Erro
          </h2>
        </div>

        <div className="space-y-2">
          {ERRORS.map((err) => (
            <div
              key={err.code}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold font-mono bg-red-100 text-red-700">
                {err.code}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{err.title}</p>
                <p className="text-xs text-gray-500">{err.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sem número de WhatsApp no momento — reative o bloco quando houver:
      <Card>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-800 mb-3">
            Precisa de ajuda com a integração?
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Nossa equipe de suporte técnico está pronta para ajudar.
          </p>
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-primary/20 text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <WhatsAppIcon size={28} />
            <div className="text-left">
              <span className="block font-medium text-sm">Suporte</span>
              <span className="block text-xs text-primary">
                Fale conosco no WhatsApp
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
          </a>
        </div>
      </Card>
      */}
    </div>
  )
}
