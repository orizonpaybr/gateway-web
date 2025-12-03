import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from 'react'

import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
  content: string
  className?: string
}

export const Tooltip = memo(
  ({ children, content, className }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState<'top' | 'bottom'>('top')
    const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>(
      'center',
    )
    const [isPositioned, setIsPositioned] = useState(false)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = useCallback(() => setIsVisible(true), [])
    const handleMouseLeave = useCallback(() => setIsVisible(false), [])

    useEffect(() => {
      if (!isVisible) {
        setIsPositioned(false)
        return
      }

      // Renderiza primeiro, depois calcula posição
      const timer = setTimeout(() => {
        if (!tooltipRef.current || !containerRef.current) {
          return
        }

        const tooltip = tooltipRef.current
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        const tooltipRect = tooltip.getBoundingClientRect()

        // Verifica espaço acima e abaixo
        const spaceAbove = rect.top
        const spaceBelow = window.innerHeight - rect.bottom

        // Decide posição vertical (top ou bottom)
        const newPosition = spaceAbove > spaceBelow ? 'top' : 'bottom'
        setPosition(newPosition)

        // Calcula posição horizontal
        const tooltipWidth = tooltipRect.width
        const centerX = rect.left + rect.width / 2
        const leftEdge = centerX - tooltipWidth / 2
        const rightEdge = centerX + tooltipWidth / 2
        const padding = 8
        const viewportWidth = window.innerWidth

        let newAlignment: 'center' | 'left' | 'right' = 'center'

        // Se o tooltip ultrapassar a borda esquerda, alinha à esquerda
        if (leftEdge < padding) {
          newAlignment = 'left'
          // Garante que mesmo alinhado à esquerda, não ultrapasse a viewport
          const leftAlignedRight = rect.left + tooltipWidth
          if (leftAlignedRight > viewportWidth - padding) {
            // Se ainda ultrapassar, força à direita
            newAlignment = 'right'
          }
        } else if (rightEdge > viewportWidth - padding) {
          // Se o tooltip ultrapassar a borda direita, alinha à direita
          newAlignment = 'right'
          // Garante que mesmo alinhado à direita, não ultrapasse a viewport
          const rightAlignedLeft = rect.right - tooltipWidth
          if (rightAlignedLeft < padding) {
            // Se ainda ultrapassar, força à esquerda
            newAlignment = 'left'
          }
        }

        setAlignment(newAlignment)
        setIsPositioned(true)
      }, 0)

      return () => clearTimeout(timer)
    }, [isVisible])

    const getPositionClasses = useMemo(() => {
      const baseClasses =
        'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap max-w-[calc(100vw-16px)]'

      // Se ainda não calculou posição, usa posição segura inicial (esquerda, topo)
      if (!isPositioned) {
        return `${baseClasses} bottom-full left-0 mb-2 opacity-0 pointer-events-none before:content-[""] before:absolute before:top-full before:left-4 before:border-4 before:border-transparent before:border-t-gray-900`
      }

      if (position === 'top') {
        const verticalClasses = 'bottom-full mb-2'
        const arrowClasses =
          'before:content-[""] before:absolute before:top-full before:border-4 before:border-transparent before:border-t-gray-900'

        if (alignment === 'center') {
          return `${baseClasses} ${verticalClasses} left-1/2 -translate-x-1/2 ${arrowClasses} before:left-1/2 before:-translate-x-1/2`
        } else if (alignment === 'left') {
          return `${baseClasses} ${verticalClasses} left-0 ${arrowClasses} before:left-4`
        } else {
          return `${baseClasses} ${verticalClasses} right-0 ${arrowClasses} before:right-4`
        }
      } else {
        const verticalClasses = 'top-full mt-2'
        const arrowClasses =
          'before:content-[""] before:absolute before:bottom-full before:border-4 before:border-transparent before:border-b-gray-900'

        if (alignment === 'center') {
          return `${baseClasses} ${verticalClasses} left-1/2 -translate-x-1/2 ${arrowClasses} before:left-1/2 before:-translate-x-1/2`
        } else if (alignment === 'left') {
          return `${baseClasses} ${verticalClasses} left-0 ${arrowClasses} before:left-4`
        } else {
          return `${baseClasses} ${verticalClasses} right-0 ${arrowClasses} before:right-4`
        }
      }
    }, [isPositioned, position, alignment])

    if (!content) {
      return <>{children}</>
    }

    return (
      <div
        ref={containerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {isVisible && (
          <div
            ref={tooltipRef}
            className={cn(
              getPositionClasses,
              isPositioned && 'opacity-100 transition-opacity duration-100',
              className,
            )}
            role="tooltip"
          >
            {content}
          </div>
        )}
      </div>
    )
  },
)
