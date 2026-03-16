---
phase: 01-code-quality-stability
plan: 05
subsystem: ui
tags: [html-to-image, dom-to-image-more, png-export, snapshots, reactflow, react]

# Dependency graph
requires:
  - phase: 01-code-quality-stability
    plan: 01
    provides: "html-to-image installed in package.json"
  - phase: 01-code-quality-stability
    plan: 04
    provides: "saveSnapshot(project, name?) signature with optional name parameter"
provides:
  - "AppToolbar.tsx uses html-to-image toPng with filter excluding ReactFlow UI panels"
  - "PNG export filters out react-flow__controls, react-flow__panel, react-flow__minimap"
  - "Snapshot name input UI wired into saveSnapshot(pj, snapshotName)"
  - "dom-to-image-more fully removed (package.json + .d.ts stub)"
affects: [01-code-quality-stability, 02-ui-enhancements]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "html-to-image filter callback: guard with instanceof Element before classList access"
    - "html-to-image option: backgroundColor (not bgcolor as in dom-to-image-more)"

key-files:
  created: []
  modified:
    - web/src/components/AppToolbar.tsx
    - web/package.json
    - web/package-lock.json
  deleted:
    - web/src/types/dom-to-image-more.d.ts

key-decisions:
  - "html-to-image filter must guard with instanceof Element — filter receives all DOM nodes, not just Elements"
  - "Snapshot name input placed before '+ Neu' button in same flex row; pressing Enter or clicking button both trigger save"
  - "After snapshot creation: clear name input (setSnapshotName('')) to avoid accidental re-use"
  - "Snapshot list display: show s.name if present, fallback to toLocaleString() for unnamed snapshots"
  - "console.error added to catch block in '+ Neu' handler (ERR-01 compliance)"

patterns-established:
  - "PNG export: inject temporary style tag, capture, remove — pattern established in Plan 01-01 preserved"

requirements-completed: [DEPS-02, BUG-05, SNAP-01]

# Metrics
duration: 8min
completed: 2026-03-16
---

# Phase 1 Plan 05: AppToolbar PNG Migration & Snapshot Name Input Summary

**html-to-image PNG export with ReactFlow UI filter and snapshot name input field replacing dom-to-image-more**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-16T13:46:00Z
- **Completed:** 2026-03-16T13:54:29Z
- **Tasks:** 2
- **Files modified:** 3 (+ 1 deleted)

## Accomplishments
- Replaced `import domtoimage from 'dom-to-image-more'` with `import { toPng } from 'html-to-image'` (named export)
- Updated PNG export handler: `backgroundColor` (not `bgcolor`), added `filter` callback excluding ReactFlow controls/panel/minimap
- Added `snapshotName` state + text input before "+ Neu" button with Enter key support and post-save clear
- Snapshot list now shows `s.name` when present, falls back to timestamp for unnamed snapshots
- Removed `dom-to-image-more` from `package.json` via `npm uninstall` and deleted `web/src/types/dom-to-image-more.d.ts` stub

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace dom-to-image-more import and update PNG export handler** - `ccf0609` (feat)
2. **Task 2: Remove dom-to-image-more package and its .d.ts stub** - `d7fa460` (chore)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `web/src/components/AppToolbar.tsx` - html-to-image import, filter option, snapshotName state + input UI, snapshot name display
- `web/package.json` - dom-to-image-more removed from dependencies
- `web/package-lock.json` - updated lockfile
- `web/src/types/dom-to-image-more.d.ts` - deleted (.d.ts stub no longer needed)

## Decisions Made
- Used `instanceof Element` guard in filter callback — required because html-to-image passes all DOM nodes (text nodes, comment nodes) to the filter, not just Elements
- Snapshot name input clears after creation to prevent accidental duplicate names on subsequent saves

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- During Task 2, a stale TypeScript build cache briefly surfaced a pre-existing error in GraphCanvas.tsx (`onEditTask` used before declaration); subsequent clean build confirmed it was a cache artifact — no actual error in the codebase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- DEPS-02, BUG-05, SNAP-01 complete — PNG export and snapshot name input are production-ready
- dom-to-image-more fully purged from codebase
- Plan 01-06 (visual verification checkpoint) can proceed

---
*Phase: 01-code-quality-stability*
*Completed: 2026-03-16*

## Self-Check: PASSED

- AppToolbar.tsx: FOUND
- dom-to-image-more.d.ts: CONFIRMED DELETED
- 01-05-SUMMARY.md: FOUND
- commit ccf0609: FOUND
- commit d7fa460: FOUND
