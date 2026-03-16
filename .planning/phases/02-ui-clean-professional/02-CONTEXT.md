# Phase 2: UI — Clean & Professional - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual redesign of PathWeaver for a professional, production-ready first impression on GitHub. No new capabilities — only visual polish, design-token system, toolbar redesign, critical path emphasis, and UX details. Everything that changes behavior or adds features is out of scope.

</domain>

<decisions>
## Implementation Decisions

### Color Palette & Design Tokens

- **Visual direction:** Neutral-monochrome + single blue accent. Clean, technical, timeless — appropriate for DIN 69900 tooling.
- **Token format:** TypeScript-Konstanten in `web/src/graph/theme.ts`, kein CSS-Custom-Properties-System. Passt zum bestehenden `CRITICAL_BG`-Pattern.
- **Full token set for theme.ts:**
  ```ts
  // Colors
  export const COLOR_BG = '#ffffff'           // canvas background
  export const COLOR_SURFACE = '#f4f4f5'      // toolbar, panels
  export const COLOR_BORDER = '#d4d4d8'       // nodes, inputs
  export const COLOR_TEXT = '#18181b'         // primary text
  export const COLOR_TEXT_MUTED = '#71717a'   // secondary text
  export const COLOR_ACCENT = '#2563eb'       // CP highlight, focus rings
  export const COLOR_ACCENT_LIGHT = '#dbeafe' // CP node background

  // Radius
  export const RADIUS_SM = 6   // inputs, small elements
  export const RADIUS_MD = 8   // nodes, buttons, panels

  // Shadows
  export const SHADOW_SM = '0 1px 3px rgba(0,0,0,.12)'  // nodes, buttons
  export const SHADOW_MD = '0 4px 12px rgba(0,0,0,.12)' // dropdowns, panels

  // Transitions
  export const TRANSITION_DEFAULT = 'all 150ms ease' // hover states, focus rings

  // Critical path (retained from Phase 1)
  export const CRITICAL_BG = COLOR_ACCENT_LIGHT  // alias for backward compat
  export const CRITICAL_BORDER = COLOR_ACCENT    // new in Phase 2
  ```
- All hardcoded hex values in component files (`AppToolbar.tsx`, `TaskNode.tsx`, `StartNode.tsx`, `EndNode.tsx`, `App.tsx`) must be replaced with these token imports.

### Critical Path Visualization

- **CP node style:** background `#dbeafe` (COLOR_ACCENT_LIGHT) + `2px solid #2563eb` (COLOR_ACCENT border). Normal nodes: background `#ffffff`, border `2px solid #d4d4d8`.
- **CP banner:** Blue info strip above the canvas, inside the graph container, below the toolbar bar. Background `#eff6ff` (blue-50), text `#1d4ed8` (blue-700). Format: `◆ Kritischer Pfad: {N} Arbeitstage`. Visually distinct from node highlights (different bg, text-only, no border).
- The banner is currently commented out in `GraphCanvas.tsx` — it must be uncommented and restyled.

### Toolbar Design

- **Button style:** Ghost buttons — no border in default state, background `#f4f4f5` on hover, `outline 2px solid #2563eb` on focus-visible, background `#e4e4e7` on active.
- **Icon + Label pattern:** Each button shows Lucide icon (left) + text label (right). `text-sm`, `gap-2` between icon and label.
- **Button component:** Extend existing `Button.tsx` with a `ghost` variant. Toolbar uses `<Button variant="ghost" icon={...}>Label</Button>`. Do NOT create a separate ToolbarButton component.
  ```ts
  export type ButtonVariant = 'outline' | 'ghost'
  ```
- **Toolbar layout:** Dedicated surface bar above the canvas (`bg: COLOR_SURFACE`, `border-bottom: 1px solid COLOR_BORDER`). Not floating. The toolbar is already rendered via GraphCanvas's `<Panel position="top-left">` — this placement stays; the outer wrapper gets the surface treatment.
- **Grouping:** Visual separator between groups: `[Export] [Import]` · `[Snapshots] [PNG]`. Separator is a `1px solid COLOR_BORDER` vertical line.
- **Lucide icons:** Install `lucide-react`. Suggested icon mapping (planner may adjust):
  - Export → `Download`
  - Import → `Upload`
  - Snapshots → `Layers` or `Camera`
  - PNG → `Image`
- **Focus-visible + hover:** All interactive elements (toolbar buttons, node inputs, context menu items) must have explicit `focus-visible` outlines using `COLOR_ACCENT`.

### App Branding

- Remove `(MVP)` from title. New title: `PathWeaver – Netzplan-Tool` (without `(MVP)`), or just `PathWeaver`. Either is acceptable — planner may choose the cleaner option.
- Remove `<big>` tag and `&nbsp;` around title — clean semantic HTML.

### Date Format

- All dates use DD.MM.YYYY (4-digit year). Currently `formatWorkdayToDate()` in `workdays.ts` already formats dates — verify it outputs 4-digit year consistently. If not, fix there (single source of truth).

### PNG Export Loading Indicator

- The PNG button shows a spinner icon (Lucide `Loader2` with `animate-spin`) and label `Exportiere...` while `toPng()` is running. Button is `disabled` during export.
- No overlay, no toast — in-button state change only.
- Implementation: `const [exporting, setExporting] = useState(false)` in AppToolbar. Set true before `toPng()`, false after.

### Claude's Discretion

- Exact padding/spacing values for toolbar and banner (use Tailwind utilities, keep consistent with existing patterns)
- Whether `StartNode.tsx` and `EndNode.tsx` also get the token treatment for their background colors (yes, they should use tokens, but exact colors are Claude's call)
- Animation for the CP banner appearing/disappearing (simple fade or none)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements
- `.planning/REQUIREMENTS.md` — Full requirement IDs for Phase 2: UI-FOUND-01/02, UI-TOOLBAR-01/02/03, UI-CRIT-01/02, UI-POLISH-01/02/03. Acceptance criteria per requirement.

### Existing UI Files (must read before touching)
- `web/src/graph/theme.ts` — Current token state (only CRITICAL_BG exists — will be expanded)
- `web/src/components/AppToolbar.tsx` — All toolbar logic, inline styles to replace
- `web/src/components/Button.tsx` — Existing Button component to extend with ghost variant
- `web/src/App.tsx` — Header with (MVP) title to fix
- `web/src/graph/TaskNode.tsx` — CP node styling (background only, add border)
- `web/src/components/GraphCanvas.tsx` — CP banner (commented out), toolbar container

### Data Format (for date display validation)
- `docs/json-format.md` — Date format spec referenced in workdays output

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button.tsx` (26 lines): Reusable button with `variant='outline'`, `forwardRef`, `ButtonHTMLAttributes`. Ready to extend with `ghost` variant.
- `Banner.tsx` (11 lines): Existing Banner component — may be usable for CP info strip styling.
- `Modal.tsx` (37 lines): Already uses Tailwind classes — reference for consistent spacing/typography.
- `CRITICAL_BG = '#dbeafe'` in theme.ts: Will become `COLOR_ACCENT_LIGHT`, backward-compatible alias.

### Established Patterns
- Inline styles used heavily in AppToolbar and nodes — Phase 2 replaces with theme tokens (not full Tailwind migration, just token extraction)
- Tailwind classes used selectively (Modal, snapshot input, some utility classes) — acceptable to use where convenient
- `Panel` from ReactFlow used in GraphCanvas for toolbar placement — keep this, just add surface styling
- All constants UPPER_SNAKE_CASE — follow same pattern for new tokens

### Integration Points
- `GraphCanvas.tsx` passes `startDate` to nodes for date rendering — date format fix happens in `formatWorkdayToDate()` in `workdays.ts`
- `AppToolbar.tsx` manages PNG export — loading state (`useState`) added there
- `theme.ts` is imported by `TaskNode.tsx` and `GraphCanvas.tsx` — after expansion, all UI components import tokens from there

</code_context>

<specifics>
## Specific Ideas

- Token naming follows existing UPPER_SNAKE_CASE pattern (e.g., `COLOR_ACCENT`, `RADIUS_MD`)
- Ghost button hover/focus should feel like VS Code or Linear — subtle, not flashy
- CP banner format: `◆ Kritischer Pfad: {N} Arbeitstage` — use the diamond bullet as visual marker

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-ui-clean-professional*
*Context gathered: 2026-03-16*
