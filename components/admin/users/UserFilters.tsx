import React, { useState, useEffect, useCallback, memo } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import { USER_STATUS_OPTIONS } from '@/lib/constants'

interface UserFiltersProps {
  defaultSearch?: string
  defaultStatus?: number | undefined
  onChange: (filters: { search?: string; status?: number | undefined }) => void
}

export const UserFilters = memo(function UserFilters({
  defaultSearch,
  defaultStatus,
  onChange,
}: UserFiltersProps) {
  const [search, setSearch] = useState(defaultSearch || '')
  const [status, setStatus] = useState<number | undefined>(defaultStatus)

  const debouncedSearch = useDebounce(search, 300)

  const handleChange = useCallback(
    (filters: { search?: string; status?: number | undefined }) => {
      onChange(filters)
    },
    [onChange],
  )

  useEffect(() => {
    handleChange({
      search: debouncedSearch || undefined,
      status,
    })
  }, [debouncedSearch, status, handleChange])

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val ? Number(val) : undefined)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Input
        label="Buscar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, email, usuário, CPF/CNPJ"
      />
      <Select
        label="Status"
        value={String(status ?? '')}
        onChange={handleStatusChange}
        options={USER_STATUS_OPTIONS}
      />
    </div>
  )
})
