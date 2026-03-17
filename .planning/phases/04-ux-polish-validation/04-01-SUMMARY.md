---
phase: 04-ux-polish-validation
plan: 01
subsystem: ui
tags: [react, vitest, cpm, serialization, help-overlay]

# Dependency graph
requires:
  - phase: 03-algorithm-guard-removal
    provides: criticalNodeIds Set and multi-successor CPM computation
provides:
  - UX-02: HelpOverlay free of outdated single-outgoing-edge constraint text
  - UX-03: v1.0 backward-compatibility regression test in serialize.test.ts
  - UX-04: Edge ID scheme documented with explicit 3-line comment in serialize.ts
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "v1.0 round-trip test pattern: isProjectJSON guard -> fromProjectJSON -> toProjectJSON -> computeCPM -> assert CPM values"

key-files:
  created: []
  modified:
    - web/src/persistence/serialize.ts
    - web/src/persistence/serialize.test.ts
    - web/src/components/HelpOverlay.tsx

key-decisions:
  - "Edge ID comment placed above the reconstruction line to make the single-handle assumption explicit before multi-handle work begins"

patterns-established:
  - "Backward-compatibility tests: use the actual ProjectJSON fixture with version: '1.0', run full round-trip through computeCPM to validate numerical correctness"

requirements-completed: [UX-02, UX-03, UX-04]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 4 Plan 01: UX Polish — Help Text, Edge ID Comment, and v1.0 Regression Test Summary

**Removed outdated 1-outgoing-edge constraint from HelpOverlay, documented the `${from}-${to}` edge ID scheme in serialize.ts, and added a v1.0 backward-compatibility round-trip test validating correct CPM values.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-17T16:39:00Z
- **Completed:** 2026-03-17T16:41:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- HelpOverlay connections section no longer shows the contradictory "Max. 1 outgoing per task" text removed in v2.0
- serialize.ts edge ID reconstruction line is now annotated with a 3-line comment explaining the single-handle assumption and future revisit trigger
- serialize.test.ts has a new describe block that loads a v1.0 linear project (start -> A(3) -> B(5) -> end), round-trips through computeCPM, and asserts durationAT=8, correct ES values, and correct criticalNodeIds

## Task Commits

Each task was committed atomically:

1. **Task 1: Add v1.0 backward-compat test and document edge ID scheme** - `103f440` (feat)
2. **Task 2: Remove outdated help text about max 1 outgoing edge** - `d0780f7` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `web/src/persistence/serialize.ts` - Added 3-line comment above edge ID reconstruction (UX-04)
- `web/src/persistence/serialize.test.ts` - Added computeCPM import and v1.0 backward-compatibility describe block (UX-03)
- `web/src/components/HelpOverlay.tsx` - Removed ' · Max. 1 outgoing per task' from connections section (UX-02)

## Decisions Made
- Edge ID comment placed above the single edge reconstruction line to make the single-handle assumption explicit before multi-handle work begins

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — all three surgical changes applied cleanly. Pre-existing 11-test failure count (German/English string mismatch in validateProjectJSON) unchanged.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 plan 01 complete; requirements UX-02, UX-03, UX-04 satisfied
- No blockers for subsequent Phase 4 plans

---
*Phase: 04-ux-polish-validation*
*Completed: 2026-03-17*
