import type { ProjectJSON } from '../cpm/types'

const CURRENT_KEY = 'pw_autosave_current'
const SNAPSHOTS_KEY = 'pw_snapshots_v1'
const MAX_SNAPSHOTS = 10

export function saveCurrent(project: ProjectJSON) {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ ts: Date.now(), project }))
  } catch {}
}

export function loadCurrent(): { ts: number; project: ProjectJSON } | undefined {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    if (!raw) return undefined
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

export function saveSnapshot(project: ProjectJSON) {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: { id: string; ts: number; project: ProjectJSON }[] = raw ? JSON.parse(raw) : []
    const snap = { id: `${Date.now()}`, ts: Date.now(), project }
    list.unshift(snap)
    while (list.length > MAX_SNAPSHOTS) list.pop()
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list))
    return snap
  } catch {}
}

export function listSnapshots(): { id: string; ts: number }[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: { id: string; ts: number; project: ProjectJSON }[] = raw ? JSON.parse(raw) : []
    return list.map(({ id, ts }) => ({ id, ts }))
  } catch {
    return []
  }
}

export function loadSnapshot(id: string): ProjectJSON | undefined {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: { id: string; ts: number; project: ProjectJSON }[] = raw ? JSON.parse(raw) : []
    return list.find((s) => s.id === id)?.project
  } catch {
    return undefined
  }
}

export function deleteSnapshot(id: string) {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    const list: { id: string; ts: number; project: ProjectJSON }[] = raw ? JSON.parse(raw) : []
    const next = list.filter((s) => s.id !== id)
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next))
  } catch {}
}


