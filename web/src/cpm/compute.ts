import type { Edge, ProjectJSON, NodeId, ComputedResult, Workday } from './types'
import { ComputeError } from './types'
import { addWorkdays, nextWorkday } from './workdays'

function buildAdjacency(nodes: NodeId[], edges: Edge[]) {
  const incoming = new Map<NodeId, Set<NodeId>>()
  const outgoing = new Map<NodeId, Set<NodeId>>()
  for (const n of nodes) {
    incoming.set(n, new Set())
    outgoing.set(n, new Set())
  }
  for (const e of edges) {
    outgoing.get(e.from)?.add(e.to)
    incoming.get(e.to)?.add(e.from)
  }
  return { incoming, outgoing }
}

function topoSort(nodes: NodeId[], edges: Edge[]): NodeId[] {
  const { incoming, outgoing } = buildAdjacency(nodes, edges)
  const q: NodeId[] = []
  for (const n of nodes) if ((incoming.get(n)?.size ?? 0) === 0) q.push(n)
  const order: NodeId[] = []
  const inc = new Map(nodes.map((n) => [n, new Set(incoming.get(n))]))
  while (q.length) {
    const n = q.shift()!
    order.push(n)
    for (const m of outgoing.get(n) ?? []) {
      const set = inc.get(m)!
      set.delete(n)
      if (set.size === 0) q.push(m)
    }
  }
  if (order.length !== nodes.length) throw new ComputeError('CYCLE', 'Zyklus erkannt')
  return order
}

export function computeCPM(input: ProjectJSON): ComputedResult {
  const nodes = input.nodes
  const edges = input.edges

  const start = nodes.find((n) => n.type === 'start')?.id
  const end = nodes.find((n) => n.type === 'end')?.id
  if (!start || !end) throw new ComputeError('MISSING_START_END', 'Start/Ziel fehlen')

  // Regeln: Start ohne Eingänge, Ende ohne Ausgänge, max. 1 Ausgang je Task
  for (const e of edges) {
    if (e.to === start) throw new ComputeError('START_HAS_INCOMING', 'Start hat Eingänge')
    if (e.from === end) throw new ComputeError('END_HAS_OUTGOING', 'Ziel hat Ausgänge')
  }
  const outCounts = new Map<NodeId, number>()
  for (const n of nodes) outCounts.set(n.id, 0)
  for (const e of edges) outCounts.set(e.from, (outCounts.get(e.from) ?? 0) + 1)
  for (const n of nodes) {
    if (n.type === 'task' && (outCounts.get(n.id) ?? 0) > 1) {
      throw new ComputeError('MULTIPLE_OUTGOING', `Mehr als 1 Ausgang an Knoten ${n.id}`)
    }
  }

  // Orphan/Erreichbarkeit: von Start aus erreichbare Knoten
  const reachable = new Set<NodeId>([start])
  const adj = new Map<NodeId, NodeId[]>()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) adj.get(e.from)!.push(e.to)
  const queue = [start]
  while (queue.length) {
    const n = queue.shift()!
    for (const m of adj.get(n)!) if (!reachable.has(m)) {
      reachable.add(m)
      queue.push(m)
    }
  }
  for (const n of nodes) {
    if (!reachable.has(n.id)) throw new ComputeError('ORPHAN', `Knoten ${n.id} ist nicht mit Start verbunden`)
  }

  // Topologische Ordnung
  const order = topoSort(nodes.map((n) => n.id), edges)

  // Dauer/Zeiten in Arbeitstagen (0‑basiert ab Projektstart)
  const ES = new Map<NodeId, Workday>()
  const EF = new Map<NodeId, Workday>()
  const LS = new Map<NodeId, Workday>()
  const LF = new Map<NodeId, Workday>()

  for (const n of nodes) {
    if (n.type === 'task') {
      const d = n.duration
      if (d == null || d < 0) throw new ComputeError('INVALID_DURATION', `Dauer fehlt/negativ für ${n.id}`)
    }
  }

  const predecessors = new Map<NodeId, NodeId[]>()
  for (const n of nodes) predecessors.set(n.id, [])
  for (const e of edges) predecessors.get(e.to)!.push(e.from)

  for (const n of order) {
    if (n === start) {
      ES.set(n, 0)
      EF.set(n, 0)
      continue
    }
    const preds = predecessors.get(n)!
    const maxEF = preds.length ? Math.max(...preds.map((p) => EF.get(p) ?? 0)) : 0
    ES.set(n, maxEF)
    const node = nodes.find((x) => x.id === n)!
    const dur = node.type === 'task' ? (node.duration as number) : 0
    EF.set(n, ES.get(n)! + dur)
  }

  // Backward Pass
  const successors = new Map<NodeId, NodeId[]>()
  for (const n of nodes) successors.set(n.id, [])
  for (const e of edges) successors.get(e.from)!.push(e.to)
  const reverse = [...order].reverse()
  for (const n of reverse) {
    if (n === end) {
      const maxEF = Math.max(...order.map((k) => EF.get(k) ?? 0))
      LF.set(n, maxEF)
      LS.set(n, maxEF)
      continue
    }
    const succs = successors.get(n)!
    const minLS = succs.length ? Math.min(...succs.map((s) => LS.get(s)!)) : (EF.get(n) ?? 0)
    const node = nodes.find((x) => x.id === n)!
    const dur = node.type === 'task' ? (node.duration as number) : 0
    LF.set(n, minLS)
    LS.set(n, minLS - dur)
  }

  // Floating-Point-Artefakte eliminieren (z.B. 2.77e-17 statt 0)
  const rnd = (v: number) => Math.round(v * 1e10) / 1e10

  const computedNodes: ComputedResult['nodes'] = {}
  for (const n of nodes) {
    if (n.type === 'start') {
      computedNodes[n.id] = { ES: 0, EF: 0, LS: 0, LF: 0, slack: 0, critical: true }
      continue
    }
    const es = rnd(ES.get(n.id) ?? 0)
    const ef = rnd(EF.get(n.id) ?? 0)
    const ls = rnd(LS.get(n.id) ?? 0)
    const lf = rnd(LF.get(n.id) ?? 0)
    const slack = rnd(ls - es)
    computedNodes[n.id] = { ES: es, EF: ef, LS: ls, LF: lf, slack, critical: slack === 0 }
  }

  // Kritischer Pfad: entlang Successors slack==0
  const path: NodeId[] = [start]
  let cur = start
  const visited = new Set<NodeId>([start])
  while (cur !== end) {
    const succs = successors.get(cur) ?? []
    const next = succs.find((s) => (computedNodes[s]?.slack ?? 1) === 0)
    if (!next || visited.has(next)) break
    path.push(next)
    visited.add(next)
    cur = next
  }

  const startISO = input.settings?.startDate
  let earliestFinishISO: string | undefined
  if (startISO) {
    const startDate = nextWorkday(new Date(startISO))
    const endDate = addWorkdays(startDate, Math.max(...Object.values(computedNodes).map((c) => c.EF)))
    earliestFinishISO = endDate.toISOString().slice(0, 10)
  }

  const durationAT = Math.max(...Object.values(computedNodes).map((c) => c.EF))
  return {
    nodes: computedNodes,
    criticalPath: path,
    project: { durationAT, earliestFinishISO },
  }
}


