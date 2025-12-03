'use client'

import {
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function SuportePage() {
  const faqItems = [
    {
      question: 'Como realizar um saque?',
      answer:
        'Acesse a página de Pix no menu lateral, informe a chave Pix de destino e o valor desejado. Confirme os dados e finalize a transação.',
    },
    {
      question: 'Qual o limite de transações por dia?',
      answer:
        'Os limites variam de acordo com o seu nível na Jornada HorsePay. Acesse "Dados da Conta" para visualizar seus limites atuais.',
    },
    {
      question: 'Como funciona a Jornada HorsePay?',
      answer:
        'A Jornada HorsePay é um programa de fidelidade onde você avança de nível conforme realiza depósitos. Cada nível oferece benefícios exclusivos.',
    },
    {
      question: 'Como gerar um QR Code para cobrança?',
      answer:
        'Acesse "QR Codes" no menu, clique em "Gerar Novo QR Code", informe o valor e referência da cobrança e confirme.',
    },
    {
      question: 'Quanto tempo leva para processar um Pix?',
      answer:
        'As transferências Pix são processadas instantaneamente, em até 10 segundos na maioria dos casos.',
    },
    {
      question: 'Como integrar com a API?',
      answer:
        'Acesse "Configurações" > "Integração com API" para obter suas credenciais (Client Key e Client Secret). Consulte a documentação em "API Docs".',
    },
  ]

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Fale conosco pelo WhatsApp',
      action: 'Abrir WhatsApp',
      color: 'bg-green-100 text-green-600',
      link: 'https://wa.me/5511999999999',
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'suporte@horsepay.com',
      action: 'Enviar Email',
      color: 'bg-blue-100 text-blue-600',
      link: 'mailto:suporte@horsepay.com',
    },
    {
      icon: Phone,
      title: 'Telefone',
      description: '(11) 3333-3333',
      action: 'Ligar',
      color: 'bg-purple-100 text-purple-600',
      link: 'tel:+551133333333',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
        <p className="text-gray-600 text-sm mt-1">
          Estamos aqui para ajudar você
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactMethods.map((method) => {
          const Icon = method.icon
          return (
            <Card key={method.title} hover>
              <div className="text-center">
                <div
                  className={`inline-flex p-4 rounded-lg ${method.color} mb-3`}
                >
                  <Icon size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {method.description}
                </p>
                <Button
                  size="sm"
                  fullWidth
                  icon={<ExternalLink size={16} />}
                  onClick={() => window.open(method.link, '_blank')}
                >
                  {method.action}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Horário de Atendimento
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Atendimento Online
            </p>
            <p className="text-sm text-gray-600">
              Segunda a Sexta: 8h às 18h
              <br />
              Sábado: 9h às 13h
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              WhatsApp e Email
            </p>
            <p className="text-sm text-gray-600">
              24 horas por dia, 7 dias por semana
              <br />
              Resposta em até 2 horas úteis
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
            >
              <summary className="flex items-center justify-between font-medium text-gray-900 list-none">
                <span>{item.question}</span>
                <span className="text-primary transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {item.answer}
              </p>
            </details>
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
              <p className="font-medium">Central de Ajuda</p>
              <p className="text-xs text-gray-600">
                Acesse nossa base de conhecimento completa
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            icon={<ExternalLink size={20} />}
          >
            <div className="text-left">
              <p className="font-medium">Status do Sistema</p>
              <p className="text-xs text-gray-600">
                Verifique o status dos nossos serviços
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            icon={<ExternalLink size={20} />}
          >
            <div className="text-left">
              <p className="font-medium">Changelog</p>
              <p className="text-xs text-gray-600">
                Veja as últimas atualizações da plataforma
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            icon={<ExternalLink size={20} />}
          >
            <div className="text-left">
              <p className="font-medium">Termos de Uso</p>
              <p className="text-xs text-gray-600">
                Leia nossos termos e condições
              </p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  )
}
