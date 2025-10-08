import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso - Orizon Pay Finance',
  description:
    'Termos e condições de uso dos serviços da Orizon Pay Finance, gateway de pagamento.',
  keywords:
    'termos de uso, gateway de pagamento, orizon pay, finance, condições',
  robots: 'index, follow',
}

export default function TermosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
