'use client'

import { memo, useState } from 'react'

import { Settings } from 'lucide-react'

import { ConfiguracoesContaTab } from '@/components/dashboard/ConfiguracoesContaTab'
import { ConfiguracoesIntegracaoTab } from '@/components/dashboard/ConfiguracoesIntegracaoTab'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

const ConfiguracoesPage = memo(() => {
  const [activeTab, setActiveTab] = useState('conta')

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

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="conta">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="conta">CONTA</TabsTrigger>
          <TabsTrigger value="integracao">INTEGRAÇÃO</TabsTrigger>
        </TabsList>

        <TabsContent value="conta">
          <ConfiguracoesContaTab />
        </TabsContent>

        <TabsContent value="integracao">
          <ConfiguracoesIntegracaoTab />
        </TabsContent>
      </Tabs>
    </div>
  )
})

ConfiguracoesPage.displayName = 'ConfiguracoesPage'

export default ConfiguracoesPage
