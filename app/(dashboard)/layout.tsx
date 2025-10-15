import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { TwoFactorSetup } from '@/components/dashboard/TwoFactorSetup'
import { TwoFactorVerify } from '@/components/dashboard/TwoFactorVerify'
import { BalanceVisibilityProvider } from '@/contexts/BalanceVisibilityContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BalanceVisibilityProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-72">
          <Header />
          <div className="mt-16 pt-4">
            <main>{children}</main>
          </div>
        </div>
        <TwoFactorSetup />
        <TwoFactorVerify />
      </div>
    </BalanceVisibilityProvider>
  )
}
