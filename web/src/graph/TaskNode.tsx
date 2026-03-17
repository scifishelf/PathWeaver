import { Handle, Position } from 'reactflow'
import { memo, useEffect, useRef, useState } from 'react'
import type { ComputedNode } from '../cpm/types'
import { formatWorkdayToDate } from '../cpm/workdays'

interface TaskData {
  id: string
  title?: string
  duration?: number
  focusOnMount?: boolean
  computed?: ComputedNode
  onEdit?: (id: string, patch: Partial<{ title: string; duration: number }>) => void
}

function TaskNodeBase({ data }: { data: TaskData }) {
  const idRef = useRef(data.id)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState<string>(data.title ?? data.id)
  const [duration, setDuration] = useState<number>(data.duration ?? 1)

  useEffect(() => {
    if (data.focusOnMount) {
      titleInputRef.current?.focus()
    }
  }, [])

  // Debounce 200ms
  useEffect(() => {
    const t = setTimeout(() => {
      data.onEdit?.(idRef.current, { title, duration })
    }, 200)
    return () => clearTimeout(t)
  }, [title, duration, data])

  const isCritical = data.computed?.critical === true

  const nodeStyle: React.CSSProperties = isCritical
    ? {
        background: 'rgba(34,211,238,0.08)',
        border: '1px solid rgba(34,211,238,0.35)',
        boxShadow:
          '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(34,211,238,0.15), 0 0 32px rgba(34,211,238,0.15)',
      }
    : {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
      }

  const valueTextColor = isCritical ? 'rgba(34,211,238,0.9)' : 'rgba(255,255,255,0.65)'

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#f8fafc',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  }

  return (
    <div
      style={{
        display: 'inline-block',
        minWidth: 180,
        textAlign: 'center',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderRadius: 12,
        fontSize: 12,
        transform: 'translateZ(0)',
        ...nodeStyle,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'rgba(96,165,250,0.8)',
          border: '2px solid rgba(255,255,255,0.3)',
          opacity: 0,
          transition: 'opacity 200ms ease',
        }}
        className="pw-handle"
      />

      <div
        style={{
          padding: '8px 10px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          rowGap: 4,
          columnGap: 6,
        }}
      >
        {/* Row 1: ES | Duration | EF */}
        <div style={{ textAlign: 'left', color: valueTextColor, fontSize: 11 }}>
          {formatWorkdayToDate((data as any)?.startDate, data.computed?.ES)}
        </div>
        <div>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={Number.isFinite(duration) ? duration : 0}
            onChange={(e) => setDuration(Number(e.target.value))}
            onWheel={(e) => {
              e.preventDefault()
              ;(e.currentTarget as HTMLInputElement).blur()
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.6)'
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.15)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            style={{
              ...inputStyle,
              width: 60,
              padding: '2px 4px',
            }}
          />
        </div>
        <div style={{ textAlign: 'right', color: valueTextColor, fontSize: 11 }}>
          {formatWorkdayToDate((data as any)?.startDate, data.computed?.EF)}
        </div>

        {/* Row 2: Title (full width) */}
        <div style={{ gridColumn: '1 / span 3', display: 'flex', justifyContent: 'center' }}>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.6)'
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.15)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            style={{
              ...inputStyle,
              width: '100%',
              padding: '4px 6px',
              fontWeight: 600,
            }}
          />
        </div>

        {/* Row 3: LS | Slack | LF */}
        <div style={{ textAlign: 'left', color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
          {formatWorkdayToDate((data as any)?.startDate, data.computed?.LS)}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
          {data.computed != null ? parseFloat(data.computed.slack.toFixed(6)) : '—'}
        </div>
        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
          {formatWorkdayToDate((data as any)?.startDate, data.computed?.LF)}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'rgba(96,165,250,0.8)',
          border: '2px solid rgba(255,255,255,0.3)',
          opacity: 0,
          transition: 'opacity 200ms ease',
        }}
        className="pw-handle"
      />

      <style>{`
        .react-flow__node:hover .pw-handle { opacity: 1 !important; }
      `}</style>
    </div>
  )
}

export const TaskNode = memo(TaskNodeBase)
