---
phase: 01-code-quality-stability
plan: 01
subsystem: dependencies, types, documentation
tags: [typescript, reactflow, json-schema, npm, discriminated-union]

# Dependency graph
requires: []
provides:
  - AppNodeData discriminated union (TaskNodeData | StartNodeData | EndNodeData) in cpm/types.ts
  - html-to-image installed and ready for Plan 01-05
  - json-schema.v1.json updated to accept computed field in exports
affects:
  - 01-03 (AppNodeData is the prerequisite for as-any removal in serialize.ts)
  - 01-05 (html-to-image installed; dom-to-image-more migration can proceed)

# Tech tracking
tech-stack:
  added:
    - html-to-image ^1.11.13
  patterns:
    - "Discriminated union pattern: AppNodeData with type literal field enables narrowing without casts"

key-files:
  created: []
  modified:
    - web/package.json (removed zustand, immer; added html-to-image)
    - web/package-lock.json
    - web/src/cpm/types.ts (AppNodeData union appended)
    - docs/json-schema.v1.json (computed property added)
    - web/src/persistence/serialize.test.ts (unused import removed — auto-fix)
    - web/src/persistence/autosave.test.ts (unused import removed — auto-fix)

key-decisions:
  - "Removed zustand and immer immediately — zero imports confirmed in research; clean first-commit"
  - "html-to-image installed in this plan despite migration happening in 01-05 — reduces diff scope"
  - "AppNodeData types defined to match forward-looking shape, not current as-any usage"
  - "json-schema top-level additionalProperties: false kept; computed is now declared, not additional"

patterns-established:
  - "Discriminated union at ReactFlow boundary: one cast in styledNodes, downstream code uses AppNodeData"

requirements-completed: [DEPS-01, DEPS-03, TYPES-02]

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 1 Plan 1: Dependencies and Types Foundation Summary

**Removed zustand and immer, installed html-to-image, exported AppNodeData discriminated union from cpm/types.ts, and fixed json-schema.v1.json to allow computed field in exports.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T14:42:50Z
- **Completed:** 2026-03-16T14:45:39Z
- **Tasks:** 3 completed
- **Files modified:** 6

## Accomplishments

- Removed two confirmed-dead dependencies (zustand, immer) from web/package.json
- Installed html-to-image ^1.11.13 in preparation for Plan 01-05 image export migration
- Exported `AppNodeData = TaskNodeData | StartNodeData | EndNodeData` discriminated union from cpm/types.ts, enabling type-safe node.data access without casts in Plans 01-03+
- Fixed docs/json-schema.v1.json to declare `computed` as an optional property so exported project files pass schema validation

## Task Commits

1. **Task 1: Remove dead dependencies and install html-to-image** — `83dddc2` (chore)
2. **Task 2: Add AppNodeData discriminated union to cpm/types.ts** — `7fdd894` (feat)
3. **Task 3: Add computed field to json-schema.v1.json** — `c58f0e7` (fix)

## Files Created/Modified

- `web/package.json` — Removed zustand, immer; added html-to-image
- `web/package-lock.json` — Updated lock file
- `web/src/cpm/types.ts` — AppNodeData discriminated union appended after ComputeError class
- `docs/json-schema.v1.json` — computed optional property added at top level
- `web/src/persistence/serialize.test.ts` — Removed unused toProjectJSON/fromProjectJSON imports (auto-fix)
- `web/src/persistence/autosave.test.ts` — Removed unused saveCurrent import (auto-fix)

## Decisions Made

- Kept dom-to-image-more in place — AppToolbar.tsx still imports it; removal in Plan 01-05 alongside import migration
- `AppNodeData` types defined with forward-looking required fields (e.g., `onEdit` required, not optional) to enforce correctness in downstream code
- json-schema top-level `additionalProperties: false` retained; adding `computed` to `properties` achieves the goal without loosening the constraint

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused imports in serialize.test.ts and autosave.test.ts causing TS6133 build errors**
- **Found during:** Task 2 (verify build after adding AppNodeData types)
- **Issue:** Stub test files committed in prior commit `0e9454b` imported `toProjectJSON`, `fromProjectJSON` (serialize.test.ts) and `saveCurrent` (autosave.test.ts) but did not use them in non-todo tests, causing TS6133 errors that failed `tsc -b`
- **Fix:** Removed unused imports from both test stubs
- **Files modified:** web/src/persistence/serialize.test.ts, web/src/persistence/autosave.test.ts
- **Verification:** `npm run build` exits 0 after fix; all 17 tests still pass
- **Committed in:** `7fdd894` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — pre-existing bug blocking build)
**Impact on plan:** Auto-fix was necessary for build to pass. No scope creep — only removed imports that were never used in active tests.

## Issues Encountered

None beyond the auto-fixed unused imports in prior-committed test stubs.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `AppNodeData` discriminated union is ready — Plan 01-03 can use it for `as any` removal in serialize.ts
- `html-to-image` installed — Plan 01-05 can proceed with migration from dom-to-image-more
- Build and all tests green

---
*Phase: 01-code-quality-stability*
*Completed: 2026-03-16*

## Self-Check: PASSED

- web/src/cpm/types.ts: FOUND
- docs/json-schema.v1.json: FOUND
- .planning/phases/01-code-quality-stability/01-01-SUMMARY.md: FOUND
- Commit 83dddc2 (chore task 1): FOUND
- Commit 7fdd894 (feat task 2): FOUND
- Commit c58f0e7 (fix task 3): FOUND
