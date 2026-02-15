'use client'

import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
interface AchievementMessage {
  level: string
  message: string
  icon: string
}
interface AchievementMessagesProps {
  messages: AchievementMessage[]
  isLoading?: boolean
}

export const AchievementMessages = memo<AchievementMessagesProps>(
  ({ messages, isLoading = false }) => {
    const memoizedMessages = useMemo(() => messages, [messages])

    if (isLoading) {
      return (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Mensagens de Conquista</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 border">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        </Card>
      )
    }

    return (
      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
          Mensagens de Conquista
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {memoizedMessages.map((achievement) => (
            <Card
              key={achievement.level}
              className="p-4 lg:p-5 border hover:shadow-md transition-shadow min-h-[8rem] flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3 shrink-0">
                <Image
                  src={achievement.icon}
                  alt={`${achievement.level} medal`}
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <h3 className="font-medium text-gray-900">
                  {achievement.level}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1 min-h-0">
                {achievement.message}
              </p>
            </Card>
          ))}
        </div>
      </Card>
    )
  },
)

AchievementMessages.displayName = 'AchievementMessages'

export default AchievementMessages
