import { Modal } from './Modal'
import { BookOpen, Grid3x3, Keyboard, Zap } from 'lucide-react'

interface HelpOverlayProps {
  open: boolean
  onClose: () => void
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 7px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 5,
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: 12,
  color: '#f8fafc',
  minWidth: 28,
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

const cellStyle: React.CSSProperties = {
  padding: '3px 5px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 4,
  fontSize: 10,
  textAlign: 'center',
  color: 'rgba(255,255,255,0.7)',
}

export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  return (
    <Modal open={open} onClose={onClose} title="Quick Reference">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13 }}>

        {/* Section 1: Node Layout */}
        <div>
          <div style={sectionHeader}>
            <Grid3x3 size={14} color="#60a5fa" />
            Node Layout (3×3 Grid)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 4,
              maxWidth: 260,
              margin: '0 auto',
            }}
          >
            <div style={{ ...cellStyle, color: '#60a5fa' }}>ES</div>
            <div style={{ ...cellStyle, color: '#60a5fa' }}>Dur.</div>
            <div style={{ ...cellStyle, color: '#60a5fa' }}>EF</div>
            <div style={{ ...cellStyle, gridColumn: '1 / span 3', color: '#f8fafc', fontWeight: 600, padding: '5px' }}>
              Name
            </div>
            <div style={cellStyle}>LS</div>
            <div style={cellStyle}>Slack</div>
            <div style={cellStyle}>LF</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            ES = Early Start · EF = Early Finish · LS = Late Start · LF = Late Finish
          </div>
        </div>

        {/* Section 2: Shortcuts */}
        <div>
          <div style={sectionHeader}>
            <Keyboard size={14} color="#a78bfa" />
            Keyboard Shortcuts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { key: 'T', desc: 'Add New Task' },
              { key: 'Esc', desc: 'Close Dialog' },
              { key: '⌘Z', desc: 'Undo' },
              { key: '⌘Y', desc: 'Redo' },
            ].map(({ key, desc }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={kbdStyle}>{key}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Critical Path */}
        <div>
          <div style={sectionHeader}>
            <Zap size={14} color="#22d3ee" />
            Critical Path
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'rgba(34,211,238,0.10)',
              border: '1px solid rgba(34,211,238,0.30)',
              borderRadius: 8,
              boxShadow: '0 0 12px rgba(34,211,238,0.15)',
              color: '#22d3ee',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', display: 'inline-block', boxShadow: '0 0 8px #22d3ee' }} />
            Cyan Glow = Critical Path
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Nodes and edges on the critical path are highlighted in cyan. Slack = 0 on this path.
          </div>
        </div>

        {/* Section 4: Connections */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <BookOpen size={12} style={{ display: 'inline', marginRight: 5, color: '#60a5fa' }} />
          Connect: drag from right handle to target node · Max. 1 outgoing per task
        </div>
      </div>
    </Modal>
  )
}
