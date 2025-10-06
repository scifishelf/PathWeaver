import type { Edge, Node } from 'reactflow'
import type { ProjectJSON, ComputedResult, TaskNode as TaskNodeJson } from '../cpm/types'

export function toProjectJSON(
  nodes: Node[],
  edges: Edge[],
  computed?: ComputedResult,
  startDate?: string
): ProjectJSON & { computed?: ComputedResult } {
  const jsonNodes: TaskNodeJson[] = nodes.map((n) => {
    const base: any = {
      id: n.id,
      type: (n.type as any) || 'task',
      x: n.position.x,
      y: n.position.y,
    }
    if (base.type === 'task') {
      base.title = (n.data as any)?.title ?? n.id
      base.duration = (n.data as any)?.duration ?? 1
    }
    return base
  })
  const jsonEdges = edges.map((e) => ({ from: e.source!, to: e.target! }))
  const project: ProjectJSON & { computed?: ComputedResult } = {
    settings: { version: '1.0' as const, startDate },
    nodes: jsonNodes,
    edges: jsonEdges,
  }
  if (computed) project.computed = computed
  return project
}

export function fromProjectJSON(project: ProjectJSON) {
  const nodes: Node[] = project.nodes.map((jn) => {
    const base: any = {
      id: jn.id,
      type: jn.type === 'task' ? 'task' : jn.type,
      position: { x: (jn as any).x ?? 0, y: (jn as any).y ?? 0 },
      data: {} as any,
    }
    if (jn.type === 'task') {
      base.data = { id: jn.id, title: (jn as any).title ?? jn.id, duration: (jn as any).duration ?? 1 }
    } else if (jn.type === 'start') {
      base.data = { label: 'Start' }
      base.deletable = false
    } else if (jn.type === 'end') {
      base.data = { label: 'Ziel' }
      base.deletable = false
    }
    return base
  })
  const edges: Edge[] = project.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to }))
  return { nodes, edges }
}

export function validateProjectJSON(project: any): string[] {
  const errors: string[] = []
  if (!project || typeof project !== 'object') return ['Kein gültiges JSON Objekt']
  if (!project.settings || project.settings.version !== '1.0') errors.push('settings.version muss "1.0" sein')
  if (!Array.isArray(project.nodes)) errors.push('nodes fehlt oder ist kein Array')
  if (!Array.isArray(project.edges)) errors.push('edges fehlt oder ist kein Array')
  const ids = new Set<string>()
  let hasStart = false
  let hasEnd = false
  for (const n of project.nodes ?? []) {
    if (!n?.id) errors.push('Node ohne id')
    else ids.add(n.id)
    if (n.type === 'start') hasStart = true
    if (n.type === 'end') hasEnd = true
  }
  if (!hasStart) errors.push('Start‑Knoten fehlt')
  if (!hasEnd) errors.push('Ziel‑Knoten fehlt')
  for (const e of project.edges ?? []) {
    if (!ids.has(e?.from) || !ids.has(e?.to)) errors.push(`Edge referenziert unbekannte Knoten (${e?.from}→${e?.to})`)
  }
  return Array.from(new Set(errors))
}


