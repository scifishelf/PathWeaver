import { toProjectJSON, fromProjectJSON, validateProjectJSON } from '../persistence/serialize'
import { saveSnapshot, listSnapshots, loadSnapshot, deleteSnapshot } from '../persistence/autosave'
import { useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'
import domtoimage from 'dom-to-image-more'
import type { Edge, Node } from 'reactflow'

interface Props {
  nodes: Node[]
  edges: Edge[]
  computed?: any
  startDate?: string
  onImport: (nodes: Node[], edges: Edge[], startDate?: string) => void
}

export function AppToolbar({ nodes, edges, computed, startDate, onImport }: Props) {
  const [snaps, setSnaps] = useState<{ id: string; ts: number }[]>([])
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    setSnaps(listSnapshots())
  }, [])
  async function onExportClick() {
    const data = toProjectJSON(nodes, edges, computed, startDate)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pathweaver.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function triggerFileDialog() {
    if (!fileInputRef.current) return
    // Reset, damit erneut die gleiche Datei gewählt werden kann
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const parsed = JSON.parse(text)
      const errs = validateProjectJSON(parsed)
      if (errs.length) {
        setImportErrors(errs)
        setImportOpen(true)
        return
      }
      const { nodes: nn, edges: ee } = fromProjectJSON(parsed)
      onImport(nn, ee, parsed.settings?.startDate)
    } catch (err) {
      setImportErrors(['Ungültiges JSON'])
      setImportOpen(true)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button
        onClick={onExportClick}
        style={{
          padding: '6px 12px',
          border: '1px solid #d4d4d8',
          borderRadius: 8,
          fontSize: 12,
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        Export
      </button>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            if (!open) {
              setOpen(true)
              setSnaps(listSnapshots())
            } else {
              setOpen(false)
            }
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #d4d4d8',
            borderRadius: 8,
            fontSize: 12,
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Snapshots
        </button>
        {open && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: '#fff',
              border: '1px solid #d4d4d8',
              borderRadius: 8,
              width: 280,
              padding: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,.12)',
              zIndex: 10002,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 600 }}>Snapshots</div>
              <button
                onClick={() => {
                  try {
                    const pj = toProjectJSON(nodes, edges, undefined, startDate)
                    saveSnapshot(pj)
                    setSnaps(listSnapshots())
                  } catch {}
                }}
                style={{ fontSize: 12 }}
              >
                + Neu
              </button>
            </div>
            {snaps.length === 0 ? (
              <div style={{ fontSize: 12, color: '#6b7280' }}>Keine Snapshots</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 220, overflowY: 'auto' }}>
                {snaps.map((s) => (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                    <span style={{ fontSize: 12 }}>{new Date(s.ts).toLocaleString()}</span>
                    <span>
                      <button
                        onClick={() => {
                          const pj = loadSnapshot(s.id)
                          if (pj) {
                            const { nodes: nn, edges: ee } = fromProjectJSON(pj as any)
                            onImport(nn, ee, (pj as any).settings?.startDate)
                            setOpen(false)
                          }
                        }}
                        style={{ marginRight: 6, fontSize: 12, padding: '2px 6px' }}
                      >
                        Laden
                      </button>
                      <button
                        onClick={() => {
                          deleteSnapshot(s.id)
                          setSnaps(listSnapshots())
                        }}
                        style={{ fontSize: 12, padding: '2px 6px' }}
                      >
                        Löschen
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <button
        onClick={triggerFileDialog}
        style={{
          padding: '6px 12px',
          border: '1px solid #d4d4d8',
          borderRadius: 8,
          fontSize: 12,
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        Import
      </button>
      {/* Verstecktes Datei-Input für Direktimport */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      <button
        onClick={async () => {
          const el = document.querySelector('.react-flow') as HTMLElement | null
          if (!el) return
          // Temporäre Stil-Anpassungen für dünnere Linien im Export
          const style = document.createElement('style')
          style.id = 'pw-export-style'
          style.innerHTML = `
            .react-flow__node * { border-width: 1px !important; box-shadow: none !important; }
            .react-flow__edge-path { stroke-width: 1.5px !important; }
          `
          document.head.appendChild(style)
          const dataUrl = await domtoimage.toPng(el, { bgcolor: '#ffffff', quality: 1 })
          style.remove()
          const a = document.createElement('a')
          a.href = dataUrl
          a.download = 'netzplan.png'
          a.click()
        }}
        style={{
          padding: '6px 12px',
          border: '1px solid #d4d4d8',
          borderRadius: 8,
          fontSize: 12,
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        PNG
      </button>
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="JSON importieren">
        <div className="space-y-3 text-sm">
          <div className="font-medium">Die Datei konnte nicht importiert werden:</div>
          <ul className="list-disc pl-5">
            {importErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <div className="flex justify-end">
            <button onClick={() => setImportOpen(false)} className="px-3 py-1.5 rounded border text-sm bg-white">
              Schließen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


