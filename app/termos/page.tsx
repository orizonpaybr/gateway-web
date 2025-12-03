'use client'

import Image from 'next/image'
import Link from 'next/link'

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
            <p className="text-gray-600">Última atualização: 19/09/2024</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="mb-8">
              <p className="text-gray-700 mb-4">
                Bem-vindo à Orizon Pay!
                <br />
                Ao utilizar o aplicativo da Orizon Pay, você concorda com os
                termos e condições descritos abaixo. Por favor, leia atentamente
                este documento, pois ele define os direitos e responsabilidades
                de ambas as partes.
              </p>
              <div className="text-center text-gray-400 mb-6">⸻</div>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Definições
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>&quot;Orizon Pay&quot;:</strong> Refere-se à Orizon
                  Pay, sua instituição de pagamento, que oferece serviços de
                  transações financeiras através deste aplicativo.
                </p>
                <p className="text-gray-700">
                  <strong>&quot;Usuário&quot;:</strong> Qualquer pessoa que
                  utilize o aplicativo da Orizon Pay.
                </p>
                <p className="text-gray-700">
                  <strong>&quot;Aplicativo&quot;:</strong> Refere-se ao software
                  de propriedade da Orizon Pay disponibilizado para os usuários
                  em dispositivos móveis.
                </p>
                <p className="text-gray-700">
                  <strong>&quot;Serviços&quot;:</strong> Todas as
                  funcionalidades oferecidas pela Orizon Pay por meio do
                  aplicativo, incluindo, mas não se limitando a transferências,
                  pagamentos e consultas de saldo.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Aceitação dos Termos
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Ao instalar, acessar ou utilizar o aplicativo Orizon Pay, você
                  concorda com estes Termos de Uso.
                </p>
                <p className="text-gray-700">
                  A Orizon Pay reserva-se o direito de modificar os Termos de
                  Uso a qualquer momento, sendo responsabilidade do usuário
                  revisá-los periodicamente.
                </p>
                <p className="text-gray-700">
                  O uso contínuo do aplicativo após alterações implica na
                  aceitação dos novos termos.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Serviços Oferecidos
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  A Orizon Pay fornece serviços financeiros digitais, incluindo:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Realização de transferências e pagamentos.</li>
                  <li>Consulta de saldos e extratos.</li>
                  <li>
                    Transações por meio de Pix e outros meios de pagamento
                    disponíveis.
                  </li>
                </ul>
                <p className="text-gray-700">
                  Os serviços podem ser expandidos ou modificados a critério
                  exclusivo da Orizon Pay.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Cadastro e Responsabilidades do Usuário
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Para acessar os serviços da Orizon Pay, o usuário deverá criar
                  uma conta e fornecer informações precisas e completas. O
                  usuário compromete-se a:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Manter suas informações de cadastro atualizadas.</li>
                  <li>
                    Proteger suas credenciais de acesso (login e senha) e não
                    compartilhá-las com terceiros.
                  </li>
                  <li>
                    Notificar a Orizon Pay imediatamente em caso de qualquer uso
                    não autorizado de sua conta.
                  </li>
                </ul>
                <p className="text-gray-700">
                  A Orizon Pay não se responsabiliza por perdas ou danos
                  resultantes de falhas na proteção das credenciais do usuário.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Uso Permitido e Proibições
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  O usuário concorda em utilizar o aplicativo exclusivamente
                  para os fins permitidos por lei e de acordo com estes Termos
                  de Uso.
                </p>
                <p className="text-gray-700">
                  O uso do aplicativo é estritamente proibido para:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Qualquer atividade ilegal ou fraudulenta.</li>
                  <li>
                    Tentar burlar, hackear ou explorar vulnerabilidades do
                    sistema da Orizon Pay.
                  </li>
                  <li>
                    Reverter a engenharia do software ou explorar indevidamente
                    o conteúdo do aplicativo.
                  </li>
                </ul>
                <p className="text-gray-700">
                  A Orizon Pay se reserva o direito de suspender ou encerrar a
                  conta de usuários que violarem estas proibições.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Privacidade e Proteção de Dados
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  A Orizon Pay está comprometida com a proteção de seus dados
                  pessoais.
                </p>
                <p className="text-gray-700">
                  Nossa Política de Privacidade descreve como coletamos,
                  utilizamos, armazenamos e protegemos as informações dos
                  usuários, de acordo com a Lei Geral de Proteção de Dados
                  (LGPD).
                </p>
                <p className="text-gray-700">
                  Ao utilizar o aplicativo, você concorda com o processamento de
                  seus dados conforme descrito em nossa Política de Privacidade.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Tarifas e Encargos
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  O uso de determinados serviços oferecidos pela Orizon Pay pode
                  estar sujeito a tarifas ou encargos, que serão comunicados ao
                  usuário no momento da transação ou de forma antecipada.
                </p>
                <p className="text-gray-700">
                  A Orizon Pay reserva-se o direito de alterar as tarifas a
                  qualquer momento, mediante notificação prévia aos usuários.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Limitações de Responsabilidade
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  A Orizon Pay se empenha em fornecer um serviço seguro e
                  contínuo. No entanto, a empresa não se responsabiliza por:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Indisponibilidade temporária do aplicativo devido a
                    manutenção, atualizações ou falhas técnicas.
                  </li>
                  <li>
                    Perdas financeiras decorrentes de falhas no serviço, exceto
                    quando decorrentes de conduta dolosa por parte da Orizon
                    Pay.
                  </li>
                  <li>
                    Erros ou omissões em informações fornecidas por terceiros.
                  </li>
                </ul>
                <p className="text-gray-700">
                  A Orizon Pay não se responsabiliza por perdas de dados, ganhos
                  cessantes ou outros danos indiretos causados pelo uso ou
                  incapacidade de uso do aplicativo.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Suspensão e Cancelamento de Serviços
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  A Orizon Pay reserva-se o direito de suspender temporariamente
                  ou cancelar de forma permanente os serviços de um usuário, a
                  seu exclusivo critério, nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Violação dos Termos de Uso.</li>
                  <li>
                    Suspeita de fraude, uso indevido ou atividades ilícitas.
                  </li>
                  <li>Manutenções programadas ou imprevistas no sistema.</li>
                </ul>
                <p className="text-gray-700">
                  Os usuários serão notificados, sempre que possível, sobre
                  suspensões planejadas ou cancelamentos de conta.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Alterações no Aplicativo
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  A Orizon Pay pode, a qualquer momento, modificar, suspender ou
                  descontinuar qualquer funcionalidade do aplicativo, com ou sem
                  aviso prévio aos usuários.
                </p>
                <p className="text-gray-700">
                  Não nos responsabilizamos por perdas decorrentes de tais
                  modificações ou descontinuações.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Propriedade Intelectual
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Todos os direitos relativos ao aplicativo Orizon Pay,
                  incluindo, mas não se limitando a, seu código-fonte, design,
                  logotipos e conteúdo, são de propriedade exclusiva da Orizon
                  Pay.
                </p>
                <p className="text-gray-700">
                  O uso do aplicativo não concede ao usuário qualquer direito
                  sobre a propriedade intelectual da empresa.
                </p>
                <p className="text-gray-700">
                  É proibido reproduzir, distribuir ou modificar qualquer parte
                  do aplicativo sem autorização prévia da Orizon Pay.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                12. Legislação Aplicável e Foro
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Estes Termos de Uso são regidos pela legislação brasileira.
                </p>
                <p className="text-gray-700">
                  Qualquer disputa relacionada a estes termos será resolvida no
                  foro da comarca de São Paulo, SP, com exclusão de qualquer
                  outro, por mais privilegiado que seja.
                </p>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contato
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Em caso de dúvidas sobre estes Termos de Uso ou sobre o
                  aplicativo, entre em contato conosco pelo e-mail:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>📧 Email:</strong> sac@orizonpayoficial.com
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
