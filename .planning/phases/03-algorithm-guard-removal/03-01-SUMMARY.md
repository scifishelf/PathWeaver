---
phase: 03-algorithm-guard-removal
plan: 01
subsystem: cpm
tags: [typescript, vitest, tdd, cpm, critical-path]

# Dependency graph
requires: []
provides:
  - CPM engine without MULTIPLE_OUTGOING guard — fan-out topology now permitted
  - ComputedResult.criticalNodeIds Set<NodeId> replacing criticalPath array
  - All zero-slack nodes identified as critical (diamond graphs fully highlighted)
affects: [03-02-PLAN.md, GraphCanvas, UI highlighting]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD red-green, Set-based critical node identification]

key-files:
  created: []
  modified:
    - web/src/cpm/types.ts
    - web/src/cpm/compute.ts
    - web/src/cpm/compute.test.ts
    - web/src/components/GraphCanvas.tsx

key-decisions:
  - "criticalNodeIds Set<NodeId> (all zero-slack nodes) replaces greedy criticalPath walk — required for correct diamond/fan-out highlighting"
  - "MULTIPLE_OUTGOING guard removed from CPM engine — fan-out topologies now valid"
  - "GraphCanvas edge highlighting: edge is critical if both source and target are in criticalNodeIds"

patterns-established:
  - "Critical path = Set of zero-slack nodes, not an ordered walk — handles multiple parallel branches"

requirements-completed: [ALGO-01, ALGO-02, ALGO-03]

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 3 Plan 01: Algorithm & Guard Removal Summary

**CPM engine guard removal via TDD: MULTIPLE_OUTGOING deleted, criticalNodeIds Set<NodeId> replaces greedy walk, fan-out and diamond graphs fully supported**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-17T14:21:21Z
- **Completed:** 2026-03-17T14:24:24Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Removed MULTIPLE_OUTGOING guard — CPM engine now accepts multi-successor task nodes
- Replaced greedy criticalPath array walk with criticalNodeIds Set (all zero-slack nodes)
- Updated ComputedResult type: criticalNodeIds: Set<NodeId> instead of criticalPath: NodeId[]
- All 5 new multi-predecessor tests pass; 44 total tests pass, 11 pre-existing language-mismatch failures unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing tests (RED)** - `1fa0d25` (test)
2. **Task 2: Implement guard removal and criticalNodeIds (GREEN)** - `e37e501` (feat)
3. **Rule 3 fix: Update GraphCanvas to use criticalNodeIds** - `df46a71` (fix)

**Plan metadata:** _(final docs commit — recorded after summary)_

_Note: TDD tasks have separate RED and GREEN commits per protocol_

## Files Created/Modified
- `web/src/cpm/types.ts` - Removed MULTIPLE_OUTGOING from ComputeErrorCode; replaced criticalPath with criticalNodeIds: Set<NodeId>
- `web/src/cpm/compute.ts` - Deleted outCounts/MULTIPLE_OUTGOING guard block; replaced greedy walk with Set-based criticalNodeIds
- `web/src/cpm/compute.test.ts` - Added 4 new tests (fan-out, diamond equal/unequal, merge node FAZ); updated existing PRD and single-node tests to use criticalNodeIds
- `web/src/components/GraphCanvas.tsx` - Updated styledEdges to use criticalNodeIds Set for edge highlighting

## Decisions Made
- Used `criticalNodeIds = Set of all zero-slack nodes` — cleaner than graph walk, handles all parallel branch topologies correctly
- Edge highlighting: an edge is on the critical path when both its source AND target are in criticalNodeIds — logically equivalent to "this edge connects two critical nodes"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated GraphCanvas.tsx to use criticalNodeIds**
- **Found during:** Task 2 (after GREEN phase implementation)
- **Issue:** GraphCanvas.tsx used `cp.criticalPath` — now a TypeScript type error after ComputedResult changed
- **Fix:** Replaced cpPairs Set (built from consecutive array elements) with direct `criticalNodeIds` lookup; edge is critical if both source and target are in the set
- **Files modified:** web/src/components/GraphCanvas.tsx
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** df46a71 (separate fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking TypeScript compilation error)
**Impact on plan:** Fix was essential for compilation correctness. The edge-highlighting logic is semantically equivalent: a critical edge connects two critical nodes — valid for both linear chains and parallel diamond branches.

## Issues Encountered
None beyond the Rule 3 fix documented above.

## Next Phase Readiness
- CPM engine fully supports fan-out and multi-predecessor topologies
- criticalNodeIds Set available throughout the app via ComputedResult
- GraphCanvas updated — edge highlighting works with new Set-based approach
- Phase 03-02 (cycle detection + UI guard removal) can proceed

---
*Phase: 03-algorithm-guard-removal*
*Completed: 2026-03-17*

## Self-Check: PASSED

All files verified present. All commits verified in git history:
- `1fa0d25` test(03-01): add failing tests for fan-out, diamond, and criticalNodeIds
- `e37e501` feat(03-01): remove MULTIPLE_OUTGOING guard, add criticalNodeIds Set
- `df46a71` fix(03-01): update GraphCanvas to use criticalNodeIds Set
