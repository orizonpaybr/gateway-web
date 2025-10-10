import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/Providers'

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
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              style: {
                background: '#FFFFFF',
                border: '1px solid #EBEBEB',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
