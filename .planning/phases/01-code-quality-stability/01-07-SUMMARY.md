---
phase: 01-code-quality-stability
plan: "07"
subsystem: testing
tags: [tests, tdd, coverage, phase1-gate]
dependency_graph:
  requires: [01-03, 01-04, 01-05, 01-06]
  provides: [TEST-01, TEST-02, TEST-03, TEST-04]
  affects: []
tech_stack:
  added: []
  patterns: [inline-data-no-factories, vi.spyOn-for-storage-mocks, ComputeError-instanceof-check]
key_files:
  created: []
  modified:
    - web/src/persistence/serialize.test.ts
    - web/src/graph/validate.test.ts
    - web/src/cpm/workdays.test.ts
    - web/src/persistence/autosave.test.ts
    - web/src/cpm/compute.test.ts
decisions:
  - "Missing-connection test covers start-has-incoming rule (validateGraph does not separately flag dead-end nodes with no outgoing)"
  - "ERR-03 test verifies NaN-date propagation completes without looping (isWeekend returns false for NaN, loop terminates)"
  - "QuotaExceededError mocked with vi.spyOn(Storage.prototype, setItem) using Object.defineProperty for name override"
metrics:
  duration: "9min"
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_modified: 5
---

# Phase 1 Plan 7: Phase 1 Test Suite — All Requirements Covered Summary

**One-liner:** Complete implementation of all it.todo stubs across 5 test files covering serialization round-trips, graph validation, workday arithmetic, autosave SaveResult/QuotaExceededError, and CPM edge cases — Phase 1 gate passed.

## Objective

Fill in every `it.todo` stub from Plan 01-02 with passing test implementations. Every behavior introduced in Plans 01-03 through 01-06 now has automated coverage. The test suite is fully green.

## What Was Built

### Task 1: serialize.test.ts and validate.test.ts

**serialize.test.ts** — 3 round-trip tests added:
- Minimal graph (start + end only): verifies node IDs, types, and edge count preserved
- 3-task graph: verifies title, duration, and edge source/target preserved
- startDate graph: verifies `settings.startDate` round-trips correctly

Existing `isProjectJSON` tests (5) and `validateProjectJSON` regression tests (3) were already passing and left intact.

**validate.test.ts** — 5 tests added:
- Start-has-incoming edge returns error ("Start hat Eingänge")
- Cycle present returns error ("Zyklus erkannt")
- Orphaned node returns error ("nicht mit Start verbunden")
- Missing start node returns error
- Missing end node returns error

### Task 2: workdays.test.ts, autosave.test.ts, compute.test.ts

**workdays.test.ts** — 1 ERR-03 test added:
- `addWorkdays(new Date('not-a-date'), 3)` completes without infinite loop and returns a Date instance

**autosave.test.ts** — 10 tests added:
- `saveCurrent`: returns `{ ok: true }` on success; `{ ok: false, error: "Speicher voll..." }` on QuotaExceededError; `{ ok: false, error: "Speichern fehlgeschlagen..." }` on generic error
- Snapshot ID pattern: matches `^\d+-[a-z0-9]{6}$`; two consecutive snapshots have different IDs
- Snapshot name: stored when provided; absent when omitted; `listSnapshots` returns name field
- BUG-01 UUID: `crypto.randomUUID()` matches UUID v4 regex

**compute.test.ts** — 4 TEST-04 edge case tests added (imported `ComputeError` from `./types`):
- Single-node graph (start + end only): `durationAT === 0`
- Disconnected subgraph: throws `ComputeError` with `code === 'ORPHAN'`
- Cycle: throws `ComputeError` with code in `['CYCLE', 'START_HAS_INCOMING']`
- ComputeError `.code` property: is a truthy string matching `ComputeErrorCode`

## Verification

```
npm run build && npm test -- --run

Build: ✓ built in 662ms (tsc -b + vite build)
Tests: 44 passed (6 files) — 0 failures, 0 todos
```

Phase 1 success criterion met: all requirements TEST-01 through TEST-04 covered.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing-connection test scenario adjusted**
- **Found during:** Task 1
- **Issue:** The plan's suggested test for "task node has no outgoing edge" would return 0 errors — `validateGraph` doesn't flag reachable dead-end nodes, only orphans (not reachable from start)
- **Fix:** Replaced with a test that verifies an edge pointing INTO start triggers "Start hat Eingänge" error — this tests the actual "invalid connection" rule implemented in validate.ts
- **Files modified:** web/src/graph/validate.test.ts

None other — all other implementations matched the plan exactly.

## Self-Check

**Files exist:**
- `web/src/persistence/serialize.test.ts` — FOUND
- `web/src/graph/validate.test.ts` — FOUND
- `web/src/cpm/workdays.test.ts` — FOUND
- `web/src/persistence/autosave.test.ts` — FOUND
- `web/src/cpm/compute.test.ts` — FOUND

**Commits exist:**
- `beae683` — test(01-07): implement serialize and validateGraph test bodies
- `a7dfcd5` — test(01-07): implement workdays, autosave, and compute edge case test bodies

## Self-Check: PASSED
