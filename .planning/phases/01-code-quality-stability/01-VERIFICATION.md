---
phase: 01-code-quality-stability
verified: 2026-03-16T15:05:00Z
status: passed
score: 20/20 must-haves verified
re_verification: false
---

# Phase 01: Code Quality & Stability Verification Report

**Phase Goal:** Establish code quality baseline — eliminate dead dependencies, achieve full TypeScript type safety in persistence layer, harden autosave reliability, fix known bugs, and achieve 100% Nyquist test coverage for all modified modules.
**Verified:** 2026-03-16T15:05:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Dead dependencies (zustand, immer) removed from package.json | VERIFIED | `grep '"zustand"\|"immer"' package.json` returns empty; html-to-image present |
| 2 | dom-to-image-more removed; replaced by html-to-image in AppToolbar.tsx | VERIFIED | `grep "dom-to-image-more" AppToolbar.tsx` returns empty; `toPng` import confirmed |
| 3 | AppNodeData discriminated union exported from cpm/types.ts | VERIFIED | `export type AppNodeData = TaskNodeData \| StartNodeData \| EndNodeData` present |
| 4 | serialize.ts has zero `as any` casts | VERIFIED | `grep -c "as any" serialize.ts` returns 0 |
| 5 | isProjectJSON type guard exported from serialize.ts | VERIFIED | `export function isProjectJSON(data: unknown): data is ProjectJSON` confirmed |
| 6 | SaveResult interface exported from autosave.ts | VERIFIED | `export interface SaveResult { ok: boolean; error?: string }` confirmed |
| 7 | QuotaExceededError caught and returns exact German copy | VERIFIED | `instanceof DOMException && e.name === 'QuotaExceededError'` with exact message confirmed |
| 8 | Snapshot IDs have random suffix (BUG-02) | VERIFIED | `id: \`${Date.now()}-${Math.random().toString(36).slice(2, 8)}\`` in autosave.ts |
| 9 | Snapshots support optional name field (SNAP-01) | VERIFIED | `name?: string` in SnapshotEntry; saveSnapshot(project, name?) confirmed |
| 10 | All empty `catch {}` blocks eliminated (ERR-01) | VERIFIED | `grep "catch {}" autosave.ts GraphCanvas.tsx` both return 0 |
| 11 | setTimeout-based validation calls removed (BUG-03) | VERIFIED | `grep -c "setTimeout.*validate" GraphCanvas.tsx` returns 0 |
| 12 | New task nodes use crypto.randomUUID() (BUG-01) | VERIFIED | `const id = crypto.randomUUID()` in addTaskNode; idRef/getNextTaskId gone |
| 13 | TopRightDebug gated on import.meta.env.DEV (BUG-04) | VERIFIED | `if (!import.meta.env.DEV) return null` at top of component |
| 14 | startDate validated with ISO regex before CPM (ERR-03) | VERIFIED | `ISO_DATE_RE` + `isValidISODate` helper in GraphCanvas.tsx; `validatedStartDate` used |
| 15 | SaveResult wired to visible QuotaExceeded banner (ERR-02) | VERIFIED | `const result: SaveResult = saveCurrent(pj); if (!result.ok) setQuotaError(result.error)` + banner JSX |
| 16 | T-shortcut creates node at viewport center (SNAP-02) | VERIFIED | `onKeyDown` handler with `getViewport()`, HTMLInputElement guard, `addTaskNode(centerX, centerY)` |
| 17 | TaskNode auto-focuses title input on focusOnMount (SNAP-02) | VERIFIED | `useEffect(() => { if (data.focusOnMount) titleInputRef.current?.focus() }, [])` in TaskNode.tsx |
| 18 | PNG export uses html-to-image with filter (BUG-05) | VERIFIED | `toPng(el, { backgroundColor, filter })` with `react-flow__controls/panel/minimap` exclusions |
| 19 | All test todos implemented — zero remaining (TEST-01–04) | VERIFIED | `grep -c "it.todo"` returns 0 across all 5 test files |
| 20 | `npm run build && npm test -- --run` exits 0 | VERIFIED | Build: 0 errors, 527 modules. Tests: 44 passed (6 files), 0 failures |

**Score:** 20/20 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `web/package.json` | html-to-image present; zustand/immer/dom-to-image-more absent | VERIFIED | html-to-image@^1.11.13 present; all three dead deps absent |
| `web/src/cpm/types.ts` | AppNodeData discriminated union | VERIFIED | TaskNodeData \| StartNodeData \| EndNodeData exported; focusOnMount on TaskNodeData |
| `docs/json-schema.v1.json` | computed field present; valid JSON | VERIFIED | "computed" optional property added; node -e JSON.parse exits 0 |
| `web/src/persistence/serialize.ts` | isProjectJSON guard; zero as-any | VERIFIED | 0 `as any`, isProjectJSON exported with `data is ProjectJSON` predicate |
| `web/src/persistence/autosave.ts` | SaveResult, QuotaExceededError, random suffix, name support | VERIFIED | All four features confirmed in file; zero empty catch blocks |
| `web/src/components/AppToolbar.tsx` | html-to-image import; snapshot name input; no dom-to-image-more | VERIFIED | toPng import; snapshotName state; name input with placeholder; filter function |
| `web/src/components/GraphCanvas.tsx` | SaveResult check; UUID; T-shortcut; ISO validation; no empty catches | VERIFIED | All confirmed; 18 remaining as-any are ReactFlow boundary (EXT-03, deferred to Phase 2) |
| `web/src/graph/TaskNode.tsx` | focusOnMount useEffect; titleInputRef | VERIFIED | titleInputRef ref, useEffect on empty deps, ref={titleInputRef} on input |
| `web/src/components/TopRightDebug.tsx` | DEV gate | VERIFIED | `if (!import.meta.env.DEV) return null` at top |
| `web/src/persistence/serialize.test.ts` | Round-trip tests; isProjectJSON tests (TEST-01, TYPES-01) | VERIFIED | 150 lines; 11 passing tests; 0 todos |
| `web/src/graph/validate.test.ts` | validateGraph tests (TEST-02) | VERIFIED | 56 lines (meets min_lines:50); 6 passing tests; 0 todos |
| `web/src/cpm/workdays.test.ts` | addWorkdays tests; ERR-03 NaN safety (TEST-03) | VERIFIED | 48 lines (meets min_lines:40); 8 passing tests; 0 todos |
| `web/src/persistence/autosave.test.ts` | SaveResult, QuotaExceededError, BUG-02, SNAP-01 (ERR-02) | VERIFIED | 103 lines (meets min_lines:70); 11 passing tests; 0 todos |
| `web/src/cpm/compute.test.ts` | CPM edge cases (TEST-04) | VERIFIED | 115 lines (meets min_lines:70); 7 passing tests; 0 todos |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `web/src/cpm/types.ts` | `web/src/persistence/serialize.ts` | `import { AppNodeData, TaskNodeData, ... } from '../cpm/types'` | WIRED | Import confirmed lines 2-10 of serialize.ts |
| `web/src/persistence/autosave.ts` | `web/src/components/GraphCanvas.tsx` | `const result: SaveResult = saveCurrent(pj); if (!result.ok) setQuotaError(...)` | WIRED | result.ok checked at line 117 of GraphCanvas.tsx |
| `web/src/components/GraphCanvas.tsx` | `web/src/cpm/compute.ts` | `isValidISODate(startDate)` guards CPM call | WIRED | ISO_DATE_RE + isValidISODate + validatedStartDate confirmed |
| `web/src/components/GraphCanvas.tsx` | `web/src/graph/TaskNode.tsx` | `focusOnMount: true` in addTaskNode triggers focus in TaskNode useEffect | WIRED | focusOnMount set in newNode.data; TaskNode reads it in useEffect |
| `web/src/components/AppToolbar.tsx` | `html-to-image` | `import { toPng } from 'html-to-image'` | WIRED | import at line 5; toPng called in PNG button handler |
| `web/src/components/AppToolbar.tsx` | `web/src/persistence/autosave.ts` | `saveSnapshot(pj, snapshotName)` | WIRED | snapshotName state passed to saveSnapshot in both Enter handler and button onClick |
| `web/src/persistence/autosave.test.ts` | `web/src/persistence/autosave.ts` | tests validate SaveResult, random suffix, name field | WIRED | QuotaExceededError, ok:true, random suffix, name tests all confirmed |
| `web/src/persistence/serialize.test.ts` | `web/src/persistence/serialize.ts` | tests validate round-trip and isProjectJSON guard | WIRED | fromProjectJSON+toProjectJSON round-trip; isProjectJSON true/false tests confirmed |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DEPS-01 | 01-01 | Zustand removed from package.json | SATISFIED | `grep '"zustand"' package.json` → no match |
| DEPS-02 | 01-05 | dom-to-image-more replaced by html-to-image | SATISFIED | AppToolbar.tsx imports toPng; dom-to-image-more absent from package.json |
| DEPS-03 | 01-01 | Immer removed from package.json | SATISFIED | `grep '"immer"' package.json` → no match |
| TYPES-01 | 01-03 | isProjectJSON type guard in serialize.ts | SATISFIED | `isProjectJSON(data: unknown): data is ProjectJSON` exported |
| TYPES-02 | 01-01 | AppNodeData discriminated union | SATISFIED | Union type in cpm/types.ts with 3 members |
| TYPES-03 | 01-03 | Zero as-any in serialize.ts | SATISFIED | `grep -c "as any" serialize.ts` = 0; typed casts (as TaskNodeData) are not as-any |
| ERR-01 | 01-04, 01-06 | No silent catch {} blocks in autosave.ts and GraphCanvas.tsx | SATISFIED | Both files: 0 empty catch blocks; all log console.error(e) |
| ERR-02 | 01-04, 01-06 | QuotaExceededError handled; SaveResult returned | SATISFIED | DOMException check + exact German copy; banner in GraphCanvas JSX |
| ERR-03 | 01-06 | startDate validated before workdays/CPM | SATISFIED | ISO_DATE_RE + isValidISODate; validatedStartDate used in computeCPM call |
| BUG-01 | 01-06 | Node IDs use crypto.randomUUID() | SATISFIED | crypto.randomUUID() in addTaskNode; old idRef/getNextTaskId gone |
| BUG-02 | 01-04 | Snapshot keys have random suffix | SATISFIED | `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` pattern confirmed |
| BUG-03 | 01-06 | setTimeout-based validate calls removed | SATISFIED | `grep -c "setTimeout.*validate" GraphCanvas.tsx` = 0 |
| BUG-04 | 01-06 | TopRightDebug behind DEV gate | SATISFIED | `if (!import.meta.env.DEV) return null` confirmed |
| BUG-05 | 01-05 | PNG export excludes ReactFlow UI panels | SATISFIED | filter function excludes react-flow__controls/panel/minimap |
| TEST-01 | 01-02, 01-07 | Serialization round-trip tests (3+ configs) | SATISFIED | serialize.test.ts: 11 passing tests; 3 round-trip configs covered |
| TEST-02 | 01-02, 01-07 | validateGraph unit tests | SATISFIED | validate.test.ts: 6 passing tests; valid graph, orphan, cycle, missing start/end |
| TEST-03 | 01-02, 01-07 | workdays unit tests with invalid date safety | SATISFIED | workdays.test.ts: 8 passing tests; NaN-safety test included |
| TEST-04 | 01-02, 01-07 | CPM edge cases (single-node, orphan, cycle) | SATISFIED | compute.test.ts: 7 passing tests; ORPHAN/CYCLE/ComputeError.code covered |
| SNAP-01 | 01-04, 01-05 | Snapshots support optional name field + UI | SATISFIED | name?: string in schema; input in AppToolbar; listSnapshots returns name |
| SNAP-02 | 01-06 | T-shortcut creates task node at viewport center | SATISFIED | onKeyDown with getViewport(); guard for input/textarea; addTaskNode(centerX, centerY) |

**Orphaned requirements check:** No additional Phase 1 requirement IDs found in REQUIREMENTS.md that were not claimed by a plan.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `web/src/components/GraphCanvas.tsx` | multiple | `as any` (18 occurrences) | Info | ReactFlow boundary casts — explicitly deferred to Phase 2 as EXT-03; not a Phase 1 failure |
| `web/src/components/GraphCanvas.tsx` | ~53 | `n.data as any` in onEditTask | Info | Part of ReactFlow boundary casts; EXT-03 scope |
| `web/src/components/AppToolbar.tsx` | ~168 | `pj as any` in loadSnapshot call path | Info | ReactFlow boundary; same EXT-03 scope |

No blockers or warnings found. All anti-patterns are intentional ReactFlow boundary casts explicitly deferred to Phase 2 (EXT-03). The REQUIREMENTS.md entry for EXT-03 is labeled as a Phase 2 item.

---

### Human Verification Required

#### 1. T-shortcut — viewport center placement

**Test:** Open app in browser, press T with no input focused
**Expected:** New task node appears at visible canvas center with title input focused and cursor blinking
**Why human:** Visual positioning and auto-focus behavior require a running browser

#### 2. Snapshot name input — UX flow

**Test:** Open Snapshots panel, type a name in the text input, press Enter or click "+ Neu"
**Expected:** Named snapshot appears in list showing the typed name instead of a timestamp
**Why human:** UI interaction flow; list display logic requires browser rendering

#### 3. PNG export — panel exclusion

**Test:** Create a small graph, click the PNG button
**Expected:** Downloaded PNG shows graph nodes and edges; does NOT include ReactFlow controls, minimap, or panel overlays
**Why human:** Visual content of exported image cannot be verified programmatically

#### 4. T-shortcut guard — no node when input focused

**Test:** Click into a task node's title input field, then press T
**Expected:** No new task node is created
**Why human:** Keyboard event + focus state interaction requires a running browser

---

### Notes

- The test runner emits two expected `stderr` lines during the test run: one `console.error` from the generic-error SaveResult test (correct behavior — the mock throws and the implementation logs it), and one `ComputeError` from `App.test.tsx` (the initial render renders an unconnected graph which correctly triggers a ComputeError that GraphCanvas.tsx catches and logs). Both are expected behavior, not failures.
- `npm run build && npm test -- --run` exits 0 — the Phase 1 gate criterion is fully met.

---

_Verified: 2026-03-16T15:05:00Z_
_Verifier: Claude (gsd-verifier)_
