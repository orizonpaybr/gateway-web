'use client'

import React, { useState, useEffect, memo } from 'react'

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/Input'

interface ManagerFiltersProps {
  onChange: (filters: { search?: string }) => void
}

export const ManagerFilters = memo(({ onChange }: ManagerFiltersProps) => {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ search: search || undefined })
    }, 500)

    return () => clearTimeout(timer)
  }, [search, onChange])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Input
            type="text"
            placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
      </div>
    </div>
  )
})
