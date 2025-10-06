import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'outline'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', className = '', ...props }, ref) => {
    const base =
      'px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
    const styles: Record<ButtonVariant, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border hover:bg-neutral-50',
    }
    return (
      <button ref={ref} className={`${base} ${styles[variant]} ${className}`} {...props} />
    )
  }
)

Button.displayName = 'Button'


