import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/Providers'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundary'

import { BRAND_FAVICON_SRC } from '@/lib/constants/brand'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coratri - Finance',
  description: 'Sistema de pagamentos e gestão financeira',
  icons: {
    icon: BRAND_FAVICON_SRC,
    shortcut: BRAND_FAVICON_SRC,
    apple: BRAND_FAVICON_SRC,
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
        <ErrorBoundaryWrapper>
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
        </ErrorBoundaryWrapper>
      </body>
    </html>
  )
}
