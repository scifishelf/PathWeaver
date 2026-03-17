import type { ProjectJSON } from '../cpm/types'

const CURRENT_KEY = 'pw_autosave_current'
const SNAPSHOTS_KEY = 'pw_snapshots_v1'
const MAX_SNAPSHOTS = 10

export interface SaveResult {
  ok: boolean
  error?: string
}

export function saveCurrent(project: ProjectJSON): SaveResult {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ ts: Date.now(), project }))
    return { ok: true }
  } catch (e) {
    console.error(e)
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, error: 'Storage full — please delete snapshots or export project as JSON' }
    }
    return { ok: false, error: 'Save failed — please reload the page or export project as JSON' }
  }
}

export function loadCurrent(): { ts: number; project: ProjectJSON } | undefined {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as { ts: number; project: ProjectJSON }
  } catch (e) {
    console.error(e)
    return undefined
  }
}

interface SnapshotEntry {
  id: string
  ts: number
  name?: string
  project: ProjectJSON
}

export function saveSnapshot(project: ProjectJSON, name?: string): SnapshotEntry | undefined {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: SnapshotEntry[] = raw ? (JSON.parse(raw) as SnapshotEntry[]) : []
    const snap: SnapshotEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      project,
    }
    if (name && name.trim().length > 0) {
      snap.name = name.trim()
    }
    list.unshift(snap)
    while (list.length > MAX_SNAPSHOTS) list.pop()
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list))
    return snap
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export function listSnapshots(): { id: string; ts: number; name?: string }[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: SnapshotEntry[] = raw ? (JSON.parse(raw) as SnapshotEntry[]) : []
    return list.map(({ id, ts, name }) => ({ id, ts, ...(name ? { name } : {}) }))
  } catch (e) {
    console.error(e)
    return []
  }
}

export function loadSnapshot(id: string): ProjectJSON | undefined {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: SnapshotEntry[] = raw ? (JSON.parse(raw) as SnapshotEntry[]) : []
    return list.find((s) => s.id === id)?.project
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export function deleteSnapshot(id: string): void {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: SnapshotEntry[] = raw ? (JSON.parse(raw) as SnapshotEntry[]) : []
    const next = list.filter((s) => s.id !== id)
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next))
  } catch (e) {
    console.error(e)
  }
}
