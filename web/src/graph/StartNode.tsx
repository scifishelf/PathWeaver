import { Handle, Position } from 'reactflow'
import { useState, useEffect } from 'react'
import { COLOR_BG, COLOR_BORDER, SHADOW_SM, RADIUS_MD, RADIUS_SM } from './theme'

export function StartNode({ data }: { data: { label: string; startDate?: string; onChangeStartDate?: (v?: string) => void } }) {
  const [value, setValue] = useState<string>(data.startDate || '')
  useEffect(() => {
    setValue(data.startDate || '')
  }, [data.startDate])
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
      <div style={{ marginBottom: 6 }}>{data.label}</div>
      <input
        type="date"
        value={value}
        onChange={(e) => {
          const v = e.target.value || undefined
          setValue(e.target.value)
          data.onChangeStartDate?.(v)
        }}
        style={{
          padding: '4px 6px',
          border: `1px solid ${COLOR_BORDER}`,
          borderRadius: RADIUS_SM,
          fontSize: 12,
          background: '#fff',
        }}
        title="Projekt-Startdatum"
      />
      <Handle type="source" position={Position.Right} />
    </div>
  )
}


