import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso - Coratri IP S.A.',
  description:
    'Termos e condições de uso dos serviços da Coratri IP S.A., instituição de pagamento.',
  keywords:
    'termos de uso, Coratri IP S.A., pagamentos, finance, condições',
  robots: 'index, follow',
}

export default function TermosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
