'use client'

import { memo, useState, useCallback, useEffect } from 'react'

import { Settings } from 'lucide-react'

import { ConfiguracoesContaTab } from '@/components/dashboard/ConfiguracoesContaTab'
import { ConfiguracoesIntegracaoTab } from '@/components/dashboard/ConfiguracoesIntegracaoTab'
import { ConfiguracoesNotificacoesTab } from '@/components/dashboard/ConfiguracoesNotificacoesTab'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useAuth } from '@/contexts/AuthContext'
import { USER_STATUS } from '@/lib/constants'

const ConfiguracoesPage = memo(() => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('conta')
  const isPending = user?.status === USER_STATUS.PENDING

  const handleTabChange = useCallback((value: string) => {
    // Se o usuário tentar acessar a aba de integração e estiver pendente, redirecionar para conta
    if (value === 'integracao' && isPending) {
      setActiveTab('conta')
      return
    }
    setActiveTab(value)
  }, [isPending])

  // Garantir que se o usuário estiver pendente e a aba ativa for integração, mude para conta
  useEffect(() => {
    if (isPending && activeTab === 'integracao') {
      setActiveTab('conta')
    }
  }, [isPending, activeTab])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Settings size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Configurações
          </h1>
        </div>
        <p className="text-gray-600 text-sm">
          Gerencie suas preferências e configurações de segurança
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        defaultValue="conta"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="conta">CONTA</TabsTrigger>
          {!isPending && (
            <TabsTrigger value="integracao">INTEGRAÇÃO</TabsTrigger>
          )}
          <TabsTrigger value="notificacoes">NOTIFICAÇÕES</TabsTrigger>
        </TabsList>

        <TabsContent value="conta">
          <ConfiguracoesContaTab />
        </TabsContent>

        {!isPending && (
          <TabsContent value="integracao">
            <ConfiguracoesIntegracaoTab />
          </TabsContent>
        )}

        <TabsContent value="notificacoes">
          <ConfiguracoesNotificacoesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
})

ConfiguracoesPage.displayName = 'ConfiguracoesPage'

export default ConfiguracoesPage
