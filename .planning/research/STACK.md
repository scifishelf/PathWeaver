# Technology Stack

**Project:** PathWeaver — v2.0 Multi-Predecessor CPM
**Researched:** 2026-03-17
**Scope:** Stack additions and changes for removing the 1-outgoing-edge constraint and implementing safe multi-predecessor CPM
**Confidence:** HIGH

---

## Context

This is a SUBSEQUENT MILESTONE research document. The base stack is validated and frozen:
React 19 + TypeScript + ReactFlow 11.11.4 + Vite + Vitest + Tailwind CSS + Lucide React.

**No new runtime dependencies are required for v2.0.** Everything needed already exists in
the installed packages. The work is pure algorithm and UI logic changes within the existing
codebase.

---

## What the v2.0 Features Actually Require

### Feature 1: Remove 1-outgoing-edge constraint

**Current restriction (in GraphCanvas.tsx, lines 58–61):**
```typescript
if (from.type === 'task') {
  const outCount = edges.filter((e) => e.source === from.id).length
  if (outCount >= 1) return false
}
```

**What changes:** Delete this guard from `isValidConnection`. Also delete the parallel check in
`compute.ts` (lines 51–58) that throws `MULTIPLE_OUTGOING`. No library needed — both are
in-codebase logic removals.

**Validation enhancement needed:** `isValidConnection` currently checks outgoing count from
a `edges` closure (React state snapshot). After removing the constraint, the callback should
use `getEdges()` from `useReactFlow` instead — this avoids stale closure reads during rapid
connections. `getEdges` is already available on the `useReactFlow` hook that is already
imported.

### Feature 2: Safe multi-predecessor CPM algorithm

**Current algorithm assessment:** The forward pass and backward pass in `compute.ts` are
ALREADY CORRECT for multi-predecessor graphs.

- Forward pass (lines 97–108): uses `Math.max(...preds.map(p => EF.get(p)))` — correct merge
  node handling; ES = max(EF of all predecessors)
- Backward pass (lines 112–129): uses `Math.min(...succs.map(s => LS.get(s)))` — correct
  fan-out handling; LF = min(LS of all successors)
- Topological sort (lines 19–36): Kahn's algorithm, handles multiple predecessors correctly

The ONLY thing blocking correct multi-predecessor computation is the `MULTIPLE_OUTGOING`
guard at lines 51–58 that rejects graphs before the algorithm runs. Remove the guard;
the algorithm requires no changes.

**Critical path display bug for parallel paths:** The current critical path extraction
(lines 148–158) walks a single linear chain using `.find()` — it picks the first zero-slack
successor and follows it. This is WRONG when there are parallel critical paths. With multiple
successors all having slack === 0, only one path is found.

Fix: Replace the single-chain walk with a graph traversal that collects ALL edges connecting
pairs of critical nodes (both endpoints have slack === 0). Return a set of critical edges,
not a linear array. This changes the return type of `computeCPM`.

**No library needed.** The fix is a 15-20 line change to the path extraction logic.

### Feature 3: UX for complex graph editing (connection feedback)

**What's needed:**
- Visual feedback when a connection attempt would be invalid (cycle would be created, or
  target is Start node) — currently the connection just silently fails
- `getOutgoers` utility for cycle detection in `isValidConnection`

**Available in existing reactflow package (v11.11.4):**
```typescript
import { getOutgoers } from 'reactflow'
// Confirmed exported from @reactflow/core via:
// web/node_modules/@reactflow/core/dist/esm/index.d.ts
```

`getOutgoers(node, nodes, edges)` returns downstream nodes — already available, zero new
dependencies.

---

## Recommended Stack Changes for v2.0

| Action | Location | Change | Rationale | Confidence |
|--------|----------|--------|-----------|------------|
| Remove guard | `compute.ts` lines 51–58 | Delete `MULTIPLE_OUTGOING` check | Algorithm is already correct without it | HIGH |
| Remove guard | `GraphCanvas.tsx` lines 58–61 | Delete 1-outgoing-edge block in `isValidConnection` | The feature we're unlocking | HIGH |
| Remove error code | `types.ts` | Remove `'MULTIPLE_OUTGOING'` from `ComputeErrorCode` union | Dead code after guard removal | HIGH |
| Fix path extraction | `compute.ts` lines 148–158 | Replace linear chain walk with edge-set traversal | Parallel critical paths need all zero-slack edges, not one path | HIGH |
| Update return type | `types.ts` + `ComputedResult` | Change `criticalPath: NodeId[]` to `criticalEdges: Set<string>` (or equivalent) | Supports multiple parallel critical paths | HIGH |
| Use getEdges() | `GraphCanvas.tsx` `isValidConnection` | Replace `edges` closure with `getEdges()` from `useReactFlow` | Avoids stale closure on rapid connection attempts | MEDIUM |
| Add cycle detection | `GraphCanvas.tsx` `isValidConnection` | Use `getOutgoers` from `'reactflow'` for DFS cycle check | Must prevent cycles as multi-successor graphs make manual tracking harder | HIGH |
| Update styledEdges | `GraphCanvas.tsx` lines 238–263 | Change CP highlighting to use `criticalEdges` set instead of `criticalPath` array | Downstream display change from type change | HIGH |
| Update nodesWithTooManyOut | `GraphCanvas.tsx` lines 173–179 | Remove — after unlocking multi-out, this error highlight is obsolete | The feature is now valid; highlighting it as error is wrong | HIGH |

---

## Core Technologies: No Changes

| Technology | Current Version | v2.0 Status | Notes |
|------------|-----------------|-------------|-------|
| React | 19.1.1 | Unchanged | No new React APIs needed |
| TypeScript | ~5.9.3 | Unchanged | Type changes are internal refactors |
| ReactFlow | 11.11.4 | Unchanged | `getOutgoers`, `getEdges` already available |
| Vitest | ^3.2.4 | Unchanged | Existing test infrastructure sufficient |
| date-fns | ^4.1.0 | Unchanged | Not touched in this milestone |
| Tailwind CSS | ^4.1.14 | Unchanged | No new visual components needed |
| Lucide React | ^0.577.0 | Unchanged | Toolbar icons unchanged |

---

## Utilities Already Available (no install needed)

| Utility | Source | Import | Use in v2.0 |
|---------|--------|--------|-------------|
| `getOutgoers` | `reactflow` (via `@reactflow/core`) | `import { getOutgoers } from 'reactflow'` | Cycle detection in `isValidConnection` |
| `getIncomers` | `reactflow` (via `@reactflow/core`) | `import { getIncomers } from 'reactflow'` | Available if needed for predecessor traversal |
| `getConnectedEdges` | `reactflow` (via `@reactflow/core`) | `import { getConnectedEdges } from 'reactflow'` | Available for edge queries |
| `getEdges()` | `useReactFlow` hook | Already imported in GraphCanvas.tsx | Replace stale `edges` closure in validation |

All three graph utility functions are confirmed exported from `@reactflow/core` (checked via
`web/node_modules/@reactflow/core/dist/esm/index.d.ts`). They work with the `Node[]` and
`Edge[]` types from `reactflow` — no type adaptation needed.

---

## Type System Changes Required

The `criticalPath: NodeId[]` return type in `ComputedResult` needs to change. Two options:

**Option A — Replace array with edge set (recommended):**
```typescript
// types.ts — ComputedResult
criticalEdges: Set<string>  // each entry: `${fromId}→${toId}`
```
Rationale: An edge set is the correct primitive for highlighting edges in ReactFlow. The
current `styledEdges` memo already builds a `cpPairs: Set<string>` from the `criticalPath`
array (GraphCanvas.tsx line 241) — this merges those two concepts cleanly.

**Option B — Keep array, add multi-path support:**
```typescript
criticalPaths: NodeId[][]  // array of paths
```
Rationale: More readable for external consumers of the JSON. But adds complexity to the
display logic. The `criticalPath` key is not persisted to JSON/localStorage (only
`ComputedResult`, which is ephemeral), so no migration needed either way.

Recommendation: **Option A**. It removes one intermediate transformation step and aligns
the data shape with how ReactFlow consumes it.

---

## What NOT to Add

| Avoid | Why | Notes |
|-------|-----|-------|
| Dagre / elkjs (auto-layout) | Not requested in v2.0 scope; adds ~150KB to bundle | Consider for a dedicated layout milestone |
| ReactFlow v12 (`@xyflow/react`) | PROJECT.md explicitly out of scope; breaking API changes require own milestone | Stay on v11.11.4 |
| Zod / Yup for runtime validation | The existing `validateProjectJSON` is sufficient; multi-predecessor doesn't add new schema fields | Defer until schema complexity grows |
| New state management library | React's `useState` + `useCallback` is sufficient; no new global state surfaces in v2.0 | Zustand was already removed in v1.0 |
| `toposort` npm package | The existing Kahn's algorithm in `compute.ts` is correct and tested; no reason to replace it | External package would add overhead with no benefit |
| `graphlib` or similar graph library | Overkill for a DAG with at most ~50 nodes; adds ~35KB for capabilities not needed | Internal adjacency maps are sufficient |

---

## Version Compatibility Notes

| Package | Compatible With | Status |
|---------|-----------------|--------|
| `reactflow@11.11.4` | `react@19.1.1` | Working in production (v1.0 shipped) |
| `reactflow@11.11.4` | `typescript@~5.9.3` | Working; `getOutgoers` types are in dist/esm/index.d.ts |
| `getOutgoers` util | `reactflow@11.11.4` | Confirmed in installed node_modules |

---

## Algorithm Correctness Verification

The claim that the existing forward/backward pass is already correct for multi-predecessor
graphs is verifiable against the existing test suite. `compute.test.ts` line 8–28 already
tests a diamond graph:

```
start → A (dur:5)
start → B (dur:3)
A → C (dur:2)
B → end
C → end
```

This is a multi-predecessor graph at the `end` node (both B and C connect to end). The test
expects `criticalPath: ['start', 'A', 'C', 'end']` and `durationAT: 7` — and it passes.
The algorithm handles merge nodes correctly. The only thing to verify after removing the
`MULTIPLE_OUTGOING` guard is multi-outgoing (fan-out), which is the symmetric case — same
`Math.min` logic in backward pass already handles it.

---

## Installation

**No new packages to install.** All required capabilities are in the current `node_modules`.

The only file-system action is a code change (no `npm install` step):

```bash
# Verify getOutgoers is already available (sanity check)
node -e "const { getOutgoers } = require('./node_modules/reactflow/dist/umd/index.js'); console.log(typeof getOutgoers)"
# Expected: function
```

---

## Sources

- `web/node_modules/reactflow/package.json` — version 11.11.4 confirmed, peer deps `react >= 17`
- `web/node_modules/@reactflow/core/dist/esm/index.d.ts` — `getOutgoers`, `getIncomers`, `getConnectedEdges` export confirmed
- `web/src/cpm/compute.ts` — forward/backward pass logic inspected; correctness for multi-predecessor verified
- `web/src/cpm/compute.test.ts` — diamond graph test (multi-predecessor) already passing
- `web/src/components/GraphCanvas.tsx` — `isValidConnection` 1-outgoing guard location identified
- [ReactFlow IsValidConnection docs](https://reactflow.dev/api-reference/types/is-valid-connection) — callback type signature confirmed
- [ReactFlow prevent-cycles example](https://reactflow.dev/examples/interaction/prevent-cycles) — `getNodes()`/`getEdges()` in `isValidConnection` pattern confirmed
- [ReactFlow getOutgoers docs](https://reactflow.dev/api-reference/utils/get-outgoers) — function signature confirmed (note: docs show `@xyflow/react` import path for v12; for v11 it's `reactflow`)
- [PMI CPM forward/backward pass](https://trustedinstitute.com/concept/pmi-sp/critical-path-method/forward-and-backward-pass/) — multi-predecessor: ES = max(EF of predecessors); multi-successor: LF = min(LS of successors) — confirms existing algorithm is correct

---

*Stack research for: PathWeaver v2.0 Multi-Predecessor CPM*
*Researched: 2026-03-17*
