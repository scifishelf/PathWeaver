import { toProjectJSON, fromProjectJSON, validateProjectJSON } from '../persistence/serialize'
import { saveSnapshot, listSnapshots, loadSnapshot, deleteSnapshot } from '../persistence/autosave'
import { useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { toPng } from 'html-to-image'
import { Download, Upload, Layers, Image, Loader2 } from 'lucide-react'
import type { Edge, Node } from 'reactflow'
import { COLOR_SURFACE, COLOR_BORDER, COLOR_BG, COLOR_TEXT_MUTED, RADIUS_MD, SHADOW_SM, SHADOW_MD } from '../graph/theme'

interface Props {
  nodes: Node[]
  edges: Edge[]
  computed?: any
  startDate?: string
  onImport: (nodes: Node[], edges: Edge[], startDate?: string) => void
}

export function AppToolbar({ nodes, edges, computed, startDate, onImport }: Props) {
  const [snaps, setSnaps] = useState<{ id: string; ts: number; name?: string }[]>([])
  const [snapshotName, setSnapshotName] = useState('')
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
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

  async function onPngClick() {
    const el = document.querySelector('.react-flow') as HTMLElement | null
    if (!el) return
    setExporting(true)
    try {
      const style = document.createElement('style')
      style.id = 'pw-export-style'
      style.innerHTML = `
        .react-flow__node * { border-width: 1px !important; box-shadow: none !important; }
        .react-flow__edge-path { stroke-width: 1.5px !important; }
      `
      document.head.appendChild(style)
      const dataUrl = await toPng(el, {
        backgroundColor: COLOR_BG,
        filter: (node) => {
          if (!(node instanceof Element)) return true
          const cls = node.classList
          return (
            !cls.contains('react-flow__controls') &&
            !cls.contains('react-flow__panel') &&
            !cls.contains('react-flow__minimap')
          )
        },
      })
      style.remove()
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'netzplan.png'
      a.click()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        background: COLOR_SURFACE,
        border: `1px solid ${COLOR_BORDER}`,
        borderRadius: RADIUS_MD,
        padding: '4px 8px',
        boxShadow: SHADOW_SM,
      }}
    >
      {/* Group 1: Export + Import */}
      <Button variant="ghost" icon={<Download size={16} />} onClick={onExportClick}>
        Export
      </Button>
      <Button variant="ghost" icon={<Upload size={16} />} onClick={triggerFileDialog}>
        Import
      </Button>

      {/* Visual separator */}
      <div style={{ width: 1, height: 20, background: COLOR_BORDER, margin: '0 4px' }} />

      {/* Group 2: Snapshots + PNG */}
      <div style={{ position: 'relative' }}>
        <Button
          variant="ghost"
          icon={<Layers size={16} />}
          onClick={() => {
            if (!open) {
              setOpen(true)
              setSnaps(listSnapshots())
            } else {
              setOpen(false)
            }
          }}
        >
          Snapshots
        </Button>
        {open && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: COLOR_BG,
              border: `1px solid ${COLOR_BORDER}`,
              borderRadius: RADIUS_MD,
              width: 280,
              padding: 8,
              boxShadow: SHADOW_MD,
              zIndex: 10002,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 600 }}>Snapshots</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const pj = toProjectJSON(nodes, edges, undefined, startDate)
                      saveSnapshot(pj, snapshotName)
                      setSnapshotName('')
                      setSnaps(listSnapshots())
                    }
                  }}
                  placeholder="Name (optional)"
                  className="text-xs px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-400"
                  style={{ width: '100%', maxWidth: 140 }}
                />
                <button
                  onClick={() => {
                    try {
                      const pj = toProjectJSON(nodes, edges, undefined, startDate)
                      saveSnapshot(pj, snapshotName)
                      setSnapshotName('')
                      setSnaps(listSnapshots())
                    } catch (e) {
                      console.error(e)
                    }
                  }}
                  style={{ fontSize: 12 }}
                >
                  + Neu
                </button>
              </div>
            </div>
            {snaps.length === 0 ? (
              <div style={{ fontSize: 12, color: COLOR_TEXT_MUTED }}>Keine Snapshots</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 220, overflowY: 'auto' }}>
                {snaps.map((s) => (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                    <span style={{ fontSize: 12 }}>
                      {s.name ? s.name : new Date(s.ts).toLocaleString()}
                    </span>
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

      <Button
        variant="ghost"
        icon={exporting ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
        onClick={onPngClick}
        disabled={exporting}
      >
        {exporting ? 'Exportiere...' : 'PNG'}
      </Button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

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
