'use client'

import React, { useEffect, useCallback, memo } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type DialogSize = 'sm' | 'md' | 'lg' | 'xl'
interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: DialogSize
  footer?: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

const sizeToMaxWidth: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-4xl',
}

export const Dialog = memo(
  ({
    open,
    onClose,
    title,
    children,
    size = 'md',
    footer,
    className,
    showCloseButton = true,
  }: DialogProps) => {
    const handleEsc = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      },
      [onClose],
    )

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleEsc)
      }
      return () => document.removeEventListener('keydown', handleEsc)
    }, [open, handleEsc])

    if (!open) {
      return null
    }

    const modalContent = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Fechar modal"
        />
        <div
          className={cn(
            'relative bg-white rounded-xl shadow-xl w-full mx-4 p-5 my-6 sm:my-0 max-h-[92vh] overflow-y-auto',
            sizeToMaxWidth[size],
            className,
          )}
        >
          {showCloseButton && (
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          )}

          {title && (
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {title}
            </h3>
          )}

          <div>{children}</div>

          {footer && <div className="mt-4 pt-3 border-t">{footer}</div>}
        </div>
      </div>
    )

    return createPortal(modalContent, document.body)
  },
)
