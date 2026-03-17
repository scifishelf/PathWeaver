import '@testing-library/jest-dom/vitest'
import { computeCPM } from './compute'
import { ComputeError } from './types'
import type { ProjectJSON } from './types'

describe('computeCPM', () => {
  it('berechnet Beispiel aus PRD', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const, startDate: '2025-10-07', workweek: [1, 2, 3, 4, 5] as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'A', type: 'task', title: 'User Story A', duration: 5 },
        { id: 'B', type: 'task', title: 'User Story B', duration: 3 },
        { id: 'C', type: 'task', title: 'User Story C', duration: 2 },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'start', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'end' },
        { from: 'C', to: 'end' },
      ],
    }

    const res = computeCPM(plan)
    expect(res.criticalNodeIds).toBeInstanceOf(Set)
    expect(res.criticalNodeIds).toEqual(new Set(['start', 'A', 'C', 'end']))
    expect(res.project.durationAT).toBe(7)
  })
  it('erkennt Zyklen (allgemein) und Start/End-Regeln', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'A', type: 'task', duration: 1 },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'A', to: 'start' },
      ],
    }
    // Verletzt Start-Regel: Start darf keine Eingänge haben
    expect(() => computeCPM(plan)).toThrowError(/Start hat Eingänge/i)
  })
  it('erkennt Orphans', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'X', type: 'task', duration: 1 },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { from: 'start', to: 'end' },
      ],
    }
    expect(() => computeCPM(plan)).toThrowError(/nicht mit Start verbunden/i)
  })
})

describe('computeCPM — edge cases (TEST-04)', () => {
  it('single node graph (start + end only, no tasks) returns durationAT of 0', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
      edges: [{ from: 'start', to: 'end' }],
    }
    const res = computeCPM(plan)
    expect(res.project.durationAT).toBe(0)
    expect(res.criticalNodeIds).toBeInstanceOf(Set)
    expect(res.criticalNodeIds.has('start')).toBe(true)
    expect(res.criticalNodeIds.has('end')).toBe(true)
  })

  it('disconnected subgraph throws ComputeError with code ORPHAN', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'orphan', type: 'task', duration: 2 },
        { id: 'end', type: 'end' },
      ],
      edges: [{ from: 'start', to: 'end' }],
    }
    let thrown: ComputeError | undefined
    try { computeCPM(plan) } catch (e) { thrown = e as ComputeError }
    expect(thrown).toBeInstanceOf(ComputeError)
    expect(thrown?.code).toBe('ORPHAN')
  })

  it('cycle throws ComputeError — code is CYCLE or START_HAS_INCOMING', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [{ id: 'start', type: 'start' }, { id: 'A', type: 'task', duration: 1 }, { id: 'end', type: 'end' }],
      edges: [{ from: 'start', to: 'A' }, { from: 'A', to: 'start' }],
    }
    let thrown: ComputeError | undefined
    try { computeCPM(plan) } catch (e) { thrown = e as ComputeError }
    expect(thrown).toBeInstanceOf(ComputeError)
    expect(['CYCLE', 'START_HAS_INCOMING']).toContain(thrown?.code)
  })

  it('ComputeError has a .code property of type ComputeErrorCode', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
      edges: [], // missing start→end connection
    }
    let thrown: ComputeError | undefined
    try { computeCPM(plan) } catch (e) { thrown = e as ComputeError }
    expect(thrown).toBeInstanceOf(ComputeError)
    expect(typeof thrown?.code).toBe('string')
    expect(thrown?.code).toBeTruthy()
  })
})

describe('computeCPM — multi-predecessor (v2.0)', () => {
  it('fan-out: multi-successor task does not throw MULTIPLE_OUTGOING', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'A', type: 'task', duration: 3 },
        { id: 'B', type: 'task', duration: 2 },
        { id: 'C', type: 'task', duration: 4 },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'end' },
        { from: 'C', to: 'end' },
      ],
    }
    const res = computeCPM(plan)
    expect(res.project.durationAT).toBe(7)  // start(0) + A(3) + C(4) = 7
  })

  it('diamond: both equal branches highlighted as critical', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'A', type: 'task', duration: 3 },
        { id: 'B', type: 'task', duration: 3 },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'start', to: 'B' },
        { from: 'A', to: 'end' },
        { from: 'B', to: 'end' },
      ],
    }
    const res = computeCPM(plan)
    expect(res.criticalNodeIds).toBeInstanceOf(Set)
    expect(res.criticalNodeIds.has('start')).toBe(true)
    expect(res.criticalNodeIds.has('A')).toBe(true)
    expect(res.criticalNodeIds.has('B')).toBe(true)
    expect(res.criticalNodeIds.has('end')).toBe(true)
  })

  it('diamond: only longer branch is critical when durations differ', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'A', type: 'task', duration: 5 },
        { id: 'B', type: 'task', duration: 3 },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'start', to: 'B' },
        { from: 'A', to: 'end' },
        { from: 'B', to: 'end' },
      ],
    }
    const res = computeCPM(plan)
    expect(res.criticalNodeIds.has('A')).toBe(true)
    expect(res.criticalNodeIds.has('B')).toBe(false)
    expect(res.project.durationAT).toBe(5)
  })

  it('merge node: FAZ equals max of all incoming FEZ', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const },
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'A', type: 'task', duration: 5 },
        { id: 'B', type: 'task', duration: 3 },
        { id: 'M', type: 'task', duration: 2 },
        { id: 'end', type: 'end' },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'start', to: 'B' },
        { from: 'A', to: 'M' },
        { from: 'B', to: 'M' },
        { from: 'M', to: 'end' },
      ],
    }
    const res = computeCPM(plan)
    expect(res.nodes['M'].ES).toBe(5)  // max(5, 3) = 5
    expect(res.nodes['M'].EF).toBe(7)  // 5 + 2
    expect(res.project.durationAT).toBe(7)
  })
})
