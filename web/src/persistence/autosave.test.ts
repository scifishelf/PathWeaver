import '@testing-library/jest-dom/vitest'
import { saveSnapshot, listSnapshots, deleteSnapshot } from './autosave'
import type { ProjectJSON } from '../cpm/types'

const minimalProject: ProjectJSON = {
  settings: { version: '1.0' },
  nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
  edges: [],
}

describe('saveCurrent / SaveResult (ERR-02)', () => {
  it.todo('returns { ok: true } on successful save')
  it.todo('returns { ok: false, error: "Speicher voll — ..." } when QuotaExceededError is thrown')
  it.todo('returns { ok: false, error: "Speichern fehlgeschlagen ..." } on generic error')
})

describe('saveSnapshot — random key suffix (BUG-02)', () => {
  beforeEach(() => localStorage.clear())

  it.todo('snapshot id contains a random suffix (not just timestamp digits)')
  it.todo('two snapshots created within 1ms have different ids')
})

describe('saveSnapshot — optional name (SNAP-01)', () => {
  beforeEach(() => localStorage.clear())

  it.todo('snapshot saved with name stores name in localStorage entry')
  it.todo('snapshot saved without name has undefined or absent name field')
  it.todo('listSnapshots() returns name field when present')
})

describe('Node ID generation (BUG-01)', () => {
  it.todo('new task node id matches UUID v4 pattern (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)')
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
