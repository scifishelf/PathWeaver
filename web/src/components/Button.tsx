import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', icon, className = '', children, ...props }, ref) => {
    const base =
      'inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
    const styles: Record<ButtonVariant, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500',
      outline: 'border hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500',
      ghost:
        'hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
    }
    return (
      <button ref={ref} className={`${base} ${styles[variant]} ${className}`} {...props}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
