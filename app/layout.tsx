import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Orizon Pay - Finance',
  description: 'Sistema de pagamentos e gestão financeira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #EBEBEB',
            },
          }}
        />
      </body>
    </html>
  )
}
