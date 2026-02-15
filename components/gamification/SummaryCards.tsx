'use client'

import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
interface SummaryCard {
  title: string
  value: string
  icon?: React.ReactNode
  isImage?: boolean
  imageSrc?: string
}
interface SummaryCardsProps {
  cards: SummaryCard[]
  isLoading?: boolean
}

export const SummaryCards = memo<SummaryCardsProps>(
  ({ cards, isLoading = false }) => {
    const memoizedCards = useMemo(() => cards, [cards])

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {memoizedCards.map((card, index) => (
          <Card key={index} className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                {card.title}
              </h3>
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {card.isImage && card.imageSrc ? (
                  <Image
                    src={card.imageSrc}
                    alt={card.title}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  card.icon
                )}
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {card.value}
            </div>
          </Card>
        ))}
      </div>
    )
  },
)

SummaryCards.displayName = 'SummaryCards'

export default SummaryCards
