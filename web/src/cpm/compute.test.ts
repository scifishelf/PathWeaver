import '@testing-library/jest-dom/vitest'
import { computeCPM } from './compute'
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
    expect(res.criticalPath).toEqual(['start', 'A', 'C', 'end'])
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
  it.todo('single node graph (start + end only, no tasks) returns durationAT of 0')
  it.todo('disconnected subgraph throws ComputeError with code ORPHAN')
  it.todo('pure cycle (no start→end path) throws ComputeError with code CYCLE or START_HAS_INCOMING')
  it.todo('ComputeError has a .code property matching ComputeErrorCode type')
})


