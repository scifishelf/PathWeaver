import type { Edge, Node } from 'reactflow'
import type {
  ProjectJSON,
  ComputedResult,
  TaskNode as TaskNodeJson,
  AppNodeData,
  TaskNodeData,
  StartNodeData,
  EndNodeData,
} from '../cpm/types'

export function toProjectJSON(
  nodes: Node<AppNodeData>[],
  edges: Edge[],
  computed?: ComputedResult,
  startDate?: string
): ProjectJSON & { computed?: ComputedResult } {
  const jsonNodes: TaskNodeJson[] = nodes.map((n) => {
    const nodeType = (n.type ?? 'task') as 'start' | 'task' | 'end'
    const base: TaskNodeJson = {
      id: n.id,
      type: nodeType,
      x: n.position.x,
      y: n.position.y,
    }
    if (nodeType === 'task') {
      const data = n.data as TaskNodeData
      base.title = data.title ?? n.id
      base.duration = data.duration ?? 1
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

export function fromProjectJSON(project: ProjectJSON): { nodes: Node<AppNodeData>[]; edges: Edge[] } {
  const nodes: Node<AppNodeData>[] = project.nodes.map((jn) => {
    const x = (jn as TaskNodeJson & { x?: number }).x ?? 0
    const y = (jn as TaskNodeJson & { y?: number }).y ?? 0
    if (jn.type === 'task') {
      const data: TaskNodeData = {
        type: 'task',
        id: jn.id,
        title: jn.title ?? jn.id,
        duration: jn.duration ?? 1,
        onEdit: () => { /* placeholder — real handler attached in GraphCanvas */ },
      }
      return { id: jn.id, type: 'task', position: { x, y }, data }
    }
    if (jn.type === 'start') {
      const data: StartNodeData = {
        type: 'start',
        label: 'Start',
        onChangeStartDate: () => { /* placeholder */ },
      }
      return { id: jn.id, type: 'start', position: { x, y }, data, deletable: false }
    }
    // type === 'end'
    const data: EndNodeData = { type: 'end', label: 'Ziel' }
    return { id: jn.id, type: 'end', position: { x, y }, data, deletable: false }
  })
  const edges: Edge[] = project.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to }))
  return { nodes, edges }
}

export function validateProjectJSON(project: unknown): string[] {
  const errors: string[] = []
  if (!project || typeof project !== 'object') return ['Kein gültiges JSON Objekt']
  const p = project as Record<string, unknown>
  if (!p['settings'] || (p['settings'] as Record<string, unknown>)['version'] !== '1.0')
    errors.push('settings.version muss "1.0" sein')
  if (!Array.isArray(p['nodes'])) errors.push('nodes fehlt oder ist kein Array')
  if (!Array.isArray(p['edges'])) errors.push('edges fehlt oder ist kein Array')
  const ids = new Set<string>()
  let hasStart = false
  let hasEnd = false
  for (const n of (p['nodes'] as unknown[]) ?? []) {
    const node = n as Record<string, unknown>
    if (!node?.['id']) errors.push('Node ohne id')
    else ids.add(node['id'] as string)
    if (node?.['type'] === 'start') hasStart = true
    if (node?.['type'] === 'end') hasEnd = true
  }
  if (!hasStart) errors.push('Start\u2011Knoten fehlt')
  if (!hasEnd) errors.push('Ziel\u2011Knoten fehlt')
  for (const e of (p['edges'] as unknown[]) ?? []) {
    const edge = e as Record<string, unknown>
    if (!ids.has(edge?.['from'] as string) || !ids.has(edge?.['to'] as string))
      errors.push(`Edge referenziert unbekannte Knoten (${edge?.['from']}\u2192${edge?.['to']})`)
  }
  return Array.from(new Set(errors))
}

export function isProjectJSON(data: unknown): data is ProjectJSON {
  return validateProjectJSON(data).length === 0
}
