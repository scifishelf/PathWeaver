---
phase: 02-ui-clean-professional
plan: "01"
subsystem: ui
tags: [design-tokens, theme, typescript]

# Dependency graph
requires:
  - phase: 01-code-quality-stability
    provides: Stable codebase with CRITICAL_BG token in theme.ts as starting point
provides:
  - Full 14-token design system in theme.ts (colors, radii, shadows, transitions, backward-compat aliases)
  - Clean app title without (MVP) suffix or legacy HTML tags
affects:
  - 02-02-PLAN (Button ghost variant, AppToolbar tokens)
  - 02-03-PLAN (TaskNode/StartNode/EndNode/GraphCanvas tokens)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Design tokens as TypeScript UPPER_SNAKE_CASE constants in theme.ts — single source of truth"
    - "Backward-compat alias pattern: CRITICAL_BG = COLOR_ACCENT_LIGHT preserves Phase 1 imports"

key-files:
  created: []
  modified:
    - web/src/graph/theme.ts
    - web/src/App.tsx
    - web/src/App.test.tsx

key-decisions:
  - "CRITICAL_BG retained as alias pointing to COLOR_ACCENT_LIGHT — no downstream breakage"
  - "CRITICAL_BORDER added as new Phase 2 alias for COLOR_ACCENT — ready for TaskNode border upgrade"
  - "App title uses plain hyphen-minus (not non-breaking hyphen) per UI-SPEC Copywriting Contract"

patterns-established:
  - "Token naming: UPPER_SNAKE_CASE with category prefix (COLOR_, RADIUS_, SHADOW_, TRANSITION_)"
  - "Backward-compat alias: new token const, alias = new token — both exportable by name"

requirements-completed:
  - UI-FOUND-01
  - UI-FOUND-02

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 2 Plan 01: Design Token Expansion Summary

**14-token design system in theme.ts with color/radius/shadow/transition constants plus clean app title removing (MVP) suffix**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T15:27:34Z
- **Completed:** 2026-03-16T15:29:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Expanded theme.ts from 1 export (CRITICAL_BG) to 14 named exports covering the full locked token set
- Retained CRITICAL_BG as backward-compat alias so Phase 1 imports compile without change
- Added CRITICAL_BORDER alias for COLOR_ACCENT, ready for Phase 2 node border upgrades
- Cleaned App.tsx h1: removed (MVP), &nbsp;, and <big> tag — plain semantic HTML
- Updated App.test.tsx: description de-MVP'd, added negative assertion for (MVP) text

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand theme.ts to full design token system** - `12ad725` (feat)
2. **Task 2: Remove (MVP) from App.tsx title and update App.test.tsx** - `c5f8f89` (feat)

## Files Created/Modified

- `web/src/graph/theme.ts` — Expanded from 1 to 14 exports; full color/radius/shadow/transition token set
- `web/src/App.tsx` — h1 now reads "PathWeaver – Netzplan-Tool" with no legacy HTML tags
- `web/src/App.test.tsx` — Test description updated; (MVP) negative assertion added

## Decisions Made

- CRITICAL_BG retained as alias pointing to COLOR_ACCENT_LIGHT — zero downstream impact
- CRITICAL_BORDER added as new alias for COLOR_ACCENT — downstream plans (02-03) can use it for node borders
- Plain hyphen-minus `-` used in title (not the non-breaking hyphen from original) per UI-SPEC

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing stderr output (ComputeError: "Knoten end ist nicht mit Start verbunden") in App.test.tsx is expected behavior from the default empty graph state — not caused by this plan's changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 14 design tokens available for downstream plans to import by name
- Plan 02-02 can import COLOR_ACCENT, COLOR_SURFACE, COLOR_BORDER, RADIUS_MD, SHADOW_SM from theme.ts for Button ghost variant and AppToolbar redesign
- Plan 02-03 can import CRITICAL_BG, CRITICAL_BORDER, COLOR_BG, COLOR_BORDER, RADIUS_MD for TaskNode/StartNode/EndNode styling

---
*Phase: 02-ui-clean-professional*
*Completed: 2026-03-16*
