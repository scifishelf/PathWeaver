import { toProjectJSON, fromProjectJSON, validateProjectJSON } from '../persistence/serialize'
import { saveSnapshot, listSnapshots, loadSnapshot, deleteSnapshot } from '../persistence/autosave'
import { useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { toPng } from 'html-to-image'
import { Download, Upload, Layers, Image, Loader2, FlaskConical } from 'lucide-react'
import type { Edge, Node } from 'reactflow'
import demoPathweaverTest from '../../../docs/testdaten/pathweaver_test.json'
import demoDoenerladen from '../../../docs/testdaten/doenerladen-tagesablauf.json'
import demoMars from '../../../docs/testdaten/mars-kolonisierung.json'

const DEMO_FILES = [
  { label: 'PathWeaver Test', data: demoPathweaverTest },
  { label: 'Döner Shop Daily Schedule', data: demoDoenerladen },
  { label: 'Mars Colonization', data: demoMars },
]

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
  const [demoOpen, setDemoOpen] = useState(false)
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
    } catch {
      setImportErrors(['Invalid JSON'])
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
        backgroundColor: '#0a0f1e',
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

  const separatorStyle: React.CSSProperties = {
    width: 1,
    height: 20,
    background: 'rgba(255,255,255,0.08)',
    margin: '0 2px',
    flexShrink: 0,
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        background: 'rgba(10,15,40,0.75)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 100,
        padding: '6px 12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Group 1: Export + Import */}
      <Button variant="ghost" icon={<Download size={16} />} onClick={onExportClick}>
        Export
      </Button>
      <Button variant="ghost" icon={<Upload size={16} />} onClick={triggerFileDialog}>
        Import
      </Button>

      {/* Demo */}
      <div style={{ position: 'relative' }}>
        <Button
          variant="ghost"
          icon={<FlaskConical size={16} />}
          onClick={() => {
            setDemoOpen((v) => !v)
            setOpen(false)
          }}
        >
          Demo
        </Button>
        {demoOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'rgba(10,15,40,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              width: 240,
              padding: 10,
              boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              zIndex: 10002,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, color: '#f8fafc', marginBottom: 8 }}>
              Load Demo Data
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {DEMO_FILES.map((demo) => (
                <li key={demo.label}>
                  <button
                    onClick={() => {
                      const { nodes: nn, edges: ee } = fromProjectJSON(demo.data as any)
                      onImport(nn, ee, (demo.data as any).settings?.startDate)
                      setDemoOpen(false)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      fontSize: 12,
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      color: 'rgba(255,255,255,0.75)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    {demo.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={separatorStyle} />

      {/* Group 2: Snapshots */}
      <div style={{ position: 'relative' }}>
        <Button
          variant="ghost"
          icon={<Layers size={16} />}
          onClick={() => {
            if (!open) {
              setOpen(true)
              setDemoOpen(false)
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
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'rgba(10,15,40,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              width: 280,
              padding: 10,
              boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              zIndex: 10002,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#f8fafc' }}>Snapshots</div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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

                  style={{
                    width: 130,
                    padding: '4px 8px',
                    fontSize: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6,
                    color: '#f8fafc',
                    outline: 'none',
                  }}
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
                  style={{
                    fontSize: 12,
                    padding: '4px 8px',
                    background: 'rgba(96,165,250,0.15)',
                    border: '1px solid rgba(96,165,250,0.3)',
                    borderRadius: 6,
                    color: '#60a5fa',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + New
                </button>
              </div>
            </div>
            {snaps.length === 0 ? (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '4px 0' }}>No Snapshots</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 220, overflowY: 'auto' }}>
                {snaps.map((s) => (
                  <li
                    key={s.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 4px',
                      borderRadius: 6,
                    }}
                  >
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                      {s.name ? s.name : new Date(s.ts).toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => {
                          const pj = loadSnapshot(s.id)
                          if (pj) {
                            const { nodes: nn, edges: ee } = fromProjectJSON(pj as any)
                            onImport(nn, ee, (pj as any).settings?.startDate)
                            setOpen(false)
                          }
                        }}
                        style={{
                          fontSize: 11,
                          padding: '2px 7px',
                          background: 'rgba(96,165,250,0.12)',
                          border: '1px solid rgba(96,165,250,0.25)',
                          borderRadius: 4,
                          color: '#60a5fa',
                          cursor: 'pointer',
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          deleteSnapshot(s.id)
                          setSnaps(listSnapshots())
                        }}
                        style={{
                          fontSize: 11,
                          padding: '2px 7px',
                          background: 'rgba(248,113,113,0.10)',
                          border: '1px solid rgba(248,113,113,0.2)',
                          borderRadius: 4,
                          color: '#f87171',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div style={separatorStyle} />

      <Button
        variant="ghost"
        icon={exporting ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
        onClick={onPngClick}
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : 'PNG'}
      </Button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import JSON">
        <div style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 10, color: '#f8fafc' }}>
            The file could not be imported:
          </div>
          <ul style={{ paddingLeft: 18, marginBottom: 14, color: 'rgba(255,255,255,0.7)' }}>
            {importErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
