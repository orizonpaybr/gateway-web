import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { TwoFactorSetup } from '@/components/dashboard/TwoFactorSetup'
import { TwoFactorVerify } from '@/components/dashboard/TwoFactorVerify'
import { BalanceVisibilityProvider } from '@/contexts/BalanceVisibilityContext'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BalanceVisibilityProvider>
      <MobileMenuProvider>
        <div className="h-screen bg-gray-50 overflow-hidden">
          <Sidebar />
          <div className="md:ml-72">
            <Header />
            <div className="mt-16 pt-4 h-[calc(100vh-4rem)] overflow-y-auto">
              <main>{children}</main>
            </div>
          </div>
          <TwoFactorSetup />
          <TwoFactorVerify />
        </div>
      </MobileMenuProvider>
    </BalanceVisibilityProvider>
  )
}
