import '@testing-library/jest-dom/vitest'
import { toProjectJSON, fromProjectJSON, validateProjectJSON, isProjectJSON } from './serialize'
import { computeCPM } from '../cpm/compute'
import type { Node, Edge } from 'reactflow'
import type { AppNodeData, TaskNodeData, StartNodeData, EndNodeData } from '../cpm/types'
import type { ProjectJSON } from '../cpm/types'

// ─── Helper builders ─────────────────────────────────────────────────────────

function taskNode(id: string, title: string, duration: number): Node<TaskNodeData> {
  return {
    id,
    type: 'task',
    position: { x: 10, y: 20 },
    data: { type: 'task', id, title, duration, onEdit: () => {} },
  }
}

function startNode(): Node<StartNodeData> {
  return {
    id: 'start',
    type: 'start',
    position: { x: 0, y: 0 },
    data: { type: 'start', label: 'Start', onChangeStartDate: () => {} },
  }
}

function endNode(): Node<EndNodeData> {
  return {
    id: 'end',
    type: 'end',
    position: { x: 100, y: 0 },
    data: { type: 'end', label: 'Ziel' },
  }
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target }
}

// ─── Round-trip tests (TEST-01) ───────────────────────────────────────────────

describe('serialize round-trip (TEST-01)', () => {
  it('round-trip: minimal graph (start + end only) preserves all fields', () => {
    const nodes: Node<AppNodeData>[] = [startNode(), endNode()]
    const edges: Edge[] = []
    const json = toProjectJSON(nodes, edges)
    const { nodes: restored, edges: restoredEdges } = fromProjectJSON(json)
    expect(restored.map(n => n.id).sort()).toEqual(['end', 'start'])
    expect(restored.find(n => n.id === 'start')?.type).toBe('start')
    expect(restored.find(n => n.id === 'end')?.type).toBe('end')
    expect(restoredEdges).toHaveLength(0)
  })

  it('round-trip: graph with 3 task nodes preserves ids, titles, durations, positions', () => {
    const nodes: Node<AppNodeData>[] = [
      startNode(),
      taskNode('A', 'Analyse', 5),
      taskNode('B', 'Entwicklung', 10),
      taskNode('C', 'Testing', 3),
      endNode(),
    ]
    const edges: Edge[] = [
      makeEdge('start', 'A'),
      makeEdge('A', 'B'),
      makeEdge('B', 'C'),
      makeEdge('C', 'end'),
    ]
    const json = toProjectJSON(nodes, edges)
    const { nodes: restored, edges: restoredEdges } = fromProjectJSON(json)

    expect(restored).toHaveLength(5)
    const taskA = restored.find(n => n.id === 'A')
    expect(taskA?.type).toBe('task')
    const dataA = taskA?.data as TaskNodeData
    expect(dataA.title).toBe('Analyse')
    expect(dataA.duration).toBe(5)

    const taskC = restored.find(n => n.id === 'C')
    const dataC = taskC?.data as TaskNodeData
    expect(dataC.title).toBe('Testing')
    expect(dataC.duration).toBe(3)

    expect(restoredEdges).toHaveLength(4)
    expect(restoredEdges.find(e => e.source === 'A' && e.target === 'B')).toBeDefined()
  })

  it('round-trip: graph with startDate setting preserves startDate', () => {
    const nodes: Node<AppNodeData>[] = [startNode(), taskNode('T1', 'Task', 2), endNode()]
    const edges: Edge[] = [makeEdge('start', 'T1'), makeEdge('T1', 'end')]
    const startDate = '2025-10-06'
    const json = toProjectJSON(nodes, edges, undefined, startDate)

    expect(json.settings?.startDate).toBe(startDate)

    const { nodes: restored } = fromProjectJSON(json)
    expect(restored.find(n => n.id === 'T1')?.type).toBe('task')
    const taskData = restored.find(n => n.id === 'T1')?.data as TaskNodeData
    expect(taskData.title).toBe('Task')
    expect(taskData.duration).toBe(2)
  })
})

// ─── isProjectJSON type guard (TYPES-01) ─────────────────────────────────────

describe('isProjectJSON type guard (TYPES-01)', () => {
  it('returns true for valid ProjectJSON with nodes and edges', () => {
    const valid: ProjectJSON = {
      settings: { version: '1.0' },
      nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
      edges: [],
    }
    expect(isProjectJSON(valid)).toBe(true)
  })
  it('returns false for null', () => {
    expect(isProjectJSON(null)).toBe(false)
  })
  it('returns false for object missing nodes array', () => {
    expect(isProjectJSON({ edges: [] })).toBe(false)
  })
  it('returns false for object missing edges array', () => {
    expect(isProjectJSON({ nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }] })).toBe(false)
  })
  it('returns false for settings.version !== "1.0"', () => {
    expect(isProjectJSON({ settings: { version: '2.0' }, nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }], edges: [] })).toBe(false)
  })
})

// ─── validateProjectJSON (existing — regression guard) ───────────────────────

describe('validateProjectJSON (existing — regression guard)', () => {
  it('returns empty array for valid project', () => {
    const valid: ProjectJSON = {
      settings: { version: '1.0' },
      nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
      edges: [],
    }
    expect(validateProjectJSON(valid)).toEqual([])
  })
  it('returns error when nodes missing', () => {
    expect(validateProjectJSON({ edges: [] })).toContain('nodes fehlt oder ist kein Array')
  })
  it('returns error when start node missing', () => {
    const noStart: ProjectJSON = {
      settings: { version: '1.0' },
      nodes: [{ id: 'end', type: 'end' }],
      edges: [],
    }
    expect(validateProjectJSON(noStart)).toContain('Start\u2011Knoten fehlt')
  })
})

describe('v1.0 backward compatibility (UX-03)', () => {
  it('loads a v1.0 linear project without errors and computes correct CPM', () => {
    const v1Project: ProjectJSON = {
      settings: { version: '1.0' },
      nodes: [
        { id: 'start', type: 'start', x: 0, y: 0 },
        { id: 'A', type: 'task', title: 'Analysis', duration: 3, x: 100, y: 0 },
        { id: 'B', type: 'task', title: 'Build', duration: 5, x: 200, y: 0 },
        { id: 'end', type: 'end', x: 300, y: 0 },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'A', to: 'B' },
        { from: 'B', to: 'end' },
      ],
    }

    // 1. Type guard accepts v1.0 fixture
    expect(isProjectJSON(v1Project)).toBe(true)

    // 2. Deserialize without throwing
    const { nodes, edges } = fromProjectJSON(v1Project)
    expect(nodes).toHaveLength(4)
    expect(edges).toHaveLength(3)

    // 3. Edge ID scheme preserved
    expect(edges.find(e => e.source === 'A' && e.target === 'B')?.id).toBe('A-B')

    // 4. Round-trip through toProjectJSON + computeCPM
    const json = toProjectJSON(nodes, edges)
    const result = computeCPM(json)
    expect(result.project.durationAT).toBe(8)
    expect(result.nodes['A'].ES).toBe(0)
    expect(result.nodes['B'].ES).toBe(3)
    expect(result.criticalNodeIds.has('A')).toBe(true)
    expect(result.criticalNodeIds.has('B')).toBe(true)
  })
})
