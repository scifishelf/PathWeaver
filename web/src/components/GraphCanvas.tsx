import { useCallback, useMemo, useState, useEffect } from 'react'
import ReactFlow, { Background, Controls, MiniMap, Panel, useEdgesState, useNodesState, addEdge, useReactFlow, ReactFlowProvider } from 'reactflow'
import type { NodeTypes } from 'reactflow'
import { StartNode } from '../graph/StartNode'
import { EndNode } from '../graph/EndNode'
import { TaskNode } from '../graph/TaskNode'
import type { Connection } from 'reactflow'
import 'reactflow/dist/style.css'
import { ContextMenu } from './ContextMenu'
// import { Banner } from './Banner'
import { validateGraph } from '../graph/validate'
import { computeCPM } from '../cpm/compute'
import { AppToolbar } from './AppToolbar'
import { COLOR_ACCENT, COLOR_BG, RADIUS_MD, SHADOW_SM, COLOR_CANVAS_BG, COLOR_ERROR, COLOR_ERROR_BG, COLOR_ERROR_BORDER, COLOR_WARNING_BG, COLOR_WARNING_BORDER, COLOR_WARNING_TEXT, COLOR_FAB, COLOR_FAB_BORDER } from '../graph/theme'
import { toProjectJSON, fromProjectJSON } from '../persistence/serialize'
import { saveCurrent, loadCurrent, type SaveResult } from '../persistence/autosave'

//

// ISO date validation helper
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isValidISODate(s: string | undefined): s is string {
  if (!s) return false
  if (!ISO_DATE_RE.test(s)) return false
  return !isNaN(new Date(s).getTime())
}

// Stabile Node-Typen (immer gleiche Referenz → keine Warnung #002)
const nodeTypes: NodeTypes = { start: StartNode, end: EndNode, task: TaskNode }

function GraphCanvasInner() {
  const { getViewport } = useReactFlow()
  const initialNodes = useMemo(
    () => [
      { id: 'start', position: { x: 120, y: 300 }, data: { label: 'Start' }, type: 'start', deletable: false },
      { id: 'end', position: { x: 1040, y: 300 }, data: { label: 'Ziel' }, type: 'end', deletable: false },
    ],
    []
  )
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [menu, setMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [quotaError, setQuotaError] = useState<string | null>(null)

  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection }, eds)), [])
  // Guards: Start hat keine Eingänge, Ende keine Ausgänge, Task max. 1 Ausgang
  const isValidConnection = useCallback(
    (conn: Connection) => {
      const from = nodes.find((n) => n.id === conn.source)
      const to = nodes.find((n) => n.id === conn.target)
      if (!from || !to) return false
      if (to.id === 'start') return false
      if (from.id === 'end') return false
      // Task-Knoten (default) dürfen max. 1 Ausgang haben
      if (from.type === 'task') {
        const outCount = edges.filter((e) => e.source === from.id).length
        if (outCount >= 1) return false
      }
      return true
    },
    [nodes, edges]
  )

  // Inline‑Edit Handler
  const onEditTask = useCallback(
    (id: string, patch: Partial<{ title: string; duration: number }>) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? ({ ...n, data: { ...(n.data as any), ...patch } } as any) : n)))
    },
    []
  )

  const addTaskNode = useCallback((x?: number, y?: number) => {
    const id = crypto.randomUUID()
    // Count existing task nodes for sequential German title
    const taskCount = nodes.filter((n) => n.type === 'task').length
    const title = `Aufgabe ${taskCount + 1}`
    const position = {
      x: x ?? 420,
      y: y ?? 160,
    }
    const newNode = {
      id,
      data: { type: 'task' as const, id, title, duration: 1, focusOnMount: true, onEdit: onEditTask } as any,
      position,
      type: 'task' as const,
    }
    setNodes((nds) => nds.concat(newNode as any))
  }, [setNodes, nodes, onEditTask])

  const onNodeContextMenu = useCallback((evt: React.MouseEvent, node: { id: string; deletable?: boolean }) => {
    evt.preventDefault()
    setMenu({ x: evt.clientX, y: evt.clientY, nodeId: node.id })
  }, [])

  const deleteNode = useCallback(() => {
    if (!menu) return
    setNodes((nds) => nds.filter((n) => n.id !== menu.nodeId || n.deletable === false))
    setEdges((eds) => eds.filter((e) => e.source !== menu.nodeId && e.target !== menu.nodeId))
    setMenu(null)
  }, [menu, setNodes, setEdges])

  // validate on any change of nodes/edges
  const validate = useCallback(() => {
    setErrors(validateGraph(nodes as any, edges as any))
  }, [nodes, edges])

  const [startDate, setStartDate] = useState<string | undefined>(undefined)

  useEffect(() => {
    validate()
    const t = setTimeout(() => {
      try {
        const pj = toProjectJSON(nodes as any, edges as any, undefined, startDate)
        const result: SaveResult = saveCurrent(pj)
        if (!result.ok && result.error) {
          setQuotaError(result.error)
        } else {
          setQuotaError(null)
        }
      } catch (e) {
        console.error(e)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [validate, nodes, edges, startDate])

  // Beim Start Autosave laden (falls vorhanden)
  useEffect(() => {
    try {
      const cur = loadCurrent()
      if (cur?.project) {
        const { nodes: nn, edges: ee } = fromProjectJSON(cur.project as any)
        setNodes(nn as any)
        setEdges(ee as any)
        setStartDate(cur.project.settings?.startDate)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // T-shortcut: press T to create a new task node at viewport center
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 't' && e.key !== 'T') return
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
      const { x, y, zoom } = getViewport()
      const centerX = (window.innerWidth / 2 - x) / zoom
      const centerY = (window.innerHeight / 2 - y) / zoom
      addTaskNode(centerX, centerY)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [getViewport, addTaskNode])

  // Highlight-Sets aus aktuellem Graph ableiten
  const startId = useMemo(() => nodes.find((n) => n.type === 'start')?.id, [nodes])
  const outgoingCount = useMemo(() => {
    const map = new Map<string, number>()
    for (const n of nodes) map.set(n.id, 0)
    for (const e of edges) map.set(e.source!, (map.get(e.source!) || 0) + 1)
    return map
  }, [nodes, edges])

  const nodesWithTooManyOut = useMemo(() => {
    const s = new Set<string>()
    for (const n of nodes) {
      if (n.type === 'task' && (outgoingCount.get(n.id) || 0) > 1) s.add(n.id)
    }
    return s
  }, [nodes, outgoingCount])

  const reachableFromStart = useMemo(() => {
    if (!startId) return new Set<string>()
    const adj = new Map<string, string[]>()
    for (const n of nodes) adj.set(n.id, [])
    for (const e of edges) if (adj.has(e.source!)) adj.get(e.source!)!.push(e.target!)
    const visited = new Set<string>([startId])
    const q = [startId]
    while (q.length) {
      const id = q.shift()!
      for (const nxt of adj.get(id) || []) if (!visited.has(nxt)) {
        visited.add(nxt)
        q.push(nxt)
      }
    }
    return visited
  }, [nodes, edges, startId])

  const cp = useMemo(() => {
    if (errors.length > 0) return undefined
    try {
      const validatedStartDate = isValidISODate(startDate) ? startDate : undefined
      const plan = {
        settings: { version: '1.0' as const, startDate: validatedStartDate },
        nodes: nodes.map((n) => ({ id: n.id, type: n.type === 'task' ? 'task' : (n.type as any), duration: (n.data as any)?.duration })),
        edges: edges.map((e) => ({ from: e.source!, to: e.target! })),
      }
      return computeCPM(plan as any)
    } catch (e) {
      console.error(e)
      return undefined
    }
  }, [nodes, edges, errors, startDate])

  const styledNodes = useMemo(() => {
    const orphan = new Set<string>()
    for (const n of nodes) if (n.type !== 'start' && !reachableFromStart.has(n.id)) orphan.add(n.id)
    const computed = cp?.nodes
    return nodes.map((n) => {
      const baseStyle: any = n.style ? { ...n.style } : {}
      if (orphan.has(n.id) || nodesWithTooManyOut.has(n.id)) {
        baseStyle.border = `2px solid ${COLOR_ERROR}`
        baseStyle.boxShadow = '0 1px 3px rgba(239,68,68,.3)'
      }
      // Kritische Knoten nicht mehr über Border markieren; Hintergrund übernimmt jeweilige Node-Komponente
      if (n.type === 'task') {
        return { ...n, style: baseStyle, data: { ...(n.data as any), id: n.id, computed: computed?.[n.id], onEdit: onEditTask, startDate } as any }
      }
      if (n.type === 'start') {
        return { ...n, style: baseStyle, data: { ...(n.data as any), startDate, onChangeStartDate: setStartDate } as any }
      }
      if (n.type === 'end') {
        return { ...n, style: baseStyle, data: { ...(n.data as any), startDate, computed: cp?.nodes?.[n.id] } as any }
      }
      return { ...n, style: baseStyle }
    })
  }, [nodes, nodesWithTooManyOut, reachableFromStart, cp, onEditTask])

  const styledEdges = useMemo(() => {
    const cycle = errors.some((e) => /Zyklus/.test(e))
    const cpPairs = new Set<string>()
    if (cp?.criticalPath) {
      for (let i = 0; i < cp.criticalPath.length - 1; i++) {
        cpPairs.add(cp.criticalPath[i] + '→' + cp.criticalPath[i + 1])
      }
    }
    return edges.map((e) => {
      const invalid = e.target === startId || nodesWithTooManyOut.has(e.source!) || cycle
      const onCp = cpPairs.has(e.source + '→' + e.target)
      const style: any = e.style ? { ...e.style } : {}
      if (invalid) {
        style.stroke = COLOR_ERROR
        style.strokeWidth = 2
      } else if (onCp) {
        style.stroke = COLOR_ACCENT
        style.strokeWidth = 3
      }
      return { ...e, style }
    })
  }, [edges, errors, nodesWithTooManyOut, startId, cp])

  return (
    <div className="w-full h-full relative" style={{ width: '100%', height: '100%', background: COLOR_CANVAS_BG }}>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={(chs) => {
          onNodesChange(chs)
        }}
        onEdgesChange={(chs) => {
          onEdgesChange(chs)
        }}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        snapToGrid
        snapGrid={[8, 8]}
        nodeTypes={nodeTypes}
      >
        <Background />
        <MiniMap />
        <Controls />
        <Panel position="top-right" style={{ right: 16, top: 16 }}>
          <AppToolbar
            nodes={nodes as any}
            edges={edges as any}
            computed={cp as any}
            startDate={startDate}
            onImport={(nn, ee, importedStartDate) => {
              setNodes(nn as any)
              setEdges(ee as any)
              setStartDate(importedStartDate)
            }}
          />
        </Panel>
        <Panel position="top-left" style={{ left: 72, top: 16, zIndex: 10002 }}>
          <button
            aria-label="Neuen Task hinzufügen"
            title="Neuen Task hinzufügen"
            onClick={() => addTaskNode()}
            style={{
              height: 45,
              width: 45,
              borderRadius: 9999,
              background: COLOR_FAB,
              color: COLOR_BG,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,.25)',
              border: `2px solid ${COLOR_FAB_BORDER}`,
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </Panel>
      </ReactFlow>
      {/* CP‑Banner (wenn keine Fehler) */}
      {errors.length === 0 && cp && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: '#eff6ff',
            color: '#1d4ed8',
            border: `1px solid ${COLOR_ACCENT}`,
            borderRadius: RADIUS_MD,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 400,
            boxShadow: SHADOW_SM,
          }}
        >
          ◆ Kritischer Pfad: {cp.project.durationAT} Arbeitstage
        </div>
      )}
      {errors.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(800px, 95vw)',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: COLOR_ERROR_BG,
            border: `1px solid ${COLOR_ERROR_BORDER}`,
            borderRadius: 8,
            padding: 12
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Fehler im Graphen</div>
            <ul style={{ paddingLeft: 18 }}>
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {quotaError && (
        <div
          style={{
            position: 'fixed',
            top: errors.length > 0 ? 120 : 56,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(800px, 95vw)',
            zIndex: 10000,
          }}
        >
          <div style={{
            background: COLOR_WARNING_BG,
            border: `1px solid ${COLOR_WARNING_BORDER}`,
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
            color: COLOR_WARNING_TEXT,
          }}>
            {quotaError}
          </div>
        </div>
      )}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: 'Löschen',
              onClick: deleteNode,
              disabled: nodes.find((n) => n.id === menu.nodeId)?.deletable === false,
            },
          ]}
        />
      )}
      {/* FAB jetzt im React Flow Panel (oben links) */}
    </div>
  )
}

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  )
}
