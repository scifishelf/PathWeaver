import { Handle, Position } from 'reactflow'
import { formatWorkdayToDate } from '../cpm/workdays'
import { COLOR_BG, COLOR_BORDER, COLOR_TEXT, SHADOW_SM, RADIUS_MD } from './theme'

export function EndNode({ data }: { data: { label: string; startDate?: string; computed?: { EF?: number; LF?: number } } }) {
  return (
    <div
      style={{
        display: 'inline-block',
        minWidth: 120,
        textAlign: 'center',
        padding: '6px 10px',
        background: COLOR_BG,
        border: `2px solid ${COLOR_BORDER}`,
        borderRadius: RADIUS_MD,
        boxShadow: SHADOW_SM,
        fontSize: 14,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{data.label}</div>
      {/* Ein Datum: Projektende (EF == LF am Ziel) */}
      <div style={{ fontSize: 12, color: COLOR_TEXT }}>{formatWorkdayToDate(data.startDate, data.computed?.EF)}</div>
    </div>
  )
}


