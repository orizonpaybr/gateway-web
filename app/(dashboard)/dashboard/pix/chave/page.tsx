'use client'

import { memo, useMemo } from 'react'

import { ArrowRight, Check, Loader2 } from 'lucide-react'

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
    step,
    selectedKeyType,
    keyValue,
    amount,
    // Valores computados
    balance: _balance,
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
    handleAdvanceToConfirm,
    handleConfirmWithdraw,
    handleBack,
    handleUseSavedKey,
  } = usePixKeyForm()

  // ===== VALORES MEMORIZADOS (evita recálculos) =====
  const selectedKeyInfo = useMemo(
    () => KEY_TYPES.find((k) => k.value === selectedKeyType),
    [selectedKeyType],
  )

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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step === 'form'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              1
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                step === 'form' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              Digitar
            </span>
          </div>

          <div className="w-6 sm:w-8 h-0.5 bg-gray-300">
            <div
              className={`h-full bg-gray-900 transition-all duration-300 ${
                step === 'confirm' ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step === 'confirm'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                step === 'confirm' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              Confirmar
            </span>
          </div>

          <div className="w-6 sm:w-8 h-0.5 bg-gray-300">
            <div
              className={`h-full bg-gray-900 transition-all duration-300 ${
                step === 'confirm' ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step === 'confirm'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              3
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                step === 'confirm' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              Finalização
            </span>
          </div>
        </div>
      </div>

      <Card className="p-6">
        {step === 'form' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  PIX COM CHAVE
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  A evolução do TED, faça transferência PIX com a chave do
                  destinatário.
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
                    SAQUE TOTAL: R$ {formattedNumericAmount}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleAdvanceToConfirm} disabled={!canAdvance}>
                Avançar <ArrowRight size={18} className="ml-2" />
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
                      {key.is_default && (
                        <Badge variant="success">Padrão</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b flex-wrap gap-2">
                <span className="text-sm text-gray-600">Tipo de Chave</span>
                <span className="text-sm font-medium text-gray-900 break-all text-right">
                  {selectedKeyInfo?.label}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b flex-wrap gap-2">
                <span className="text-sm text-gray-600">Chave PIX</span>
                <span className="text-sm font-medium text-gray-900 break-all text-right">
                  {keyValue}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b flex-wrap gap-2">
                <span className="text-sm text-gray-600">Valor</span>
                <span className="text-lg font-bold text-gray-900">
                  R$ {formattedNumericAmount}
                </span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Verifique todos os dados antes de confirmar. Esta ação não
                pode ser desfeita.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={isWithdrawing}
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmWithdraw}
                className="bg-green-600 hover:bg-green-700"
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />{' '}
                    Processando...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Confirmar Saque
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
})

PixChavePage.displayName = 'PixChavePage'

export default PixChavePage
