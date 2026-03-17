import type { Edge, Node } from 'reactflow'

export function validateGraph(nodes: Node[], edges: Edge[]): string[] {
  const errors: string[] = []
  if (!nodes.length) return errors

  const idToType = new Map(nodes.map((n) => [n.id, String(n.type || 'task')]))
  const ids = new Set(nodes.map((n) => n.id))
  const start = nodes.find((n) => n.type === 'start')?.id
  const end = nodes.find((n) => n.type === 'end')?.id

  if (!start || !end) return ['Start or end node missing']

  for (const e of edges) {
    if (e.target === start) errors.push('Start has incoming edges')
    if (e.source === end) errors.push('End has outgoing edges')
  }

  // Build adjacency and indegree for Kahn (cycle detection)
  const incoming = new Map<string, number>()
  const adj = new Map<string, string[]>()
  for (const id of ids) {
    incoming.set(id, 0)
    adj.set(id, [])
  }
  for (const e of edges) {
    if (!ids.has(e.source!) || !ids.has(e.target!)) continue
    incoming.set(e.target!, (incoming.get(e.target!) || 0) + 1)
    adj.get(e.source!)!.push(e.target!)
  }
  // Kahn
  const q: string[] = []
  for (const [id, deg] of incoming) if (deg === 0) q.push(id)
  let visited = 0
  while (q.length) {
    const id = q.shift()!
    visited++
    for (const nxt of adj.get(id) || []) {
      const d = (incoming.get(nxt) || 0) - 1
      incoming.set(nxt, d)
      if (d === 0) q.push(nxt)
    }
  }
  if (visited < ids.size) errors.push('Cycle detected')

  // Reachability from start
  const reach = new Set<string>([start])
  const qq = [start]
  while (qq.length) {
    const cur = qq.shift()!
    for (const nxt of adj.get(cur) || []) if (!reach.has(nxt)) {
      reach.add(nxt)
      qq.push(nxt)
    }
  }
  for (const id of ids) {
    if (!reach.has(id) && idToType.get(id) !== 'start') {
      errors.push(`Node ${id} is not connected to Start`)
    }
  }

  return Array.from(new Set(errors))
}


