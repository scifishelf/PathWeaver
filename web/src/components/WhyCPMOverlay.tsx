import { Modal } from './Modal'
import { Clock, Target, Layers, TrendingUp } from 'lucide-react'

interface WhyCPMOverlayProps {
  open: boolean
  onClose: () => void
}

const sectionHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  fontWeight: 600,
  fontSize: 13,
  color: '#f8fafc',
  marginBottom: 10,
}

const divider: React.CSSProperties = {
  borderTop: '1px solid rgba(255,255,255,0.06)',
  paddingTop: 16,
}

function CpmNetworkSVG() {
  const node = (x: number, y: number, label: string, critical: boolean, sub: string) => {
    const c = critical ? '#22d3ee' : 'rgba(255,255,255,0.25)'
    const bg = critical ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.05)'
    const glow = critical ? '0 0 10px rgba(34,211,238,0.4)' : 'none'
    return (
      <g key={label}>
        <rect
          x={x - 28} y={y - 16} width={56} height={32}
          rx={6}
          fill={bg}
          stroke={c}
          strokeWidth={1.5}
          style={{ filter: glow !== 'none' ? `drop-shadow(0 0 5px rgba(34,211,238,0.5))` : undefined }}
        />
        <text x={x} y={y - 2} textAnchor="middle" fill={critical ? '#22d3ee' : '#f8fafc'} fontSize={10} fontWeight={600}>{label}</text>
        <text x={x} y={y + 10} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={8}>{sub}</text>
      </g>
    )
  }

  const edge = (x1: number, y1: number, x2: number, y2: number, critical: boolean) => {
    const c = critical ? '#22d3ee' : 'rgba(255,255,255,0.18)'
    const w = critical ? 2 : 1
    return (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={c} strokeWidth={w}
        strokeDasharray={critical ? undefined : '4 3'}
        markerEnd={`url(#arrow-${critical ? 'crit' : 'norm'})`}
        style={critical ? { filter: 'drop-shadow(0 0 3px rgba(34,211,238,0.6))' } : undefined}
      />
    )
  }

  return (
    <svg viewBox="0 0 320 110" width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
      <defs>
        <marker id="arrow-crit" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#22d3ee" />
        </marker>
        <marker id="arrow-norm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.25)" />
        </marker>
      </defs>

      {/* Edges */}
      {edge(56, 55, 122, 30, true)}
      {edge(56, 55, 122, 80, false)}
      {edge(178, 30, 244, 55, true)}
      {edge(178, 80, 244, 55, false)}
      {edge(272, 55, 292, 55, true)}

      {/* Nodes */}
      {node(28, 55, 'Start', true, 'Day 0')}
      {node(150, 28, 'Task A', true, '5 days')}
      {node(150, 82, 'Task B', false, '3 days')}
      {node(272, 55, 'Task C', true, '4 days')}
      {node(310, 55, 'End', true, 'Day 9')}

      {/* Labels */}
      <text x="160" y="106" textAnchor="middle" fill="rgba(34,211,238,0.6)" fontSize={8}>
        Critical Path: Start → A → C → End (9 days)
      </text>
    </svg>
  )
}

function HistoryTimeline() {
  const items = [
    { year: '1956', text: 'DuPont & Remington Rand beginnen gemeinsame Forschung', accent: '#a78bfa' },
    { year: '1958', text: 'Erster Praxiseinsatz: DuPont Chemiewerk-Wartung', accent: '#60a5fa' },
    { year: '1960s', text: 'Übernahme durch NASA, US Navy (→ PERT), Bauwesen', accent: '#22d3ee' },
    { year: 'Heute', text: 'Weltweiter Industriestandard für Projektplanung', accent: '#34d399' },
  ]

  return (
    <div style={{ position: 'relative', paddingLeft: 16 }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: 5, top: 6, bottom: 6,
        width: 1, background: 'rgba(255,255,255,0.10)',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(({ year, text, accent }) => (
          <div key={year} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: accent, flexShrink: 0, marginTop: 2,
              boxShadow: `0 0 6px ${accent}`,
            }} />
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: accent, marginRight: 6 }}>{year}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const benefits = [
  { icon: Clock, label: 'Projektenddatum', desc: 'Frühestmöglicher Abschluss rechnerisch exakt bestimmbar', color: '#60a5fa' },
  { icon: Target, label: 'Engpässe sehen', desc: 'Kritische Vorgänge sofort identifizierbar', color: '#22d3ee' },
  { icon: Layers, label: 'Ressourcen priorisieren', desc: 'Puffer (Float) zeigt Spielraum bei unkritischen Vorgängen', color: '#a78bfa' },
  { icon: TrendingUp, label: 'Szenarien prüfen', desc: '"Was wäre wenn?"-Analysen mit direktem Ergebnis', color: '#34d399' },
]

export function WhyCPMOverlay({ open, onClose }: WhyCPMOverlayProps) {
  return (
    <Modal open={open} onClose={onClose} title="Why CPM?" maxWidth={580}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13 }}>

        {/* Intro */}
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
          Die <strong style={{ color: '#f8fafc' }}>Critical Path Method (CPM)</strong> ist eine bewährte
          Technik aus dem Projektmanagement, die den <em>frühestmöglichen Projektabschluss</em> und
          die <em>kritischen Abhängigkeiten</em> zwischen Vorgängen sichtbar macht.
        </p>

        {/* Network Diagram */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '14px 10px 10px',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Beispiel-Netzplan
          </div>
          <CpmNetworkSVG />
          <div style={{ marginTop: 8, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#22d3ee' }}>
              <div style={{ width: 20, height: 2, background: '#22d3ee', borderRadius: 1, boxShadow: '0 0 4px #22d3ee' }} />
              Kritischer Pfad (Slack = 0)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.3)', borderRadius: 1, borderTop: '1px dashed rgba(255,255,255,0.3)' }} />
              Unkritisch (hat Puffer)
            </div>
          </div>
        </div>

        {/* History */}
        <div style={divider}>
          <div style={sectionHeader}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#a78bfa" strokeWidth="1.5" />
              <path d="M7 4v3.5l2 1.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Entstehungsgeschichte
          </div>
          <HistoryTimeline />
        </div>

        {/* Benefits */}
        <div style={divider}>
          <div style={sectionHeader}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 10 L5 7 L8 9 L12 4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Warum CPM?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {benefits.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} style={{
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon size={13} color={color} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>{label}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Terms */}
        <div style={{ ...divider, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Schlüsselbegriffe
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { term: 'ES', full: 'Early Start', color: '#60a5fa' },
              { term: 'EF', full: 'Early Finish', color: '#60a5fa' },
              { term: 'LS', full: 'Late Start', color: 'rgba(255,255,255,0.5)' },
              { term: 'LF', full: 'Late Finish', color: 'rgba(255,255,255,0.5)' },
              { term: 'Float', full: 'Puffer / Slack', color: '#fbbf24' },
              { term: 'CP', full: 'Critical Path', color: '#22d3ee' },
            ].map(({ term, full, color }) => (
              <div key={term} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 100,
                fontSize: 11,
              }}>
                <span style={{ fontWeight: 700, color }}>{term}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{full}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  )
}
