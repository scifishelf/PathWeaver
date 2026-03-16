---
phase: 01-code-quality-stability
plan: "06"
subsystem: ui
tags: [react, reactflow, typescript, error-handling, keyboard-shortcut, uuid]

# Dependency graph
requires:
  - phase: 01-code-quality-stability plan 03
    provides: serialize.ts type safety (toProjectJSON/fromProjectJSON)
  - phase: 01-code-quality-stability plan 04
    provides: SaveResult interface from autosave.ts
provides:
  - GraphCanvas.tsx hardened: zero empty catches, SaveResult wired to banner, startDate validated
  - T-shortcut (key T) creates task node at viewport center with auto-focused title
  - UUID node IDs replacing N{num} timestamp counter format
  - TopRightDebug DEV gate (returns null in production)
  - TaskNode focusOnMount auto-focus via titleInputRef useEffect
affects: [ui, task-creation, keyboard-shortcuts, error-surfacing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ReactFlowProvider wrapper pattern for useReactFlow() outside <ReactFlow> children
    - ISO date validation with regex + Date NaN check before passing to computeCPM
    - SaveResult checked inline; quota errors propagated to visible banner state
    - focusOnMount as creation-time signal in node data; useEffect([], []) fires once on mount
    - T-shortcut guard: HTMLInputElement / HTMLTextAreaElement check before creating node

key-files:
  created: []
  modified:
    - web/src/components/GraphCanvas.tsx
    - web/src/graph/TaskNode.tsx
    - web/src/components/TopRightDebug.tsx

key-decisions:
  - "useReactFlow() requires ReactFlowProvider context — GraphCanvas refactored into GraphCanvasInner + GraphCanvas (provider wrapper)"
  - "onEditTask moved before addTaskNode to avoid block-scoped variable used before declaration TS error"
  - "focusOnMount handled with empty deps useEffect in TaskNode — fires once on mount, never re-fires on subsequent renders"
  - "idRef counter and getNextTaskId completely removed — crypto.randomUUID() eliminates N{num} collision concerns"

patterns-established:
  - "ISO_DATE_RE + isValidISODate helper: validate user-supplied dates before passing to CPM computation"
  - "SaveResult inline check: const result = saveCurrent(pj); if (!result.ok) setQuotaError(result.error)"
  - "ReactFlowProvider wrapper: when component needs useReactFlow(), wrap with provider rather than restructuring JSX tree"

requirements-completed: [ERR-01, ERR-03, BUG-01, BUG-03, BUG-04, SNAP-02]

# Metrics
duration: 5min
completed: 2026-03-16
---

# Phase 1 Plan 06: GraphCanvas Hardening + T-shortcut + UUID IDs Summary

**GraphCanvas.tsx fully hardened: zero silent failures, UUID node IDs, T-shortcut with auto-focus, startDate ISO validation, QuotaExceeded banner, DEV-gated debug component**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-16T13:51:34Z
- **Completed:** 2026-03-16T13:56:26Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Removed all 3 empty `catch {}` blocks from GraphCanvas.tsx; all errors now log via `console.error(e)`
- Removed all 3 `setTimeout(() => validate(), 0)` calls; validation fires correctly via `useEffect` deps
- Wired `saveCurrent()` `SaveResult` to `quotaError` state; visible yellow banner shown on QuotaExceededError
- Added `ISO_DATE_RE` + `isValidISODate` helper; `startDate` validated before passing to `computeCPM`
- Added T-shortcut (`keydown` listener): press T outside inputs → new task node at viewport center
- T-shortcut guard: `HTMLInputElement` / `HTMLTextAreaElement` check prevents node creation when editing
- Switched node IDs to `crypto.randomUUID()`; removed `idRef` counter and `getNextTaskId` function entirely
- German sequential title `Aufgabe {N}` for new nodes (counts existing task nodes)
- `TaskNode` gains `titleInputRef` + `focusOnMount` useEffect — title input focused on node creation
- `TopRightDebug` returns `null` when `!import.meta.env.DEV` — safe production guard

## Task Commits

1. **Task 1: Fix empty catches, remove setTimeouts, wire SaveResult banner, validate startDate** - `d7fa460` (fix — note: bundled into prior 01-05 chore commit)
2. **Task 2: Add T-shortcut, UUID IDs, focusOnMount in TaskNode, DEV gate in TopRightDebug** - `4915e4e` (feat)

## Files Created/Modified

- `web/src/components/GraphCanvas.tsx` - All major fixes: empty catches, setTimeouts, SaveResult banner, startDate validation, ReactFlowProvider wrapper, T-shortcut, UUID IDs, German titles
- `web/src/graph/TaskNode.tsx` - Added focusOnMount to TaskData interface; titleInputRef; focus useEffect
- `web/src/components/TopRightDebug.tsx` - DEV gate: `if (!import.meta.env.DEV) return null`

## Decisions Made

- `useReactFlow()` must be called inside a `ReactFlowProvider` context — refactored `GraphCanvas` into `GraphCanvasInner` (uses the hook) wrapped by exported `GraphCanvas` (provides `ReactFlowProvider`). This is the standard ReactFlow pattern for accessing viewport state from the root component.
- `onEditTask` moved before `addTaskNode` to resolve TypeScript "used before declaration" error for `const` in same scope.
- `idRef` counter fully removed — `crypto.randomUUID()` makes collision prevention unnecessary.
- `focusOnMount` uses empty-dependency `useEffect` (fires once on mount). The node data value is a creation-time signal and does not need to be cleared — it simply won't cause re-focus because the effect doesn't re-run.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ReactFlowProvider context required for useReactFlow()**
- **Found during:** Task 1 (adding `useReactFlow` import and hook call)
- **Issue:** `useReactFlow()` must be called inside a component rendered as a child of `<ReactFlow>` or `<ReactFlowProvider>`. `GraphCanvas` itself renders `<ReactFlow>` as its root, so the hook call at the top of `GraphCanvas` is outside the provider.
- **Fix:** Renamed main function to `GraphCanvasInner`, exported `GraphCanvas` as a thin `ReactFlowProvider` wrapper around `GraphCanvasInner`. Added `ReactFlowProvider` to the reactflow import.
- **Files modified:** `web/src/components/GraphCanvas.tsx`
- **Verification:** `tsc -b` passes; `vite build` exits 0
- **Committed in:** `d7fa460` (Task 1 commit)

**2. [Rule 1 - Bug] onEditTask forward reference in addTaskNode**
- **Found during:** Task 1 (build step)
- **Issue:** `addTaskNode` referenced `onEditTask` which was declared after it — TypeScript error TS2448 "Block-scoped variable used before its declaration"
- **Fix:** Moved `onEditTask` declaration above `addTaskNode`
- **Files modified:** `web/src/components/GraphCanvas.tsx`
- **Verification:** Build passes with zero TypeScript errors
- **Committed in:** `d7fa460` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking — ReactFlowProvider context; 1 bug — forward reference)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered

- Task 1 changes to GraphCanvas.tsx were inadvertently committed inside a prior plan's `d7fa460` commit (chore(01-05)). The code is correct and all acceptance criteria pass; the commit message attribution is the only anomaly.

## Next Phase Readiness

- All Phase 1 GraphCanvas.tsx requirements satisfied (ERR-01, ERR-03, BUG-01, BUG-03, BUG-04, SNAP-02)
- `saveCurrent()` results now properly surfaced; `startDate` validated; silent failures eliminated
- T-shortcut with auto-focus ready for UX testing
- Phase 1 Plan 07 (test implementation) can now implement tests against hardened components

---
*Phase: 01-code-quality-stability*
*Completed: 2026-03-16*
