import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/Providers'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orizon Pay - Finance',
  description: 'Sistema de pagamentos e gestão financeira',
  icons: {
    icon: '/LOGO-ORIZON.png',
    shortcut: '/LOGO-ORIZON.png',
    apple: '/LOGO-ORIZON.png',
  },
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
          <ReactQueryProvider>
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
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  )
}
