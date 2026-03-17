import { Handle, Position } from 'reactflow'
import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'

export function StartNode({ data }: { data: { label: string; startDate?: string; onChangeStartDate?: (v?: string) => void } }) {
  const [value, setValue] = useState<string>(data.startDate || '')
  useEffect(() => {
    setValue(data.startDate || '')
  }, [data.startDate])

  return (
    <div
      style={{
        display: 'inline-block',
        minWidth: 130,
        textAlign: 'center',
        padding: '10px 14px',
        background: 'rgba(52,211,153,0.08)',
        border: '1px solid rgba(52,211,153,0.25)',
        borderRadius: 12,
        boxShadow: '0 0 24px rgba(52,211,153,0.12)',
        transform: 'translateZ(0)',
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13, color: '#34d399' }}>
        {data.label}
      </div>

      {/* Date input with calendar icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6,
          padding: '3px 6px',
        }}
      >
        <CalendarDays size={12} color="rgba(255,255,255,0.4)" />
        <input
          type="date"
          value={value}
          onChange={(e) => {
            const v = e.target.value || undefined
            setValue(e.target.value)
            data.onChangeStartDate?.(v)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 12,
            color: '#f8fafc',
            width: 104,
            colorScheme: 'dark',
          }}
          title="Project Start Date"
        />
      </div>

      <Handle type="source" position={Position.Right} style={{ background: 'rgba(96,165,250,0.8)', border: '2px solid rgba(255,255,255,0.3)', width: 10, height: 10 }} />
    </div>
  )
}
