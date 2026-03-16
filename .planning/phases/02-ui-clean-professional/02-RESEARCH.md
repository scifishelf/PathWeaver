# Phase 2: UI — Clean & Professional - Research

**Researched:** 2026-03-16
**Domain:** React UI polish — design tokens, Lucide icons, Tailwind CSS, inline-style migration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Visual direction:** Neutral-monochrome + single blue accent. Clean, technical, timeless.
- **Token format:** TypeScript constants in `web/src/graph/theme.ts` (UPPER_SNAKE_CASE). No CSS custom properties system. Follows existing `CRITICAL_BG` pattern.
- **Full token set defined verbatim in CONTEXT.md** — all 12 tokens are locked (COLOR_BG, COLOR_SURFACE, COLOR_BORDER, COLOR_TEXT, COLOR_TEXT_MUTED, COLOR_ACCENT, COLOR_ACCENT_LIGHT, RADIUS_SM, RADIUS_MD, SHADOW_SM, SHADOW_MD, TRANSITION_DEFAULT, CRITICAL_BG alias, CRITICAL_BORDER).
- **Button component:** Extend existing `Button.tsx` with a `ghost` variant. Do NOT create a separate ToolbarButton component. `ButtonVariant = 'outline' | 'ghost'`.
- **Toolbar layout:** Not floating. Surface bar using existing `<Panel position="top-right">` placement; outer wrapper gets `bg: COLOR_SURFACE`, `border-bottom: 1px solid COLOR_BORDER` treatment.
- **Toolbar grouping:** `[Export] [Import]` · separator · `[Snapshots] [PNG]`. Separator is a `1px solid COLOR_BORDER` vertical line.
- **Icons:** Install `lucide-react`. Suggested mapping: Export→Download, Import→Upload, Snapshots→Layers or Camera, PNG→Image.
- **CP node style:** background `COLOR_ACCENT_LIGHT` + `2px solid COLOR_ACCENT` border. Normal nodes: bg `#ffffff`, border `2px solid COLOR_BORDER`.
- **CP banner:** Blue info strip, `background: #eff6ff`, `color: #1d4ed8`. Format: `◆ Kritischer Pfad: {N} Arbeitstage`. Currently inline-coded in GraphCanvas.tsx — not the commented-out Banner component import.
- **PNG loading state:** In-button only — `Loader2` with `animate-spin` + label `Exportiere...`, button `disabled`. No toast, no overlay.
- **App title:** Remove `(MVP)`, remove `<big>` tag and `&nbsp;`. Either `PathWeaver` or `PathWeaver – Netzplan-Tool`.
- **Date format:** DD.MM.YYYY (4-digit year). Fix in `formatDateShort()` in `workdays.ts` — single source of truth.

### Claude's Discretion

- Exact padding/spacing values for toolbar and banner (use Tailwind utilities, consistent with existing patterns)
- Whether `StartNode.tsx` and `EndNode.tsx` get token treatment for background colors (yes, but exact colors are Claude's call)
- Animation for the CP banner appearing/disappearing (simple fade or none)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-FOUND-01 | Remove `(MVP)` from app title; title reads `PathWeaver` or `PathWeaver – Netzplan` | Single-line change in `App.tsx` line 13; remove `<big>`, `&nbsp;`, and `(MVP)` text |
| UI-FOUND-02 | `theme.ts` expanded to full design token system; no hardcoded hex in component files | All 7 components importing from theme.ts; full token set defined in CONTEXT.md |
| UI-TOOLBAR-01 | Toolbar buttons have Lucide icons + text labels | Install `lucide-react`; extend `Button.tsx` with `ghost` variant; add `icon` prop |
| UI-TOOLBAR-02 | Toolbar actions visually grouped with separator | Vertical `1px solid COLOR_BORDER` line between [Export+Import] and [Snapshots+PNG] |
| UI-TOOLBAR-03 | Hover and `focus-visible` styles on all interactive elements | Tailwind `focus-visible:outline-2 focus-visible:outline-offset-2` using COLOR_ACCENT; node inputs; context menu items |
| UI-CRIT-01 | CP banner visually distinct from node highlights; clearly readable | Banner bg `#eff6ff`, text `#1d4ed8`; node bg `#dbeafe` — different hues, different contrast |
| UI-CRIT-02 | Critical nodes have both background fill AND colored border | `TaskNode.tsx`: `border: 2px solid COLOR_ACCENT` when `data.computed?.critical`, else `2px solid COLOR_BORDER` |
| UI-POLISH-01 | Date format DD.MM.YYYY (4-digit year) throughout | `formatDateShort()` in `workdays.ts` currently uses 2-digit year (`yy = pad2(d.getFullYear() % 100)`); fix to `d.getFullYear()` |
| UI-POLISH-02 | Loading indicator during PNG export | `useState(false)` for `exporting` in AppToolbar; set before/after `toPng()` call; show `Loader2` icon |
| UI-POLISH-03 | Snapshot panel shows names; naming at creation time | Already implemented (SNAP-01 from Phase 1); verify snapshot list renders `name` field correctly |
</phase_requirements>

---

## Summary

Phase 2 is a pure visual polish phase with no new capabilities. The codebase is a React + Vite + TypeScript application using ReactFlow 11, Tailwind CSS 4, and inline styles heavily in the graph/toolbar layer. All changes are contained to 7 existing files plus one new dependency (`lucide-react`).

The dominant pattern in the codebase is inline `style={{}}` objects in ReactFlow nodes and AppToolbar, mixed with Tailwind utility classes in modal/dialog components. Phase 2 extracts all hardcoded hex values into `theme.ts` token constants and migrates component inline styles to reference those tokens. No full Tailwind migration is required — the pattern is token extraction only.

The most important code discovery is the date format bug: `formatDateShort()` in `workdays.ts` line 31 computes `yy = pad2(d.getFullYear() % 100)`, producing 2-digit years (e.g. `26` instead of `2026`). This is the single fix for UI-POLISH-01. The CP banner is already inline-coded in `GraphCanvas.tsx` (lines 317–337) — not behind the commented-out `Banner` component import — so the restyling happens in that inline block. The `App.test.tsx` test checks for `/Netzplan/i` text, which will continue to pass after removing `(MVP)`.

**Primary recommendation:** Sequence work as (1) expand theme.ts tokens, (2) migrate all component hardcoded hex values to tokens, (3) install lucide-react + extend Button + redesign toolbar, (4) fix CP banner + node border, (5) fix date format + PNG loading state. Each wave is independent and testable.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lucide-react | latest | Icon set for toolbar buttons | Already chosen by user; 1100+ icons, tree-shakeable, official React bindings |
| tailwindcss | ^4.1.14 | Utility classes for spacing/typography | Already in project; used in Modal, Button, ContextMenu |
| reactflow | ^11.11.4 | Graph canvas, Panel component | Already in project; Panel used for toolbar placement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| html-to-image | ^1.11.13 | PNG export | Already integrated; loading state added around `toPng()` call |

### Not Needed
No new libraries beyond `lucide-react`. No CSS-in-JS, no animation library (fade is optional and can be done with Tailwind transition utilities).

**Installation:**
```bash
cd web && npm install lucide-react
```

---

## Architecture Patterns

### File Touch Map

Every file that needs changes and what changes are required:

```
web/src/graph/theme.ts           → EXPAND: add 12 new token exports
web/src/components/Button.tsx    → EXTEND: add 'ghost' variant + icon prop
web/src/components/AppToolbar.tsx → REWRITE: icon+label buttons, ghost variant, grouping, PNG loading state
web/src/components/GraphCanvas.tsx → RESTYLE: CP banner inline block, remove hardcoded hex
web/src/graph/TaskNode.tsx       → TOKEN: replace '#d4d4d8' hex, add CRITICAL_BORDER
web/src/graph/StartNode.tsx      → TOKEN: replace '#d4d4d8', decide background token
web/src/graph/EndNode.tsx        → TOKEN: replace '#d4d4d8' and '#374151', decide background token
web/src/cpm/workdays.ts          → BUG FIX: 2-digit → 4-digit year in formatDateShort
web/src/App.tsx                  → CLEANUP: remove (MVP), <big>, &nbsp;
web/src/components/ContextMenu.tsx → ADD: focus-visible styles on button items
```

### Pattern 1: Token Import in Component Files

All component files import named constants from `theme.ts`:

```typescript
// Source: existing pattern in TaskNode.tsx line 4
import { COLOR_BORDER, COLOR_ACCENT, COLOR_ACCENT_LIGHT, SHADOW_SM, RADIUS_MD } from '../graph/theme'

// Usage in inline style
style={{
  border: `2px solid ${data.computed?.critical ? COLOR_ACCENT : COLOR_BORDER}`,
  background: data.computed?.critical ? COLOR_ACCENT_LIGHT : COLOR_BG,
  borderRadius: RADIUS_MD,
  boxShadow: SHADOW_SM,
}}
```

**Import path varies by component depth:**
- `AppToolbar.tsx`, `GraphCanvas.tsx`, `Button.tsx`: `'../graph/theme'`
- `TaskNode.tsx`, `StartNode.tsx`, `EndNode.tsx`: `'./theme'` (already present)

### Pattern 2: Ghost Button Variant

The existing `Button.tsx` uses a `Record<ButtonVariant, string>` lookup for Tailwind class strings. Extend with `ghost`:

```typescript
// Source: Button.tsx existing pattern
type ButtonVariant = 'outline' | 'ghost'

const styles: Record<ButtonVariant, string> = {
  outline: 'border hover:bg-neutral-50',
  ghost: 'hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
}
```

The `icon` prop pattern for icon+label buttons:

```typescript
import type { ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

// In render:
<button ...>
  {icon && <span className="flex-shrink-0">{icon}</span>}
  {children}
</button>
```

### Pattern 3: Lucide Icon Usage

```typescript
// Source: lucide-react standard pattern
import { Download, Upload, Layers, Image, Loader2 } from 'lucide-react'

// Icon sizing for toolbar: 16x16 with label
<Button variant="ghost" icon={<Download size={16} />}>Export</Button>

// PNG loading state
<Button variant="ghost" icon={exporting ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />} disabled={exporting}>
  {exporting ? 'Exportiere...' : 'PNG'}
</Button>
```

### Pattern 4: Toolbar Visual Grouping

The toolbar is rendered inside `<Panel position="top-right">` in GraphCanvas. The wrapper `<div>` gets surface styling:

```typescript
// AppToolbar.tsx wrapper change
<div style={{
  display: 'flex',
  gap: 4,
  alignItems: 'center',
  background: COLOR_SURFACE,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: RADIUS_MD,
  padding: '4px 8px',
  boxShadow: SHADOW_SM,
}}>
  {/* Group 1: Export + Import */}
  <Button variant="ghost" icon={<Download size={16} />}>Export</Button>
  <Button variant="ghost" icon={<Upload size={16} />}>Import</Button>

  {/* Separator */}
  <div style={{ width: 1, height: 20, background: COLOR_BORDER, margin: '0 4px' }} />

  {/* Group 2: Snapshots + PNG */}
  <Button variant="ghost" icon={<Layers size={16} />}>Snapshots</Button>
  <Button variant="ghost" icon={<Image size={16} />}>PNG</Button>
</div>
```

### Pattern 5: CP Banner Restyling

The CP banner in `GraphCanvas.tsx` (lines 317–337) is an inline `<div>` — not the commented-out `Banner` component. Restyle the existing inline block:

```typescript
// Replace the existing banner content
{errors.length === 0 && cp && (
  <div style={{
    position: 'fixed',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    background: '#eff6ff',       // blue-50 — distinct from node bg #dbeafe
    color: '#1d4ed8',             // blue-700
    border: `1px solid ${COLOR_ACCENT}`,
    borderRadius: RADIUS_MD,
    padding: '6px 16px',
    fontSize: 12,
    fontWeight: 500,
    boxShadow: SHADOW_SM,
  }}>
    ◆ Kritischer Pfad: {cp.project.durationAT} Arbeitstage
  </div>
)}
```

Note: The banner format per CONTEXT.md is `◆ Kritischer Pfad: {N} Arbeitstage` — the existing banner also shows path node IDs and end date. The planner should confirm whether to keep the existing detail or use the locked format from CONTEXT.md.

### Pattern 6: Critical Node Border

In `TaskNode.tsx`, the outer `<div>` style currently has `border: '2px solid #d4d4d8'` unconditionally. Replace with conditional border color:

```typescript
// TaskNode.tsx — outer div style
style={{
  border: `2px solid ${data.computed?.critical ? COLOR_ACCENT : COLOR_BORDER}`,
  background: data.computed?.critical ? COLOR_ACCENT_LIGHT : COLOR_BG,
  borderRadius: RADIUS_MD,
  boxShadow: SHADOW_SM,
  // ...
}}
```

### Pattern 7: Date Format Fix

`formatDateShort()` in `workdays.ts` line 31 currently:
```typescript
const yy = pad2(d.getFullYear() % 100)  // BUG: produces "26" not "2026"
return `${dd}.${mm}.${yy}`
```

Fix: use the full year without `% 100` and without `pad2` (4-digit years don't need zero-padding):
```typescript
const yyyy = d.getFullYear()
return `${dd}.${mm}.${yyyy}`
```

### Anti-Patterns to Avoid

- **Do not create a new ToolbarButton component.** The user explicitly locked `Button.tsx` with `ghost` variant as the implementation vehicle.
- **Do not add CSS custom properties / CSS variables.** Token format is TypeScript constants only.
- **Do not migrate all inline styles to Tailwind.** Only replace hardcoded hex values with token constants — existing inline style structure stays.
- **Do not import `Banner.tsx` for the CP banner.** The existing inline div approach stays (Banner.tsx has a yellow color scheme that doesn't match the blue token system).
- **Do not show a full loading overlay for PNG export.** In-button state change only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon set | SVG sprite system, custom icon components | `lucide-react` | Tree-shakeable, React 19 compatible, consistent stroke width, accessibility attributes built in |
| Spinner animation | CSS keyframe animation | Tailwind `animate-spin` on Lucide `Loader2` | Already available via Tailwind; zero custom CSS |
| Focus-visible ring | Custom `:focus` pseudo-class CSS | Tailwind `focus-visible:outline-2 focus-visible:outline-blue-600` | Already used in Button.tsx (`focus:ring-blue-500`); keep consistent |

---

## Common Pitfalls

### Pitfall 1: Existing App.test.tsx Will Break if Title Text Changes Badly

**What goes wrong:** `App.test.tsx` checks `screen.getByText(/Netzplan/i)` — this will pass as long as the word "Netzplan" remains in the title. But the test description still says "renders MVP header" which becomes stale.
**Why it happens:** Test was written against the `(MVP)` title.
**How to avoid:** Update the test description string from "renders MVP header" to "renders app header" when updating App.tsx. The assertion itself (`/Netzplan/i`) already passes for `PathWeaver – Netzplan-Tool`.
**Warning signs:** Test passes but description is misleading — flag for update.

### Pitfall 2: `StartNode.tsx` and `EndNode.tsx` Both Import `CRITICAL_BG` for Their Own Background

**What goes wrong:** Both `StartNode` and `EndNode` use `CRITICAL_BG` as their background color (lines imported from theme.ts). This means Start and End nodes always render with the blue-100 critical background, regardless of whether they are on the critical path.
**Why it happens:** The existing code uses `CRITICAL_BG` as a "this node is special" style — not a "this node is critical" style.
**How to avoid:** The planner must decide appropriate token for Start/End node backgrounds. Since they are structural (not task) nodes, `COLOR_SURFACE` (#f4f4f5) or `COLOR_BG` (#ffffff) is appropriate. Do not leave them on `CRITICAL_BG` after Phase 2.

### Pitfall 3: `styledNodes` in GraphCanvas.tsx Has Error-State Border Override

**What goes wrong:** `GraphCanvas.tsx` lines 215–218 apply `border: '2px solid #ef4444'` for orphan/too-many-outputs nodes via `styledNodes`. This is set on `n.style` (ReactFlow's node wrapper style), which is SEPARATE from the inner `<div>` style inside `TaskNode.tsx`.
**Why it happens:** ReactFlow applies `n.style` to the wrapper node div; the TaskNode component controls its own inner div border. The two styling layers don't conflict but must be understood as separate.
**How to avoid:** Error-state border styling in `styledNodes` is fine as-is — it overrides the ReactFlow node wrapper. The token-based border inside TaskNode.tsx is the component's own border. Both can exist; the wrapper border will visually overlap the component border.

### Pitfall 4: Button `ghost` Variant Needs `focus-visible` Not `focus`

**What goes wrong:** The current `Button.tsx` base class uses `focus:ring-2 focus:ring-blue-500`. If `ghost` variant keeps this, keyboard users see focus ring on all focus events (including mouse click).
**Why it happens:** `focus:` triggers on all focus, `focus-visible:` triggers only on keyboard navigation.
**How to avoid:** The `ghost` variant should use `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600` — consistent with the locked decision in CONTEXT.md. The base class `focus:ring-2` should ideally become `focus-visible:ring-2` for consistency, but this only needs doing for ghost variant as required by UI-TOOLBAR-03.

### Pitfall 5: PNG Export Button Is an Inline `<button>` Not a `<Button>` Component

**What goes wrong:** The PNG export button in `AppToolbar.tsx` (lines 215–255) is an inline `<button>` element with inline styles — it doesn't use the `Button` component. When refactoring to add loading state, easy to miss converting it.
**Why it happens:** Original code was written before the Button component was standardized.
**How to avoid:** Convert the PNG inline button to `<Button variant="ghost" icon={...}>` when adding loading state. Same for all four toolbar buttons.

### Pitfall 6: CP Banner Currently Shows Full Path + End Date — Decision Needed

**What goes wrong:** The existing CP banner content (GraphCanvas.tsx lines 334–336) shows `criticalPath.join(' → ')` (all node IDs) plus end date in 2-digit year format. The CONTEXT.md locked format is `◆ Kritischer Pfad: {N} Arbeitstage` — just the duration number.
**Why it happens:** CONTEXT.md specifies a simplified banner; existing code is more verbose.
**How to avoid:** The planner should implement the locked format from CONTEXT.md (duration only). This also fixes the 2-digit year in the banner's current end date display.

---

## Code Examples

### Expand theme.ts (complete new file)

```typescript
// Source: locked token set from CONTEXT.md
// web/src/graph/theme.ts

// Colors
export const COLOR_BG = '#ffffff'
export const COLOR_SURFACE = '#f4f4f5'
export const COLOR_BORDER = '#d4d4d8'
export const COLOR_TEXT = '#18181b'
export const COLOR_TEXT_MUTED = '#71717a'
export const COLOR_ACCENT = '#2563eb'
export const COLOR_ACCENT_LIGHT = '#dbeafe'

// Radius
export const RADIUS_SM = 6
export const RADIUS_MD = 8

// Shadows
export const SHADOW_SM = '0 1px 3px rgba(0,0,0,.12)'
export const SHADOW_MD = '0 4px 12px rgba(0,0,0,.12)'

// Transitions
export const TRANSITION_DEFAULT = 'all 150ms ease'

// Critical path (backward compat alias)
export const CRITICAL_BG = COLOR_ACCENT_LIGHT
export const CRITICAL_BORDER = COLOR_ACCENT
```

### Fix 2-digit year (workdays.ts)

```typescript
// Current (BUG):
const yy = pad2(d.getFullYear() % 100)
return `${dd}.${mm}.${yy}`

// Fixed:
const yyyy = d.getFullYear()
return `${dd}.${mm}.${yyyy}`
```

### PNG loading state (AppToolbar.tsx)

```typescript
const [exporting, setExporting] = useState(false)

async function onPngClick() {
  const el = document.querySelector('.react-flow') as HTMLElement | null
  if (!el) return
  setExporting(true)
  try {
    // ... existing style injection + toPng call ...
  } finally {
    setExporting(false)
  }
}

// Button render:
<Button
  variant="ghost"
  icon={exporting ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
  onClick={onPngClick}
  disabled={exporting}
>
  {exporting ? 'Exportiere...' : 'PNG'}
</Button>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `CRITICAL_BG` only (background) | `CRITICAL_BG` + `CRITICAL_BORDER` (background + border) | CP nodes are clearly distinguishable even in grayscale |
| 2-digit year `dd.mm.yy` | 4-digit year `dd.mm.yyyy` | Unambiguous date display; fixes UI-POLISH-01 |
| Hardcoded hex in component files | Named token constants from theme.ts | Single source of truth for all visual values |
| Text-only toolbar buttons | Icon + label ghost buttons | Faster recognition, professional appearance |

**Deprecated/outdated in this phase:**
- `pad2(d.getFullYear() % 100)` in `workdays.ts`: replaced by `d.getFullYear()`
- Inline `style={{ border: '1px solid #d4d4d8', borderRadius: 8, ... }}` patterns in toolbar buttons: replaced by `<Button variant="ghost">`

---

## Open Questions

1. **CP banner detail level**
   - What we know: CONTEXT.md specifies `◆ Kritischer Pfad: {N} Arbeitstage` (duration only). Existing banner shows full path nodes + end date.
   - What's unclear: Should the path node IDs and end date be retained or removed?
   - Recommendation: Follow CONTEXT.md locked format — duration only. The path is visible in the graph itself.

2. **StartNode and EndNode background tokens**
   - What we know: Both currently use `CRITICAL_BG` for their backgrounds (always blue-100). This is incorrect semantics.
   - What's unclear: Should they use `COLOR_SURFACE` (gray), `COLOR_BG` (white), or keep a blue tint as "structural node" indicator?
   - Recommendation: `COLOR_BG` (white) for clean DIN 69900 look; differentiate them structurally via their shape/label, not color.

3. **`focus:ring-2` base class in Button.tsx**
   - What we know: Existing base includes `focus:ring-2 focus:ring-blue-500` (triggers on mouse click too).
   - What's unclear: Update base class to `focus-visible` as well, or only add `focus-visible` to ghost variant?
   - Recommendation: Only add `focus-visible` to the ghost variant as required by UI-TOOLBAR-03. Don't change existing `outline` variant behavior to avoid scope creep.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 (globals: true) |
| Config file | `web/vite.config.ts` — `test.environment: 'jsdom'`, `test.setupFiles: ['./vitest.setup.ts']` |
| Quick run command | `cd web && npx vitest run --reporter=verbose` |
| Full suite command | `cd web && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-FOUND-01 | Title does not contain "(MVP)" | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ (needs assertion update) |
| UI-FOUND-02 | No hardcoded hex in component files | manual/lint | ESLint regex rule or manual grep check | ❌ Wave 0 |
| UI-TOOLBAR-01 | Toolbar buttons render Lucide icons | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ (needs new assertions) |
| UI-TOOLBAR-02 | Visual grouping with separator | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ (needs new assertions) |
| UI-TOOLBAR-03 | focus-visible on interactive elements | manual | Browser keyboard nav | manual-only |
| UI-CRIT-01 | CP banner has blue-50 bg + blue-700 text | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ (needs new assertions) |
| UI-CRIT-02 | Critical task nodes have colored border | unit | `cd web && npx vitest run src/graph/TaskNode.test.tsx` | ❌ Wave 0 |
| UI-POLISH-01 | formatDateShort returns 4-digit year | unit | `cd web && npx vitest run src/cpm/workdays.test.ts` | ✅ (needs new test case) |
| UI-POLISH-02 | PNG button shows spinner while exporting | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ (needs new assertions) |
| UI-POLISH-03 | Snapshot panel shows names | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ (likely already covered by SNAP-01 tests) |

### Sampling Rate

- **Per task commit:** `cd web && npx vitest run src/cpm/workdays.test.ts` (date format fix validation)
- **Per wave merge:** `cd web && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `web/src/graph/TaskNode.test.tsx` — covers UI-CRIT-02 (critical node border render)
- [ ] `web/src/App.test.tsx` assertion updates — update description "MVP header" → "app header"; add assertion that `(MVP)` text is NOT present

*(Existing `workdays.test.ts` infrastructure covers UI-POLISH-01 with one new test case added — no new file needed)*

---

## Sources

### Primary (HIGH confidence)

- Direct source code inspection: `web/src/graph/theme.ts`, `AppToolbar.tsx`, `Button.tsx`, `TaskNode.tsx`, `StartNode.tsx`, `EndNode.tsx`, `GraphCanvas.tsx`, `App.tsx`, `workdays.ts`, `Banner.tsx`, `ContextMenu.tsx`
- `web/package.json` — confirmed dependency versions, confirmed `lucide-react` NOT yet installed
- `web/vite.config.ts` — confirmed Vitest config (jsdom, globals, setupFiles)
- `.planning/phases/02-ui-clean-professional/02-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)

- Lucide React standard usage pattern (icon + size prop, `animate-spin` via Tailwind) — verified against known library API; lucide-react has been stable in this pattern since v0.263

### Tertiary (LOW confidence)

- None — all findings are directly from source inspection or locked CONTEXT.md decisions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json; lucide-react is the locked choice
- Architecture: HIGH — all patterns derived directly from reading existing source files
- Pitfalls: HIGH — identified from direct code reading (2-digit year bug confirmed in workdays.ts line 31; CP banner confirmed inline in GraphCanvas.tsx not Banner.tsx)

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable libraries; no fast-moving dependencies)
