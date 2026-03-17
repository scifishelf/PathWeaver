---
phase: 03-algorithm-guard-removal
plan: 02
subsystem: ui
tags: [reactflow, typescript, cpm, graph, cycle-detection, bfs]

# Dependency graph
requires:
  - phase: 03-algorithm-guard-removal
    plan: 01
    provides: criticalNodeIds Set<string> in ComputedResult, removal of MULTIPLE_OUTGOING guard from compute.ts

provides:
  - BFS cycle detection in isValidConnection via getOutgoers
  - Stale-closure fix: isValidConnection reads live state from getEdges()/getNodes()
  - Duplicate edge guard in connection validation
  - Removal of nodesWithTooManyOut red borders on multi-successor task nodes
  - criticalNodeIds-based edge highlighting (both endpoints critical = critical edge)

affects: [GraphCanvas, CPM visualization, graph editing UX]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Use useReactFlow().getEdges()/getNodes() inside useCallback to avoid stale closure on live graph state"
    - "BFS reachability check before allowing edge creation to prevent cycles"
    - "Edge criticality: check both source AND target node in criticalNodeIds Set"

key-files:
  created: []
  modified:
    - web/src/components/GraphCanvas.tsx

key-decisions:
  - "isValidConnection dependency array uses [getEdges, getNodes] (stable refs from useReactFlow), not closed-over nodes/edges state"
  - "BFS starts at conn.target and walks forward — if it reaches conn.source, the proposed edge would create a cycle"
  - "Edge is critical if BOTH endpoints are in criticalNodeIds (correct for diamond/multi-path topologies)"
  - "nodesWithTooManyOut removed entirely — multi-successor is now valid and should never show error state"

patterns-established:
  - "Stale closure pattern: when a useCallback accesses live ReactFlow state, use useReactFlow().getEdges()/getNodes() not closed-over state"
  - "BFS cycle guard pattern: walk outgoers of proposed target; if source found, reject connection"

requirements-completed:
  - ALGO-04
  - ALGO-05
  - ALGO-06
  - UX-01

# Metrics
duration: 2min
completed: 2026-03-17
---

# Phase 3 Plan 02: GraphCanvas Guard Removal & BFS Cycle Detection Summary

**BFS cycle detection in isValidConnection with stale-closure fix via getEdges/getNodes, removal of nodesWithTooManyOut error borders, and criticalNodeIds-based edge highlighting replacing cpPairs walk**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-17T14:26:54Z
- **Completed:** 2026-03-17T14:28:28Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments

- Replaced closed-over `nodes`/`edges` in `isValidConnection` with live `getEdges()`/`getNodes()` calls from `useReactFlow()` — eliminates stale closure bug (ALGO-06)
- Added BFS cycle detection using `getOutgoers` from reactflow — walks from proposed target forward, rejects if it reaches proposed source (ALGO-04)
- Added duplicate edge guard via `liveEdges.some(...)` (ALGO-05)
- Removed `outgoingCount` and `nodesWithTooManyOut` useMemos entirely — multi-successor task nodes no longer shown with red error border (UX-01)
- Updated `styledEdges` to use `criticalNodeIds.has(e.source!) && criticalNodeIds.has(e.target!)` — correctly highlights all critical edges in diamond/multi-path topologies

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite isValidConnection with BFS cycle detection and stale-closure fix** - `4746fe9` (feat)

**Plan metadata:** *(docs commit follows)*

## Files Created/Modified

- `web/src/components/GraphCanvas.tsx` - BFS cycle detection, stale-closure fix, nodesWithTooManyOut removal, criticalNodeIds edge highlighting

## Decisions Made

- Used `[getEdges, getNodes]` as the dependency array for `isValidConnection` — these are stable function references from `useReactFlow()`, not values, so the closure always calls the latest getter without re-creating the callback on every state change.
- BFS direction: walk forward from `conn.target` through existing outgoers. If `conn.source` is reached, the proposed edge would create a cycle — reject it.
- Kept `startDate` in the `styledNodes` dependency array since that was part of the original correct dependencies unrelated to this change.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. TypeScript compiled cleanly, test results matched expected (44 passing, 11 pre-existing failures, zero new failures).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 3 complete: both plans (CPM engine guard removal + UI layer update) are done
- criticalNodeIds is correctly computed in compute.ts and correctly consumed in GraphCanvas.tsx
- Multi-successor task graphs now work end-to-end: no engine errors, no false red borders, correct critical edge highlighting
- Ready for Phase 4 (UI polish / milestone v2.0 completion)

---
*Phase: 03-algorithm-guard-removal*
*Completed: 2026-03-17*
