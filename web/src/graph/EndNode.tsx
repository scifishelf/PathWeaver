import { Handle, Position } from 'reactflow'
import { formatWorkdayToDate } from '../cpm/workdays'

export function EndNode({ data }: { data: { label: string; startDate?: string; computed?: { EF?: number; LF?: number } } }) {
  return (
    <div
      style={{
        display: 'inline-block',
        minWidth: 120,
        textAlign: 'center',
        padding: '6px 10px',
        background: '#fff',
        border: '2px solid #d4d4d8',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,.12)',
        fontSize: 14,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{data.label}</div>
      {/* Ein Datum: Projektende (EF == LF am Ziel) */}
      <div style={{ fontSize: 12, color: '#374151' }}>{formatWorkdayToDate(data.startDate, data.computed?.EF)}</div>
    </div>
  )
}


