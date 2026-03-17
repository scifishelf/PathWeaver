import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', icon, className = '', children, style, ...props }, ref) => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      transition: 'all 200ms ease',
      whiteSpace: 'nowrap',
    }

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
      },
      outline: {
        background: 'rgba(255,255,255,0.06)',
        color: '#f8fafc',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      },
      ghost: {
        background: 'transparent',
        color: 'rgba(255,255,255,0.70)',
      },
    }

    const disabledStyles: React.CSSProperties = {
      opacity: 0.45,
      cursor: 'not-allowed',
    }

    const combinedStyle: React.CSSProperties = {
      ...base,
      ...variantStyles[variant],
      ...(props.disabled ? disabledStyles : {}),
      ...style,
    }

    return (
      <button
        ref={ref}
        style={combinedStyle}
        className={className}
        onMouseEnter={(e) => {
          if (props.disabled) return
          const el = e.currentTarget
          if (variant === 'primary') {
            el.style.boxShadow = '0 0 20px rgba(96,165,250,0.4), 0 2px 8px rgba(99,102,241,0.3)'
            el.style.transform = 'scale(1.02)'
          } else if (variant === 'outline') {
            el.style.background = 'rgba(255,255,255,0.10)'
            el.style.borderColor = 'rgba(255,255,255,0.22)'
          } else {
            el.style.background = 'rgba(255,255,255,0.08)'
            el.style.color = '#f8fafc'
          }
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          if (props.disabled) return
          const el = e.currentTarget
          if (variant === 'primary') {
            el.style.boxShadow = '0 2px 8px rgba(99,102,241,0.3)'
            el.style.transform = ''
          } else if (variant === 'outline') {
            el.style.background = 'rgba(255,255,255,0.06)'
            el.style.borderColor = 'rgba(255,255,255,0.15)'
          } else {
            el.style.background = 'transparent'
            el.style.color = 'rgba(255,255,255,0.70)'
          }
          props.onMouseLeave?.(e)
        }}
        onMouseDown={(e) => {
          if (props.disabled) return
          if (variant === 'ghost') {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
          }
          props.onMouseDown?.(e)
        }}
        onMouseUp={(e) => {
          if (props.disabled) return
          if (variant === 'ghost') {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          }
          props.onMouseUp?.(e)
        }}
        {...props}
      >
        {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
