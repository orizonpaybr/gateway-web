'use client'

import { memo, useState, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { ConfiguracoesContaTab } from '@/components/dashboard/ConfiguracoesContaTab'
import { ConfiguracoesIntegracaoTab } from '@/components/dashboard/ConfiguracoesIntegracaoTab'
import { ConfiguracoesNotificacoesTab } from '@/components/dashboard/ConfiguracoesNotificacoesTab'
import { Settings } from 'lucide-react'

const ConfiguracoesPage = memo(() => {
  const [activeTab, setActiveTab] = useState('conta')

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Settings size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
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
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="conta">CONTA</TabsTrigger>
          <TabsTrigger value="integracao">INTEGRAÇÃO</TabsTrigger>
          <TabsTrigger value="notificacoes">NOTIFICAÇÕES</TabsTrigger>
        </TabsList>

        <TabsContent value="conta">
          <ConfiguracoesContaTab />
        </TabsContent>

        <TabsContent value="integracao">
          <ConfiguracoesIntegracaoTab />
        </TabsContent>

        <TabsContent value="notificacoes">
          <ConfiguracoesNotificacoesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
})

ConfiguracoesPage.displayName = 'ConfiguracoesPage'

export default ConfiguracoesPage
