import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  items: { label: string; onClick: () => void; disabled?: boolean }[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const onAny = () => onClose()
    window.addEventListener('click', onAny)
    return () => {
      window.removeEventListener('click', onAny)
    }
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 10000,
        minWidth: 160,
        background: 'rgba(10,15,40,0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        padding: 4,
      }}
    >
      {items.map((it, idx) => (
        <button
          key={idx}
          onClick={it.onClick}
          disabled={it.disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 13,
            color: it.disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)',
            background: 'transparent',
            border: 'none',
            cursor: it.disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            transition: '120ms ease',
          }}
          onMouseEnter={(e) => {
            if (it.disabled) return
            e.currentTarget.style.background = 'rgba(248,113,113,0.15)'
            e.currentTarget.style.color = '#f87171'
            const icon = e.currentTarget.querySelector('svg') as SVGElement | null
            if (icon) icon.style.color = '#f87171'
          }}
          onMouseLeave={(e) => {
            if (it.disabled) return
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
            const icon = e.currentTarget.querySelector('svg') as SVGElement | null
            if (icon) icon.style.color = ''
          }}
        >
          <Trash2 size={14} />
          {it.label}
        </button>
      ))}
    </div>
  )
}
