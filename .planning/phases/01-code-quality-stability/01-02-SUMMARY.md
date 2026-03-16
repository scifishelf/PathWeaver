---
phase: 01-code-quality-stability
plan: 02
subsystem: testing
tags: [vitest, testing-library, typescript, cpm, serialize, autosave, workdays, validateGraph]

requires: []
provides:
  - "4 new test files with it.todo stubs covering TEST-01 through TEST-04, ERR-02, BUG-01, BUG-02, SNAP-01"
  - "Passing regression tests for validateProjectJSON, validateGraph (valid graph), isWeekend, nextWorkday, addWorkdays, autosave round-trip"
  - "Extended compute.test.ts with TEST-04 edge case stubs"
affects:
  - "01-03 (isProjectJSON guard implementation — TYPES-01 stubs ready)"
  - "01-04 (SaveResult error handling — ERR-02 stubs ready)"
  - "01-05 (UUID node IDs — BUG-01 stubs ready)"
  - "01-06 (ERR-03 invalid date — stub ready)"
  - "01-07 (all round-trip and behavioral tests to be implemented)"

tech-stack:
  added: []
  patterns:
    - "it.todo('description') for unimplemented behavioral contracts"
    - "beforeEach(() => localStorage.clear()) for autosave test isolation"
    - "Inline test data with makeNode/makeEdge helpers (no fixtures)"

key-files:
  created:
    - web/src/persistence/serialize.test.ts
    - web/src/graph/validate.test.ts
    - web/src/cpm/workdays.test.ts
    - web/src/persistence/autosave.test.ts
  modified:
    - web/src/cpm/compute.test.ts

key-decisions:
  - "Import only functions actually used in passing tests — linter removes unused imports from todo stubs; this is acceptable since todos are stubs only"
  - "Regression tests added inline (not in separate files) to validate existing behavior before Plan 01-07 adds implementations"

patterns-established:
  - "Test file structure: import jest-dom, import from relative path, describe blocks per requirement ID"
  - "Todo stubs use requirement IDs in describe names (TEST-01, ERR-02, BUG-01) for traceability to REQUIREMENTS.md"

requirements-completed: [TEST-01, TEST-02, TEST-03, TEST-04]

duration: 4min
completed: 2026-03-16
---

# Phase 01 Plan 02: Test Stub Files Summary

**4 new vitest stub files + extended compute.test.ts establishing behavioral contracts for 27 todo tests across TEST-01 through TEST-04, ERR-02, BUG-01, BUG-02, and SNAP-01**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-16T14:43:00Z
- **Completed:** 2026-03-16T14:44:15Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created serialize.test.ts with 8 todo stubs (TEST-01, TYPES-01) plus 3 passing regression tests for validateProjectJSON
- Created validate.test.ts with 5 todo stubs (TEST-02) plus 1 passing regression test for valid linear graph
- Created workdays.test.ts with 1 todo stub (ERR-03) plus 7 passing tests for isWeekend, nextWorkday, addWorkdays (TEST-03)
- Created autosave.test.ts with 9 todo stubs (ERR-02, BUG-01, BUG-02, SNAP-01) plus 2 passing regression tests
- Extended compute.test.ts with 4 todo stubs for TEST-04 edge cases
- Full suite: 6 test files, 17 passing, 27 todos, 0 failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Create serialize.test.ts and validate.test.ts stubs** - `0e9454b` (test)
2. **Task 2: Create workdays.test.ts and autosave.test.ts stubs; extend compute.test.ts** - `08cfe89` (test)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `web/src/persistence/serialize.test.ts` - TEST-01 round-trip stubs + TYPES-01 isProjectJSON stubs + validateProjectJSON regression tests
- `web/src/graph/validate.test.ts` - TEST-02 validateGraph stubs + valid-graph regression test
- `web/src/cpm/workdays.test.ts` - TEST-03 addWorkdays passing tests + ERR-03 todo stub
- `web/src/persistence/autosave.test.ts` - ERR-02, BUG-01, BUG-02, SNAP-01 stubs + regression tests
- `web/src/cpm/compute.test.ts` - Appended TEST-04 describe block with 4 todo stubs

## Decisions Made

- Import only functions actually used in passing tests. The linter (ESLint auto-fix on save) removed unused imports from `serialize.test.ts` and `autosave.test.ts` — `toProjectJSON`, `fromProjectJSON`, and `saveCurrent` were removed since they appear only in todo stubs. This is correct behavior; those imports will be added back by Plan 01-07 when the tests are implemented.
- Regression tests added to each new file to guard existing behavior, not just todos. This ensures Plan 01-07 implementations cannot regress current functionality.

## Deviations from Plan

None — plan executed exactly as written. The linter removing unused imports is expected behavior, not a deviation.

## Issues Encountered

None.

## Next Phase Readiness

- All 5 test files required for Nyquist compliance now exist
- `npm test -- --run` exits 0 after every subsequent plan without "file not found" errors
- Plan 01-03 can proceed: TYPES-01 stubs in serialize.test.ts are ready
- Plan 01-04 can proceed: ERR-02 stubs in autosave.test.ts are ready
- Plan 01-07 has full behavioral contract: 27 todo stubs describe exactly what to implement

## Self-Check: PASSED

- FOUND: web/src/persistence/serialize.test.ts
- FOUND: web/src/graph/validate.test.ts
- FOUND: web/src/cpm/workdays.test.ts
- FOUND: web/src/persistence/autosave.test.ts
- FOUND: .planning/phases/01-code-quality-stability/01-02-SUMMARY.md
- FOUND: 0e9454b (Task 1 commit)
- FOUND: 08cfe89 (Task 2 commit)

---
*Phase: 01-code-quality-stability*
*Completed: 2026-03-16*
