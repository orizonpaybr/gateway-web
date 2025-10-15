'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type DialogSize = 'sm' | 'md' | 'lg'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: DialogSize
  footer?: React.ReactNode
  className?: string
}

const sizeToMaxWidth: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  className,
}: DialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-xl w-full mx-4 p-5',
          sizeToMaxWidth[size],
          className,
        )}
      >
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

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
}
