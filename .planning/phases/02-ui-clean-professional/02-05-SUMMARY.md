---
phase: 02-ui-clean-professional
plan: 05
subsystem: ui
tags: [react, design-tokens, theme, typescript]

# Dependency graph
requires:
  - phase: 02-ui-clean-professional
    provides: theme.ts token system established in plans 02-01 through 02-04
provides:
  - theme.ts with 23 named constants (9 new: canvas bg, error, warning, FAB tokens)
  - GraphCanvas.tsx with zero unauthorized hardcoded hex values
  - AppToolbar.tsx with zero hardcoded hex values
  - Full compliance with UI-FOUND-02 "kein hardcodierter Hex-Wert mehr in Komponenten"
affects: [all future UI work referencing error/warning/FAB/canvas colors]

# Tech tracking
tech-stack:
  added: []
  patterns: [All visual values flow through theme.ts named constants; no inline hex in component files]

key-files:
  created: []
  modified:
    - web/src/graph/theme.ts
    - web/src/components/GraphCanvas.tsx
    - web/src/components/AppToolbar.tsx

key-decisions:
  - "rgba() shadow values kept inline (no token for rgba variants) — acceptable per plan spec"
  - "CP banner values (#eff6ff, #1d4ed8) intentionally retained — distinct from token values by design, locked per plan 02-03"

patterns-established:
  - "Token naming: COLOR_<CATEGORY>_<VARIANT> (e.g. COLOR_ERROR_BG, COLOR_WARNING_TEXT)"
  - "All hardcoded hex in components replaced via named import from theme.ts"

requirements-completed: [UI-FOUND-02]

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 02 Plan 05: Hex Token Cleanup Summary

**All hardcoded hex values removed from GraphCanvas.tsx and AppToolbar.tsx via 9 new theme.ts tokens covering canvas background, error/warning banners, and FAB button**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T16:56:50Z
- **Completed:** 2026-03-16T16:58:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added 9 new named color constants to theme.ts (23 total exports)
- Replaced 10 hardcoded hex values in GraphCanvas.tsx with named imports
- Replaced 2 hardcoded hex values in AppToolbar.tsx with named imports
- UI-FOUND-02 requirement fully satisfied: zero unauthorized hex in components

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand theme.ts with 9 new tokens** - `125f844` (feat)
2. **Task 2: Replace hardcoded hex in GraphCanvas.tsx and AppToolbar.tsx** - `98cd2d6` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `web/src/graph/theme.ts` - Added 9 new color tokens: COLOR_CANVAS_BG, COLOR_ERROR, COLOR_ERROR_BG, COLOR_ERROR_BORDER, COLOR_WARNING_BG, COLOR_WARNING_BORDER, COLOR_WARNING_TEXT, COLOR_FAB, COLOR_FAB_BORDER
- `web/src/components/GraphCanvas.tsx` - Replaced 10 hardcoded hex values; import expanded to include all new tokens and COLOR_BG
- `web/src/components/AppToolbar.tsx` - Replaced 2 hardcoded hex values; import expanded with COLOR_TEXT_MUTED

## Decisions Made
- rgba() shadow values kept inline — no token for rgba alpha variants, acceptable per plan spec
- CP banner values (#eff6ff, #1d4ed8) intentionally retained as per plan 02-03 spec

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 02 all 5 plans complete; all UI token requirements satisfied
- theme.ts is the single source of truth for all visual values across the application
- No blockers for subsequent work

---
*Phase: 02-ui-clean-professional*
*Completed: 2026-03-16*
