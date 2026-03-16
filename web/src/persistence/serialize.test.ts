import '@testing-library/jest-dom/vitest'
import { validateProjectJSON } from './serialize'
import type { ProjectJSON } from '../cpm/types'

describe('serialize round-trip (TEST-01)', () => {
  it.todo('round-trip: minimal graph (start + end only) preserves all fields')
  it.todo('round-trip: graph with 3 task nodes preserves ids, titles, durations, positions')
  it.todo('round-trip: graph with startDate setting preserves startDate')
})

describe('isProjectJSON type guard (TYPES-01)', () => {
  it.todo('returns true for valid ProjectJSON with nodes and edges')
  it.todo('returns false for null')
  it.todo('returns false for object missing nodes array')
  it.todo('returns false for object missing edges array')
  it.todo('returns false for settings.version !== "1.0"')
})

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
    expect(validateProjectJSON(noStart)).toContain('Start‑Knoten fehlt')
  })
})
