import React, { memo } from 'react'
import { cn } from '@/lib/utils'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    /** Login/cadastro: preto #101010, hover cinza (sem primary) */
    | 'inkSolid'
    | 'inkOutline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
}

export const Button = memo<ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    className = '',
    ...props
  }) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      secondary: 'bg-secondary text-white hover:opacity-90',
      outline:
        'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
      ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
      inkSolid:
        'bg-[#101010] text-white border border-[#101010] hover:bg-[#2a2a2a] hover:border-[#2a2a2a]',
      inkOutline:
        'bg-white text-[#101010] border border-[#101010] hover:bg-[#101010] hover:text-white hover:border-[#101010]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {icon && (
          <span className="flex items-center justify-center">{icon}</span>
        )}
        {children}
      </button>
    )
  },
)
