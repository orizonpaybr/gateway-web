'use client'

import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import type { Gender } from '@/types/user'

/**
 * Props do componente AnimatedAvatar
 *
 * @interface AnimatedAvatarProps
 * @property {Gender | null} [gender]
 * @property {'sm' | 'md' | 'lg'} [size]
 * @property {string} [className]
 */
interface AnimatedAvatarProps {
  gender?: Gender | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Avatar masculino usando a imagem do public
const MaleAvatar = memo(() => (
  <div className="w-full h-full relative">
    <Image
      src="/avatar-man.webp"
      alt="Avatar masculino"
      fill
      className="object-cover rounded-full"
      sizes="(max-width: 768px) 32px, (max-width: 1200px) 40px, 48px"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  </div>
))

MaleAvatar.displayName = 'MaleAvatar'

// Avatar feminino usando a imagem do public
const FemaleAvatar = memo(() => (
  <div className="w-full h-full relative">
    <Image
      src="/avatar-woman.jpg"
      alt="Avatar feminino"
      fill
      className="object-cover rounded-full"
      sizes="(max-width: 768px) 32px, (max-width: 1200px) 40px, 48px"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  </div>
))

FemaleAvatar.displayName = 'FemaleAvatar'

/**
 * Tamanhos pré-definidos para evitar recálculos (Performance)
 * @const SIZE_CLASSES
 */
const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
} as const

/**
 * Componente de Avatar Animado
 *
 * @description Exibe avatar masculino ou feminino baseado no gênero do usuário
 * @performance Utiliza React.memo e useMemo para otimização
 * @param {AnimatedAvatarProps} props - Props do componente
 * @returns {JSX.Element} Avatar do usuário
 *
 * @example
 * ```tsx
 * <AnimatedAvatar gender="female" size="md" />
 * <AnimatedAvatar gender="male" size="lg" className="border" />
 * ```
 */
export const AnimatedAvatar = memo<AnimatedAvatarProps>(
  ({ gender, size = 'md', className = '' }) => {
    const selectedGender = useMemo(() => {
      return gender ?? 'male'
    }, [gender])

    const containerClasses = useMemo(() => {
      return `${SIZE_CLASSES[size]} ${className}`
    }, [size, className])

    return (
      <div className={containerClasses}>
        {selectedGender === 'female' ? <FemaleAvatar /> : <MaleAvatar />}
      </div>
    )
  },
)

AnimatedAvatar.displayName = 'AnimatedAvatar'
