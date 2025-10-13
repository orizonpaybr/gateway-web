'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Image
              src="/LOGO-ORIZON-AZUL-PRETA.png"
              alt="Orizon Pay"
              width={120}
              height={36}
              priority
            />
          </div>
          <Link
            href="/"
            className="text-primary text-sm font-medium hover:underline"
          >
            Finance
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Termos de Uso
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 mb-4">
                Ao utilizar os serviços da Orizon Pay Finance, você concorda em
                cumprir e estar sujeito aos termos e condições estabelecidos
                neste documento. Estes termos constituem um acordo legal entre
                você e a Orizon Pay Finance.
              </p>
              <p className="text-gray-700">
                Se você não concorda com qualquer parte destes termos, não deve
                utilizar nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Definições
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Gateway de Pagamento:</strong> Sistema que facilita o
                  processamento de transações financeiras entre comerciantes e
                  clientes.
                </p>
                <p className="text-gray-700">
                  <strong>Usuário:</strong> Pessoa física ou jurídica que
                  utiliza nossos serviços.
                </p>
                <p className="text-gray-700">
                  <strong>Transação:</strong> Operação financeira realizada
                  através de nossa plataforma.
                </p>
                <p className="text-gray-700">
                  <strong>Conta:</strong> Cadastro do usuário em nossa
                  plataforma.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Serviços Oferecidos
              </h2>
              <p className="text-gray-700 mb-4">
                A Orizon Pay Finance oferece os seguintes serviços:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Processamento de pagamentos online</li>
                <li>Gateway de pagamento para e-commerce</li>
                <li>Integração com múltiplas formas de pagamento</li>
                <li>Relatórios e análises de transações</li>
                <li>Suporte técnico e comercial</li>
                <li>Ferramentas de gestão financeira</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Cadastro e Conta do Usuário
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Para utilizar nossos serviços, é necessário criar uma conta
                  fornecendo informações verdadeiras, precisas e completas.
                </p>
                <p className="text-gray-700">O usuário é responsável por:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Manter a confidencialidade de suas credenciais de acesso
                  </li>
                  <li>
                    Notificar imediatamente sobre qualquer uso não autorizado de
                    sua conta
                  </li>
                  <li>Atualizar suas informações quando necessário</li>
                  <li>
                    Fornecer documentos válidos para verificação de identidade
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Processamento de Pagamentos
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Nossa plataforma processa pagamentos de forma segura,
                  utilizando criptografia e protocolos de segurança avançados.
                </p>
                <p className="text-gray-700">
                  <strong>Taxas:</strong> As taxas de processamento são
                  informadas previamente e podem variar conforme o tipo de
                  transação e plano contratado.
                </p>
                <p className="text-gray-700">
                  <strong>Prazo de Liquidação:</strong> Os valores são
                  liquidados conforme cronograma estabelecido em contrato,
                  geralmente em até 2 dias úteis.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Segurança e Proteção de Dados
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Implementamos medidas rigorosas de segurança para proteger
                  seus dados e transações:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Criptografia SSL/TLS para todas as transações</li>
                  <li>Certificação PCI DSS Level 1</li>
                  <li>Monitoramento 24/7 para detectar atividades suspeitas</li>
                  <li>
                    Conformidade com a Lei Geral de Proteção de Dados (LGPD)
                  </li>
                  <li>Armazenamento seguro de informações sensíveis</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Responsabilidades do Usuário
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">O usuário compromete-se a:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Utilizar os serviços apenas para transações legítimas</li>
                  <li>Não realizar atividades fraudulentas ou ilegais</li>
                  <li>Respeitar os limites de transação estabelecidos</li>
                  <li>Manter atualizados os dados cadastrais</li>
                  <li>Reportar imediatamente qualquer irregularidade</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Limitações e Isenções
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  A Orizon Pay Finance não se responsabiliza por:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Falhas em sistemas de terceiros (bancos, adquirentes)</li>
                  <li>Interrupções temporárias de serviço para manutenção</li>
                  <li>
                    Decisões de aprovação/reprovação de transações por terceiros
                  </li>
                  <li>Uso indevido da plataforma pelo usuário</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Modificações dos Termos
              </h2>
              <p className="text-gray-700">
                Reservamo-nos o direito de modificar estes termos a qualquer
                momento. As alterações serão comunicadas através da plataforma e
                entrarão em vigor 30 dias após a publicação. O uso continuado
                dos serviços após as modificações constitui aceitação dos novos
                termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Resolução de Conflitos
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Estes termos são regidos pela legislação brasileira. Qualquer
                  disputa será resolvida através de:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Negociação direta entre as partes</li>
                  <li>Mediação através de câmara competente</li>
                  <li>Arbitragem, se necessário</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Contato
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Para dúvidas sobre estes termos ou nossos serviços:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Email:</strong> suporte@orizonpay.com
                  </p>
                  <p>
                    <strong>Telefone:</strong> +55 11 98164-4351
                  </p>
                  <p>
                    <strong>Horário de Atendimento:</strong> Segunda a Sexta, 8h
                    às 18h
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-gray-500">
                Ao utilizar nossos serviços, você concorda com estes termos de
                uso.
              </p>
              <Button onClick={() => window.history.back()} variant="outline">
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
