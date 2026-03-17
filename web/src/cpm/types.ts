export type NodeId = string
export type Workday = number // 0‑basiert ab Projektstart

export interface ProjectSettings {
  version: '1.0'
  startDate?: string // ISO
  workweek?: ReadonlyArray<number> // 1..7 (1=Mo)
}

export interface TaskNode {
  id: NodeId
  type: 'start' | 'task' | 'end'
  title?: string
  duration?: number // AT, Pflicht bei type='task'
  x?: number
  y?: number
}

export interface Edge {
  from: NodeId
  to: NodeId
}

export interface ProjectJSON {
  settings?: ProjectSettings
  nodes: TaskNode[]
  edges: Edge[]
}

export interface ComputedNode {
  ES: Workday
  EF: Workday
  LS: Workday
  LF: Workday
  slack: number
  critical: boolean
}

export interface ComputedResult {
  nodes: Record<NodeId, ComputedNode>
  criticalNodeIds: Set<NodeId>
  project: { durationAT: number; earliestFinishISO?: string }
}

export type ComputeErrorCode =
  | 'MISSING_START_END'
  | 'CYCLE'
  | 'ORPHAN'
  | 'UNREACHABLE_END'
  | 'START_HAS_INCOMING'
  | 'END_HAS_OUTGOING'
  | 'INVALID_DURATION'

export class ComputeError extends Error {
  public code: ComputeErrorCode
  constructor(code: ComputeErrorCode, message: string) {
    super(message)
    this.name = 'ComputeError'
    this.code = code
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ReactFlow node data types — discriminated union for type-safe node.data access
// One cast at the ReactFlow boundary; downstream code uses AppNodeData directly.
// ────────────────────────────────────────────────────────────────────────────

export interface TaskNodeData {
  type: 'task'
  id: string
  title: string
  duration: number
  computed?: ComputedNode
  onEdit: (id: string, patch: Partial<{ title: string; duration: number }>) => void
  startDate?: string
  focusOnMount?: boolean
}

export interface StartNodeData {
  type: 'start'
  label: string
  startDate?: string
  onChangeStartDate: (date: string) => void
}

export interface EndNodeData {
  type: 'end'
  label: string
  startDate?: string
  computed?: ComputedNode
}

export type AppNodeData = TaskNodeData | StartNodeData | EndNodeData
