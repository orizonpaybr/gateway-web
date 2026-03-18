'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/Button'

const logoSrc = encodeURI('/Logo Coratri Finance.png')

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src={logoSrc}
              alt="Coratri Finance"
              width={260}
              height={72}
              priority
              className="object-contain mx-auto"
            />
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
                Bem-vindo à Coratri IP S.A.
                <br />
                <br />
                Ao utilizar o aplicativo da Coratri IP S.A., você concorda com
                os termos e condições descritos abaixo. Por favor, leia
                atentamente este documento, pois ele define os direitos e
                responsabilidades de ambas as partes.
              </p>
              <div className="text-center text-gray-400 mb-6">⸻</div>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Definições
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>&quot;Coratri IP S.A.&quot;:</strong> Refere-se à
                  Coratri IP S.A., instituição de pagamento que oferece serviços
                  de transações financeiras por meio deste aplicativo.
                </p>
                <p className="text-gray-700">
                  <strong>&quot;Usuário&quot;:</strong> Qualquer pessoa física
                  ou jurídica que utilize o aplicativo da Coratri IP S.A.
                </p>
                <p className="text-gray-700">
                  <strong>&quot;Aplicativo&quot;:</strong> Refere-se ao software
                  de propriedade da Coratri IP S.A. disponibilizado aos usuários
                  em dispositivos móveis ou outros meios digitais.
                </p>
                <p className="text-gray-700">
                  <strong>&quot;Serviços&quot;:</strong> Todas as
                  funcionalidades oferecidas pela Coratri IP S.A. por meio do
                  aplicativo, incluindo, mas não se limitando a transferências,
                  pagamentos, consultas de saldo e demais serviços financeiros
                  digitais.
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
                  Ao instalar, acessar ou utilizar o aplicativo da Coratri IP
                  S.A., o usuário declara que leu, compreendeu e concorda
                  integralmente com estes Termos de Uso.
                </p>
                <p className="text-gray-700">
                  A Coratri IP S.A. reserva-se o direito de modificar estes
                  Termos de Uso a qualquer momento. É responsabilidade do
                  usuário revisá-los periodicamente.
                </p>
                <p className="text-gray-700">
                  O uso contínuo do aplicativo após eventuais alterações implica
                  na aceitação automática dos novos termos.
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
                  A Coratri IP S.A. disponibiliza serviços financeiros digitais,
                  incluindo:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Realização de transferências e pagamentos;</li>
                  <li>Consulta de saldos e extratos;</li>
                  <li>
                    Transações por meio de Pix e outros meios de pagamento
                    disponíveis;
                  </li>
                  <li>
                    Integração com plataformas e serviços financeiros digitais.
                  </li>
                </ul>
                <p className="text-gray-700">
                  Os serviços poderão ser ampliados, modificados ou
                  descontinuados a qualquer momento, a exclusivo critério da
                  Coratri IP S.A.
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
                  Para utilizar os serviços da Coratri IP S.A., o usuário deverá
                  realizar cadastro e fornecer informações verdadeiras,
                  completas e atualizadas.
                </p>
                <p className="text-gray-700">O usuário compromete-se a:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Manter seus dados cadastrais atualizados;</li>
                  <li>
                    Proteger suas credenciais de acesso (login, senha e
                    autenticações adicionais);
                  </li>
                  <li>Não compartilhar suas credenciais com terceiros;</li>
                  <li>
                    Notificar imediatamente a Coratri IP S.A. em caso de
                    suspeita de acesso não autorizado à sua conta.
                  </li>
                </ul>
                <p className="text-gray-700">
                  A Coratri IP S.A. não se responsabiliza por perdas decorrentes
                  de falha do usuário em proteger suas credenciais.
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
                  O usuário compromete-se a utilizar o aplicativo exclusivamente
                  para fins lícitos e em conformidade com estes Termos de Uso.
                </p>
                <p className="text-gray-700">
                  É expressamente proibido utilizar o aplicativo para:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Atividades ilegais, fraudulentas ou que violem a legislação
                    vigente;
                  </li>
                  <li>
                    Tentativas de invasão, fraude ou exploração de
                    vulnerabilidades do sistema;
                  </li>
                  <li>
                    Engenharia reversa, cópia ou exploração indevida do
                    software;
                  </li>
                  <li>
                    Uso do aplicativo para práticas que violem normas
                    regulatórias do sistema financeiro.
                  </li>
                </ul>
                <p className="text-gray-700">
                  A Coratri IP S.A. poderá suspender ou encerrar contas que
                  violem estes termos.
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
                  A Coratri IP S.A. está comprometida com a proteção da
                  privacidade e dos dados pessoais dos usuários.
                </p>
                <p className="text-gray-700">
                  O tratamento de dados é realizado em conformidade com a Lei
                  Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
                </p>
                <p className="text-gray-700">
                  Nossa Política de Privacidade descreve como coletamos,
                  utilizamos, armazenamos e protegemos as informações dos
                  usuários.
                </p>
                <p className="text-gray-700">
                  Ao utilizar o aplicativo, o usuário concorda com o tratamento
                  de seus dados conforme descrito nesta política.
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
                  Determinados serviços disponibilizados pela Coratri IP S.A.
                  podem estar sujeitos à cobrança de tarifas ou encargos.
                </p>
                <p className="text-gray-700">
                  As tarifas aplicáveis serão informadas previamente ao usuário
                  ou no momento da realização da transação.
                </p>
                <p className="text-gray-700">
                  A Coratri IP S.A. poderá atualizar ou alterar as tarifas
                  mediante comunicação prévia.
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
                  A Coratri IP S.A. empenha-se em fornecer serviços seguros,
                  eficientes e contínuos.
                </p>
                <p className="text-gray-700">
                  No entanto, não se responsabiliza por:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Indisponibilidade temporária do aplicativo por motivos
                    técnicos, manutenção ou atualização;
                  </li>
                  <li>
                    Falhas decorrentes de serviços prestados por terceiros;
                  </li>
                  <li>
                    Perdas financeiras decorrentes de fatores externos ou fora
                    de seu controle;
                  </li>
                  <li>
                    Danos indiretos, lucros cessantes ou perda de dados
                    decorrentes do uso do aplicativo.
                  </li>
                </ul>
              </div>
            </section>

            <div className="text-center text-gray-400 mb-6">⸻</div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Suspensão e Cancelamento de Serviços
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  A Coratri IP S.A. poderá suspender ou cancelar o acesso do
                  usuário aos serviços nas seguintes hipóteses:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Violação destes Termos de Uso;</li>
                  <li>
                    Suspeita de fraude, lavagem de dinheiro ou atividades
                    ilícitas;
                  </li>
                  <li>Determinação regulatória ou legal;</li>
                  <li>Necessidade operacional ou manutenção do sistema.</li>
                </ul>
                <p className="text-gray-700">
                  Sempre que possível, o usuário será previamente notificado.
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
                  A Coratri IP S.A. poderá, a qualquer momento, modificar,
                  suspender ou descontinuar funcionalidades do aplicativo, com
                  ou sem aviso prévio.
                </p>
                <p className="text-gray-700">
                  A empresa não será responsável por eventuais impactos
                  decorrentes dessas alterações.
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
                  Todos os direitos relativos ao aplicativo da Coratri IP S.A.,
                  incluindo software, design, logotipos, sistemas e conteúdos,
                  são de propriedade exclusiva da empresa.
                </p>
                <p className="text-gray-700">
                  O uso do aplicativo não concede ao usuário qualquer direito
                  sobre a propriedade intelectual da Coratri IP S.A.
                </p>
                <p className="text-gray-700">
                  É proibida qualquer reprodução, distribuição ou modificação do
                  aplicativo sem autorização expressa.
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
                  Estes Termos de Uso são regidos pelas leis da República
                  Federativa do Brasil.
                </p>
                <p className="text-gray-700">
                  Fica eleito o foro da Comarca de São Paulo – SP, com exclusão
                  de qualquer outro, por mais privilegiado que seja, para
                  dirimir eventuais controvérsias decorrentes destes termos.
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
                  Em caso de dúvidas sobre estes Termos de Uso ou sobre os
                  serviços da Coratri IP S.A., entre em contato:
                </p>
                <p className="text-gray-700">
                  <strong>📧</strong>{' '}
                  <a
                    href="mailto:sac@coratri.com"
                    className="text-[#101010] font-medium underline underline-offset-2 hover:opacity-80"
                  >
                    sac@coratri.com
                  </a>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-gray-500">
                Ao utilizar nossos serviços, você concorda com estes termos de
                uso.
              </p>
              <Button
                onClick={() => window.history.back()}
                variant="inkOutline"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
