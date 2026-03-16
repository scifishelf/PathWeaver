# Project Research Summary

**Project:** PathWeaver — CPM Network Planning Tool
**Domain:** React/TypeScript graph-based project planning tool (DIN 69900 Netzplan)
**Researched:** 2026-03-16
**Confidence:** HIGH (all findings grounded in direct codebase analysis)

## Executive Summary

PathWeaver is a client-only, browser-based CPM (Critical Path Method) network planning tool built on React 19, TypeScript, ReactFlow 11, and Tailwind CSS v4. The codebase has a solid, well-layered architecture — UI, business logic, and serialization are cleanly separated — but accumulated technical debt in type safety, error handling, and visual polish prevents it from reaching production quality. The improvement work for this milestone is not about restructuring the architecture; it is about hardening the existing layers and replacing the prototype-era UI with a professional, consistent design.

The recommended approach follows a two-phase sequence: code quality and stability first, then visual redesign. This ordering is non-negotiable: the type-safety improvements (discriminated unions, type guards) and error-handling fixes (silent catch blocks, localStorage quota) create the safety net that makes the visual redesign changes verifiable. Attempting UI work on top of 44+ `as any` casts and silent failure paths would make regressions invisible. The library swap (`dom-to-image-more` to `html-to-image`) and Zustand removal are small, high-confidence cleanups that belong at the start of Phase 1 because they reduce surface area before deeper refactoring begins.

The key risks are: (1) silent data loss from localStorage failures that are currently swallowed by empty `catch {}` blocks — must be fixed before any storage key changes; (2) the PNG export capturing UI controls inside the exported image due to the broad `.react-flow` capture target; (3) careless `as any` removal causing TypeScript cascade errors unless casts are first categorized by type (JSON boundary, ReactFlow boundary, lazy shortcut). All three risks have clear, well-understood mitigations.

---

## Key Findings

### Recommended Stack

The current stack (React 19, TypeScript ~5.9, Vite 7, Tailwind 4, ReactFlow 11, date-fns 4, Vitest 3, Playwright) is sound and requires no major changes. Two targeted removals and one replacement are recommended for this milestone.

**Dependency changes:**
- **`html-to-image` replaces `dom-to-image-more`** — drop-in API replacement; ships its own TypeScript types; actively maintained; supports `filter` callback to exclude UI controls from PNG capture. One import, one option rename, delete the hand-written `.d.ts` stub.
- **Remove `zustand`** — installed but has zero imports in the codebase. Adds ~3KB bundle weight for no benefit. Built-in React hooks (`useState`, `useReducer`, Context) are sufficient at the current ~1000-line scale.
- **Verify `immer` usage before removing** — it is a peer dep of Zustand but may be used independently.
- **Stay on ReactFlow 11.11.4** — the app runs in production on React 19; the peer dep range `>= 17` is satisfied. ReactFlow v12 (`@xyflow/react`) has breaking API changes and is explicitly out of scope.
- **Do NOT add AJV** — the only AJV version present (6.12.6) is a transitive dep that does not support JSON Schema draft 2020-12 used by `docs/json-schema.v1.json`. Using it would silently ignore schema directives. Prefer extending the existing `validateProjectJSON` hand-rolled validator, or Zod if schema complexity grows.

**Core technologies (unchanged):**
- React 19.1.1 — stable, compatible with ReactFlow 11 in production
- TypeScript ~5.9.3 — current stable; strict mode gaps to fix, not a version issue
- Tailwind CSS 4.x — CSS-first config; no issues identified
- date-fns 4.x — used for workday arithmetic; no issues identified

See `.planning/research/STACK.md` for full analysis.

### Expected Features

The milestone goal is "Ziel 2 — UI: Clean & Professional." Research identified concrete gaps between the current prototype-level UI and professional-grade tool expectations, drawing on patterns from draw.io, Miro, Figma, and ReactFlow examples.

**Must have (table stakes):**
- Remove "(MVP)" from the app title — signals unfinished product at first glance
- Consistent design tokens: expand `theme.ts` beyond the single `CRITICAL_BG` constant; all colors, border-radius, shadows as named tokens or CSS variables
- Icon-based toolbar buttons with labels — text-only buttons (`Export`, `PNG`) read as unstyled HTML
- Toolbar visual grouping with separators — Export/Import together; Snapshots/PNG as a separate group
- Strengthened critical path node highlight — add `border: 2px solid #2563eb` to critical nodes (not just the current light-blue background fill)
- CP info banner redesign — give it distinct visual weight (e.g., blue-600 background with white text) so it does not blend with the node highlight
- 4-digit year in date formatting — the current `DD.MM.YY` is a single-line fix (`% 100` removal) with a DIN-correctness rationale
- Loading indicator during PNG export — the DOM freezes 1–3s; no feedback makes it look broken
- Hover and focus-visible styles on all interactive elements — currently absent on toolbar buttons and node inputs

**Should have (differentiators):**
- Snapshot naming — allows users to label snapshots ("Before re-ordering"); requires adding `name?: string` to the snapshot schema
- Keyboard shortcut for "Add task" (`T` key) — `addTaskNode` already exists; needs a `useEffect` keydown listener

**Defer (out of scope for this milestone):**
- Animated/glowing critical path edges — validate with a real graph before building; risk of visual noise
- Node slack gradient visualization — high visual complexity; design must be validated first
- Toolbar collapse to icon-only on narrow canvas — not needed until canvas space is a pain point
- Dark mode — incompatible with the white-background DIN 69900 document convention
- Multiple color themes, drag-and-drop toolbar reordering, right-panel sidebar — scope creep with no user demand

See `.planning/research/FEATURES.md` for full analysis.

### Architecture Approach

The existing three-tier architecture (UI → Business Logic → Serialization+Persistence) is correct and must not be restructured. The improvement work targets hardening within each layer: replacing `as any` casts with discriminated unions and type guards, surfacing swallowed errors, adding tests for pure logic functions, and eliminating timing anti-patterns.

**Major components and their roles:**
1. **`GraphCanvas.tsx`** — orchestrates graph state, triggers validation, CPM compute, and autosave; the main integration point. Currently contains `setTimeout`-based validation side effects and silent catch blocks.
2. **`serialize.ts`** — the critical bridge between ReactFlow `Node[]`/`Edge[]` types and domain `ProjectJSON` types; contains 44+ `as any` casts; has no round-trip test. This is the highest-risk file to modify.
3. **`compute.ts` / `validate.ts`** — pure functions accepting domain types only; no ReactFlow dependency; highest testability; the safest place to add coverage first.
4. **`autosave.ts`** — localStorage read/write with three silent `catch {}` blocks; `QuotaExceededError` is never surfaced to the user.
5. **`workdays.ts`** — pure date arithmetic; `new Date('not-a-date')` passed to `addWorkdays()` creates an infinite loop risk due to the `isWeekend()` while-loop.

**Key patterns to follow:**
- Discriminated union types for ReactFlow node data (`TaskNodeData`, `StartNodeData`, `EndNodeData`) — one cast at the boundary, typed everywhere downstream
- Type predicate guard (`isProjectJSON`) at the `JSON.parse()` boundary — eliminates downstream `as any` casts caused by `any`-typed parse results
- `SaveResult` return type from `autosave.ts` — structured error reporting replacing silent failures
- ISO date validation before arithmetic — prevent `Invalid Date` infinite loop
- Round-trip serialization tests before touching `serialize.ts`

**Build order is a hard dependency:** types and type guards first → tests → error handling → type cleanup → housekeeping. Skipping the test step before cleanup removes the safety net.

See `.planning/research/ARCHITECTURE.md` for full analysis with code examples.

### Critical Pitfalls

1. **localStorage key migration without backward compatibility guard** — changing key names or bumping `settings.version` without a migration function causes silent data loss. The empty `catch {}` blocks make the loss invisible. Fix: add `console.error` to all catch blocks first; write migration functions before changing any key or schema version.

2. **PNG export captures UI controls inside the image** — the current capture target `.react-flow` includes all ReactFlow panels (AppToolbar, MiniMap, Controls). When migrating to `html-to-image`, use the `filter` option to exclude `.react-flow__controls`, `.react-flow__panel`, and `.react-flow__minimap` elements. Also: `quality` option is PNG-incompatible (PNG is lossless); remove it to avoid silent no-ops.

3. **`as any` removal triggering TypeScript cascade errors** — ReactFlow 11's `Node` generic defaults to `any`. Removing casts naively causes 20+ compile errors. Categorize first: JSON-boundary casts → type guards; ReactFlow-boundary casts → typed generics; lazy shortcuts → narrowing. Fix `serialize.ts` before `GraphCanvas.tsx`.

4. **`validate()` setTimeout capturing stale closure state** — the existing `setTimeout(() => validate(), 0)` pattern is fragile. Refactoring incorrectly (adding `validate` to a `useEffect` dependency array without stable memoization) creates infinite render loops. The correct fix: extract `validate` as a pure function taking `nodes`/`edges` as parameters, then call it from a single `useEffect([nodes, edges])`.

5. **Tailwind classes silently overridden by inline styles** — components like `AppToolbar.tsx` and `TaskNode.tsx` use inline `style` objects, which always win over class-based rules. During redesign, migrate one component fully (remove inline styles, add Tailwind classes) before moving to the next. Never mix both approaches on the same CSS property in the same element.

See `.planning/research/PITFALLS.md` for full analysis including moderate and minor pitfalls.

---

## Implications for Roadmap

Based on combined research, a two-phase structure is strongly recommended. The architecture's build-order dependency (types → tests → error handling → type cleanup) maps directly to Phase 1. The feature dependency tree (design tokens unlock all other visual work) maps directly to Phase 2.

### Phase 1: Code Quality & Stability

**Rationale:** The architecture research identifies a hard dependency order: type guards and tests must precede type cleanup; error handling must precede UI changes that depend on storage feedback. The pitfalls research shows that silent data loss, PNG export issues, and `as any` cascade errors all originate in this layer. Building the visual redesign on top of unfixed infrastructure creates invisible regressions.

**Delivers:** A codebase where failures are visible, types are honest, and the test suite covers the core business logic. Users do not see the change directly, but the tool becomes stable enough to ship confidently.

**Addresses:**
- Zustand removal (STACK.md)
- `dom-to-image-more` → `html-to-image` replacement (STACK.md)
- `validateProjectJSON` extension for `startDate` format and `duration >= 0` (STACK.md)
- PNG export capture target fix and `filter` option (PITFALLS.md #2)
- `autosave.ts` `SaveResult` return type, `QuotaExceededError` surfacing (ARCHITECTURE.md)
- `isProjectJSON` type guard at parse boundary (ARCHITECTURE.md)
- Round-trip serialization tests (ARCHITECTURE.md)
- `compute.ts`, `validate.ts`, `workdays.ts` unit tests (ARCHITECTURE.md)
- `setTimeout` → `useEffect` validation refactor (PITFALLS.md #6)
- `computed` field in exported JSON — schema fix or strip (PITFALLS.md #7)
- `TopRightDebug.tsx` hidden behind `import.meta.env.DEV` (ARCHITECTURE.md)
- `crypto.randomUUID()` for snapshot IDs (ARCHITECTURE.md)

**Avoids:** localStorage data loss (Pitfall #1), `as any` cascade errors (Pitfall #3), stale closure render loops (Pitfall #6)

### Phase 2: UI — Clean & Professional

**Rationale:** Feature research identifies design tokens as the root dependency for all visual work — icons, banner redesign, critical path emphasis, and node highlight all require a consistent token system first. This phase can only proceed after Phase 1 because: (a) type-safe node data is required to safely extend node styling, and (b) the Tailwind/inline-style mixing pitfall requires component-by-component migration that is easier to do on a stable, tested codebase.

**Delivers:** A tool that reads as professional on first open, with consistent visual language, clear critical path emphasis, and polished interactive states. The "(MVP)" label is gone. Exported PNGs are clean.

**Addresses:**
- Remove "(MVP)" from title (FEATURES.md table stakes)
- Expand `theme.ts` into real design token system with CSS variables (FEATURES.md table stakes)
- Icon-based toolbar buttons with visual grouping and separators (FEATURES.md table stakes)
- CP banner redesign — blue-600 with white text, distinct from node highlight (FEATURES.md table stakes)
- Critical node border highlight `border: 2px solid #2563eb` (FEATURES.md table stakes)
- Fix date format to 4-digit year throughout (FEATURES.md table stakes)
- Hover and focus-visible styles on all interactive elements (FEATURES.md table stakes)
- Snapshot naming UI with `name?: string` schema addition (FEATURES.md differentiators)
- Keyboard shortcut for add-task (`T` key) (FEATURES.md differentiators)

**Avoids:** Tailwind/inline-style specificity conflicts (Pitfall #5), date format inconsistency surviving the redesign (Pitfall #8)

**Uses:** `html-to-image` `filter` option for clean PNG export (STACK.md), Tailwind CSS variables for semantic color roles (STACK.md)

### Phase Ordering Rationale

- Type safety (Phase 1) must precede visual changes (Phase 2) because the node data types (`TaskNodeData`, `StartNodeData`, `EndNodeData`) established in Phase 1 are the foundation for extending node styling in Phase 2.
- Tests must precede `as any` cleanup (both within Phase 1) so regressions are caught immediately.
- Error handling (`SaveResult`, `QuotaExceededError`) must land before the snapshot naming UI (Phase 2) because the user-facing storage feedback is a prerequisite for communicating snapshot save failures.
- Design tokens must be the first task of Phase 2 because every other visual change depends on having a canonical color and spacing vocabulary.
- The library swap (`dom-to-image-more` → `html-to-image`) and Zustand removal should open Phase 1 — they are small, reversible, and reduce dependency surface before the harder refactoring begins.

### Research Flags

**Phases with standard patterns (no deeper research needed):**
- **Phase 1 (Code Quality):** All patterns are well-documented TypeScript and React patterns. The specific file locations and bug signatures are known from direct codebase analysis. Discriminated unions, type guards, `useEffect` patterns, and localStorage error handling all have canonical solutions.
- **Phase 2 (UI Redesign):** CSS variable-based design token systems and Tailwind component migration are established patterns. The specific components and their current styling approaches are known from source analysis.

**Phases that may benefit from targeted research during planning:**
- **Phase 2, snapshot naming:** Requires a schema change (`name?: string` added to the snapshot data shape). Before implementing, verify that existing localStorage snapshots without the `name` field will deserialize correctly — this is a mini-migration concern (Pitfall #1 applies here).
- **Phase 2, critical path animated edges:** Deferred from must-have list, but if included, ReactFlow 11's SVG edge animation support needs validation. CSS animations on `<path>` elements inside ReactFlow's SVG layer may interact with ReactFlow's own transform updates.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings from direct local file inspection (package.json, node_modules, source code). One gap: `html-to-image` npm version currency not verified (web access denied); confirm before install. |
| Features | HIGH | Current UI gaps derived directly from source code. Table stakes grounded in established diagramming tool patterns (draw.io, Miro, Figma). Anti-features grounded in project constraints (DIN 69900, client-only). |
| Architecture | HIGH | All patterns derived from direct inspection of the actual source files. Build order verified against concrete dependency analysis. Pitfall-prevention strategies are standard TypeScript/React patterns. |
| Pitfalls | HIGH | Every pitfall is grounded in actual code locations with line references. No hypothetical pitfalls. |

**Overall confidence: HIGH**

### Gaps to Address

- **`html-to-image` version currency:** Web access was unavailable during research. Before running `npm install html-to-image`, verify the current stable version on npm and check for any open critical issues in the repository. The API and rationale are sound; the version number is the only unverified detail.
- **`immer` actual usage:** Search `web/src/**` for `import.*immer` before removing it alongside Zustand. STACK.md flags this as "verify separately."
- **ReactFlow 11 + React 19 edge cases:** The app runs in production (primary evidence of compatibility), but the combination is not an officially tested matrix. React 19 Strict Mode double-invocation of effects could surface latent bugs in `GraphCanvas.tsx`'s `useEffect` chains. Monitor during Phase 1 refactoring.
- **`computed` field in JSON schema:** Confirm whether `docs/json-schema.v1.json` currently documents the optional `computed` field in exports. If not, decide before Phase 1 whether to strip it from export or add it to the schema — either fix is simple but must be done before schema validation is enforced.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `web/src/components/AppToolbar.tsx`, `GraphCanvas.tsx`, `graph/TaskNode.tsx`, `graph/StartNode.tsx`, `graph/EndNode.tsx`, `graph/theme.ts`, `App.tsx`
- `web/src/persistence/autosave.ts`, `serialize.ts`
- `web/src/cpm/compute.ts`, `validate.ts`, `workdays.ts`, `types.ts`
- `web/package.json`, `web/node_modules/*/package.json` (reactflow, zustand, ajv, immer, dom-to-image-more)
- `docs/json-schema.v1.json`
- `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/TESTING.md`
- `web/src/App.test.tsx`, `web/src/cpm/compute.test.ts`, `vitest.setup.ts`

### Secondary (MEDIUM confidence — training knowledge, corroborated by codebase evidence)
- ReactFlow 11 documentation patterns and testing constraints — training data; existing `App.test.tsx` provides corroborating evidence
- Professional diagramming tool conventions (draw.io, Miro, Figma) — training data; used for table stakes feature assessment
- MDN `DOMException.name === 'QuotaExceededError'` — training data; standard cross-browser pattern
- `html-to-image` library API — training data; version currency unverified (web access denied)
- Zod 3.x as preferred schema library fallback — training data; stable major for several years

### Note on Research Constraints

Web search, WebFetch, and Brave Search were unavailable during this research session. All findings are grounded in local file inspection and training-data knowledge. The recommendation to verify `html-to-image` version currency before install is the only action item that requires external network access.

---
*Research completed: 2026-03-16*
*Ready for roadmap: yes*
