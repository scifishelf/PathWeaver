import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import ReactFlow, { Background, Controls, MiniMap, Panel, useEdgesState, useNodesState, addEdge } from 'reactflow'
import type { NodeTypes } from 'reactflow'
import { StartNode } from '../graph/StartNode'
import { EndNode } from '../graph/EndNode'
import { TaskNode } from '../graph/TaskNode'
import type { Connection } from 'reactflow'
import 'reactflow/dist/style.css'
import { ContextMenu } from './ContextMenu'
import { Banner } from './Banner'
import { validateGraph } from '../graph/validate'
import { computeCPM } from '../cpm/compute'
import { AppToolbar } from './AppToolbar'
import { toProjectJSON, fromProjectJSON } from '../persistence/serialize'
import { saveCurrent, loadCurrent } from '../persistence/autosave'

//

// Stabile Node-Typen (immer gleiche Referenz → keine Warnung #002)
const nodeTypes: NodeTypes = { start: StartNode, end: EndNode, task: TaskNode }

export function GraphCanvas() {
  const idRef = useRef(1)
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

  const getNextTaskId = useCallback(() => {
    // Ermittelt die nächste freie Nummer für IDs im Format N{num}
    let max = 0
    for (const n of nodes) {
      const m = /^N(\d+)$/.exec(n.id)
      if (m) {
        const num = parseInt(m[1], 10)
        if (!Number.isNaN(num)) max = Math.max(max, num)
      }
    }
    // idRef nur als Fallback/Monotonie-Schutz
    max = Math.max(max, idRef.current)
    idRef.current = max + 1
    return `N${max + 1}`
  }, [nodes])

  const addTaskNode = useCallback(() => {
    const id = getNextTaskId()
    const newNode = {
      id,
      data: { id, title: id, duration: 1 } as any,
      position: { x: 420, y: 160 },
      type: 'task' as const,
    }
    setNodes((nds) => {
      const next = nds.concat(newNode as any)
      setTimeout(() => validate(), 0)
      return next
    })
  }, [setNodes, getNextTaskId])

  // Inline‑Edit Handler
  const onEditTask = useCallback(
    (id: string, patch: Partial<{ title: string; duration: number }>) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? ({ ...n, data: { ...(n.data as any), ...patch } } as any) : n)))
    },
    []
  )

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
        saveCurrent(pj)
      } catch {}
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
        const m = nn
          .map((n) => /^N(\d+)$/.exec(n.id))
          .filter(Boolean)
          .map((m: any) => parseInt(m[1], 10))
        const max = m.length ? Math.max(...(m as number[])) : 0
        if (max >= idRef.current) idRef.current = max + 1
      }
    } catch {}
  }, [])

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
      const plan = {
        settings: { version: '1.0' as const, startDate },
        nodes: nodes.map((n) => ({ id: n.id, type: n.type === 'task' ? 'task' : (n.type as any), duration: (n.data as any)?.duration })),
        edges: edges.map((e) => ({ from: e.source!, to: e.target! })),
      }
      return computeCPM(plan as any)
    } catch {
      return undefined
    }
  }, [nodes, edges, errors, startDate])

  const styledNodes = useMemo(() => {
    const orphan = new Set<string>()
    for (const n of nodes) if (n.type !== 'start' && !reachableFromStart.has(n.id)) orphan.add(n.id)
    const computed = cp?.nodes
    const cpSet = new Set(cp?.criticalPath ?? [])
    return nodes.map((n) => {
      const baseStyle: any = n.style ? { ...n.style } : {}
      if (orphan.has(n.id) || nodesWithTooManyOut.has(n.id)) {
        baseStyle.border = '2px solid #ef4444'
        baseStyle.boxShadow = '0 1px 3px rgba(239,68,68,.3)'
      }
      if (cpSet.has(n.id)) {
        baseStyle.border = '2px solid #2563eb'
        baseStyle.boxShadow = '0 1px 3px rgba(37,99,235,.35)'
      }
      if (n.type === 'task') {
        return { ...n, style: baseStyle, data: { ...(n.data as any), id: n.id, computed: computed?.[n.id], onEdit: onEditTask } as any }
      }
      if (n.type === 'start') {
        return { ...n, style: baseStyle, data: { ...(n.data as any), startDate, onChangeStartDate: setStartDate } as any }
      }
      if (n.type === 'end') {
        return { ...n, style: baseStyle, data: { ...(n.data as any), earliestFinish: cp?.project?.earliestFinishISO } as any }
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
        style.stroke = '#ef4444'
        style.strokeWidth = 2
      } else if (onCp) {
        style.stroke = '#2563eb'
        style.strokeWidth = 3
      }
      return { ...e, style }
    })
  }, [edges, errors, nodesWithTooManyOut, startId, cp])

  return (
    <div className="w-full h-full relative" style={{ width: '100%', height: '100%', background: '#eef2f7' }}>
      <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10001 }}>
        <AppToolbar
          nodes={nodes as any}
          edges={edges as any}
          computed={cp as any}
          startDate={startDate}
          onImport={(nn, ee) => {
            setNodes(nn as any)
            setEdges(ee as any)
            // Seed den lokalen Zähler anhand der importierten IDs
            const m = nn
              .map((n) => /^N(\d+)$/.exec(n.id))
              .filter(Boolean)
              .map((m: any) => parseInt(m[1], 10))
            const max = m.length ? Math.max(...(m as number[])) : 0
            if (max >= idRef.current) idRef.current = max + 1
            setStartDate(undefined)
            setTimeout(() => validate(), 0)
          }}
        />
      </div>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={(chs) => {
          onNodesChange(chs)
          setTimeout(() => validate(), 0)
        }}
        onEdgesChange={(chs) => {
          onEdgesChange(chs)
          setTimeout(() => validate(), 0)
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
        <Panel position="bottom-left" style={{ left: 56, bottom: 16 }}>
          <button
            aria-label="Task hinzufügen"
            title="Task hinzufügen"
            onClick={addTaskNode}
            className="h-11 w-11 rounded-full bg-blue-600 text-white text-2xl leading-none shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
          >
            +
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
            background: '#fff',
            border: '1px solid #d4d4d8',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,.1)'
          }}
        >
          <span>
            Kritischer Pfad: {cp.criticalPath.join(' → ')} · Dauer {cp.project.durationAT} AT
            {cp.project.earliestFinishISO ? ` · Ende ${cp.project.earliestFinishISO}` : ''}
          </span>
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
          <Banner>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Fehler im Graphen</div>
            <ul style={{ paddingLeft: 18 }}>
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </Banner>
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
      {/* FAB jetzt im React Flow Panel (unten links) */}
    </div>
  )
}


