---
phase: 02-ui-clean-professional
verified: 2026-03-16T17:05:00Z
status: gaps_found
score: 9/10 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 19/20
  gaps_closed:
    - "GraphCanvas.tsx hardcoded hex values for error banner, FAB, canvas background, validation highlights, CP edge stroke — all replaced by plan 02-05"
    - "AppToolbar.tsx hardcoded hex values (#ffffff PNG export bg, #6b7280 muted text) — replaced by plan 02-05"
    - "theme.ts expanded from 14 to 23 exports (9 new tokens for canvas, error, warning, FAB)"
  gaps_remaining:
    - "StartNode.tsx line 38: background: '#fff' on date input — COLOR_BG (#ffffff) already imported, single missed substitution"
  regressions: []
gaps:
  - truth: "No component file contains a hardcoded hex value that belongs in theme.ts"
    status: partial
    reason: "StartNode.tsx line 38 contains background: '#fff' on the date input inner element. '#fff' is functionally identical to COLOR_BG ('#ffffff') which is already imported by this file. All other hardcoded hex has been eliminated."
    artifacts:
      - path: "web/src/graph/StartNode.tsx"
        issue: "Line 38: `background: '#fff'` — must be `background: COLOR_BG` (COLOR_BG already imported on line 3)"
    missing:
      - "Replace `background: '#fff'` with `background: COLOR_BG` on StartNode.tsx line 38"
---

# Phase 02: UI Clean & Professional — Verification Report (Re-verification)

**Phase Goal:** PathWeaver reads as a professional, production-ready tool on first open — with a consistent design language, an icon-based toolbar, prominent critical path emphasis, and no prototype-era artifacts.
**Verified:** 2026-03-16T17:05:00Z
**Status:** gaps_found (1 residual gap)
**Re-verification:** Yes — after plan 02-05 gap-closure run

---

## Re-verification Summary

Previous verification (2026-03-16T16:42:00Z) found UI-FOUND-02 partial: GraphCanvas.tsx had 10+ hardcoded hex values and AppToolbar.tsx had 2. Plan 02-05 was created as a gap-closure plan to address these by expanding theme.ts with 9 new tokens and replacing all remaining hardcoded hex in GraphCanvas.tsx and AppToolbar.tsx.

**Gaps closed by plan 02-05:**
- theme.ts now exports 23 constants (14 core + 9 new: COLOR_CANVAS_BG, COLOR_ERROR, COLOR_ERROR_BG, COLOR_ERROR_BORDER, COLOR_WARNING_BG, COLOR_WARNING_BORDER, COLOR_WARNING_TEXT, COLOR_FAB, COLOR_FAB_BORDER)
- GraphCanvas.tsx: all previously flagged hex replaced (`#ef4444` → COLOR_ERROR, `#2563eb` → COLOR_ACCENT, `#eef2f7` → COLOR_CANVAS_BG, `#16a34a` → COLOR_FAB, `#065f46` → COLOR_FAB_BORDER, `#fee2e2` → COLOR_ERROR_BG, `#fecaca` → COLOR_ERROR_BORDER, `#fefce8` → COLOR_WARNING_BG, `#fef08a` → COLOR_WARNING_BORDER, `#854d0e` → COLOR_WARNING_TEXT, `#fff` (FAB color) → COLOR_BG)
- AppToolbar.tsx: PNG backgroundColor `#ffffff` → COLOR_BG, empty-state color `#6b7280` → COLOR_TEXT_MUTED

**Remaining gap:** StartNode.tsx line 38 `background: '#fff'` on date input — not addressed by any plan.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | theme.ts exports 23 named design token constants (14 core + 9 extended) | VERIFIED | `grep "^export const" theme.ts \| wc -l` → 23; all tokens confirmed present |
| 2 | No component file contains a hardcoded hex value that belongs in theme.ts | PARTIAL | StartNode.tsx line 38: `background: '#fff'` — should be `COLOR_BG`; all other component files are clean |
| 3 | App header reads "PathWeaver – Netzplan-Tool" with no (MVP), no `<big>` | VERIFIED | App.tsx line 13 confirmed; App.test.tsx asserts `.not.toContain('(MVP)')` |
| 4 | Toolbar has four ghost icon+label buttons grouped with visual separator | VERIFIED | AppToolbar.tsx: 4× `variant="ghost"` counted; Lucide icons Download/Upload/Layers/Image; 1px COLOR_BORDER separator div confirmed |
| 5 | PNG button shows Loader2 spinner and "Exportiere..." while exporting; disabled | VERIFIED | `exporting` state, `setExporting(true/false)` in try/finally, `disabled={exporting}`, Loader2 import confirmed |
| 6 | CP nodes have 2px COLOR_ACCENT border AND COLOR_ACCENT_LIGHT background when critical | VERIFIED | TaskNode.tsx lines 43-46: conditional borderColor and background using theme tokens; TaskNode.test.tsx 4 tests confirm |
| 7 | CP banner: "◆ Kritischer Pfad: {N} Arbeitstage" — no node IDs, no end date | VERIFIED | GraphCanvas.tsx line 335: exact format confirmed; `criticalPath.join` and `earliestFinishISO` absent |
| 8 | All interactive elements have focus-visible styles | VERIFIED | Button.tsx ghost: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`; ContextMenu.tsx buttons: same classes present on line 28 |
| 9 | Date format uses 4-digit year (DD.MM.YYYY) throughout all node displays | VERIFIED | workdays.ts: `const yyyy = d.getFullYear()` (no `% 100`); 3 formatDateShort tests pass including negative assertion |
| 10 | Snapshot panel shows names; name input present when creating | VERIFIED | AppToolbar.tsx: `{s.name ? s.name : new Date(s.ts).toLocaleString()}` display; name input with `placeholder="Name (optional)"` and Enter key + button save |

**Score:** 9/10 truths verified (truth #2 is partial — one missed line in StartNode.tsx)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `web/src/graph/theme.ts` | 23 named design token exports | VERIFIED | COLOR_BG through COLOR_FAB_BORDER; CRITICAL_BG/CRITICAL_BORDER backward-compat aliases preserved |
| `web/src/App.tsx` | Clean title, no MVP | VERIFIED | "PathWeaver – Netzplan-Tool" on line 13; no MVP, no `<big>`, no `&nbsp;` |
| `web/src/App.test.tsx` | Updated test; MVP negative assertion | VERIFIED | "renders app header"; `expect(document.body.textContent).not.toContain('(MVP)')` |
| `web/src/components/Button.tsx` | ghost variant + icon prop + focus-visible | VERIFIED | All present; ButtonProps exports ghost in union; `icon?: ReactNode`; flex layout for icon+label |
| `web/src/components/AppToolbar.tsx` | 4 ghost buttons, Lucide icons, separator, exporting state, zero hardcoded hex | VERIFIED | All present; grep for hex returns zero matches |
| `web/src/graph/TaskNode.tsx` | CP conditional border + background; all tokens; no hex | VERIFIED | `borderColor` and `background` expressions use theme tokens; grep returns 0 hex |
| `web/src/graph/StartNode.tsx` | COLOR_BG outer background, COLOR_BORDER border, no hardcoded hex | PARTIAL | Outer div correct; **date input line 38: `background: '#fff'` hardcode remains** |
| `web/src/graph/EndNode.tsx` | COLOR_BG, COLOR_BORDER, COLOR_TEXT; no hardcoded hex | VERIFIED | All three tokens used; grep returns 0 hex |
| `web/src/components/GraphCanvas.tsx` | All hex tokenized except intentional CP banner values | VERIFIED | Only `#eff6ff` and `#1d4ed8` remain (intentionally spec'd by plan 02-03); all other hex replaced |
| `web/src/components/ContextMenu.tsx` | focus-visible:outline-blue-600 on buttons | VERIFIED | Line 28 confirmed |
| `web/src/cpm/workdays.ts` | `d.getFullYear()` for 4-digit year | VERIFIED | Line 31: `const yyyy = d.getFullYear()` |
| `web/src/cpm/workdays.test.ts` | formatDateShort tests | VERIFIED | 3 tests in `describe('formatDateShort (UI-POLISH-01)')` |
| `web/src/graph/TaskNode.test.tsx` | CP border/background render tests | VERIFIED | 5 tests (1 render, 2 critical, 2 non-critical); RGB conversion from jsdom noted in comments |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `theme.ts` | `TaskNode.tsx` | Import of COLOR_BORDER, COLOR_ACCENT, COLOR_ACCENT_LIGHT, COLOR_BG, SHADOW_SM, RADIUS_MD, RADIUS_SM | WIRED | Line 4 import; all 7 tokens used in render |
| `theme.ts` | `StartNode.tsx` | Import of COLOR_BG, COLOR_BORDER, SHADOW_SM, RADIUS_MD, RADIUS_SM | WIRED | Line 3 import; outer div uses all tokens |
| `theme.ts` | `EndNode.tsx` | Import of COLOR_BG, COLOR_BORDER, COLOR_TEXT, SHADOW_SM, RADIUS_MD | WIRED | Line 3 import; all 5 tokens used |
| `theme.ts` | `GraphCanvas.tsx` | Import of 12 tokens including COLOR_CANVAS_BG, COLOR_ERROR, COLOR_FAB, COLOR_BG | WIRED | Line 14 import; all tokens actively used |
| `theme.ts` | `AppToolbar.tsx` | Import of COLOR_SURFACE, COLOR_BORDER, COLOR_BG, COLOR_TEXT_MUTED, RADIUS_MD, SHADOW_SM, SHADOW_MD | WIRED | Line 9 import; all used in wrapper, separator, dropdown |
| `Button.tsx` | `AppToolbar.tsx` | `import { Button }` + `variant="ghost"` | WIRED | 4 ghost Button instances in toolbar group |
| `lucide-react` | `AppToolbar.tsx` | Download, Upload, Layers, Image, Loader2 | WIRED | Package present in package.json; all 5 icons imported and used |

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|-------------|--------|----------|
| UI-FOUND-01 | 02-01 | Remove (MVP) from app title | SATISFIED | App.tsx line 13; App.test.tsx negative assertion |
| UI-FOUND-02 | 02-01, 02-05 | Full design token system; no hardcoded hex in components | PARTIAL | 23 tokens in theme.ts; StartNode.tsx line 38 `background: '#fff'` is only remaining violation |
| UI-TOOLBAR-01 | 02-02 | Toolbar buttons with Lucide icons + text labels | SATISFIED | All 4 buttons: icon (Lucide) + children (text) using ghost Button |
| UI-TOOLBAR-02 | 02-02 | Visual grouping with separator: [Export\|Import] · [Snapshots\|PNG] | SATISFIED | 1px COLOR_BORDER div separator between groups |
| UI-TOOLBAR-03 | 02-02, 02-03 | hover + focus-visible on all interactive elements | SATISFIED | ghost variant hover/active/focus-visible; ContextMenu focus-visible |
| UI-CRIT-01 | 02-03 | CP banner redesigned, distinct from node highlight color | SATISFIED (automated) | `#eff6ff` (blue-50) vs `#dbeafe` (blue-100) confirmed; visual distinction needs human check |
| UI-CRIT-02 | 02-03, 02-04 | Critical nodes have border highlight in addition to background | SATISFIED | 2px COLOR_ACCENT border on critical=true; verified by 4 TaskNode tests |
| UI-POLISH-01 | 02-04 | 4-digit year DD.MM.YYYY throughout | SATISFIED | workdays.ts fix confirmed; all date display flows through formatDateShort |
| UI-POLISH-02 | 02-02 | Loading indicator during PNG export | SATISFIED | Loader2 + "Exportiere..." + disabled state in AppToolbar |
| UI-POLISH-03 | 02-02 | Snapshot panel shows names; naming input on create | SATISFIED | Name display and input confirmed in AppToolbar snapshot dropdown |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `web/src/graph/StartNode.tsx` | 38 | `background: '#fff'` on date input — hardcoded hex; COLOR_BG already imported | Warning | Single missed substitution; functionally equivalent to COLOR_BG; violates UI-FOUND-02 hex-free contract |
| `web/src/components/GraphCanvas.tsx` | 325–326 | `background: '#eff6ff'` and `color: '#1d4ed8'` in CP banner | Info | Intentionally hardcoded per plan 02-03 spec ("these are design values distinct from tokens"); not a gap |
| `web/src/components/AppToolbar.tsx` | 178–226 | Snapshot dropdown internal buttons (+ Neu, Laden, Löschen) are raw `<button>` elements | Info | Explicitly out of scope per plan 02-02 must_haves note |

---

### Human Verification Required

#### 1. Visual professionalism on first open

**Test:** Open the app in a browser from a clean state. Evaluate the overall visual impression.
**Expected:** Clean white header with "PathWeaver – Netzplan-Tool"; icon+label toolbar at top-right; green FAB button at top-left over the canvas; soft gray canvas background. No prototype-era artifacts.
**Why human:** Overall professional appearance requires visual judgment.

#### 2. CP banner vs CP node color distinctiveness (UI-CRIT-01)

**Test:** Build a valid graph, observe the CP banner and a highlighted CP task node simultaneously.
**Expected:** The banner (`#eff6ff`, blue-50) and the CP node fill (`#dbeafe`, blue-100) are visibly distinguishable — they read as separate UI elements rather than variations of the same block.
**Why human:** The two colors are one Tailwind shade apart; visual distinctness is a perceptual judgment.

#### 3. PNG export loading state

**Test:** Click the PNG button in the toolbar.
**Expected:** Button immediately transitions to Loader2 spinning icon + "Exportiere..." label; button is non-interactive; after ~1-3 seconds reverts to Image icon + "PNG" and a file download begins.
**Why human:** Async state transition with real DOM rendering requires live browser interaction.

---

### Gaps Summary

One gap remains after plan 02-05 gap-closure:

**StartNode.tsx line 38 — residual `background: '#fff'`**

The date input inside `StartNode` has `background: '#fff'` as an inline style property. `COLOR_BG = '#ffffff'` is already imported by this file (line 3). The outer div correctly uses `COLOR_BG`, but the inner date input was missed. This is the only remaining hardcoded hex value in any component file.

Plan 02-03 specified StartNode migrations for the outer div properties (background, border, borderRadius, boxShadow) and the date input properties (border, borderRadius) but omitted the date input's `background`. Plan 02-05 addressed GraphCanvas.tsx and AppToolbar.tsx only, not revisiting StartNode.

Fix: one-character change — `background: '#fff'` → `background: COLOR_BG` on line 38 of `web/src/graph/StartNode.tsx`.

All 52 tests pass. No regressions introduced by plan 02-05.

---

## Test Coverage Summary

| Test File | Tests | Phase 2 Coverage |
|-----------|-------|-----------------|
| `src/App.test.tsx` | 1 | UI-FOUND-01: asserts no (MVP) in body text |
| `src/graph/TaskNode.test.tsx` | 5 | UI-CRIT-02: critical/non-critical border and background |
| `src/cpm/workdays.test.ts` | 11 | UI-POLISH-01: 3 formatDateShort tests (4-digit year) |
| `src/cpm/compute.test.ts` | 7 | Pre-existing CPM logic |
| `src/persistence/serialize.test.ts` | 11 | Pre-existing persistence |
| `src/persistence/autosave.test.ts` | 11 | Pre-existing persistence |
| `src/graph/validate.test.ts` | 6 | Pre-existing validation |

**Total: 52 tests, 52 passing**

---

_Verified: 2026-03-16T17:05:00Z_
_Verifier: Claude (gsd-verifier)_
