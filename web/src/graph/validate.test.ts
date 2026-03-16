import '@testing-library/jest-dom/vitest'
import { validateGraph } from './validate'
import type { Node, Edge } from 'reactflow'

// Helper to create minimal ReactFlow nodes
function makeNode(id: string, type: string): Node {
  return { id, type, position: { x: 0, y: 0 }, data: {} }
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target }
}

describe('validateGraph (TEST-02)', () => {
  it('returns empty array for a valid linear graph', () => {
    const nodes = [makeNode('start', 'start'), makeNode('A', 'task'), makeNode('end', 'end')]
    const edges = [makeEdge('start', 'A'), makeEdge('A', 'end')]
    expect(validateGraph(nodes, edges)).toEqual([])
  })

  it('returns error when an edge creates an incoming connection to start (missing connection rule)', () => {
    // validateGraph catches when start receives incoming edges (invalid topology)
    const nodes = [makeNode('start', 'start'), makeNode('A', 'task'), makeNode('end', 'end')]
    const edges = [makeEdge('A', 'start'), makeEdge('start', 'end')] // A→start is invalid
    const errs = validateGraph(nodes, edges)
    expect(errs.some(e => /Start hat Eingänge/.test(e))).toBe(true)
  })

  it('returns error when a cycle is present', () => {
    const nodes = [makeNode('start', 'start'), makeNode('A', 'task'), makeNode('B', 'task'), makeNode('end', 'end')]
    const edges = [makeEdge('start', 'A'), makeEdge('A', 'B'), makeEdge('B', 'A'), makeEdge('B', 'end')]
    const errs = validateGraph(nodes, edges)
    expect(errs.some(e => /Zyklus/.test(e))).toBe(true)
  })

  it('returns error for orphaned node not reachable from start', () => {
    const nodes = [makeNode('start', 'start'), makeNode('orphan', 'task'), makeNode('end', 'end')]
    const edges = [makeEdge('start', 'end')] // orphan has no incoming edge from start
    const errs = validateGraph(nodes, edges)
    expect(errs.some(e => /nicht mit Start verbunden/.test(e))).toBe(true)
  })

  it('returns error when start node is missing', () => {
    const nodes = [makeNode('A', 'task'), makeNode('end', 'end')]
    const edges = [makeEdge('A', 'end')]
    const errs = validateGraph(nodes, edges)
    expect(errs.some(e => /Start/.test(e))).toBe(true)
  })

  it('returns error when end node is missing', () => {
    const nodes = [makeNode('start', 'start'), makeNode('A', 'task')]
    const edges = [makeEdge('start', 'A')]
    const errs = validateGraph(nodes, edges)
    expect(errs.some(e => /Ziel/.test(e))).toBe(true)
  })
})
