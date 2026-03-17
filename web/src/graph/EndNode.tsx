import { Handle, Position } from 'reactflow'
import { formatWorkdayToDate } from '../cpm/workdays'

export function EndNode({ data }: { data: { label: string; startDate?: string; computed?: { EF?: number; LF?: number } } }) {
  const dateStr = formatWorkdayToDate(data.startDate, data.computed?.EF)
  const hasDate = dateStr && dateStr !== '—'

  return (
    <div
      style={{
        display: 'inline-block',
        minWidth: 130,
        textAlign: 'center',
        padding: '10px 14px',
        background: 'rgba(167,139,250,0.08)',
        border: '1px solid rgba(167,139,250,0.25)',
        borderRadius: 12,
        boxShadow: '0 0 24px rgba(167,139,250,0.12)',
        transform: 'translateZ(0)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: 'rgba(167,139,250,0.8)',
          border: '2px solid rgba(255,255,255,0.3)',
          width: 10,
          height: 10,
        }}
      />
      <div style={{ marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#a78bfa' }}>
        {data.label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: hasDate ? '#f8fafc' : 'rgba(255,255,255,0.3)',
        }}
      >
        {hasDate ? dateStr : '—'}
      </div>
    </div>
  )
}
