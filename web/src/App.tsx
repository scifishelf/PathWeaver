// import { useState } from 'react'
// import { HelpOverlay } from './components/HelpOverlay'
// import { Button } from './components/Button'
import { GraphCanvas } from './components/GraphCanvas'
// Toolbar wird innerhalb des Canvas platziert

export default function App() {
  // const [helpOpen, setHelpOpen] = useState(false)
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">&nbsp;<big>PathWeaver</big> – Netzplan‑Tool (MVP)</h1>
          <div className="flex items-center gap-3">
            {/* Hilfe temporär ausgeblendet */}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] min-w-[1200px] h-[700px] px-6 py-6">
        <div className="w-full h-full border rounded-lg bg-white overflow-hidden" style={{ width: '100%', height: '700px' }}>
          <GraphCanvas />
        </div>
      </main>
      {/* <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} /> */}
    </div>
  )
}
