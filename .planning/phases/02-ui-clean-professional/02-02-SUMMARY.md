---
phase: 02-ui-clean-professional
plan: "02"
subsystem: ui
tags: [react, typescript, lucide-react, tailwindcss, button, toolbar]

# Dependency graph
requires:
  - phase: 02-01
    provides: Design tokens (COLOR_SURFACE, COLOR_BORDER, RADIUS_MD, SHADOW_SM, SHADOW_MD) in theme.ts
provides:
  - Button.tsx with ghost variant (hover/active/focus-visible) and icon?: ReactNode prop
  - AppToolbar.tsx rewritten with four ghost Button components using Lucide icons
  - Visual separator between Export/Import group and Snapshots/PNG group
  - PNG button with inline loading state (Loader2 spinner + 'Exportiere...' label)
  - Toolbar wrapper styled with COLOR_SURFACE, COLOR_BORDER, RADIUS_MD, SHADOW_SM
affects:
  - 02-03
  - Any component that renders AppToolbar or imports Button

# Tech tracking
tech-stack:
  added: [lucide-react ^0.577.0]
  patterns:
    - "Ghost button variant: hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-* (not focus:)"
    - "Icon+label ghost buttons: Button variant=ghost with icon prop renders icon in flex-shrink-0 span"
    - "Toolbar grouping: 1px COLOR_BORDER vertical div separator between button groups"
    - "Inline loading state: useState(exporting) toggles icon (Loader2 spinner) and label; button disabled during async op"

key-files:
  created: []
  modified:
    - web/src/components/Button.tsx
    - web/src/components/AppToolbar.tsx
    - web/package.json

key-decisions:
  - "Ghost variant uses focus-visible: not focus: to avoid keyboard-style ring on mouse clicks"
  - "Snapshot dropdown internal buttons (Neu, Laden, Löschen) remain plain <button> elements — out of scope per plan"
  - "Exporting state lives in AppToolbar via useState; no separate context or store needed"
  - "Snapshot list state type expanded to { id: string; ts: number; name?: string }[] eliminating the as-cast pattern"

patterns-established:
  - "Pattern 1: Ghost variant for icon+label toolbar buttons — use Button variant=ghost with icon prop, never create ToolbarButton component"
  - "Pattern 2: Inline async loading state — useState boolean, set true before async op, finally block resets to false"
  - "Pattern 3: focus-visible for ghost buttons — prevents ring on mouse click, shows ring on keyboard navigation"

requirements-completed:
  - UI-TOOLBAR-01
  - UI-TOOLBAR-02
  - UI-TOOLBAR-03
  - UI-POLISH-02
  - UI-POLISH-03

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 2 Plan 02: Toolbar Icon Buttons and Ghost Variant Summary

**Ghost Button variant with icon prop added to Button.tsx; AppToolbar rewritten with four Lucide icon+label ghost buttons, visual separator, and in-button PNG export loading state**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T15:30:40Z
- **Completed:** 2026-03-16T15:32:49Z
- **Tasks:** 2
- **Files modified:** 3 (Button.tsx, AppToolbar.tsx, package.json + package-lock.json)

## Accomplishments
- Button.tsx gains `ghost` variant with `hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-*` (no focus: ring on mouse)
- Button.tsx gains `icon?: ReactNode` prop rendered in `flex-shrink-0` span before children; base class uses `inline-flex items-center gap-2`
- AppToolbar rewritten: four toolbar actions (Export, Import, Snapshots, PNG) converted from raw `<button>` to `<Button variant="ghost" icon={...}>`
- lucide-react installed; Download, Upload, Layers, Image, Loader2 icons used
- 1px COLOR_BORDER vertical separator between Export+Import group and Snapshots+PNG group
- PNG button shows Loader2 animate-spin and 'Exportiere...' while `exporting` state is true; disabled during export
- Toolbar wrapper styled with theme tokens: COLOR_SURFACE background, COLOR_BORDER border, RADIUS_MD border-radius, SHADOW_SM

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Button.tsx with ghost variant and icon prop** - `bc21a4d` (feat)
2. **Task 2: Rewrite AppToolbar.tsx with icon buttons, grouping, and PNG loading state** - `468531c` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `web/src/components/Button.tsx` - Added ghost variant, icon prop, inline-flex base, per-variant focus styles
- `web/src/components/AppToolbar.tsx` - Full rewrite: four ghost Button components with Lucide icons, separator, exporting state, theme token wrapper
- `web/package.json` - lucide-react ^0.577.0 added

## Decisions Made
- Ghost variant uses `focus-visible:` not `focus:` — prevents keyboard-style focus ring appearing on mouse click (anti-pattern from CONTEXT.md)
- Snapshot dropdown internal buttons (Neu, Laden, Löschen) kept as plain `<button>` — explicitly out of scope per plan must_haves
- Snapshot list state type updated from `{ id: string; ts: number }[]` to include `name?` field, eliminating the `as { id: string; ts: number; name?: string }` cast pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Button ghost variant + icon prop available for all future components
- AppToolbar now uses professional icon+label layout matching UI-SPEC design
- All 44 Vitest tests pass; TypeScript clean
- Ready for Plan 02-03 (node styling, critical path highlighting)

---
*Phase: 02-ui-clean-professional*
*Completed: 2026-03-16*

## Self-Check: PASSED

- Button.tsx: FOUND
- AppToolbar.tsx: FOUND
- 02-02-SUMMARY.md: FOUND
- Commit bc21a4d (Task 1): FOUND
- Commit 468531c (Task 2): FOUND
