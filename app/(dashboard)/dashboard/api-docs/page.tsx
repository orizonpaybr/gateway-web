'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, Code, ExternalLink, Copy, Key } from 'lucide-react'

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/account/balance',
      description: 'Consultar saldo da conta',
      methodColor: 'bg-green-100 text-green-700',
    },
    {
      method: 'GET',
      path: '/api/v1/transactions',
      description: 'Listar transações',
      methodColor: 'bg-green-100 text-green-700',
    },
    {
      method: 'GET',
      path: '/api/v1/transactions/:id',
      description: 'Consultar transação específica',
      methodColor: 'bg-green-100 text-green-700',
    },
    {
      method: 'POST',
      path: '/api/v1/pix/transfer',
      description: 'Realizar transferência Pix',
      methodColor: 'bg-blue-100 text-blue-700',
    },
    {
      method: 'POST',
      path: '/api/v1/qrcode/generate',
      description: 'Gerar QR Code de cobrança',
      methodColor: 'bg-blue-100 text-blue-700',
    },
    {
      method: 'GET',
      path: '/api/v1/qrcode/:id',
      description: 'Consultar QR Code',
      methodColor: 'bg-green-100 text-green-700',
    },
    {
      method: 'POST',
      path: '/api/v1/withdraw',
      description: 'Solicitar saque',
      methodColor: 'bg-blue-100 text-blue-700',
    },
    {
      method: 'GET',
      path: '/api/v1/extract',
      description: 'Obter extrato',
      methodColor: 'bg-green-100 text-green-700',
    },
  ]

  const codeExample = `// Exemplo de requisição com autenticação
const response = await fetch('https://api.horsepay.com/v1/account/balance', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_CLIENT_KEY',
    'X-Client-Secret': 'YOUR_CLIENT_SECRET',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample)
    alert('Código copiado para a área de transferência!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Documentação da API
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Integre o HorsePay ao seu sistema
          </p>
        </div>
        <Button
          icon={<ExternalLink size={18} />}
          onClick={() => window.open('https://docs.horsepay.com', '_blank')}
        >
          Ver Documentação Completa
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Key size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Autenticação</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Importante:</strong> Todas as requisições à API devem
            incluir suas credenciais de autenticação nos headers. Você pode
            obter suas credenciais em{' '}
            <a
              href="/dashboard/configuracoes"
              className="underline font-medium"
            >
              Configurações
            </a>
            .
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Header: Authorization
            </label>
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mt-1">
              Bearer YOUR_CLIENT_KEY
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Header: X-Client-Secret
            </label>
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mt-1">
              YOUR_CLIENT_SECRET
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Base URL</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          https://api.horsepay.com
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Code size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Exemplo de Requisição
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Copy size={16} />}
            onClick={copyCode}
          >
            Copiar Código
          </Button>
        </div>

        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{codeExample}</code>
          </pre>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
            <BookOpen size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Endpoints Disponíveis
          </h2>
        </div>

        <div className="space-y-3">
          {endpoints.map((endpoint, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${endpoint.methodColor}`}
              >
                {endpoint.method}
              </span>
              <div className="flex-1">
                <p className="font-mono text-sm text-gray-900 mb-1">
                  {endpoint.path}
                </p>
                <p className="text-xs text-gray-600">{endpoint.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink size={16} />}
              >
                Detalhes
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recursos Adicionais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            icon={<ExternalLink size={20} />}
          >
            <div className="text-left">
              <p className="font-medium">Webhooks</p>
              <p className="text-xs text-gray-600">
                Configure notificações em tempo real
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            icon={<ExternalLink size={20} />}
          >
            <div className="text-left">
              <p className="font-medium">SDKs</p>
              <p className="text-xs text-gray-600">
                Bibliotecas para diversas linguagens
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            icon={<ExternalLink size={20} />}
          >
            <div className="text-left">
              <p className="font-medium">Sandbox</p>
              <p className="text-xs text-gray-600">
                Ambiente de testes para desenvolvedores
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            icon={<ExternalLink size={20} />}
          >
            <div className="text-left">
              <p className="font-medium">Status da API</p>
              <p className="text-xs text-gray-600">
                Monitore a disponibilidade em tempo real
              </p>
            </div>
          </Button>
        </div>
      </Card>

      <Card>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-gray-800">
            <strong>Precisa de ajuda com a integração?</strong>
            <br />
            Nossa equipe de suporte técnico está pronta para ajudar você. Entre
            em contato através da página de{' '}
            <a
              href="/dashboard/suporte"
              className="text-primary underline font-medium"
            >
              Suporte
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  )
}
