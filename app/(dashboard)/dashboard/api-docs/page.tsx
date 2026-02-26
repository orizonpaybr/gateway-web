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
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

const SUPPORT_WHATSAPP_URL = 'https://wa.me/5549988906647'

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  if (!apiUrl) {
    return 'https://api.orizonpay.com.br'
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
    desc: 'Rate limit atingido. Cash In: 60 req/min. Cash Out: 30 req/min. Status: 20 req/min.',
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
  "amount": 150.00,
  "debtor_name": "João Silva",
  "email": "joao@email.com",
  "debtor_document_number": "12345678901",
  "phone": "11999999999",
  "postback": "https://seusite.com/webhook/pix"
}`

const cashInResponse = `{
  "idTransaction": "e2a3f1c8d94b...",
  "qrcode": "00020126580014br.gov.bcb.pix...",
  "status": "WAITING_FOR_APPROVAL",
  "amount": 150.00,
  "expires_at": "2025-01-15T16:30:00Z"
}`

const cashOutBody = `{
  "token": "{{CLIENT_KEY}}",
  "secret": "{{CLIENT_SECRET}}",
  "amount": 80.00,
  "pixKey": "joao@email.com",
  "pixKeyType": "email",
  "baasPostbackUrl": "https://seusite.com/webhook/cashout"
}`

const cashOutResponse = `{
  "idTransaction": "uuid-a1b2c3...",
  "status": "processing",
  "amount": 80.00,
  "pixKey": "joao@email.com",
  "pixKeyType": "email"
}`

const statusBody = `{
  "idTransaction": "e2a3f1c8d94b..."
}`

const statusResponse = `{
  "status": "PAID_OUT"
}`

const webhookPayload = `{
  "idTransaction": "e2a3f1c8d94b...",
  "status": "PAID_OUT",
  "amount": 150.00,
  "paidAt": "2025-01-15T16:12:33Z"
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
              . Não existe rota separada para &quot;gerar token&quot; — envie
              as credenciais em cada chamada (Cash In e Cash Out).
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
                <p className="font-medium">
                  Descubra o IPv4 do seu servidor
                </p>
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
                        (Invoke-WebRequest -Uri &quot;https://api.ipify.org&quot; -UseBasicParsing).Content.Trim()
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
                <strong>amount</strong>, <strong>debtor_name</strong>,{' '}
                <strong>email</strong> — obrigatórios
              </p>
              <p>
                <span className="text-gray-400">○</span>{' '}
                <strong>debtor_document_number</strong> — CPF ou CNPJ do pagador
                (opcional)
              </p>
              <p>
                <span className="text-gray-400">○</span> <strong>phone</strong>{' '}
                — telefone do pagador (opcional)
              </p>
              <p>
                <span className="text-gray-400">○</span>{' '}
                <strong>postback</strong> — URL para receber confirmação de
                pagamento (opcional)
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
                <strong>idTransaction</strong> — ID único. Guarde para consultar
                o status.
              </p>
              <p>
                <strong>qrcode</strong> — código do QR Code PIX. Exiba para o
                seu cliente.
              </p>
              <p>
                <strong>status</strong> — sempre{' '}
                <code className="bg-gray-100 px-1 rounded">
                  WAITING_FOR_APPROVAL
                </code>{' '}
                na criação.
              </p>
              <p>
                <strong>expires_at</strong> — expira em 1 hora.
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
                <span className="text-red-500 font-bold">*</span> Todos os
                campos são <strong>obrigatórios</strong>.
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
                receber a confirmação do saque.
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
                <strong>status: processing</strong> — saque automático em
                andamento.
              </p>
              <p>
                <strong>status: pending</strong> — aguardando aprovação manual.
              </p>
              <p className="sm:col-span-2">
                Use <strong>idTransaction</strong> para monitorar o status via
                polling ou webhook.
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

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
            <Bell size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Webhook / Postback
          </h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Quando o pagamento é confirmado, a Orizon envia uma requisição{' '}
          <strong>POST</strong> para a URL que você informou no campo{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">postback</code>{' '}
          (cash in) ou{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">
            baasPostbackUrl
          </code>{' '}
          (cash out).
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
          <strong>Importante:</strong> Seu servidor deve responder com HTTP{' '}
          <strong>200</strong> o mais rápido possível. Processar a lógica de
          negócio de forma assíncrona (fila) é fortemente recomendado.
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Payload recebido no seu servidor
            </p>
            <Button
              variant="ghost"
              size="sm"
              icon={<Copy size={14} />}
              onClick={() => handleCopy(webhookPayload)}
            >
              Copiar
            </Button>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs leading-relaxed">
              <code>{webhookPayload}</code>
            </pre>
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
