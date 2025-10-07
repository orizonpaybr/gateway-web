'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Edit,
  User,
  Building2,
  DollarSign,
  Settings as SettingsIcon,
} from 'lucide-react'

export default function ContaPage() {
  const userData = {
    fullName: 'João Silva',
    username: '@joaosilva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    city: 'São Paulo',
  }

  const companyData = {
    name: 'Empresa Exemplo LTDA',
    cnpj: '12.345.678/0001-90',
    tradeName: 'Empresa Exemplo',
    phone: '(11) 3333-3333',
    email: 'contato@empresa.com',
  }

  const taxasConfig = {
    depositoPercentual: 2.5,
    saquePercentual: 1.5,
    afiliadoPercentual: 5.0,
    limiteDeposito: 50000,
    limiteSaque: 10000,
    retencaoPercentual: 0.5,
  }

  const funcionalidades = {
    saqueAutomatico: true,
    saqueDashboard: true,
    saqueAPI: true,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dados da Conta</h1>
        <p className="text-gray-600 text-sm mt-1">
          Visualize e gerencie as informações da sua conta
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <User size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Dados Pessoais
            </h2>
          </div>
          <Button variant="outline" size="sm" icon={<Edit size={16} />}>
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Nome Completo
            </label>
            <p className="text-sm text-gray-900 mt-1">{userData.fullName}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Nome de Usuário
            </label>
            <p className="text-sm text-gray-900 mt-1">{userData.username}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Email
            </label>
            <p className="text-sm text-gray-900 mt-1">{userData.email}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Telefone
            </label>
            <p className="text-sm text-gray-900 mt-1">{userData.phone}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              CPF
            </label>
            <p className="text-sm text-gray-900 mt-1">{userData.cpf}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Cidade
            </label>
            <p className="text-sm text-gray-900 mt-1">{userData.city}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Building2 size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Dados da Empresa
            </h2>
          </div>
          <Button variant="outline" size="sm" icon={<Edit size={16} />}>
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Razão Social
            </label>
            <p className="text-sm text-gray-900 mt-1">{companyData.name}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              CNPJ
            </label>
            <p className="text-sm text-gray-900 mt-1">{companyData.cnpj}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Nome Fantasia
            </label>
            <p className="text-sm text-gray-900 mt-1">
              {companyData.tradeName}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Telefone
            </label>
            <p className="text-sm text-gray-900 mt-1">{companyData.phone}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Email
            </label>
            <p className="text-sm text-gray-900 mt-1">{companyData.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <DollarSign size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Taxas e Limites
            </h2>
          </div>
          <Button variant="outline" size="sm" icon={<Edit size={16} />}>
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Taxa de Depósito
            </label>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {taxasConfig.depositoPercentual}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Taxa de Saque
            </label>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {taxasConfig.saquePercentual}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Taxa de Afiliado
            </label>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {taxasConfig.afiliadoPercentual}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Limite de Depósito
            </label>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {taxasConfig.limiteDeposito.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Limite de Saque
            </label>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {taxasConfig.limiteSaque.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Taxa de Retenção
            </label>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {taxasConfig.retencaoPercentual}%
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <SettingsIcon size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Funcionalidades
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Saque Automático</p>
              <p className="text-sm text-gray-600">
                Saques programados automaticamente
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                funcionalidades.saqueAutomatico
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {funcionalidades.saqueAutomatico ? 'Ativo' : 'Inativo'}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Saque via Dashboard</p>
              <p className="text-sm text-gray-600">
                Realizar saques através do painel
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                funcionalidades.saqueDashboard
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {funcionalidades.saqueDashboard ? 'Ativo' : 'Inativo'}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Saque via API</p>
              <p className="text-sm text-gray-600">
                Realizar saques através da API
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                funcionalidades.saqueAPI
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {funcionalidades.saqueAPI ? 'Ativo' : 'Inativo'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
