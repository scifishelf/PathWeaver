# Phase 3: Algorithm & Guard Removal - Research

**Researched:** 2026-03-17
**Domain:** CPM algorithm correctness, ReactFlow 11 connection validation, TypeScript discriminated unions
**Confidence:** HIGH

## Summary

Phase 3 is a surgical, well-bounded change set with all change sites already identified in the codebase. The goal is to atomically remove the artificial 1-outgoing-edge constraint and fix critical-path highlighting for diamond/parallel topologies. The forward-pass CPM algorithm already handles merge nodes correctly (`Math.max` over predecessors — no change needed). The critical path walk, however, uses a greedy single-path approach that breaks for parallel critical paths and must be replaced with a Set-based approach. `isValidConnection` in GraphCanvas has a stale-closure bug and lacks cycle-detection BFS — both must be fixed atomically with the guard removal.

The pre-existing test suite has 11 failing tests caused by German vs. English error message mismatches between test expectations and implementation strings. These are pre-existing failures from v1.0 and are out of scope for Phase 3 — do not fix them during this phase. The 40 passing tests must remain green after Phase 3 changes.

**Primary recommendation:** Make all 7 changes in a single logical commit; partial removal leaves the graph visually broken (red borders + no CPM values) as documented in STATE.md.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ALGO-01 | Nutzer kann von einem Task-Knoten beliebig viele ausgehende Kanten zeichnen (Guard-Entfernung aus `compute.ts`, `types.ts`, `GraphCanvas.tsx` atomar) | Three exact change sites identified with line numbers |
| ALGO-02 | CPM-Berechnung ergibt korrekte FAZ-Werte bei Merge-Knoten (FAZ = max aller eingehenden FEZ) | Already correct — `Math.max(...preds.map(p => EF.get(p)))` at compute.ts:104; no algorithm change needed |
| ALGO-03 | Kritische-Pfad-Highlighting zeigt alle parallelen kritischen Äste (criticalNodeIds-Ansatz statt greedy single-path walk) | Greedy walk at compute.ts:149-159 identified; replacement pattern documented; ComputedResult type update required |
| ALGO-04 | Nutzer kann keinen Zyklus durch Drag-and-Drop erzeugen (BFS Cycle Detection in `isValidConnection` via `getEdges()`/`getOutgoers`) | ReactFlow 11 API confirmed: `getEdges()` on ReactFlowInstance, `getOutgoers(node, nodes, edges)` as standalone util; BFS pattern documented |
| ALGO-05 | Duplicate-Edge-Guard verhindert doppelte Kanten zwischen demselben Knoten-Paar | One-liner check using `getEdges()` result; documented below |
| ALGO-06 | `isValidConnection` liest aktuellen Kantenzustand via `getEdges()` statt stale closure | Confirmed: `useReactFlow().getEdges()` returns live state; closed-over `edges` state is stale |
| UX-01 | Multi-Successor-Knoten erhalten keinen roten Fehlerrahmen (`nodesWithTooManyOut` entfernt) | `nodesWithTooManyOut` used in 3 places: declaration at GraphCanvas:173, styledNodes at :220, styledEdges at :247; all must be removed |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| reactflow | ^11.11.4 | Graph canvas, connection validation, node state | Already in use; v12 explicitly out of scope |
| TypeScript | ~5.9.3 | Type safety throughout; discriminated unions | Already in use |
| Vitest | ^3.2.4 | Test framework | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @reactflow/core | (transitive) | `getOutgoers` standalone utility, `useReactFlow` hook | Cycle detection in `isValidConnection` |

**No new dependencies needed.** All required APIs are already in the installed ReactFlow 11.11.4.

---

## Architecture Patterns

### Recommended Project Structure

No structural changes needed. All changes are within existing files:

```
web/src/
├── cpm/
│   ├── compute.ts        # Remove MULTIPLE_OUTGOING guard; replace greedy path walk
│   └── types.ts          # Remove 'MULTIPLE_OUTGOING' from ComputeErrorCode; update ComputedResult
├── components/
│   └── GraphCanvas.tsx   # Fix isValidConnection; remove nodesWithTooManyOut; update styledEdges
```

### Pattern 1: Atomic Guard Removal (ALGO-01)

**What:** Remove the `MULTIPLE_OUTGOING` guard from three files in one commit. Any partial removal causes graph errors (CPM throws, nodes show red borders while still being rejected at creation).

**Files and exact change sites:**

**`compute.ts` lines 51–58** — delete the entire outCounts block:
```typescript
// DELETE THIS BLOCK:
const outCounts = new Map<NodeId, number>()
for (const n of nodes) outCounts.set(n.id, 0)
for (const e of edges) outCounts.set(e.from, (outCounts.get(e.from) ?? 0) + 1)
for (const n of nodes) {
  if (n.type === 'task' && (outCounts.get(n.id) ?? 0) > 1) {
    throw new ComputeError('MULTIPLE_OUTGOING', `More than 1 outgoing edge at node ${n.id}`)
  }
}
```

**`types.ts` line 50** — remove `'MULTIPLE_OUTGOING'` from the `ComputeErrorCode` union:
```typescript
// BEFORE:
export type ComputeErrorCode =
  | 'MISSING_START_END'
  | 'CYCLE'
  | 'ORPHAN'
  | 'UNREACHABLE_END'
  | 'MULTIPLE_OUTGOING'   // <-- DELETE THIS LINE
  | 'START_HAS_INCOMING'
  | 'END_HAS_OUTGOING'
  | 'INVALID_DURATION'
```

**`GraphCanvas.tsx` lines 57–61** — remove the outgoing-edge count check:
```typescript
// DELETE THESE LINES inside isValidConnection:
if (from.type === 'task') {
  const outCount = edges.filter((e) => e.source === from.id).length
  if (outCount >= 1) return false
}
```

### Pattern 2: Stale Closure Fix + BFS Cycle Detection (ALGO-04, ALGO-06)

**What:** `isValidConnection` currently closes over the `edges` state variable which may be stale at call time. Replace with `useReactFlow().getEdges()` which always reads live state from the ReactFlow store.

**Confirmed API (ReactFlow 11.11.4):**
- `useReactFlow()` returns `ReactFlowInstance` — has `getEdges(): Edge[]` and `getNodes(): Node[]`
- `getOutgoers(node, nodes, edges)` is a standalone exported utility (NOT a method on ReactFlowInstance)

```typescript
// Source: node_modules/@reactflow/core/dist/esm/types/instance.d.ts (verified)
// Source: node_modules/@reactflow/core/dist/esm/utils/graph.d.ts (verified)

import { getOutgoers, useReactFlow } from 'reactflow'

// Inside GraphCanvasInner — replace the existing useReactFlow() call:
const { getViewport, getEdges, getNodes } = useReactFlow()

const isValidConnection = useCallback(
  (conn: Connection) => {
    const liveEdges = getEdges()      // live state, not stale closure
    const liveNodes = getNodes()      // needed for getOutgoers BFS

    const from = liveNodes.find((n) => n.id === conn.source)
    const to   = liveNodes.find((n) => n.id === conn.target)
    if (!from || !to) return false
    if (to.id === 'start') return false
    if (from.id === 'end') return false

    // ALGO-05: Duplicate edge guard
    if (liveEdges.some((e) => e.source === conn.source && e.target === conn.target)) return false

    // ALGO-04: Cycle detection — would adding source→target create a cycle?
    // A cycle exists if target can already reach source
    const visited = new Set<string>()
    const queue = [conn.target!]
    while (queue.length) {
      const cur = queue.shift()!
      if (cur === conn.source) return false  // cycle detected
      if (visited.has(cur)) continue
      visited.add(cur)
      const curNode = liveNodes.find((n) => n.id === cur)
      if (curNode) {
        for (const outgoer of getOutgoers(curNode, liveNodes, liveEdges)) {
          queue.push(outgoer.id)
        }
      }
    }
    return true
  },
  [getEdges, getNodes]   // stable references from useReactFlow — no stale closure
)
```

**Note:** `getEdges` and `getNodes` from `useReactFlow()` are stable function references (they read from the ReactFlow store directly, not from React state), so including them in the `useCallback` dependency array is correct and does not cause unnecessary re-renders.

### Pattern 3: criticalNodeIds Set Approach (ALGO-03)

**What:** Replace the greedy single-path walk in `compute.ts` with a set of all nodes where `slack === 0`. Update `ComputedResult` type and all callsites.

**The problem with the current greedy walk (compute.ts:149–159):**
```typescript
// Current — broken for diamond graphs:
const path: NodeId[] = [start]
let cur = start
const visited = new Set<NodeId>([start])
while (cur !== end) {
  const succs = successors.get(cur) ?? []
  const next = succs.find((s) => (computedNodes[s]?.slack ?? 1) === 0)
  if (!next || visited.has(next)) break
  path.push(next)
  visited.add(next)
  cur = next
}
```

This picks the FIRST successor with `slack === 0` and discards any parallel critical branches.

**Replacement — return all critical node IDs:**
```typescript
// NEW: collect all nodes where slack === 0
const criticalNodeIds = new Set<NodeId>()
for (const [id, cn] of Object.entries(computedNodes)) {
  if (cn.slack === 0) criticalNodeIds.add(id)
}
```

**Update `ComputedResult` in `types.ts`:**
```typescript
// BEFORE:
export interface ComputedResult {
  nodes: Record<NodeId, ComputedNode>
  criticalPath: NodeId[]      // <-- greedy single path
  project: { durationAT: number; earliestFinishISO?: string }
}

// AFTER:
export interface ComputedResult {
  nodes: Record<NodeId, ComputedNode>
  criticalPath: NodeId[]          // keep for backward compat — derive from criticalNodeIds
  criticalNodeIds: Set<NodeId>    // NEW: all nodes with slack === 0
  project: { durationAT: number; earliestFinishISO?: string }
}
```

**Alternative:** Remove `criticalPath` entirely and derive it only in the return statement as the topo-ordered subset of `criticalNodeIds`. Check all callers — only `GraphCanvas.tsx` consumes `cp.criticalPath`. Simplest approach: replace `criticalPath` with `criticalNodeIds` and update GraphCanvas accordingly.

**Update `styledEdges` in GraphCanvas.tsx:**
```typescript
// BEFORE — uses criticalPath array to build cpPairs:
const cpPairs = new Set<string>()
if (cp?.criticalPath) {
  for (let i = 0; i < cp.criticalPath.length - 1; i++) {
    cpPairs.add(cp.criticalPath[i] + '→' + cp.criticalPath[i + 1])
  }
}
const onCp = cpPairs.has(e.source + '→' + e.target)

// AFTER — use criticalNodeIds: edge is on CP if BOTH endpoints are critical
const criticalIds = cp?.criticalNodeIds ?? new Set<string>()
const onCp = criticalIds.has(e.source!) && criticalIds.has(e.target!)
```

**Update `styledNodes` (if any node critical check references criticalPath):**
The `styledNodes` useMemo does not use `criticalPath` directly — it passes `computed?.[n.id]` to each node, and the `ComputedNode.critical` boolean handles node highlighting. No change needed in `styledNodes`.

### Pattern 4: Remove nodesWithTooManyOut (UX-01)

**What:** The `nodesWithTooManyOut` Set drives red error borders for nodes with >1 outgoing edge. After ALGO-01, this state becomes both incorrect (no longer an error) and redundant (prevented at connection time).

**Three removal sites in GraphCanvas.tsx:**

1. **Declaration** (lines 173–179): Delete the `nodesWithTooManyOut = useMemo(...)` block entirely.

2. **styledNodes** (line 220): Remove `nodesWithTooManyOut.has(n.id)` from the orphan check condition:
```typescript
// BEFORE:
if (orphan.has(n.id) || nodesWithTooManyOut.has(n.id)) {

// AFTER:
if (orphan.has(n.id)) {
```

3. **styledEdges** (line 247): Remove `nodesWithTooManyOut.has(e.source!)` from the invalid check:
```typescript
// BEFORE:
const invalid = e.target === startId || nodesWithTooManyOut.has(e.source!) || cycle

// AFTER:
const invalid = e.target === startId || cycle
```

4. **styledEdges dependency array** (line 263): Remove `nodesWithTooManyOut` from the `useMemo` deps.

### Anti-Patterns to Avoid

- **Partial guard removal:** Removing only from `GraphCanvas.tsx` (isValidConnection) while leaving the `compute.ts` guard means new multi-successor graphs created by other means would cause compute errors. All three files must change atomically.
- **Keeping greedy walk alongside criticalNodeIds:** Don't keep the old greedy walk — it produces misleading output and the Set approach is strictly better. One clean replacement.
- **Using closed-over `nodes`/`edges` in isValidConnection:** After the fix, only `getEdges()`/`getNodes()` from `useReactFlow()` should be used inside `isValidConnection`.
- **Self-loops:** The cycle detection BFS naturally rejects self-loops (target === source), but consider adding an explicit check `if (conn.source === conn.target) return false` before the BFS for clarity.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cycle detection | Custom adjacency traversal from scratch | BFS using `getOutgoers` + `getEdges()` from ReactFlow | `getOutgoers` handles ReactFlow's internal node lookup correctly |
| Edge deduplication logic | Complex state management | Simple `.some()` check on `getEdges()` result | One liner; reads live state |
| Node reachability in CPM | Second BFS implementation | Already exists at compute.ts:61–75 | Don't duplicate — the CPM layer handles this at compute time |

**Key insight:** ReactFlow 11 provides `getEdges()` on the instance (reads live store state, bypasses React's stale closure problem) and `getOutgoers` as a graph utility. Using these is the correct approach rather than maintaining parallel state.

---

## Common Pitfalls

### Pitfall 1: Stale `edges` in isValidConnection
**What goes wrong:** `isValidConnection` is called during drag, but the `edges` closed over may be from a previous render cycle. Fast drag-and-drop can miss recently added edges, allowing duplicate or cycle-creating connections.
**Why it happens:** `useCallback` with `[nodes, edges]` captures the values at hook creation time. Between renders, `edges` is stale.
**How to avoid:** Use `getEdges()` from `useReactFlow()` inside `isValidConnection`. Remove `edges` from the dependency array entirely; keep only `[getEdges, getNodes]`.
**Warning signs:** Duplicate edges appearing in the graph, cycle detection failing on rapid sequential drag operations.

### Pitfall 2: criticalPath greedy walk silently drops parallel paths
**What goes wrong:** In a diamond graph where both branches have equal duration, only one branch is highlighted as critical. The algorithm appears to work (no errors, duration is correct) but the visualization is wrong.
**Why it happens:** `Array.find()` returns the first match; in `succs.find(s => slack === 0)`, only one successor per node is followed.
**How to avoid:** Replace the entire greedy walk with `Set<NodeId>` of all nodes where `slack === 0`. All edges connecting two critical nodes are critical edges.
**Warning signs:** Diamond topology test showing only one arm highlighted despite equal durations.

### Pitfall 3: ComputedResult type change breaks TypeScript callers
**What goes wrong:** If `criticalPath: NodeId[]` is removed without updating all consumers, TypeScript compilation fails.
**Why it happens:** `cp?.criticalPath` is referenced in `styledEdges` in GraphCanvas.tsx.
**How to avoid:** Update the type and all callers atomically. Only one consumer: `styledEdges` in `GraphCanvas.tsx`. Check with `grep -n "criticalPath"` before finalizing.
**Warning signs:** `tsc` errors after changing `ComputedResult`.

### Pitfall 4: getOutgoers signature
**What goes wrong:** Calling `getOutgoers(nodeId, nodes, edges)` with a string ID instead of a Node object.
**Why it happens:** Mistaking it for an ID-based lookup.
**How to avoid:** `getOutgoers` takes a `Node` object as first argument (confirmed from `graph.d.ts`). Always find the node first: `const curNode = liveNodes.find(n => n.id === cur)`.
**Warning signs:** TypeScript error: `Argument of type 'string' is not assignable to parameter of type 'Node'`.

### Pitfall 5: Pre-existing test failures misattributed to Phase 3
**What goes wrong:** The test run shows 11 failing tests — these are ALL pre-existing from v1.0 (German error message strings in tests don't match English strings in implementation). Phase 3 changes must not introduce any NEW failures.
**Why it happens:** Test expectations were written in German (`/Start hat Eingänge/i`, `/nicht mit Start verbunden/i`) but the implementation uses English (`'Start has incoming edges'`, `'Node X is not connected to Start'`).
**How to avoid:** Run the test suite before starting Phase 3 work. Record the baseline (40 passing, 11 failing). After Phase 3, the count should be: 40+ passing (new tests added), same 11 failing (untouched).
**Warning signs:** Any previously-passing test turning red after Phase 3.

---

## Code Examples

Verified patterns from official sources and codebase analysis:

### ReactFlow 11: getEdges() and getNodes() from useReactFlow (ALGO-06)
```typescript
// Source: node_modules/@reactflow/core/dist/esm/types/instance.d.ts (verified)
// ReactFlowInstance has:
//   getEdges: () => Edge[]
//   getNodes: () => Node[]
// These read directly from the ReactFlow store — always current, no stale closure.

const { getViewport, getEdges, getNodes } = useReactFlow()
```

### ReactFlow 11: getOutgoers standalone utility (ALGO-04)
```typescript
// Source: node_modules/@reactflow/core/dist/esm/utils/graph.d.ts (verified)
// Signature: getOutgoers<T>(node: Node<T>, nodes: Node<T>[], edges: Edge[]): Node<T>[]
// NOT on ReactFlowInstance — import directly from 'reactflow'

import { getOutgoers } from 'reactflow'
const outgoers = getOutgoers(nodeObject, allNodes, allEdges)
```

### BFS Cycle Detection for isValidConnection
```typescript
// Would connecting source → target create a cycle?
// = Can we reach source by starting at target and following existing edges?
const wouldCreateCycle = (sourceId: string, targetId: string, liveNodes: Node[], liveEdges: Edge[]): boolean => {
  const visited = new Set<string>()
  const queue = [targetId]
  while (queue.length) {
    const cur = queue.shift()!
    if (cur === sourceId) return true
    if (visited.has(cur)) continue
    visited.add(cur)
    const curNode = liveNodes.find((n) => n.id === cur)
    if (curNode) {
      for (const outgoer of getOutgoers(curNode, liveNodes, liveEdges)) {
        queue.push(outgoer.id)
      }
    }
  }
  return false
}
```

### criticalNodeIds Set — forward-pass already correct, only return value changes
```typescript
// Source: compute.ts analysis — ALGO-02 confirmed: forward pass is already correct.
// Line 104: const maxEF = preds.length ? Math.max(...preds.map((p) => EF.get(p) ?? 0)) : 0
// This correctly handles merge nodes. No algorithm change needed.

// Only the RETURN value changes — replace greedy walk with:
const criticalNodeIds = new Set<NodeId>(
  Object.entries(computedNodes)
    .filter(([, cn]) => cn.slack === 0)
    .map(([id]) => id)
)

return {
  nodes: computedNodes,
  criticalNodeIds,           // replaces criticalPath
  project: { durationAT, earliestFinishISO },
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Greedy single critical path walk | criticalNodeIds Set (slack === 0 for all) | Phase 3 | Enables correct diamond/parallel path highlighting |
| Closed-over `edges` in isValidConnection | `getEdges()` from `useReactFlow()` | Phase 3 | Prevents stale-state bugs on rapid drag-and-drop |
| 1-outgoing-edge constraint (structural cycle prevention) | Explicit BFS cycle detection | Phase 3 | Allows fan-out topology while preserving cycle safety |

**Deprecated/outdated after Phase 3:**
- `MULTIPLE_OUTGOING` error code: removed from `ComputeErrorCode` union and from `compute.ts`
- `nodesWithTooManyOut` useMemo: removed from `GraphCanvas.tsx`
- `criticalPath: NodeId[]` in `ComputedResult`: replaced by `criticalNodeIds: Set<NodeId>`

---

## Open Questions

1. **Should `criticalPath: NodeId[]` be kept alongside `criticalNodeIds`?**
   - What we know: Only one consumer (`GraphCanvas.tsx` styledEdges). The greedy path is used to build `cpPairs` for edge highlighting only.
   - What's unclear: Whether any future consumer (Phase 4, export) might want an ordered path.
   - Recommendation: Remove `criticalPath` entirely in Phase 3 and derive edge highlighting directly from `criticalNodeIds`. Simpler is better. If a future phase needs ordered path, it can be computed then.

2. **Self-loop prevention**
   - What we know: BFS cycle detection handles `source === target` (BFS immediately finds source at target start, returns `false`). But this requires the BFS to start and immediately check `cur === sourceId`.
   - What's unclear: Whether the BFS as written correctly handles the case where `targetId === sourceId`.
   - Recommendation: Add explicit `if (conn.source === conn.target) return false` before the BFS call as defensive guard.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `web/vite.config.ts` (test section) |
| Quick run command | `cd web && npx vitest run src/cpm/compute.test.ts` |
| Full suite command | `cd web && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ALGO-01 | Multi-outgoing edges no longer throw `MULTIPLE_OUTGOING` | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ Wave 0 — needs new test |
| ALGO-02 | Merge node FAZ = max of all incoming FEZ (already correct) | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ Wave 0 — needs diamond test |
| ALGO-03 | Diamond graph highlights both branches | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ Wave 0 — needs diamond test |
| ALGO-04 | Cycle creation rejected at connection time | unit | `cd web && npx vitest run src/graph/validate.test.ts` | ❌ Wave 0 — isValidConnection logic is UI; test via compute.ts CYCLE detection |
| ALGO-05 | Duplicate edge rejected | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ Wave 0 — needs test |
| ALGO-06 | Stale closure fix | manual-only | n/a | — Stale closure behavior not unit-testable in isolation |
| UX-01 | No red border on multi-successor nodes | unit | `cd web && npx vitest run src/graph/TaskNode.test.tsx` | ❌ Wave 0 — existing TaskNode tests don't cover border logic for multi-successor |

### Sampling Rate
- **Per task commit:** `cd web && npx vitest run src/cpm/compute.test.ts`
- **Per wave merge:** `cd web && npx vitest run`
- **Phase gate:** Full suite green (on currently-passing 40 tests) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `web/src/cpm/compute.test.ts` — add: "fan-out: multi-successor node does not throw MULTIPLE_OUTGOING" (ALGO-01)
- [ ] `web/src/cpm/compute.test.ts` — add: "diamond graph: both branches highlighted, durationAT correct" (ALGO-02, ALGO-03)
- [ ] `web/src/cpm/compute.test.ts` — add: `criticalNodeIds` is a `Set<string>` containing all zero-slack nodes (ALGO-03)
- [ ] `web/src/cpm/compute.test.ts` — update: `criticalPath` reference → `criticalNodeIds` if type changes (ALGO-03)

---

## Sources

### Primary (HIGH confidence)
- Codebase direct analysis — `web/src/cpm/compute.ts` full read with line-by-line inspection
- Codebase direct analysis — `web/src/cpm/types.ts` full read
- Codebase direct analysis — `web/src/components/GraphCanvas.tsx` full read
- Codebase direct analysis — `web/src/graph/validate.ts` full read
- `node_modules/@reactflow/core/dist/esm/types/instance.d.ts` — confirms `getEdges()` and `getNodes()` on `ReactFlowInstance`
- `node_modules/@reactflow/core/dist/esm/utils/graph.d.ts` — confirms `getOutgoers(node, nodes, edges)` signature
- `.planning/STATE.md` — confirms atomic removal requirement and BFS design decision

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — requirements verified against code analysis
- `.planning/PROJECT.md` — constraints confirmed (ReactFlow 11, no upgrades)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — ReactFlow 11 API verified from installed node_modules type definitions
- Architecture: HIGH — all change sites identified with exact line numbers from direct code read
- Algorithm correctness: HIGH — forward pass verified as already correct; only return type and walk need changing
- Pitfalls: HIGH — stale closure confirmed from code; test failures confirmed from test run

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable codebase, no external API dependencies changing)
