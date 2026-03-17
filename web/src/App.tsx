import { useState } from 'react'
import { HelpOverlay } from './components/HelpOverlay'
import { HelpCircle } from 'lucide-react'
import { GraphCanvas } from './components/GraphCanvas'

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 1200 }}>
      {/* Glassmorphism Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10,15,40,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Network icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="5" cy="14" r="3" fill="#60a5fa" />
              <circle cx="14" cy="5" r="3" fill="#a78bfa" />
              <circle cx="23" cy="14" r="3" fill="#22d3ee" />
              <circle cx="14" cy="23" r="3" fill="#60a5fa" />
              <line x1="5" y1="14" x2="14" y2="5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <line x1="14" y1="5" x2="23" y2="14" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <line x1="23" y1="14" x2="14" y2="23" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.7" />
              <line x1="5" y1="14" x2="14" y2="23" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </svg>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                PathWeaver
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
                Netzplan-Tool
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              aria-label="Hilfe öffnen"
              title="Schnellreferenz"
              onClick={() => setHelpOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#f8fafc'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
              }}
            >
              <HelpCircle size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Canvas fills remaining height */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <GraphCanvas />
      </main>

      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
