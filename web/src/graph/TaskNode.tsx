import { Handle, Position } from 'reactflow'
import { memo, useEffect, useRef, useState } from 'react'
import type { ComputedNode } from '../cpm/types'
import { COLOR_BORDER, COLOR_ACCENT, COLOR_ACCENT_LIGHT, COLOR_BG, SHADOW_SM, RADIUS_MD, RADIUS_SM } from './theme'
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

  // Auto-focus title input when node is first created via T-shortcut or FAB
  useEffect(() => {
    if (data.focusOnMount) {
      titleInputRef.current?.focus()
    }
  }, []) // run once on mount — focusOnMount is a creation-time signal only

  // Debounce 200ms
  useEffect(() => {
    const t = setTimeout(() => {
      data.onEdit?.(idRef.current, { title, duration })
    }, 200)
    return () => clearTimeout(t)
  }, [title, duration, data])

  return (
    <div
      style={{
        display: 'inline-block',
        minWidth: 180,
        textAlign: 'center',
        background: data.computed?.critical ? COLOR_ACCENT_LIGHT : COLOR_BG,
        border: `2px solid ${data.computed?.critical ? COLOR_ACCENT : COLOR_BORDER}`,
        borderRadius: RADIUS_MD,
        boxShadow: SHADOW_SM,
        fontSize: 12,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div style={{ padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', rowGap: 4, columnGap: 6 }}>
        {/* Oberzeile: FB | Dauer | FA */}
        <div style={{ textAlign: 'left' }}>{formatWorkdayToDate((data as any)?.startDate, data.computed?.ES)}</div>
        <div>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={Number.isFinite(duration) ? duration : 0}
            onChange={(e) => setDuration(Number(e.target.value))}
            onWheel={(e) => {
              // Verhindert versehentliches Hoch/Runter bei Scrollen über dem Feld
              e.preventDefault()
              ;(e.currentTarget as HTMLInputElement).blur()
            }}
            style={{
              width: '60px',
              padding: '2px 4px',
              border: `1px solid ${COLOR_BORDER}`,
              borderRadius: RADIUS_SM,
              textAlign: 'center',
            }}
          />
        </div>
        <div style={{ textAlign: 'right' }}>{formatWorkdayToDate((data as any)?.startDate, data.computed?.EF)}</div>

        {/* Mitte: Name */}
        <div style={{ gridColumn: '1 / span 3', display: 'flex', justifyContent: 'center' }}>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 6px',
              border: `1px solid ${COLOR_BORDER}`,
              borderRadius: RADIUS_SM,
              fontWeight: 600,
              textAlign: 'center',
            }}
          />
        </div>

        {/* Unterzeile: LS | Schlupf | LA */}
        <div style={{ textAlign: 'left' }}>{formatWorkdayToDate((data as any)?.startDate, data.computed?.LS)}</div>
        <div>{data.computed?.slack ?? '—'}</div>
        <div style={{ textAlign: 'right' }}>{formatWorkdayToDate((data as any)?.startDate, data.computed?.LF)}</div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export const TaskNode = memo(TaskNodeBase)


