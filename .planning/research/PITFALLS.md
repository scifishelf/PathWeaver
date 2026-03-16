# Domain Pitfalls

**Domain:** React/TypeScript code quality improvement and UI redesign (existing codebase)
**Project:** PathWeaver
**Researched:** 2026-03-16
**Confidence:** HIGH (based on direct codebase analysis + established engineering patterns)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or hard-to-diagnose regressions.

---

### Pitfall 1: localStorage Key Migration Without Backward Compatibility Guard

**What goes wrong:**
The current `autosave.ts` stores all data under two keys: `pw_autosave_current` and `pw_snapshots_v1`. When snapshot IDs change from `Date.now()` string format to `crypto.randomUUID()` + suffix format, the new code still reads the old format correctly — but if the key *prefix* or *structure* is ever changed, every existing user loses their autosaved project silently. The `loadCurrent()` and `loadSnapshot()` functions already swallow all errors with empty `catch {}` blocks, so data loss becomes invisible.

**Why it happens:**
The silent catch pattern in `autosave.ts` (lines 10, 18, 32) was designed to be resilient, but it hides migration failures. A JSON structure change (e.g., the `settings.version` field becoming `'1.1'`) causes `validateProjectJSON` to reject the loaded data, and the app silently starts with an empty graph — losing the user's work.

**Consequences:**
- User opens app after update, graph is gone with no error message
- No way to diagnose what happened (error was caught and discarded)
- Only affects users with existing localStorage data (not reproducible in fresh tests)

**Prevention:**
- Before changing any localStorage key name or data shape, write a migration function that reads the old key and writes the new key, then deletes the old key
- Migration must run once on first load, before the main `loadCurrent()` call
- Keep `validateProjectJSON` version-aware (distinguish "unknown version" from "corrupt data")
- Add `console.error` to all `catch {}` blocks before any migration work, so failures become visible during development

**Warning signs:**
- PR that changes key names in `autosave.ts` without a migration block
- PR that bumps `settings.version` without updating `validateProjectJSON` to handle the old version
- `catch {}` blocks left empty when migrating

**Phase:** Code Quality & Stability (Phase 1) — must be addressed before any localStorage key changes

---

### Pitfall 2: `html-to-image` Captures the ReactFlow Container Including UI Controls

**What goes wrong:**
The current PNG export in `AppToolbar.tsx` (line 190) targets `.react-flow` — the outermost ReactFlow wrapper. `dom-to-image-more` and `html-to-image` both capture everything inside that element, including the MiniMap, Controls panel, and the floating AppToolbar Panel. The `toPng` call will capture the toolbar buttons ("Export", "Snapshots", "Import", "PNG") inside the exported image because the `<Panel position="top-right">` is rendered inside `.react-flow`.

When migrating to `html-to-image`, the API is nearly identical (`toPng(element, options)`), but the `bgcolor` option name changes to `backgroundColor`, and the `quality` option is not supported for PNG (only JPEG). Passing an unsupported option silently does nothing, so the export still works but the explicit quality hint is ignored.

**Why it happens:**
The ReactFlow DOM structure nests all panels inside the `.react-flow` root. Both libraries capture the full subtree. The migration is tempting to do as a drop-in replacement without auditing what gets captured.

**Consequences:**
- UI controls (buttons, minimap) appear in exported PNG — unprofessional result
- Export freeze of 1–3s remains unchanged (both libraries block the main thread)
- If `quality: 1` option is left in the `toPng` call for `html-to-image`, it silently no-ops (PNG is always lossless)

**Prevention:**
- Switch the capture target from `.react-flow` to `.react-flow__renderer` (the inner canvas area only) or add a dedicated wrapper div around only the graph content
- Audit what is inside the target element before and after migration using browser DevTools
- For `html-to-image`, use `filter` option to exclude `.react-flow__controls`, `.react-flow__minimap`, and `.react-flow__panel` elements from capture
- Remove the `quality` option for PNG calls; it only applies to `toJpeg`

**Warning signs:**
- PR that swaps `dom-to-image-more` for `html-to-image` with only the import line changed
- No visual regression check (screenshot comparison) after the migration
- The temporary `<style id="pw-export-style">` injection pattern (lines 193–199) should still be reviewed — `html-to-image` handles inline styles differently and may not honour `!important` overrides injected at runtime

**Phase:** Code Quality & Stability (Phase 1) — first task after library swap

---

### Pitfall 3: `as any` Removal That Breaks ReactFlow Integration

**What goes wrong:**
The codebase has 44+ `as any` casts, heavily concentrated in `GraphCanvas.tsx` and `serialize.ts`. Many of these are not careless shortcuts — they are necessary bridges between ReactFlow's `Node` generic type (`Node<TData>`) and the app's typed `TaskNode` data shape. Removing all `as any` casts without replacing them with proper generic type parameters will cause TypeScript errors on every call to `setNodes`, `onNodesChange`, and anywhere `n.data` is accessed.

**Why it happens:**
ReactFlow 11's `Node` type uses a generic `TData = any` default. The codebase chose not to thread a typed `Node<TaskData>` throughout, using `as any` at boundaries instead. The correct fix requires either (a) typing all ReactFlow state as `Node<TaskData | StartData | EndData>` and using discriminated unions, or (b) using type guards at access sites. Both approaches are non-trivial.

**Consequences:**
- Attempting a "find all `as any` and remove" approach causes 20+ TypeScript compile errors
- Discriminated union approach requires changes in `GraphCanvas.tsx`, `AppToolbar.tsx`, `serialize.ts`, and all three node components
- Risk of introducing `as unknown as X` casts (false fix) which TypeScript accepts but are equally unsafe

**Prevention:**
- Audit `as any` casts before removing them: categorize into "true unknown input" (JSON parsing, external data — should become type guards) vs "ReactFlow boundary" (should become typed generics) vs "lazy shortcut" (fix with proper narrowing)
- Fix ReactFlow boundary casts first by adding `Node<Record<string, unknown>>` throughout, then narrow per-component
- Prioritize `serialize.ts` casts (highest risk, pure logic, no ReactFlow dependency) — these can be typed independently
- Do not remove `as any` from `setNodes(nn as any)` calls until the ReactFlow node type is parameterized project-wide

**Warning signs:**
- PR description says "remove all as any" without specifying which category
- TypeScript strict mode errors spiking after the PR
- New `as unknown as X` casts appearing (swapping one unsafe cast for another)

**Phase:** Code Quality & Stability (Phase 1) — serialize.ts first, then ReactFlow types

---

## Moderate Pitfalls

Mistakes that create visible bugs, test failures, or significant rework.

---

### Pitfall 4: Testing ReactFlow Components Without Required JSDOM Polyfills

**What goes wrong:**
The existing `vitest.setup.ts` already polyfills `ResizeObserver` — but ReactFlow 11 requires additional browser APIs that JSDOM does not provide: `DOMMatrixReadOnly`, `SVGSVGElement.getScreenCTM()`, and CSS custom property computation. Without these, rendering `GraphCanvas` or any component that imports from `reactflow` in a test will throw uncaught errors or produce empty renders, causing tests to pass vacuously (no assertions on actual content).

**Why it happens:**
ReactFlow 11's internal layout engine calls `getBoundingClientRect()` and `getComputedStyle()` during node positioning. JSDOM returns zeroes for all measurements. The existing `App.test.tsx` smoke test passes because it only checks for `rf__wrapper` presence (the outer div always renders) without testing any visual state.

**Consequences:**
- Tests for node rendering pass but don't verify actual rendered content
- Integration tests for CPM highlighting (critical path color changes) will always fail or require mocks that make the test worthless
- `AppToolbar` tests that trigger import and check graph updates will see `setNodes` called but no visual result because ReactFlow measurement hooks return no-op

**Prevention:**
- Keep ReactFlow component tests at smoke-test level only (does it render without crashing)
- Test *logic* separately: `validateGraph`, `computeCPM`, `serialize`, `workdays` are pure functions with no ReactFlow dependency — these are the high-value test targets
- For AppToolbar interaction tests that involve import/export, mock `fromProjectJSON` and `toProjectJSON` rather than exercising the full DOM
- Use Playwright E2E for any test that requires actual ReactFlow behavior (drag, connect, visual state)
- Add `DOMMatrix` polyfill to `vitest.setup.ts` if testing any component that uses ReactFlow's transform utilities

**Warning signs:**
- Test for critical path highlighting that always passes even when `CRITICAL_BG` is not applied
- Test file that renders `<GraphCanvas />` and asserts on node styles — styles will always be empty in JSDOM
- Coverage report showing high % on `GraphCanvas.tsx` through a test that does not actually assert anything meaningful

**Phase:** Code Quality & Stability (Phase 1, test coverage tasks)

---

### Pitfall 5: Tailwind v4 Class Changes Breaking Existing Inline Styles

**What goes wrong:**
The project uses Tailwind v4 (`"tailwindcss": "^4.1.14"`) with the new CSS-first configuration (`@import "tailwindcss"` in `index.css`). The codebase mixes two styling approaches: React inline `style={{}}` objects (used heavily in `GraphCanvas.tsx`, `AppToolbar.tsx`, `TaskNode.tsx`) and Tailwind utility classes (used in `Modal.tsx`, `AppToolbar.tsx` error modal). During a visual redesign, adding new Tailwind classes to components that currently use inline styles can cause specificity conflicts — Tailwind's generated CSS classes may be overridden by inline styles, or vice versa, creating unpredictable visual results.

**Why it happens:**
Inline `style` attributes always have the highest specificity in CSS and cannot be overridden by class-based rules (without `!important`). Components like `AppToolbar.tsx` (line 64) and `TaskNode.tsx` use only inline styles for their layout and colors. Adding Tailwind classes to these components for the redesign will appear to work but the inline styles will silently win for any property declared in both places.

**Consequences:**
- Design tokens (e.g., a new brand color applied via `bg-blue-600`) do not appear because an inline `background: '#fff'` overrides it
- Inconsistent behavior: some components respond to Tailwind design tokens, others ignore them silently
- Debugging requires knowing which properties are inline vs class-based for each component

**Prevention:**
- Choose one styling approach per component and migrate fully: do not mix inline styles and Tailwind classes in the same element for the same CSS property
- During redesign, create a `cn()` utility (e.g., with `clsx`) to compose class names, and migrate inline styles to Tailwind classes systematically, component by component
- ReactFlow's own nodes (`TaskNode`, `StartNode`, `EndNode`) are special: their outer `<div>` uses inline styles because ReactFlow measures them for layout. Only use Tailwind classes for inner content elements, not the outer node wrapper
- Test visual output in browser after each component migration, not just in JSDOM

**Warning signs:**
- Tailwind classes added to a component but visual change not visible in browser
- Mixed styling in the same JSX element: `<div className="bg-blue-600" style={{ background: '#fff' }}>`
- "Why doesn't this class work?" appearing in PR comments

**Phase:** UI Redesign (Phase 2)

---

### Pitfall 6: `validate()` Called via `setTimeout` Capturing Stale Closure State

**What goes wrong:**
In `GraphCanvas.tsx`, `validate()` is defined as a `useCallback` that closes over `nodes` and `edges` (line 108–110). It is called in two places via `setTimeout(() => validate(), 0)` — inside `setNodes` updater (line 82) and in `onNodesChange`/`onEdgesChange` handlers (lines 245, 250). Because `validate` is captured at the time the `setTimeout` is scheduled, it may reference stale `nodes`/`edges` values from the previous render cycle, causing the error state to be one interaction behind.

During a code quality phase that replaces `setTimeout` with proper `useEffect` patterns, this is easy to fix incorrectly: moving `validate()` into a `useEffect([nodes, edges])` is correct, but if `validate` itself is included in the effect's dependency array (which ESLint's exhaustive-deps rule will require), and `validate` is recreated on every render due to a missing `useCallback` or an unstable dependency, this creates an infinite effect loop.

**Why it happens:**
The current code works "well enough" because ReactFlow batches state updates and the 0ms timeout fires after React reconciliation. But it is fragile. The exhaustive-deps lint rule is likely disabled or suppressed for these callbacks.

**Consequences:**
- Refactoring the timing incorrectly introduces infinite re-render loops
- Removing the `setTimeout` without understanding the batching creates validation races
- Adding `validate` to a `useEffect` dependency array without memoizing it causes the effect to run on every render

**Prevention:**
- The correct pattern is: one `useEffect` that fires when `nodes` or `edges` changes and calls validation + autosave, with `validate` extracted to a stable function that takes `nodes` and `edges` as parameters (not from closure)
- When refactoring, run the ESLint `react-hooks/exhaustive-deps` rule and fix each warning carefully — do not suppress it
- Check that `validate` in `useCallback` has `[nodes, edges]` in its dependency array; if it does, it is recreated on every state change and should not be called inside `setNodes` updater

**Warning signs:**
- `useEffect` that runs continuously (check React DevTools "Profiler" tab for re-renders)
- ESLint warning `react-hooks/exhaustive-deps` suppressed with `// eslint-disable-next-line`
- Validation error appearing one click late (stale closure symptom)

**Phase:** Code Quality & Stability (Phase 1, setTimeout bugfix tasks)

---

### Pitfall 7: JSON Schema Validation Not Covering the `computed` Field on Export

**What goes wrong:**
`toProjectJSON` optionally includes a `computed` field (the `ComputedResult`) in the exported JSON (line 29 of `serialize.ts`). The `validateProjectJSON` function does not check for this field and does not strip it on import. When re-imported, `fromProjectJSON` ignores it because it only maps `nodes` and `edges`. This is currently harmless, but it creates a schema inconsistency: exported files contain a field that `json-schema.v1.json` does not document (based on the PROJECT.md reference to the schema file), making exported files non-schema-valid.

If the schema validation task (from PROJECT.md requirements) validates the file before import and the schema is strict, it will reject valid exports as "invalid".

**Consequences:**
- Users who export and re-import their own files get a schema validation error
- Schema enforcement blocks legitimate round-trip use case

**Prevention:**
- Either remove `computed` from export (it is derived data, can always be recalculated from `nodes`/`edges`) or add it to the schema as an optional field
- Update `validateProjectJSON` to explicitly allow and ignore unknown top-level fields (use an open schema)
- Add a serialization round-trip test: export → import → compare nodes and edges (not computed)

**Warning signs:**
- `json-schema.v1.json` does not have a `computed` property defined
- Import of a freshly exported file fails schema validation
- `toProjectJSON` and `fromProjectJSON` diverge in their understanding of the data shape

**Phase:** Code Quality & Stability (Phase 1, JSON import validation task)

---

## Minor Pitfalls

Mistakes that create polish or maintenance issues but do not block functionality.

---

### Pitfall 8: Date Format Inconsistency Surviving the Redesign

**What goes wrong:**
`formatDateShort()` in `workdays.ts` formats dates as `DD.MM.YY` (2-digit year, line 31: `d.getFullYear() % 100`). The PROJECT.md lists "Datumformat: Konsistenz (aktuell '06.10.25' vs '06.10.2025')" as a UI goal. The year-2000 truncation is intentional (2-digit year is conventional in German project management contexts), but if the UI redesign adds a date display in a different component using a different formatter or `date-fns`'s `format(d, 'dd.MM.yyyy')`, both formats will coexist again.

**Prevention:**
- Create a single `formatDate(d: Date): string` utility that all components use
- Document the intentional choice of 2-digit year in a comment
- Add a test that verifies `formatDateShort` output format so future changes are caught

**Phase:** UI Redesign (Phase 2)

---

### Pitfall 9: Zustand Removal Leaving Dead Imports

**What goes wrong:**
Zustand is installed (`zustand: ^5.0.8`) but the codebase does not use it for any runtime state. However, `immer` (`^10.1.3`) is also installed and is a common Zustand middleware dependency. Removing Zustand from `package.json` without checking whether `immer` is used elsewhere will silently leave `immer` as a dead dependency (or, if `immer` is actually used somewhere, removing it breaks the build).

**Prevention:**
- Search for all imports of `zustand` and `immer` before removing either
- Run `npm ls immer` to see if any other dependency relies on it transitively
- Remove both or keep both based on findings

**Warning signs:**
- `import { produce } from 'immer'` found anywhere in `src/`
- `import { create } from 'zustand'` found anywhere in `src/`

**Phase:** Code Quality & Stability (Phase 1, Zustand tech debt task)

---

### Pitfall 10: `TopRightDebug.tsx` Remains Imported Even When Hidden

**What goes wrong:**
Hiding `TopRightDebug.tsx` behind `import.meta.env.DEV` (from PROJECT.md requirements) only prevents rendering in production. If the import statement itself is not conditional, the module and its dependencies are still included in the production bundle. Vite's tree-shaking will eliminate the rendering code, but any side effects in the module (e.g., `console.log` calls at module scope) would still execute.

**Prevention:**
- Use dynamic `import()` with `import.meta.env.DEV` condition, or simply delete the component and its import entirely if it has no ongoing value
- Verify the production bundle does not include debug code using `vite build --report` and checking the output manifest

**Phase:** Code Quality & Stability (Phase 1)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| localStorage key/ID changes | Silent data loss from missing migration | Write migration function before changing keys; add console.error to all catch blocks first |
| `dom-to-image-more` → `html-to-image` | UI controls captured in PNG; unsupported options silently ignored | Audit capture target element; use `filter` option; remove `quality` from `toPng` calls |
| `as any` removal | TypeScript errors cascade through ReactFlow-typed state | Categorize casts first; fix serialize.ts before GraphCanvas.tsx |
| Adding test coverage | ReactFlow components untestable in JSDOM for visual state | Test pure logic (CPM, serialize, workdays) in unit tests; use Playwright for visual assertions |
| Visual redesign / Tailwind classes | Inline styles silently override new Tailwind classes | Migrate one component fully before moving to the next; no mixed styling on same property |
| setTimeout → useEffect refactor | Infinite render loop from unstable validate dependency | Extract validate as pure function taking nodes/edges params; fix exhaustive-deps warnings |
| JSON schema enforcement | Round-trip import fails due to `computed` field not in schema | Strip `computed` from export or add it to schema before enabling strict validation |

---

## Sources

- Direct codebase analysis: `web/src/persistence/autosave.ts`, `serialize.ts`, `GraphCanvas.tsx`, `AppToolbar.tsx`, `TaskNode.tsx`, `graph/validate.ts`, `cpm/workdays.ts`, `cpm/types.ts`
- Test infrastructure analysis: `vitest.setup.ts`, `App.test.tsx`, `compute.test.ts`, `vite.config.ts`
- Project requirements: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/CONVENTIONS.md`
- Confidence: HIGH for all pitfalls (grounded in actual code, not hypothetical)
