'use client'

import { useEffect, useState } from 'react'

import { Settings } from 'lucide-react'
import { toast } from 'sonner'

import {
  DepositSettingsSection,
  WithdrawalSettingsSection,
  ReportCustomizationSection,
  SecurityIPsSection,
} from '@/components/admin/settings'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { useGatewaySettings } from '@/hooks/useGatewaySettings'
import type {
  GatewaySettings,
  NumericSettingsField,
} from '@/types/gateway-settings'

export default function ConfiguracoesGeraisPage() {
  const { user, authReady } = useAuth()
  const { settings, isLoading, updateSettings, isUpdating } =
    useGatewaySettings()

  const [localSettings, setLocalSettings] = useState<GatewaySettings | null>(
    null,
  )
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'deposito',
    'saque',
    'relatorios',
  ])
  const [editingValues, setEditingValues] = useState<
    Partial<Record<NumericSettingsField, string>>
  >({})

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  useEffect(() => {
    if (!authReady) {
      return
    }
    if (Number(user?.permission) !== 3) {
      toast.error('Acesso negado', {
        description: 'Somente administradores podem acessar esta página.',
      })
    }
  }, [authReady, user])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    )
  }

  const getNumericDisplayedValue = (field: NumericSettingsField) => {
    if (editingValues[field] !== undefined) {
      return editingValues[field] ?? ''
    }
    const value = localSettings?.[field]
    return value === null || value === undefined ? '' : String(value)
  }

  const handleNumericChange =
    (field: NumericSettingsField) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      setEditingValues((prev) => ({ ...prev, [field]: rawValue }))
    }

  const handleNumericBlur =
    (field: NumericSettingsField) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      setEditingValues((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })

      if (!localSettings) {
        return
      }

      const parsed = parseFloat(rawValue)
      const finalValue = isNaN(parsed) || rawValue.trim() === '' ? 0 : parsed

      setLocalSettings({
        ...localSettings,
        [field]: finalValue,
      })
    }

  const handleSwitchChange = (field: keyof GatewaySettings) => {
    if (!localSettings) {
      return
    }
    setLocalSettings({
      ...localSettings,
      [field]: !localSettings[field],
    })
  }

  const handleAddIP = (ip: string) => {
    if (!localSettings) {
      return
    }
    setLocalSettings({
      ...localSettings,
      global_ips: [...localSettings.global_ips, ip],
    })
  }

  const handleRemoveIP = (ip: string) => {
    if (!localSettings) {
      return
    }
    setLocalSettings({
      ...localSettings,
      global_ips: localSettings.global_ips.filter((i) => i !== ip),
    })
  }

  const handleSave = async () => {
    if (!localSettings) {
      return
    }

    try {
      await updateSettings(localSettings)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
  }

  if (isLoading || !localSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (Number(user?.permission) !== 3) {
    return null
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Ajustes Gerais</h1>
        </div>
        <p className="text-gray-600">
          Configure as taxas, relatórios e segurança do gateway
        </p>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Taxas</h2>

          <DepositSettingsSection
            settings={localSettings}
            isExpanded={expandedSections.includes('deposito')}
            onToggle={() => toggleSection('deposito')}
            getDisplayValue={getNumericDisplayedValue}
            handleChange={handleNumericChange}
            handleBlur={handleNumericBlur}
          />

          <WithdrawalSettingsSection
            settings={localSettings}
            isExpanded={expandedSections.includes('saque')}
            onToggle={() => toggleSection('saque')}
            getDisplayValue={getNumericDisplayedValue}
            handleChange={handleNumericChange}
            handleBlur={handleNumericBlur}
          />
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            Personalização de Relatórios
          </h2>

          <ReportCustomizationSection
            settings={localSettings}
            isExpanded={expandedSections.includes('relatorios')}
            onToggle={() => toggleSection('relatorios')}
            onSwitchChange={handleSwitchChange}
          />
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Configurações de Segurança
          </h2>

          <SecurityIPsSection
            globalIps={localSettings.global_ips}
            onAddIP={handleAddIP}
            onRemoveIP={handleRemoveIP}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          variant="primary"
          size="sm"
          disabled={isUpdating}
          className="px-6"
        >
          {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
