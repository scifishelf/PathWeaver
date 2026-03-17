import type { ReactNode } from 'react'
import { AlertTriangle, XCircle, CheckCircle2, Info } from 'lucide-react'

type BannerVariant = 'warning' | 'error' | 'success' | 'info'

interface BannerProps {
  children: ReactNode
  variant?: BannerVariant
}

const variantConfig: Record<BannerVariant, {
  icon: ReactNode
  background: string
  border: string
  color: string
  glow: string
}> = {
  warning: {
    icon: <AlertTriangle size={15} />,
    background: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.25)',
    color: '#fbbf24',
    glow: '0 0 12px rgba(251,191,36,0.2)',
  },
  error: {
    icon: <XCircle size={15} />,
    background: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.25)',
    color: '#f87171',
    glow: '0 0 12px rgba(248,113,113,0.2)',
  },
  success: {
    icon: <CheckCircle2 size={15} />,
    background: 'rgba(34,211,238,0.10)',
    border: 'rgba(34,211,238,0.25)',
    color: '#22d3ee',
    glow: '0 0 12px rgba(34,211,238,0.2)',
  },
  info: {
    icon: <Info size={15} />,
    background: 'rgba(96,165,250,0.10)',
    border: 'rgba(96,165,250,0.25)',
    color: '#60a5fa',
    glow: '0 0 12px rgba(96,165,250,0.2)',
  },
}

export function Banner({ children, variant = 'warning' }: BannerProps) {
  const cfg = variantConfig[variant]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        width: '100%',
        background: cfg.background,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${cfg.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
        color: cfg.color,
        boxShadow: cfg.glow,
        animation: 'bannerIn 250ms ease both',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
      <span>{children}</span>
      <style>{`
        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
