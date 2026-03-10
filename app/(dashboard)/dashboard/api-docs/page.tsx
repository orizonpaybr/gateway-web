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
  ExternalLink,
  ListChecks,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

const SUPPORT_WHATSAPP_URL = 'https://wa.me/5549988906647'

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  if (!apiUrl) {
    return 'https://api.orizonpay.com'
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
    desc: 'Erro interno ou adquirente não configurado. Contate o suporte.',
  },
]

const cashInBody = `{
  "token": "{{CLIENT_KEY}}",
  "secret": "{{CLIENT_SECRET}}",
  "amount": 1,
  "description": "Depósito via PIX",
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
  "qr_code_image_url": "data:image/png;base64,...",
  "expires_at": "2025-01-15T16:30:00Z"
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
  "message": "Saque solicitado com sucesso",
  "id": "PAYOUT_API_xxx...",
  "amount": 1,
  "pixKey": "chave-pix@exemplo.com",
  "pixKeyType": "email",
  "withdrawStatusId": "Processing",
  "createdAt": "2026-03-10T10:22:34.000Z",
  "updatedAt": "2026-03-10T10:22:34.000Z"
}`

const statusBody = `{
  "idTransaction": "e2a3f1c8d94b..."
}`

const statusResponse = `{
  "status": "PAID_OUT"
}`

const webhookPayloadCashIn = `{
  "idTransaction": "61EEE0E510610020496486CDF83742AD",
  "status": "PAID_OUT",
  "amount": 150.00,
  "paidAt": "2025-01-15T16:12:33-03:00",
  "typeTransaction": "PIX_IN",
  "payer": {
    "name": "Nome do pagador",
    "document": "00000000000",
    "email": "email@exemplo.com",
    "phone": "11999999999"
  },
  "receiver": {
    "user_id": "seu_user_id_orizon"
  }
}`

const webhookPayloadCashOut = `{
  "idTransaction": "7A95F2004C29C4B88EC03D82C19E405A",
  "status": "PAID_OUT",
  "amount": 0.03,
  "paidAt": "2026-02-27T19:17:53-03:00",
  "typeTransaction": "PIX_OUT",
  "beneficiary": {
    "name": "Nome do beneficiário",
    "document": "000.000.000-00",
    "pixKey": "chave-pix@exemplo.com"
  },
  "sender": {
    "user_id": "seu_user_id_orizon"
  }
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
          Integre PIX Cash In e Cash Out ao seu negócio
        </p>
        <p className="text-gray-500 text-xs mt-1">
          PIX disponível via adquirente HeartPay. Use token e secret em cada requisição.
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
              credenciais em cada chamada (Cash In e Cash Out).
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
                Header: api_token
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                &quot;api_token&quot;: &quot;SeuClientKey&quot;
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Header: api_secret
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                &quot;api_secret&quot;: &quot;SeuClientSecret&quot;
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
                <p className="font-medium">Descubra o IPv4 do seu servidor</p>
                <p className="text-gray-600 text-sm">
                  A API aceita apenas <strong>IPv4</strong>. Rode no terminal o
                  comando do seu sistema; a resposta será só o número do IP
                  (ex.: 45.233.86.159). Use esse valor ao adicionar o IP.
                </p>
                <div className="grid gap-3">
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Linux e Mac
                    </p>
                    <p className="mb-1.5 text-xs text-gray-600">
                      No Terminal, cole e execute. O resultado é o seu IPv4.
                    </p>
                    <div className="min-w-0 overflow-hidden rounded bg-gray-900">
                      <pre className="overflow-x-auto px-3 py-2 text-sm font-mono text-green-400 whitespace-pre">
                        curl https://api.ipify.org
                      </pre>
                    </div>
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Windows (PowerShell)
                    </p>
                    <p className="mb-1.5 text-xs text-gray-600">
                      No PowerShell, cole e execute. O resultado é o seu IPv4.
                    </p>
                    <div className="min-w-0 overflow-hidden rounded bg-gray-900">
                      <pre className="max-w-full overflow-x-auto break-all whitespace-pre-wrap px-3 py-2 text-xs font-mono text-green-400">
                        (Invoke-WebRequest -Uri
                        &quot;https://api.ipify.org&quot;
                        -UseBasicParsing).Content.Trim()
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
          pagamento ser confirmado pelo banco, a Orizon notifica a URL informada
          no campo{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">postback</code>.
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
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
              <p>
                <span className="text-red-500 font-bold">*</span>{' '}
                <strong>token</strong>, <strong>secret</strong>,{' '}
                <strong>amount</strong> (mín. R$ 1,00), <strong>debtor_name</strong>,{' '}
                <strong>email</strong> — obrigatórios
              </p>
              <p>
                <span className="text-red-500 font-bold">*</span>{' '}
                <strong>debtor_document_number</strong> — CPF (11 dígitos) ou
                CNPJ (14 dígitos) do pagador — obrigatório para PIX
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
              <p className="sm:col-span-2">
                <span className="text-gray-400">○</span>{' '}
                <strong>split_email</strong> + <strong>split_percentage</strong>{' '}
                — split de pagamento (opcional)
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
                <strong>transaction_id</strong> — ID único. Guarde para consultar
                o status.
              </p>
              <p>
                <strong>qr_code</strong> — código PIX Copia e Cola.{' '}
                <strong>qr_code_image_url</strong> — imagem do QR Code (base64).
              </p>
              <p>
                <strong>status</strong> — <code className="bg-gray-100 px-1 rounded">success</code> na
                criação. O pagamento é confirmado via webhook.
              </p>
              <p>
                <strong>expires_at</strong> — QR Code expira em 1 hora.
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
          Envia um PIX para qualquer chave PIX.
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
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
              <p>
                <span className="text-red-500 font-bold">*</span>{' '}
                <strong>token</strong>, <strong>secret</strong>,{' '}
                <strong>amount</strong> (mín. R$ 1,00), <strong>pixKey</strong>,{' '}
                <strong>pixKeyType</strong>, <strong>baasPostbackUrl</strong> — obrigatórios.
              </p>
              <p>
                <strong>pixKeyType</strong> aceita:{' '}
                <code className="bg-gray-100 px-1 rounded">cpf</code>{' '}
                <code className="bg-gray-100 px-1 rounded">cnpj</code>{' '}
                <code className="bg-gray-100 px-1 rounded">email</code>{' '}
                <code className="bg-gray-100 px-1 rounded">telefone</code>{' '}
                <code className="bg-gray-100 px-1 rounded">aleatoria</code>
              </p>
              <p className="sm:col-span-2">
                <strong>baasPostbackUrl</strong> — URL do seu servidor para
                receber o webhook quando o saque for processado (pago, cancelado
                ou estornado). Use <code className="bg-gray-100 px-1 rounded">web</code> se for apenas pela interface.
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
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
              <p>
                <strong>withdrawStatusId: Processing</strong> — saque automático em
                andamento (valor será enviado em instantes).
              </p>
              <p>
                <strong>withdrawStatusId: PendingProcessing</strong> — aguardando aprovação manual.
              </p>
              <p className="sm:col-span-2">
                Use o <strong>id</strong> retornado para consultar status via POST /api/status ou pelo webhook.
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
          pelo seu{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">
            idTransaction
          </code>
          . Não requer autenticação.
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
          a Orizon envia um <strong>POST</strong> para a URL que você informou:
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
          payload inclui{' '}
          <code className="bg-gray-100 px-1 rounded">typeTransaction</code> (
          <code>PIX_IN</code> ou <code>PIX_OUT</code>) para você identificar o
          tipo e os dados do <strong>pagador</strong> (depósito) ou do{' '}
          <strong>beneficiário</strong> (saque).
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
                <strong>payer</strong> — dados de quem pagou o PIX (nome,
                documento, email, telefone), quando informados na criação do
                depósito.
              </p>
              <p>
                <strong>receiver.user_id</strong> — identificador da conta
                Orizon que recebeu o valor.
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
                <strong>beneficiary</strong> — dados de quem recebeu o PIX
                (nome, documento, chave PIX informados na solicitação de saque).
              </p>
              <p>
                <strong>sender.user_id</strong> — identificador da conta Orizon
                que solicitou o saque.
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
                  https://seusite.com/webhook/orizon
                </code>
                ) que aceite POST e responda 200 rapidamente.
              </li>
              <li className="pl-0.5">
                No <strong>depósito</strong>, envie esse URL no campo{' '}
                <code className="break-words bg-gray-200 px-1 rounded">postback</code>.
              </li>
              <li className="pl-0.5">
                No <strong>saque</strong>, envie esse URL no campo{' '}
                <code className="break-words bg-gray-200 px-1 rounded">
                  baasPostbackUrl
                </code>
                .
              </li>
              <li className="pl-0.5">
                No seu backend, leia{' '}
                <code className="break-words bg-gray-200 px-1 rounded">
                  typeTransaction
                </code>{' '}
                para saber se é PIX_IN ou PIX_OUT; use{' '}
                <code className="break-words bg-gray-200 px-1 rounded">idTransaction</code>{' '}
                para conciliar com sua base e{' '}
                <code className="break-words bg-gray-200 px-1 rounded">payer</code> /{' '}
                <code className="break-words bg-gray-200 px-1 rounded">beneficiary</code>{' '}
                para exibir ou registrar dados do cliente.
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
          Abaixo estão todos os status que uma transação pode assumir.
          Use o campo{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">status</code>{' '}
          retornado na consulta ou no webhook para identificar o estado atual.
        </p>

        <div className="mb-5">
          <p className="text-sm font-medium text-gray-800 mb-3">
            Status de Depósito (Cash In)
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Webhook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-mono">WAITING_FOR_APPROVAL</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">QR Code gerado, aguardando pagamento</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">PROCESSING</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Pagamento em processamento</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-mono">PAID_OUT</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Pagamento confirmado e creditado</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">CANCELLED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Cobrança cancelada ou expirada</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">FAILED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Pagamento não realizado</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono">REFUNDED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Depósito estornado (valor total debitado)</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono">PARTIALLY_REFUNDED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Depósito estornado parcialmente</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
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
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Webhook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-mono">PENDING</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Saque aguardando aprovação manual</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">PROCESSING</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">PIX enviado, aguardando liquidação</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-mono">PAID_OUT</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Saque liquidado com sucesso</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">CANCELLED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Saque cancelado (ex: chave PIX inválida, saldo insuficiente)</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">FAILED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Saque não realizado (falha no processamento)</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono">REFUNDED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Saque estornado (valor devolvido ao saldo)</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono">PARTIALLY_REFUNDED</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Saque estornado parcialmente</td>
                  <td className="px-4 py-2.5 text-green-600 text-xs font-medium">Sim</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">Fluxo típico de status</p>
          <div className="space-y-1.5 text-xs">
            <p><strong>Depósito:</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">WAITING_FOR_APPROVAL</code>{' → '}
              <code className="bg-blue-100 px-1 rounded">PAID_OUT</code>{' '}
              (ou <code className="bg-blue-100 px-1 rounded">CANCELLED</code> se expirar)
            </p>
            <p><strong>Saque automático:</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">PROCESSING</code>{' → '}
              <code className="bg-blue-100 px-1 rounded">PAID_OUT</code>{' '}
              (ou <code className="bg-blue-100 px-1 rounded">CANCELLED</code> / <code className="bg-blue-100 px-1 rounded">FAILED</code> se houver erro)
            </p>
            <p><strong>Saque manual:</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">PENDING</code>{' → '}
              <code className="bg-blue-100 px-1 rounded">PROCESSING</code>{' → '}
              <code className="bg-blue-100 px-1 rounded">PAID_OUT</code>
            </p>
            <p><strong>Estorno:</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">PAID_OUT</code>{' → '}
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
    </div>
  )
}
