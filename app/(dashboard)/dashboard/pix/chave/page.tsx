'use client'

import { memo, useMemo } from 'react'

import { Send, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { PixKeyInput } from '@/components/ui/PixKeyInput'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { usePixKeyForm } from '@/hooks/usePixKeyForm'
import type { PixKeyType } from '@/lib/api'

const KEY_TYPES = [
  { value: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
  { value: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { value: 'telefone', label: 'Telefone', placeholder: '(11) 98765-4321' },
  { value: 'email', label: 'E-mail', placeholder: 'seu@email.com' },
  { value: 'aleatoria', label: 'Aleatória', placeholder: 'Chave aleatória' },
] as const

const MAX_LIMIT = 15000

const SavedKeysSkeletonLoader = memo(() => (
  <div className="pt-4 border-t">
    <Skeleton className="h-5 w-32 mb-3" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
))

SavedKeysSkeletonLoader.displayName = 'SavedKeysSkeletonLoader'

const PixChavePage = memo(() => {
  const {
    // Estado
    selectedKeyType,
    keyValue,
    amount,
    // Valores computados
    balance,
    numericAmount,
    hasKeys,
    // Validações
    canAdvance,
    // Estados de loading
    isLoadingKeys: _isLoadingKeys,
    isWithdrawing,
    // Data
    savedKeysData,
    // Setters
    setKeyValue,
    setAmount,
    // Handlers (já memorizados no hook)
    handleKeyTypeChange,
    handleConfirmWithdraw,
    handleUseSavedKey,
  } = usePixKeyForm()

  // ===== VALORES MEMORIZADOS (evita recálculos) =====
  const formattedMaxLimit = useMemo(
    () =>
      MAX_LIMIT.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      }),
    [],
  )

  const formattedNumericAmount = useMemo(
    () =>
      numericAmount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [numericAmount],
  )

  const formattedBalance = useMemo(
    () =>
      balance.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
    [balance],
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Saque PIX</h1>
          <p className="text-gray-600 text-sm mt-1">
            Transfira valores da sua carteira para qualquer chave PIX
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Realizar Saque
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Saldo disponível: {formattedBalance}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="pix-key-type-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                TIPO DE CHAVE
              </label>
              <Select
                id="pix-key-type-select"
                value={selectedKeyType}
                onChange={(value) => handleKeyTypeChange(value as PixKeyType)}
                options={KEY_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="pix-key-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                CHAVE PIX
              </label>
              <PixKeyInput
                id="pix-key-input"
                keyType={selectedKeyType}
                value={keyValue}
                onChange={setKeyValue}
                hideLabel
                className="w-full"
              />
            </div>

            <div>
              <CurrencyInput
                label="VALOR *"
                value={amount}
                onChange={setAmount}
                placeholder="100,00"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Limite máximo: R$ {formattedMaxLimit}
              </p>
            </div>
          </div>

          {numericAmount > 0 && (
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  Valor do Saque: R$ {formattedNumericAmount}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleConfirmWithdraw}
              disabled={!canAdvance || isWithdrawing}
              icon={
                isWithdrawing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )
              }
            >
              {isWithdrawing ? 'Processando...' : 'Confirmar Saque'}
            </Button>
          </div>

          {hasKeys && savedKeysData?.data && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Chaves Salvas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedKeysData.data.map((key) => (
                  <button
                    key={key.id}
                    onClick={() => handleUseSavedKey(key)}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{key.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {key.key_type_label}
                        </p>
                        <p className="text-xs text-gray-600">
                          {key.key_value_formatted}
                        </p>
                      </div>
                    </div>
                    {key.is_default && <Badge variant="success">Padrão</Badge>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
})

PixChavePage.displayName = 'PixChavePage'

export default PixChavePage
