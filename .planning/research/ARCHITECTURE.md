# Architecture Research

**Domain:** Multi-Predecessor/Multi-Successor CPM Graph — PathWeaver v2.0
**Researched:** 2026-03-17
**Confidence:** HIGH (based on direct codebase inspection of all relevant source files)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer                                 │
├──────────────────┬──────────────────────┬───────────────────────┤
│   App.tsx        │   GraphCanvas.tsx     │   AppToolbar.tsx      │
│ (header, modals) │ (orchestrator,        │ (export, import,      │
│                  │  state, CPM trigger,  │  snapshot UI)         │
│                  │  edge/node styling)   │                       │
├──────────────────┴──────────────────────┴───────────────────────┤
│                     Graph / Node Layer                           │
├──────────────┬──────────────────┬────────────────────────────────┤
│  TaskNode    │  StartNode       │  EndNode                       │
│  (DIN 69900  │  (date picker)   │  (displays EF)                 │
│   grid,      │                  │                                │
│   inline     │                  │                                │
│   edit)      │                  │                                │
├──────────────┴──────────────────┴────────────────────────────────┤
│                  Business Logic Layer                            │
├───────────────────────────┬─────────────────────────────────────┤
│  cpm/compute.ts           │  graph/validate.ts                   │
│  (ES/EF/LS/LF, critical   │  (cycle detection, orphan check,     │
│   path, topoSort)         │   ReactFlow-facing)                  │
├───────────────────────────┴─────────────────────────────────────┤
│                   Persistence Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  persistence/serialize.ts      persistence/autosave.ts          │
│  (ProjectJSON <-> ReactFlow     (localStorage, snapshots)       │
│   node/edge conversion)                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Key State |
|-----------|----------------|-----------|
| `App.tsx` | Header, help/info overlays, layout | `helpOpen`, `whyCpmOpen` |
| `GraphCanvas.tsx` | Single orchestrator: RF state, CPM trigger, validation, autosave, error display, edge/node styling | `nodes`, `edges`, `errors`, `cp`, `startDate` |
| `TaskNode.tsx` | DIN 69900 grid rendering, inline edit (title, duration), computed value display | Local input state |
| `cpm/compute.ts` | Pure CPM: topological sort, forward pass (ES/EF), backward pass (LS/LF), critical path | Stateless pure function |
| `graph/validate.ts` | ReactFlow-facing graph validation (operates on RF Node/Edge types) | Stateless pure function |
| `persistence/serialize.ts` | Bidirectional conversion: ProjectJSON <-> RF nodes+edges | Stateless pure functions |
| `persistence/autosave.ts` | localStorage read/write, snapshot management | localStorage |

---

## Where the 1-Outgoing-Edge Constraint Lives

The constraint exists in **three separate locations**. All three must be addressed.

### Location 1 — `components/GraphCanvas.tsx` lines 57-61: UX gate

```typescript
// isValidConnection callback, passed to <ReactFlow isValidConnection={...}>
if (from.type === 'task') {
  const outCount = edges.filter((e) => e.source === from.id).length
  if (outCount >= 1) return false   // blocks the drag gesture
}
```

This is the **primary user-facing gate**. Removing these 4 lines immediately allows users to draw multiple outgoing edges from task nodes.

### Location 2 — `cpm/compute.ts` lines 51-58: Algorithm gate

```typescript
const outCounts = new Map<NodeId, number>()
for (const n of nodes) outCounts.set(n.id, 0)
for (const e of edges) outCounts.set(e.from, (outCounts.get(e.from) ?? 0) + 1)
for (const n of nodes) {
  if (n.type === 'task' && (outCounts.get(n.id) ?? 0) > 1) {
    throw new ComputeError('MULTIPLE_OUTGOING', `More than 1 outgoing edge at node ${n.id}`)
  }
}
```

This is a **pure function-level guard** — even if the UI permits multi-outgoing edges, the CPM engine throws `ComputeError('MULTIPLE_OUTGOING', ...)`. This entire block is dead code once the feature is fully implemented and must be deleted.

### Location 3 — `components/GraphCanvas.tsx` lines 173-179: Error visualization set

```typescript
const nodesWithTooManyOut = useMemo(() => {
  const s = new Set<string>()
  for (const n of nodes) {
    if (n.type === 'task' && (outgoingCount.get(n.id) || 0) > 1) s.add(n.id)
  }
  return s
}, [nodes, outgoingCount])
```

This `useMemo` produces a set of nodes flagged as "too many outgoing edges." It feeds **two consumers**:
- Node styling: adds a red error border to flagged nodes
- Edge styling: the condition `nodesWithTooManyOut.has(e.source!)` marks those edges red

After removing the constraint, this entire `useMemo` and both consuming references must be deleted to prevent false error coloring.

### Location 4 — `cpm/types.ts` line 50: Dead error code

```typescript
| 'MULTIPLE_OUTGOING'
```

The `ComputeErrorCode` discriminated union includes this code. It becomes a dead type entry once the throw is removed from `compute.ts`. Remove it.

---

## CPM Algorithm: What Changes for Merge Nodes (Fan-in)

### Forward Pass — Already Correct

The existing forward pass at `compute.ts:104` already handles merge nodes:

```typescript
const maxEF = preds.length ? Math.max(...preds.map((p) => EF.get(p) ?? 0)) : 0
ES.set(n, maxEF)
```

`ES = max(EF of all predecessors)` is the correct DIN 69900 / CPM rule for merge nodes (FAZ = max of all incoming FEZ). This works for any number of predecessors — 1, 2, or N.

### Backward Pass — Already Correct

The backward pass at `compute.ts:124` also handles multiple successors:

```typescript
const minLS = succs.length ? Math.min(...succs.map((s) => LS.get(s)!)) : (EF.get(n) ?? 0)
```

`LF = min(LS of all successors)` is correct for split nodes (fan-out). Multiple outgoing edges are already handled here.

**Conclusion:** The forward and backward pass algorithms do not need to change. The CPM math is already multi-predecessor and multi-successor safe. Only the guard that prevents execution must be removed.

### Critical Path Traversal — Needs a Fix

The `criticalPath` assembly at `compute.ts:148-158` uses a greedy single-path walk:

```typescript
const path: NodeId[] = [start]
let cur = start
const visited = new Set<NodeId>([start])
while (cur !== end) {
  const succs = successors.get(cur) ?? []
  const next = succs.find((s) => (computedNodes[s]?.slack ?? 1) === 0)
  if (!next || visited.has(next)) break  // finds first critical successor only
  path.push(next)
  visited.add(next)
  cur = next
}
```

In a diamond graph (A and B both critical, both merge into C), this traversal picks only one branch. The returned `criticalPath` array is still useful for the duration banner (project duration is correct regardless), but it cannot be used for **edge highlighting** in a multi-path graph.

**Recommended change:** Keep the `criticalPath` traversal for the duration calculation. For edge highlighting, switch to a `ComputedNode.critical` per-node approach in `GraphCanvas.tsx` (see Pattern 3 below). This is a targeted, non-breaking fix.

---

## Data Flow: Current vs. After v2.0

### Current Flow (v1.0)

```
User drags edge
  -> isValidConnection: blocks if task already has >=1 outgoing edge
  -> onConnect -> addEdge -> setEdges

edges/nodes change
  -> useEffect -> validateGraph (ReactFlow-facing, no outgoing-count check)
  -> setErrors

errors.length === 0
  -> computeCPM: throws on MULTIPLE_OUTGOING
  -> cp = ComputedResult

cp.criticalPath (linear NodeId[])
  -> cpPairs = Set<"id1->id2"> built from sequential path walk
  -> edge style: cyan if in cpPairs, red if nodesWithTooManyOut or invalid

ComputedNode.critical
  -> TaskNode background tint (cyan for critical nodes)
```

### Target Flow (v2.0)

```
User drags edge
  -> isValidConnection: blocks only start-incoming, end-outgoing, duplicate edges, self-loops
  -> onConnect -> addEdge -> setEdges

edges/nodes change
  -> useEffect -> validateGraph (unchanged — already no outgoing-count check)
  -> setErrors

errors.length === 0
  -> computeCPM (MULTIPLE_OUTGOING guard removed)
  -> cp = ComputedResult

cp.nodes[id].critical (per-node boolean, true for all nodes on any critical path)
  -> criticalNodeIds = Set<NodeId> derived in GraphCanvas
  -> edge is critical if source.critical === true AND target.critical === true
  -> edge style: cyan for critical edges, default for valid non-critical edges

ComputedNode.critical
  -> TaskNode background tint (unchanged)
```

---

## Recommended Project Structure

No structural changes needed. All changes are targeted modifications within existing files:

```
web/src/
├── cpm/
│   ├── compute.ts        MODIFIED: remove MULTIPLE_OUTGOING guard + fix criticalPath
│   ├── compute.test.ts   MODIFIED: add multi-predecessor tests, remove MULTIPLE_OUTGOING test
│   └── types.ts          MODIFIED: remove 'MULTIPLE_OUTGOING' from ComputeErrorCode
├── components/
│   └── GraphCanvas.tsx   MODIFIED: 3 targeted changes (see below)
└── graph/
    └── validate.ts       NO CHANGE
```

`validate.ts` requires no changes. It already does not check outgoing counts — it validates only structural correctness (cycles, orphans, missing start/end). The constraint was always only in `GraphCanvas.tsx` (UX) and `compute.ts` (algorithm).

---

## Architectural Patterns

### Pattern 1: CPM as Pure Function — Isolation Enables Safe Refactoring

**What:** `computeCPM(ProjectJSON): ComputedResult` has no React dependencies, no side effects. All algorithm changes are verifiable via unit tests without mounting any component.

**When to use:** All CPM logic changes go through `compute.ts` first, tests second, then UI updates.

**Trade-offs:** The purity is a constraint — `compute.ts` cannot access React state directly. This is the right constraint: it keeps the algorithm testable. The integration point is the `useMemo` in `GraphCanvas.tsx` that calls `computeCPM`.

**Example:**
```typescript
// Test a multi-predecessor diamond before touching any UI code
const plan: ProjectJSON = {
  nodes: [start, A, B, C, end],
  edges: [start->A, start->B, A->C, B->C, C->end]
  // A: duration 5, B: duration 3, C: duration 2
}
const result = computeCPM(plan)
expect(result.nodes['C'].ES).toBe(5)  // max(EF_A=5, EF_B=3)
expect(result.nodes['C'].critical).toBe(true)
expect(result.nodes['A'].critical).toBe(true)
expect(result.nodes['B'].critical).toBe(false)  // B has slack
```

### Pattern 2: `isValidConnection` as the Single UX Gate

**What:** ReactFlow's `isValidConnection` callback is the only place where edge creation is blocked at the interaction level. It is synchronous, runs on every drag-connect attempt, and returning `false` cancels the gesture visually without error.

**When to use:** All UX-level edge rules live here. Structural rules (cycles, orphans) belong in `validateGraph`. Algorithm rules (correct CPM input) belong in `computeCPM`.

**After v2.0, the complete set of UX rules:**
```typescript
const isValidConnection = useCallback((conn: Connection) => {
  if (!conn.source || !conn.target) return false
  if (conn.target === 'start') return false           // start has no incoming
  if (conn.source === 'end') return false             // end has no outgoing
  if (conn.source === conn.target) return false       // no self-loops
  // Prevent duplicate edges (same source -> same target)
  const duplicate = edges.some(e => e.source === conn.source && e.target === conn.target)
  if (duplicate) return false
  return true
}, [edges])
```

The duplicate-edge guard is the **replacement** for the outgoing-count guard. It is the only new rule needed.

**Trade-offs:** This guard operates on the current `edges` state snapshot. Because `isValidConnection` closes over `edges` via `useCallback([edges])`, it stays current. The duplicate guard is O(n) on edge count — negligible for any realistic project graph.

### Pattern 3: Derive Critical Edge Set from Per-Node `critical` Flag

**What:** For highlighting critical path edges in a multi-branch graph, derive criticality from `ComputedNode.critical` (per-node boolean) rather than from the `criticalPath: NodeId[]` array (which only captures one path).

**When to use:** Replace `cpPairs` in `styledEdges` with this approach.

**Trade-offs:**
- Pro: Correctly highlights all critical edges in any graph topology (parallel paths, diamonds, converging branches)
- Pro: No change to `ComputedResult` type — `criticalPath: NodeId[]` is kept for the banner
- Con: An edge where both endpoints are critical is assumed to be a critical edge. In a pathological graph (node A has two outgoing edges to two different critical nodes, but only one branch leads to the critical path), this could over-highlight one edge. In practice this is visually acceptable and matches how project management tools show results.

**Example — replacing cpPairs in styledEdges:**
```typescript
// Build criticalNodeIds once from cp results
const criticalNodeIds = useMemo(() => {
  if (!cp) return new Set<string>()
  return new Set(
    Object.entries(cp.nodes)
      .filter(([, c]) => c.critical)
      .map(([id]) => id)
  )
}, [cp])

// In styledEdges:
const onCp = criticalNodeIds.has(e.source!) && criticalNodeIds.has(e.target!)
```

---

## Component Boundaries: New vs. Modified

### No New Files Required

The existing layer separation cleanly contains all changes. This is a **removal-and-replacement milestone** — no new components, files, or hooks.

### Modified Files Only

| File | Change Type | Lines Affected (approx.) | Description |
|------|-------------|--------------------------|-------------|
| `cpm/compute.ts` | Remove block | Lines 46 (comment), 51-58 | Delete MULTIPLE_OUTGOING guard entirely |
| `cpm/compute.ts` | Optional improvement | Lines 148-158 | criticalPath traversal: no functional change needed if using per-node approach |
| `cpm/types.ts` | Remove type entry | Line 50 | Remove `'MULTIPLE_OUTGOING'` from ComputeErrorCode |
| `graph/validate.ts` | No change | — | Already no outgoing-count check |
| `components/GraphCanvas.tsx` | Remove 4 lines | Lines 57-60 | Delete outgoing-count guard from isValidConnection |
| `components/GraphCanvas.tsx` | Add 2 lines | Near isValidConnection | Add duplicate-edge guard |
| `components/GraphCanvas.tsx` | Remove useMemo | Lines 173-179 | Delete nodesWithTooManyOut |
| `components/GraphCanvas.tsx` | Remove references | Lines 220, 247 | Remove nodesWithTooManyOut.has() from styledNodes and styledEdges |
| `components/GraphCanvas.tsx` | Replace cpPairs | Lines 240-244, 248 | Switch from cpPairs (path-based) to criticalNodeIds (node-based) |
| `cpm/compute.test.ts` | Add + remove tests | New describe block | Add multi-predecessor diamond tests; remove/update MULTIPLE_OUTGOING test if any |

---

## Build Order (Dependency-Aware)

### Step 1 — CPM Algorithm (Foundation)

**Why first:** All UI and test changes depend on the algorithm being correct and not throwing. Tests written in this step prove the algorithm before touching UI.

**Changes:**
- `cpm/compute.ts`: Delete the MULTIPLE_OUTGOING guard block (lines 51-58 and line 46 comment)
- `cpm/compute.test.ts`: Add multi-predecessor test cases (diamond, parallel, fan-out + fan-in)

**Tests to add:**
```typescript
it('handles diamond graph (fan-out + fan-in): ES at merge node = max(predecessors EF)', ...)
it('marks parallel branches: only longest branch is critical', ...)
it('fan-out: start->A and start->B are both valid', ...)
```

**Unblocks:** Everything else. With the algorithm guard removed, Steps 2-4 become safe.

### Step 2 — Type Cleanup

**Why second:** Clean up dead code from the type system before touching the UI.

**Changes:**
- `cpm/types.ts`: Remove `'MULTIPLE_OUTGOING'` from `ComputeErrorCode`

**Note:** If any test asserts `thrown?.code === 'MULTIPLE_OUTGOING'`, that test must be deleted in this step.

### Step 3 — UI Connection Guard (Unblocks User Interaction)

**Why third:** Depends on algorithm being correct (Step 1). This is the change users see directly.

**Changes in `GraphCanvas.tsx`:**
- Delete the 4-line outgoing-count check from `isValidConnection` (lines 57-60)
- Add duplicate-edge guard to `isValidConnection` (2 lines)

### Step 4 — Remove Error Visualization Set

**Why fourth:** Depends on Step 3 (need to update the same function and surrounding useMemo blocks together to avoid referencing deleted state).

**Changes in `GraphCanvas.tsx`:**
- Delete `nodesWithTooManyOut` useMemo
- Remove `nodesWithTooManyOut.has(n.id)` from `styledNodes` condition (line 220)
- Remove `nodesWithTooManyOut.has(e.source!)` from `styledEdges` invalid condition (line 247)

### Step 5 — Edge Highlighting Fix

**Why fifth:** Depends on Step 4 (the `styledEdges` block is touched in both Step 4 and Step 5 — batch cleanly).

**Changes in `GraphCanvas.tsx`:**
- Add `criticalNodeIds` useMemo derived from `cp.nodes`
- Replace `cpPairs` and its population loop with `onCp = criticalNodeIds.has(source) && criticalNodeIds.has(target)`

### Step 6 — Regression Testing

**Changes:**
- Run all 44 existing tests — all should still pass (no regressions)
- The CPM test for the first `describe` block (`'berechnet Beispiel aus PRD'`) already tests a multi-predecessor graph (A->C and B->C both feed C); this test was passing before because `start->A` and `start->B` are single-outgoing from start (not task nodes). Verify it still passes.
- Verify HelpOverlay documentation is accurate (update shortcut reference or help text if it mentions "1 outgoing edge" anywhere)

---

## Anti-Patterns

### Anti-Pattern 1: Removing Only the UI Guard

**What people do:** Delete the `isValidConnection` outgoing-count check but leave the `MULTIPLE_OUTGOING` throw in `compute.ts`.

**Why it's wrong:** Users can draw multi-outgoing edges, but `computeCPM` throws and `cp` becomes `undefined`. All nodes show uncalculated (no ES/EF values). The critical path banner disappears. The graph appears broken.

**Do this instead:** Remove both guards atomically in the same commit, with tests verifying the algorithm handles the inputs correctly.

### Anti-Pattern 2: Changing `criticalPath: NodeId[]` to a Multi-Path Type

**What people do:** Change `ComputedResult.criticalPath` to `NodeId[][]` or `{ paths: NodeId[][] }` to represent multiple simultaneous critical paths.

**Why it's wrong:** High blast radius — affects `AppToolbar.tsx` (exports computed), the CP duration banner, `serialize.ts`, and all existing tests that assert on `criticalPath`. The type change is not necessary: `ComputedNode.critical` already marks all critical nodes regardless of topology.

**Do this instead:** Keep `criticalPath: NodeId[]` for the duration banner. Use `ComputedNode.critical` for edge/node visual highlighting.

### Anti-Pattern 3: Adding a Dedicated "Merge Node" Type

**What people do:** Introduce a new ReactFlow node type (`type: 'merge'`) to explicitly represent fan-in points.

**Why it's wrong:** DIN 69900 does not use separate merge node symbols. Any task node receiving multiple incoming edges is already a merge node — the CPM algorithm handles this implicitly. Adding a node type changes the ProjectJSON schema (version bump required), expands the discriminated union, and complicates the UX with no benefit.

**Do this instead:** Treat multi-incoming-edge nodes as implicit merge nodes. No special handling or visual differentiation needed.

### Anti-Pattern 4: Forgetting the Duplicate-Edge Guard

**What people do:** Remove the outgoing-count guard and add nothing in its place.

**Why it's wrong:** ReactFlow does not prevent connecting the same two nodes twice. A duplicate edge (`A -> B` twice) creates ambiguity in the CPM algorithm (both edges appear in the predecessor/successor maps, but `ES` will still be calculated correctly — however, two identical edges provide no additional information and can confuse users). The edge ID collision in `serialize.ts` (`"${from}-${to}"`) would also cause ReactFlow to silently discard the second edge on import.

**Do this instead:** Replace the outgoing-count guard with a duplicate-edge guard in `isValidConnection`. This is a 2-line addition.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Change for v2.0 |
|----------|---------------|-----------------|
| `GraphCanvas.tsx` -> `computeCPM` | Direct call in `useMemo`, passes `ProjectJSON`-shaped object | No interface change — MULTIPLE_OUTGOING guard is internal to computeCPM |
| `GraphCanvas.tsx` -> `validateGraph` | Direct call in `useCallback` (ReactFlow types) | No change — validate.ts has never checked outgoing counts |
| `computeCPM` -> `TaskNode` via `data.computed` | `ComputedNode` shape passed as prop | No change — `ComputedNode.critical` flag already exists |
| `serialize.ts` -> `computeCPM` | `toProjectJSON` output | No change — edge schema `{ from, to }` supports multiple edges per node already |
| `GraphCanvas.tsx` styledEdges | Currently uses `cpPairs` from `criticalPath` | Change to `criticalNodeIds` from `cp.nodes` (see Pattern 3) |

### ReactFlow 11 Specifics (HIGH confidence — confirmed by codebase)

- `isValidConnection` is the **only ReactFlow hook controlling edge creation** at the drag level. No other ReactFlow prop needs to change.
- ReactFlow 11's `addEdge` utility (used in `onConnect`) performs no validation — it is a pure array merge. No change needed here.
- `TaskNode.tsx` uses a single `<Handle type="source">` with no `id` prop. In ReactFlow 11, a Handle without an `id` can originate multiple edges — this is the default behavior. No change to the Handle configuration is needed.
- ReactFlow 11 does not enforce any limit on the number of edges from a given Handle. The 1-outgoing constraint was entirely application code, not a ReactFlow framework constraint.

---

## Sources

- Direct inspection of all relevant source files:
  - `/web/src/cpm/compute.ts` (lines 46-58: the guard; lines 97-109: forward pass; lines 112-128: backward pass; lines 148-158: criticalPath traversal)
  - `/web/src/components/GraphCanvas.tsx` (lines 50-65: isValidConnection; lines 173-179: nodesWithTooManyOut; lines 238-263: styledEdges)
  - `/web/src/graph/validate.ts` (confirmed: no outgoing-count check)
  - `/web/src/cpm/types.ts` (ComputeErrorCode union, ComputedNode, ComputedResult)
  - `/web/src/graph/TaskNode.tsx` (Handle configuration)
  - `/web/src/persistence/serialize.ts` (edge ID generation: `"${from}-${to}"`)
  - `/web/src/cpm/compute.test.ts` (existing test coverage, including multi-predecessor fixture)
- ReactFlow 11 Handle behavior: confirmed by ReactFlow source — a Handle without `id` supports multiple connections by default (no `maxConnections` prop in RF11)
- CPM / DIN 69900 merge node rule: `FAZ = max(FEZ of all predecessors)` — confirmed by existing implementation and algorithm reference

---

*Architecture research for: PathWeaver v2.0 Multi-Predecessor CPM*
*Researched: 2026-03-17*
