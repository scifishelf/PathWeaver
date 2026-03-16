---
phase: 02-ui-clean-professional
plan: 03
subsystem: graph-nodes, cp-banner, context-menu
tags: [design-tokens, theme-migration, cp-banner, accessibility, focus-visible]
dependency_graph:
  requires: [02-01]
  provides: [token-migrated-nodes, cp-banner-restyled, context-menu-a11y]
  affects: [TaskNode, StartNode, EndNode, GraphCanvas, ContextMenu]
tech_stack:
  added: []
  patterns: [theme-token-substitution, conditional-border-via-template-literal]
key_files:
  created: []
  modified:
    - web/src/graph/TaskNode.tsx
    - web/src/graph/StartNode.tsx
    - web/src/graph/EndNode.tsx
    - web/src/components/GraphCanvas.tsx
    - web/src/components/ContextMenu.tsx
decisions:
  - CP banner background is '#eff6ff' (blue-50), distinct from COLOR_ACCENT_LIGHT '#dbeafe' (CP node fill) — different values by design
  - Banner text locked to '◆ Kritischer Pfad: {N} Arbeitstage' — no node ID list, no end date
  - TaskNode uses template-literal border to switch between COLOR_ACCENT and COLOR_BORDER based on critical flag
  - StartNode and EndNode use COLOR_BG (not CRITICAL_BG); the CRITICAL_BG alias was semantically incorrect for those nodes
metrics:
  duration: 2min
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_modified: 5
---

# Phase 2 Plan 3: Graph Node Token Migration and CP Banner Restyle Summary

Token-migrated all three node components to use design tokens from theme.ts; CP nodes now have colored border (COLOR_ACCENT) in addition to fill; CP banner restyled to locked '◆ Kritischer Pfad: {N} Arbeitstage' format; ContextMenu buttons have keyboard focus-visible outline.

## What Was Built

**Task 1 — Token-migrate TaskNode, StartNode, EndNode** (commit `977d74e`)

Replaced all hardcoded hex values and magic numbers across the three node components with theme tokens:

- **TaskNode**: `CRITICAL_BG` removed; background now conditionally `COLOR_ACCENT_LIGHT` (critical) or `COLOR_BG` (non-critical); border now `2px solid COLOR_ACCENT` when critical, `2px solid COLOR_BORDER` otherwise; `borderRadius 8` → `RADIUS_MD`, `borderRadius 6` → `RADIUS_SM`, `boxShadow` literal → `SHADOW_SM`
- **StartNode**: `CRITICAL_BG` removed (was always applying blue-100 background regardless of criticality — semantic bug); background now `COLOR_BG`; border, radius, shadow all migrated to tokens
- **EndNode**: `CRITICAL_BG` removed (same semantic bug as StartNode); background `COLOR_BG`; date text color `'#374151'` → `COLOR_TEXT`

**Task 2 — CP Banner restyle and ContextMenu focus-visible** (commit `7664cb7`)

- **GraphCanvas CP banner**: `CRITICAL_BG` import replaced by `COLOR_ACCENT, RADIUS_MD, SHADOW_SM`; background changed from `'#dbeafe'` to `'#eff6ff'`; added `color: '#1d4ed8'`; border from `'#bfdbfe'` to `` `1px solid ${COLOR_ACCENT}` ``; padding `'6px 12px'` → `'8px 16px'`; boxShadow to `SHADOW_SM`; banner text simplified from node-ID list + end date to `◆ Kritischer Pfad: {N} Arbeitstage`
- **ContextMenu**: Added `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600` to button className

## Decisions Made

1. **CP banner background '#eff6ff' vs COLOR_ACCENT_LIGHT '#dbeafe'**: These are intentionally distinct values. The banner uses blue-50 (#eff6ff), which is lighter than the node fill blue-100 (#dbeafe). This ensures the banner and critical nodes are visually differentiable as separate elements.

2. **Locked banner format**: The banner now shows only duration, removing node ID paths and the end date with 2-digit year. This reduces visual noise and makes the most critical metric immediately readable.

3. **Template-literal border in TaskNode**: The conditional CP border uses a template literal to switch between `COLOR_ACCENT` and `COLOR_BORDER` rather than inline ternary in two separate style properties. This keeps the logic in one line.

4. **StartNode/EndNode use COLOR_BG**: These nodes were incorrectly using `CRITICAL_BG` (always blue-100), making all start/end nodes appear as critical nodes. Fixed to `COLOR_BG` (white) which is semantically correct — only task nodes can be on the critical path.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `grep "CRITICAL_BG"` → zero matches in all five modified files
- `grep "#d4d4d8\|#dbeafe\|#374151"` → zero matches in node files
- `grep "Arbeitstage"` → match in GraphCanvas with correct diamond-prefixed format
- `grep "criticalPath.join\|earliestFinishISO"` → zero matches in GraphCanvas (removed from banner)
- `grep "focus-visible:outline-blue-600"` → match in ContextMenu
- TypeScript: `npx tsc --noEmit` exits 0
- Vitest: 44/44 tests pass (6 test files)

## Self-Check: PASSED

All modified files exist. Both task commits (977d74e, 7664cb7) confirmed in git history.
