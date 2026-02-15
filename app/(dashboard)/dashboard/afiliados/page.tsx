'use client'

import React from 'react'
import { AffiliateStats } from '@/components/dashboard/affiliate/AffiliateStats'
import { AffiliateLink } from '@/components/dashboard/affiliate/AffiliateLink'
import { Users } from 'lucide-react'

export default function AfiliadosPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Programa de Afiliados
          </h1>
          <p className="text-gray-600 mt-1">
            Indique amigos e ganhe comissões automáticas em cada transação
          </p>
        </div>
      </div>

      <AffiliateStats />

      <AffiliateLink />
    </div>
  )
}
