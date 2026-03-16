---
phase: 02-ui-clean-professional
plan: 04
subsystem: cpm, graph-nodes, test-coverage
tags: [bug-fix, date-formatting, tdd, test-coverage, jsdom]
dependency_graph:
  requires: [02-02, 02-03]
  provides: [4-digit-year-format, tasknode-test-coverage]
  affects: [workdays.ts, workdays.test.ts, TaskNode.tsx, TaskNode.test.tsx]
tech_stack:
  added: []
  patterns: [tdd-red-green, border-longhand-for-jsdom]
key_files:
  created:
    - web/src/graph/TaskNode.test.tsx
  modified:
    - web/src/cpm/workdays.ts
    - web/src/cpm/workdays.test.ts
    - web/src/graph/TaskNode.tsx
decisions:
  - formatDateShort uses d.getFullYear() directly (no % 100) to return 4-digit year
  - TaskNode uses borderWidth/borderStyle/borderColor longhands instead of border shorthand (jsdom drops shorthand)
  - TaskNode.test.tsx asserts borderColor as rgb() values (jsdom converts hex to rgb on longhand properties)
metrics:
  duration: 4min
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_modified: 4
---

# Phase 2 Plan 4: 2-Digit Year Bug Fix and TaskNode Test Coverage Summary

Fixed the `% 100` year truncation bug in `formatDateShort` (now returns `DD.MM.YYYY`); created `TaskNode.test.tsx` with 5 tests covering critical-path border/background rendering per UI-CRIT-02; adapted border assertions for jsdom by using CSS longhand properties.

## What Was Built

**Task 1 — Fix 2-digit year bug in formatDateShort** (commit `74da9cd`)

- `web/src/cpm/workdays.ts`: Removed `% 100` from year calculation; `const yy = pad2(d.getFullYear() % 100)` replaced with `const yyyy = d.getFullYear()`. Return value is now `${dd}.${mm}.${yyyy}` producing `16.03.2026` instead of `16.03.26`.
- `web/src/cpm/workdays.test.ts`: Added `formatDateShort` to import; appended `describe('formatDateShort (UI-POLISH-01)', ...)` block with 3 test cases covering 4-digit year, negative assertion for 2-digit year, and year-2000 edge case. All 11 workdays tests pass.

**Task 2 — Create TaskNode.test.tsx for CP border coverage** (commit `20eef9f`)

- `web/src/graph/TaskNode.test.tsx`: Created with 5 tests asserting critical-path rendering:
  - Renders without crashing when `computed` is undefined
  - Critical node: `borderColor` matches `COLOR_ACCENT` (#2563eb / rgb(37, 99, 235))
  - Critical node: `background` matches `COLOR_ACCENT_LIGHT` (#dbeafe / rgb(219, 234, 254))
  - Non-critical node: `borderColor` matches `COLOR_BORDER` (#d4d4d8 / rgb(212, 212, 216))
  - Non-critical node: `background` matches `COLOR_BG` (#ffffff / rgb(255, 255, 255))
- `web/src/graph/TaskNode.tsx`: Adapted border style from shorthand (`border: '2px solid ...'`) to longhands (`borderWidth: 2, borderStyle: 'solid', borderColor: ...`) to enable assertion via `style.borderColor` in jsdom (Rule 1 auto-fix — jsdom silently drops `border` shorthand, making border assertions impossible).

## Decisions Made

1. **4-digit year via `d.getFullYear()` directly**: No padding or modulo — `getFullYear()` returns the full 4-digit year as a number, inserted directly into the template literal. Simple and correct.

2. **Border longhand in TaskNode**: jsdom (used by Vitest) does not support the CSS `border` shorthand property — setting `element.style.border = '...'` or React's `style={{ border: '...' }}` produces an empty `style.border` in jsdom. The longhand properties (`borderWidth`, `borderStyle`, `borderColor`) are supported and allow test assertions. This change has no visual impact in the browser (computed result is identical).

3. **rgb() assertions in tests**: jsdom converts hex color values to `rgb()` notation when parsing `borderColor` and `background`. Tests assert against the rgb equivalent constants, with additional equality checks confirming the TOKEN constants still hold the expected hex values — tying the runtime assertion to the design token contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TaskNode border shorthand incompatible with jsdom assertions**

- **Found during:** Task 2 (RED phase — tests failed with `expected '' to contain '#2563eb'`)
- **Issue:** jsdom drops CSS `border` shorthand entirely; `style.border` always returns `''` regardless of what's set, making the planned border assertions impossible
- **Fix:** Changed `TaskNode.tsx` border from shorthand `border: \`2px solid ${...}\`` to three longhand properties (`borderWidth`, `borderStyle`, `borderColor`); updated test assertions to use `style.borderColor` and rgb() equivalents
- **Files modified:** `web/src/graph/TaskNode.tsx`, `web/src/graph/TaskNode.test.tsx`
- **Commits:** `20eef9f`

### Deferred Items

**StartNode.tsx input uses `'#fff'` instead of `COLOR_BG`**

- Pre-existing issue from Plan 02-03 (not introduced by this plan)
- Logged to `.planning/phases/02-ui-clean-professional/deferred-items.md`
- No user-visible impact (values are identical)

## Verification Results

- `grep "d.getFullYear() % 100" web/src/cpm/workdays.ts` → zero matches (bug removed)
- `grep "const yyyy = d.getFullYear()" web/src/cpm/workdays.ts` → match confirmed
- `grep "formatDateShort" web/src/cpm/workdays.test.ts` → match confirmed
- `grep "2026" web/src/cpm/workdays.test.ts` → match confirmed (4-digit year in test expectation)
- `grep "COLOR_ACCENT" web/src/graph/TaskNode.test.tsx` → match confirmed
- `grep "COLOR_BORDER" web/src/graph/TaskNode.test.tsx` → match confirmed
- `grep "UI-CRIT-02" web/src/graph/TaskNode.test.tsx` → match confirmed
- `cd web && npx vitest run` → 52/52 tests pass (7 test files)

## Self-Check: PASSED
