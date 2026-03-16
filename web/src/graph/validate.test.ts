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

  it.todo('returns error when a task node has no outgoing edge (missing connection)')
  it.todo('returns error when a cycle is present')
  it.todo('returns error for orphaned node not reachable from start')
  it.todo('returns error when start node is missing')
  it.todo('returns error when end node is missing')
})
