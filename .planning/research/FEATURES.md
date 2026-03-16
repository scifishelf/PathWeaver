# Feature Landscape

**Domain:** Graph-based project planning tool (CPM/Netzplan)
**Researched:** 2026-03-16
**Research mode:** Features dimension — UI/UX patterns for "Clean & Professional"

---

## Context: Current UI State

Before mapping features, here is what the current implementation does and what gaps exist:

| Area | Current state | Problem |
|------|---------------|---------|
| Header | `PathWeaver – Netzplan‑Tool (MVP)` in `text-3xl font-bold` | "MVP" is visible in production; no app identity |
| Toolbar | 4 flat text buttons (`Export`, `Snapshots`, `Import`, `PNG`) with inline styles, no icons | Looks like a prototype; no visual hierarchy |
| FAB (add node) | Green circle `45×45px` in top-left Panel, green `#16a34a` with dark green border | Visually isolated from toolbar; color clashes with the neutral theme |
| Node design | White card with `border: 2px solid #d4d4d8`; critical nodes get `background: #dbeafe` (blue-100) | Background-only highlight is too subtle for the primary UX signal |
| Critical path edges | `stroke: #2563eb`, `strokeWidth: 3` | Good start — blue is correct semantic color, but no animation or emphasis |
| CP banner | Fixed, centered, `background: #dbeafe`, `border: 1px solid #bfdbfe` | Same light-blue as the node highlight — undifferentiated; hard to read |
| Error banner | Fixed, centered, red background, non-interactive | `pointerEvents: none` makes it correct, but styling is raw |
| Color theme | `CRITICAL_BG = '#dbeafe'` (Tailwind blue-100) — single exported token | Color system exists as one file but is not extended |
| Typography | `Inter` font loaded via CSS, `@apply antialiased` — good baseline | Not used consistently; toolbar uses `fontSize: 12` inline |
| Canvas background | `#eef2f7` (cool off-white) | Acceptable; aligns with professional tool aesthetic |
| Inputs in nodes | Date/number/text fields with `border: 1px solid #d4d4d8` inline | No focus rings; no :focus-visible styles |

---

## Table Stakes

Features users expect. Missing = product feels incomplete or unpolished.

| Feature | Why Expected | Complexity | Current Gap |
|---------|--------------|------------|-------------|
| Consistent design tokens (color, spacing, typography) | Every professional tool (Figma, draw.io, Miro) uses a visible design system. Without it the tool reads as a prototype. | Low | `CRITICAL_BG` is the only token; toolbar uses raw inline hex values |
| Icon-based toolbar buttons | Text-only buttons (`Export`, `PNG`) look like unstyled `<button>` elements. Icon + label is the minimum for professional perception. | Low | No icons used anywhere |
| Toolbar visual grouping | Miro, Figma, draw.io all group related actions with separators or button-group borders. Export/Import belong together; Snapshots is a history action. | Low | All 4 buttons in a flat row with identical styling |
| Critical path emphasis that is immediately obvious | The core value prop of the tool is "kritischer Pfad muss korrekt berechnet und klar sichtbar sein". Currently the highlight is a subtle background color change. | Low–Medium | Blue-100 background is easy to miss; no border-color change on critical nodes |
| CP info banner that looks intentional | The current banner shares the same blue-100 background as critical nodes. It reads as accidental. A CP summary needs visual weight. | Low | `background: #dbeafe` identical to node highlight |
| Error state that is distinct from warning | Red error banner and the yellow `Banner.tsx` component (unused) exist separately. There is no visual language distinguishing error vs warning vs info. | Low | No semantic color roles defined |
| "MVP" removed from title | An open-source project with "MVP" in the title signals unfinished work at first glance. | Very Low | `(MVP)` is hardcoded in `App.tsx` |
| Consistent date formatting | Current code formats dates as `06.10.25` (2-digit year). `06.10.2025` is the DIN-correct form. | Very Low | Manual `.slice(2,4)` in `GraphCanvas.tsx` line 328 |
| Loading indicator during PNG export | The DOM freezes 1–3s during `dom-to-image-more` rendering. No feedback → looks broken. | Low | No indicator exists |
| Focus styles on node inputs | Inputs inside nodes have no visible focus ring. Keyboard navigation is invisible. | Low | `border: 1px solid #d4d4d8` is static |
| Hover states on toolbar buttons | Buttons have no `:hover` styles. The UI feels non-interactive. | Very Low | All inline styles, no hover handling |

---

## Differentiators

Features that set this tool apart from a typical CPM calculator. Not expected, but valued by the target audience (developers and project managers using a self-hosted tool).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Critical path animated/glowing edge | Instead of just `strokeWidth: 3` + blue color, a subtle pulse or glow on critical edges makes the path immediately readable in a complex graph. draw.io does not do this. | Medium | Requires CSS animation on SVG path; ReactFlow supports `className` on edges |
| Semantic color roles exposed as CSS variables | Allowing users (or self-hosters) to override `--color-critical`, `--color-error`, `--color-bg-canvas` via CSS makes the tool genuinely configurable. | Low | One `theme.ts` file needs expansion; CSS custom properties map trivially |
| Node slack visualization as a subtle gradient or border opacity | For non-critical nodes, showing slack as a visual gradient (white → very light neutral based on slack amount) helps experts read network saturation at a glance. | Medium | Needs `slackRatio` calculation in `styledNodes`; design must be subtle to not compete with critical highlight |
| Toolbar collapses to icon-only on narrow canvas | Professional diagramming tools (draw.io, Miro) hide labels when space is constrained. Keeps the canvas area large. | Medium | Requires responsive Panel logic; not in current `AppToolbar` |
| Snapshot names | Snapshots currently show only `toLocaleString()` timestamp. Letting users name a snapshot ("Before re-ordering tasks") makes the history panel genuinely useful. | Low–Medium | Requires `name` field in snapshot schema; UI needs an inline rename input |
| Keyboard shortcut for "Add task" | Every professional graph tool supports keyboard shortcuts. `T` to add a task node is the minimum. | Low | `addTaskNode` already exists; needs `useEffect` keydown listener |

---

## Anti-Features

Features to explicitly NOT build during this UI milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Dark mode | Adds significant CSS complexity; DIN network plans are conventionally white-background documents. Dark mode would make PNG exports look wrong. | Maintain white canvas as a constraint; the tool is a document editor, not an app |
| Multiple color themes / theme picker | This is a distraction from the core work. Color system should be internal and consistent, not user-configurable via UI controls. | Use CSS variables internally for maintainability; don't expose a theme picker |
| Drag-and-drop toolbar reordering | No user has asked for this. It is complex and adds no value for a single-user CPM tool. | Fixed action groups with clear hierarchy |
| Node icon library / custom shapes | The DIN 69900 format defines the node layout. Custom shapes dilute the standard. Target audience knows the format. | Keep the existing 3-row grid exactly as-is; only improve styling |
| Undo/redo history (beyond snapshots) | Full undo/redo requires command-pattern architecture. The snapshot system already provides a coarser version of this. | Invest in making the snapshot system more usable (naming, count indicator) instead |
| Tooltips on every toolbar button | Over-engineering. Icon + label is sufficient. Tooltips only make sense for icon-only buttons. | Show label text next to icons; add `title` attribute as a fallback |
| Animated node entrance | Adds visual noise. Nodes should appear immediately and cleanly. | No entrance animations; focus on static visual quality |
| Right panel / properties sidebar | Would require layout restructuring and obscures the canvas. The inline-edit-in-node pattern already works well. | Keep editing in the node itself |

---

## Feature Dependencies

```
Consistent design tokens (CSS variables in theme.ts)
  → All other visual features: icons, colors, banners, node highlights

Icon-based toolbar buttons
  → Toolbar visual grouping (icons make grouping clearer)
  → Toolbar collapses to icon-only (requires icon-based design first)

Critical path emphasis (node border + background)
  → CP info banner redesign (both must use the same semantic color)
  → Critical path animated edge (builds on solid base styling)

Error/Warning semantic color roles
  → Distinct error banner
  → Distinct warning state for graph validation messages

Snapshot naming
  → Requires snapshot schema change (add `name?: string` field)
  → Should be done before or alongside snapshot UI refresh

Keyboard shortcut for "Add task"
  → Independent; can be shipped any time
```

---

## MVP Recommendation

For the "Ziel 2 — UI: Clean & Professional" milestone, prioritize in this order:

**Must ship (table stakes, very low → low complexity):**
1. Remove "MVP" from title, clean up header
2. Expand `theme.ts` into a real design token file (colors, border-radius, shadow levels)
3. Add icons to toolbar buttons + visual grouping with a separator between Export/Import and Snapshots/PNG
4. Redesign CP banner: distinct background (e.g., blue-600 with white text), heavier typographic weight
5. Strengthen critical path node highlight: add `border: 2px solid #2563eb` to critical nodes (not just background)
6. Fix date format to 4-digit year consistently
7. Add loading indicator (spinner or button state change) during PNG export
8. Add `:hover` and `:focus-visible` styles to all interactive elements

**Should ship (differentiators, low–medium complexity):**
9. Snapshot naming (requires small schema change; high usability gain)
10. Keyboard shortcut for add-task (`T` key)

**Defer:**
- Animated/glowing critical path edges: Nice to have, but risks adding noise. Validate with a real project graph first.
- Node slack gradient: High visual complexity; validate that it reads clearly before building.
- Toolbar collapse: Only needed if the canvas feels crowded; not a first-milestone concern.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Current UI gaps | HIGH | Directly derived from reading the source code |
| Table stakes (what looks professional) | HIGH | Based on well-established patterns in graph tools (draw.io, Miro, Figma, ReactFlow examples); no external search needed for this domain |
| Anti-features rationale | HIGH | Derived from project constraints (DIN 69900, client-only, open-source) stated in PROJECT.md |
| Complexity estimates | MEDIUM | Based on codebase familiarity; no external validation of implementation time |
| Differentiator features | MEDIUM | Based on training knowledge of diagramming tool patterns; could be validated with user testing |

---

## Sources

- Source code analysis: `/web/src/components/AppToolbar.tsx`, `GraphCanvas.tsx`, `graph/TaskNode.tsx`, `graph/StartNode.tsx`, `graph/EndNode.tsx`, `graph/theme.ts`, `index.css`, `App.tsx`
- Project constraints: `.planning/PROJECT.md`
- Architecture context: `.planning/codebase/ARCHITECTURE.md`
- Domain knowledge: ReactFlow 11 documentation patterns, DIN 69900 standard node format, professional diagramming tool conventions (draw.io, Miro, Figma) — training data, MEDIUM confidence for specific implementation details
