---
phase: 01-code-quality-stability
plan: 03
subsystem: testing
tags: [typescript, serialize, type-guards, reactflow, discriminated-union]

# Dependency graph
requires:
  - phase: 01-code-quality-stability
    plan: 01
    provides: "AppNodeData discriminated union (TaskNodeData | StartNodeData | EndNodeData) in cpm/types.ts"
provides:
  - "isProjectJSON(data: unknown): data is ProjectJSON type guard in serialize.ts"
  - "as-any-free toProjectJSON accepting Node<AppNodeData>[]"
  - "as-any-free fromProjectJSON returning { nodes: Node<AppNodeData>[], edges: Edge[] }"
  - "validateProjectJSON parameter narrowed from any to unknown"
affects:
  - 01-06
  - serialize call sites in GraphCanvas.tsx

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Discriminated union narrowing: cast to specific member (TaskNodeData) after type guard check, no as-any"
    - "Type guard via validateProjectJSON: isProjectJSON wraps existing validator, single source of truth"
    - "fromProjectJSON placeholder handlers: onEdit/onChangeStartDate stubs replaced by GraphCanvas after setNodes"

key-files:
  created: []
  modified:
    - web/src/persistence/serialize.ts
    - web/src/persistence/serialize.test.ts

key-decisions:
  - "toProjectJSON accepts Node<AppNodeData>[] — callers in GraphCanvas.tsx use 'nodes as any' until Plan 01-06 cleans them up"
  - "fromProjectJSON returns explicit { nodes: Node<AppNodeData>[], edges: Edge[] } return type"
  - "isProjectJSON delegates to validateProjectJSON — one validation implementation, two calling conventions"
  - "validateProjectJSON parameter: any -> unknown, uses Record<string, unknown> narrowing internally"

patterns-established:
  - "Type guard pattern: export function isX(data: unknown): data is X { return validate(data).length === 0 }"

requirements-completed: [TYPES-01, TYPES-03]

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 01 Plan 03: Serialize Type Safety Summary

**Eliminated all six `as any` casts from serialize.ts using AppNodeData discriminated union narrowing and added `isProjectJSON(data: unknown): data is ProjectJSON` type guard**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T14:47:00Z
- **Completed:** 2026-03-16T14:50:00Z
- **Tasks:** 1 (TDD: RED + GREEN commits)
- **Files modified:** 2

## Accomplishments
- Replaced all 6 `as any` casts in `serialize.ts` with proper TypeScript narrowing via `AppNodeData` discriminated union
- Added `isProjectJSON` export: `(data: unknown) => data is ProjectJSON` predicate
- Strengthened `validateProjectJSON` parameter from `any` to `unknown`
- `fromProjectJSON` now returns explicitly typed `{ nodes: Node<AppNodeData>[], edges: Edge[] }`
- All 22 passing tests remain green; 5 new `isProjectJSON` tests added and passing

## Task Commits

TDD tasks committed as RED then GREEN:

1. **RED: failing tests for isProjectJSON** - `cdbb81f` (test)
2. **GREEN: as-any-free serialize.ts + isProjectJSON** - `b2bce13` (feat)

**Plan metadata:** (docs commit — see final_commit step)

_TDD task: test commit followed by feat commit_

## Files Created/Modified
- `web/src/persistence/serialize.ts` - Zero `as any`; new `isProjectJSON` export; `validateProjectJSON` uses `unknown`
- `web/src/persistence/serialize.test.ts` - 5 todo stubs replaced with real passing tests for `isProjectJSON`

## Decisions Made
- `toProjectJSON` accepts `Node<AppNodeData>[]` — GraphCanvas call sites still pass `nodes as any` until Plan 01-06
- `fromProjectJSON` placeholder `onEdit`/`onChangeStartDate` functions needed because `TaskNodeData`/`StartNodeData` interfaces require them; GraphCanvas replaces them after `setNodes`
- `validateProjectJSON` internally uses `Record<string, unknown>` bracket-notation access — no `as any` but explicit narrowing at each property

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `isProjectJSON` type guard ready for use at `JSON.parse()` call sites (AppToolbar import handler, autosave loader)
- Plan 01-04 (autosave error handling) can now use `isProjectJSON` instead of ad-hoc `as any` casts
- Plan 01-06 (GraphCanvas as-any cleanup) will update call sites to pass `Node<AppNodeData>[]` directly

---
*Phase: 01-code-quality-stability*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: web/src/persistence/serialize.ts
- FOUND: web/src/persistence/serialize.test.ts
- FOUND: .planning/phases/01-code-quality-stability/01-03-SUMMARY.md
- FOUND commit: cdbb81f (test — RED phase)
- FOUND commit: b2bce13 (feat — GREEN phase)
