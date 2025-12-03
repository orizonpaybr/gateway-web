import React from 'react'

import { FileText } from 'lucide-react'

interface DocumentIconProps {
  size?: number
  className?: string
}

export function DocumentIcon({ size = 28, className = '' }: DocumentIconProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-blue-500 text-white ${className}`}
      style={{ width: size, height: size }}
    >
      <FileText size={size * 0.7} />
    </div>
  )
}
