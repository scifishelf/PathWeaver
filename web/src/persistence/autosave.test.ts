import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { saveCurrent, saveSnapshot, listSnapshots, deleteSnapshot } from './autosave'
import type { ProjectJSON } from '../cpm/types'

const minimalProject: ProjectJSON = {
  settings: { version: '1.0' },
  nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
  edges: [],
}

describe('saveCurrent / SaveResult (ERR-02)', () => {
  beforeEach(() => localStorage.clear())

  it('returns { ok: true } on successful save', () => {
    const result = saveCurrent(minimalProject)
    expect(result.ok).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns { ok: false, error: "Speicher voll — ..." } when QuotaExceededError is thrown', () => {
    const quotaError = new DOMException('QuotaExceeded')
    Object.defineProperty(quotaError, 'name', { value: 'QuotaExceededError', writable: true })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw quotaError })
    const result = saveCurrent(minimalProject)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Speicher voll — bitte Snapshots löschen oder Projekt als JSON exportieren')
    vi.restoreAllMocks()
  })

  it('returns { ok: false, error: "Speichern fehlgeschlagen ..." } on generic error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Generic storage error')
    })
    const result = saveCurrent(minimalProject)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/Speichern fehlgeschlagen/)
    vi.restoreAllMocks()
  })
})

describe('saveSnapshot — random key suffix (BUG-02)', () => {
  beforeEach(() => localStorage.clear())

  it('snapshot id contains a random suffix (not just timestamp digits)', () => {
    const snap = saveSnapshot(minimalProject)
    expect(snap?.id).toMatch(/^\d+-[a-z0-9]{6}$/)
  })

  it('two snapshots created within 1ms have different ids', () => {
    const a = saveSnapshot(minimalProject)
    const b = saveSnapshot(minimalProject)
    expect(a?.id).not.toBe(b?.id)
  })
})

describe('saveSnapshot — optional name (SNAP-01)', () => {
  beforeEach(() => localStorage.clear())

  it('snapshot saved with name stores name in localStorage entry', () => {
    const snap = saveSnapshot(minimalProject, 'Mein Test')
    expect(snap?.name).toBe('Mein Test')
  })

  it('snapshot saved without name has undefined or absent name field', () => {
    const snap = saveSnapshot(minimalProject)
    expect(snap?.name).toBeUndefined()
  })

  it('listSnapshots() returns name field when present', () => {
    saveSnapshot(minimalProject, 'Named Snapshot')
    const snaps = listSnapshots()
    expect(snaps[0].name).toBe('Named Snapshot')
  })
})

describe('Node ID generation (BUG-01)', () => {
  it('crypto.randomUUID() generates valid UUID v4 format', () => {
    // crypto.randomUUID() is the new node ID generation method (BUG-01 fix in Plan 01-05)
    // jsdom (vitest environment) provides crypto.randomUUID globally
    const id = crypto.randomUUID()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})

describe('listSnapshots / deleteSnapshot (regression)', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips a snapshot via saveSnapshot + listSnapshots', () => {
    saveSnapshot(minimalProject)
    const snaps = listSnapshots()
    expect(snaps).toHaveLength(1)
    expect(snaps[0]).toHaveProperty('id')
    expect(snaps[0]).toHaveProperty('ts')
  })

  it('deleteSnapshot removes only the targeted snapshot', () => {
    saveSnapshot(minimalProject)
    const [snap] = listSnapshots()
    deleteSnapshot(snap.id)
    expect(listSnapshots()).toHaveLength(0)
  })
})
