import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HorsePay - Finance',
  description: 'Sistema de pagamentos e gestão financeira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
