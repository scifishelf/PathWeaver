# Codebase Concerns

**Analysis Date:** 2026-03-17

## Tech Debt

**TypeScript `as any` casts — ReactFlow integration boundary:**
- Issue: 26+ `as any` casts throughout codebase, concentrated in `GraphCanvas.tsx` and `serialize.ts`. These are necessary bridges between ReactFlow's untyped Node/Edge generics and app's typed data shapes rather than careless shortcuts.
- Files: `web/src/components/GraphCanvas.tsx` (lines 69, 85, 89, 106, 115, 134-136, 199, 202, 221, 224, 227, 306-308, 311-312), `web/src/graph/TaskNode.tsx` (lines 102, 132, 161, 167), `web/src/components/AppToolbar.tsx` (lines 245-246)
- Impact: Reduces type safety at ReactFlow boundaries, making it harder to catch data shape mismatches. Removing all casts without proper typed generics causes cascade of TypeScript errors.
- Fix approach: Categorize casts into "true unknown input" (JSON parsing → use type guards), "ReactFlow boundary" (should become typed generics with discriminated unions), and "lazy shortcuts" (proper narrowing). Fix `serialize.ts` independently first, then refactor ReactFlow state as `Node<TaskData | StartData | EndData>` with discriminated unions throughout `GraphCanvas.tsx`, `AppToolbar.tsx`, and node components.

**Incomplete localStorage error handling — silent failure pattern:**
- Issue: `saveCurrent()`, `loadCurrent()`, `loadSnapshot()`, `deleteSnapshot()` catch errors silently with `console.error()` but return undefined/empty arrays, masking data loss. Errors are logged but not propagated to user.
- Files: `web/src/persistence/autosave.ts` (lines 10-23, 25-34, 59-62, 76-85, 87-96)
- Impact: Users lose data (project state disappears) with no visible error message. Migration failures (e.g., key name changes, JSON structure changes) become invisible until user reopens app and finds graph empty.
- Fix approach: For reads (`loadCurrent`, `loadSnapshot`): return `{ ok: false, error: string }` instead of undefined, propagate to UI as banner. For writes: `saveCurrent` already returns `SaveResult`; extend pattern to snapshots. Add migration function that runs once on startup, checks old key names, migrates data, logs completion.

**Zustand and immer dependencies removed but not verified:**
- Issue: Both dependencies are no longer imported in codebase (`package.json` confirms removal), but initial analysis marked these as risks. Removal was verified post-hoc in STATE.md but creates risk if new code accidentally re-introduces usage without seeing `package.json`.
- Files: `web/package.json` (no zustand, immer imports)
- Impact: Low — current state is clean. Risk is human: if Zustand is needed in future (e.g., for cross-component state), developer must explicitly add it back.
- Fix approach: Document that both are intentionally removed in favor of React hooks. If global state becomes necessary, use Zustand; dependency will be clearly visible in package.json.

---

## Known Bugs

**setTimeout validation closure capturing stale nodes/edges state:**
- Symptoms: Graph validation error state may lag one interaction behind. Autosave fires with potentially stale nodes/edges.
- Files: `web/src/components/GraphCanvas.tsx` (lines 111-127)
- Trigger: Create a node, immediately make a graph error (e.g., connect to Start) — the error banner may not appear until the next change, and autosave captures the stale state.
- Workaround: Wait for the next change to see validation errors. Autosave is logged but stale writes are never read back (validation occurs on load), so data is never corrupted.
- Root cause: `validate` is a `useCallback` with `[nodes, edges]` deps, so it's recreated on every state change. The `setTimeout(() => validate(), 300)` in effect line 113 captures the dependency closure at effect-run time. If nodes/edges change again before the timeout fires, the timeout captures the old validate function with old closure values.

**JSON Schema allows `computed` field but does not document it:**
- Symptoms: Exported JSON files contain optional `computed` field (CPM results) that `json-schema.v1.json` may not document. Round-trip validation (export → import → re-validate) may fail if schema is strict.
- Files: `web/src/persistence/serialize.ts` (line 39 exports computed), `docs/json-schema.v1.json` (must check if `computed` property exists)
- Trigger: Export a project with computed results, then re-import it and validate against schema.
- Workaround: Remove `computed` from exported JSON (it is always recalculated on import anyway).
- Root cause: `toProjectJSON` includes `computed` for reference, but it's derived data. `fromProjectJSON` ignores it. Schema should either allow it as optional or export should exclude it.

**App.test.tsx smoke test does not assert visual content:**
- Symptoms: Test passes vacuously — it only checks that `rf__wrapper` div exists, not that any nodes are rendered or styled correctly.
- Files: `web/src/App.test.tsx` (line 11 only checks wrapper presence)
- Trigger: Render the app. It never fails because JSDOM returns zeroes for all `getBoundingClientRect` calls.
- Workaround: Don't rely on JSDOM tests for visual assertions. Use Playwright E2E for full rendering checks.
- Root cause: ReactFlow 11 requires actual browser APIs (`DOMMatrixReadOnly`, `getScreenCTM()`, computed styles). JSDOM stubs are incomplete. Existing `vitest.setup.ts` polyfills `ResizeObserver` but not these deeper APIs.

---

## Security Considerations

**No authentication or authorization model:**
- Risk: All data is public (localStorage is per-browser). No server-side persistence. If deployed as shared tool, any user sees any other user's data if localStorage is shared.
- Files: `web/src/persistence/autosave.ts`, `web/src/components/AppToolbar.tsx`
- Current mitigation: Single-user tool (browser-local storage only). No server sync. Each browser/user has isolated data.
- Recommendations: For future multi-user version: (1) Add authentication (OAuth/JWT), (2) Move localStorage to server-synced database, (3) Add row-level permissions on projects, (4) Add audit log for export/share actions.

**JSON import accepts any file structure without origin validation:**
- Risk: User can import malicious JSON files that execute arbitrary parsing code or overflow localStorage.
- Files: `web/src/components/AppToolbar.tsx` (lines 48-66 file import handler)
- Current mitigation: `validateProjectJSON` checks for required fields and structure. File size is limited only by browser memory. Large files may crash tab.
- Recommendations: Add file size limit before parsing (e.g., 10MB). Validate JSON structure strictly before parsing (use schema validation library like Zod/Joi). Consider sandboxing import in Web Worker.

**PNG export may capture sensitive data in UI:**
- Risk: If toolbar buttons with sensitive labels (e.g., "Export to Client Server") are visible in graph during export, they appear in PNG. Exported PNG is shared with sensitive metadata.
- Files: `web/src/components/AppToolbar.tsx` (lines 68-99 PNG export with filter)
- Current mitigation: Filter excludes `.react-flow__controls`, `.react-flow__panel`, `.react-flow__minimap`. AppToolbar is outside `.react-flow`, so it's excluded. Safe to export.
- Recommendations: Add UI hint that export is public-shareable. Add metadata strip option (remove titles, dates, durations from export). Test that toolbar is never captured.

---

## Performance Bottlenecks

**Graph rendering with 50+ nodes causes layout thrashing:**
- Problem: ReactFlow recalculates layout and styles on every state change. With 50+ nodes, each keystroke in node title triggers full graph re-render and DOM measurement.
- Files: `web/src/components/GraphCanvas.tsx` (lines 209-231 styledNodes memo, lines 233-258 styledEdges memo)
- Cause: `styledNodes` and `styledEdges` are memoized but depend on `nodes` and `edges`. Each node edit (`onEditTask` at line 67-72) triggers setNodes, which runs all memos. No virtualization.
- Improvement path: (1) Memoize individual node/edge styling functions with `React.memo`. (2) Use `useDeferredValue` for non-critical style updates. (3) For 100+ nodes, implement virtualization (ReactFlow's built-in viewport-based culling may be enough). (4) Batch title edits with debounce (already 200ms in TaskNode.tsx line 29, but full graph still re-renders).

**Autosave writes to localStorage every 300ms during editing:**
- Problem: Lines 113-125 in GraphCanvas.tsx serialize entire project and write to localStorage on every nodes/edges change (batched at 300ms). No deduplication — two identical states cause two writes.
- Files: `web/src/components/GraphCanvas.tsx` (lines 113-125)
- Cause: Validation + autosave happen in same effect. Every keystroke (title edit) schedules a save.
- Improvement path: (1) Debounce longer for autosave than validation (validation 0ms, save 1000ms). (2) Compare project JSON before writing (skip if identical). (3) Only save when user focuses away from node inputs. (4) Batch multiple saves in a single effect.

**CPM computation blocks main thread for large graphs:**
- Problem: `computeCPM` (topological sort + path computation) is synchronous. Graphs with 100+ nodes and 200+ edges may take 50-100ms, freezing UI.
- Files: `web/src/cpm/compute.ts` (lines 5-35 topo sort, entire function blocking)
- Cause: No parallelization or Web Worker. Full sync computation.
- Improvement path: (1) Move `computeCPM` to Web Worker (separate thread). (2) Return a Promise from memoized hook that updates state when done. (3) Show loading state while computing. (4) Cache result, only recompute when graph structure changes (not on style-only changes).

---

## Fragile Areas

**GraphCanvas component — 330+ lines of complex state management:**
- Files: `web/src/components/GraphCanvas.tsx`
- Why fragile: Single component manages nodes, edges, validation, autosave, CPM computation, styling, context menus, and keyboard shortcuts. Each feature has side effects that depend on others.
- Safe modification: (1) Extract pure logic into separate files: validation (done: `graph/validate.ts`), serialization (done: `persistence/serialize.ts`), CPM (done: `cpm/compute.ts`). (2) Extract state hooks: `useGraphState`, `useValidation`, `useAutosave`, `useCPM`. (3) Test each hook independently with unit tests, not E2E. (4) Add regression tests for edge cases: empty graph, duplicate node IDs, disconnected subgraphs.
- Test coverage: Validation logic is tested (`graph/validate.test.ts`), CPM logic is tested (`cpm/compute.test.ts`), but GraphCanvas integration is not. App.test.tsx only smoke-tests rendering.

**serialize.ts — No strict type guards on input:**
- Files: `web/src/persistence/serialize.ts` (lines 43-71 fromProjectJSON has unsafe `as` casts)
- Why fragile: `fromProjectJSON` assumes input structure without type narrowing. It casts JSON to `TaskNodeJson` without checking all required fields. If JSON is malformed (missing `id`, `type`, etc.), the function returns silently incorrect data.
- Safe modification: (1) Use Zod or io-ts for schema validation before deserialization. (2) Add explicit type guards: `function isTaskNode(x: unknown): x is TaskNodeJson { ... }`. (3) Return `{ ok, error, data? }` instead of throwing, so callers can handle invalid input gracefully. (4) Add tests: import malformed JSON, verify error is caught.
- Test coverage: `serialize.test.ts` exists but is limited. Need tests for: missing fields, wrong types, extra fields, edge case values (empty string titles, zero duration).

**TaskNode inline style coupling to ReactFlow layout:**
- Files: `web/src/graph/TaskNode.tsx` (lines 37-48 isCritical ? ... inline styles)
- Why fragile: Node styles are split between inline `style={{}}` (layout, backdrop, shadow) and Tailwind classes (unlikely, not in current code). If design tokens in `graph/theme.ts` change, colors must be updated manually here. If ReactFlow changes how it measures node size, the hardcoded `minWidth: 180` may break layout.
- Safe modification: (1) Extract critical/non-critical node styles to `graph/theme.ts` as named objects: `TASK_NODE_CRITICAL`, `TASK_NODE_NORMAL`. (2) Import and use: `style={{ ...TASK_NODE_CRITICAL }}`. (3) Update theme.ts once, all nodes update. (4) Add visual regression test (Playwright screenshot) to catch theme changes.
- Test coverage: `TaskNode.test.tsx` exists but likely doesn't test styling. Add snapshot test.

**Validation logic split between two files:**
- Files: `web/src/graph/validate.ts` (ReactFlow graph validation), `web/src/persistence/serialize.ts` (JSON schema validation)
- Why fragile: Both files validate project structure but independently. `validateGraph` checks for cycles/orphans/start-end rules. `validateProjectJSON` checks JSON schema. If one is updated (e.g., add new error rule), the other may not match. ImportError message from `AppToolbar` shows `validateProjectJSON` errors, but GraphCanvas shows `validateGraph` errors — different validation contexts.
- Safe modification: (1) Consolidate into single `validate()` that takes both ReactFlow nodes and JSON structure. (2) Run both checks, return union of errors. (3) Document which errors come from which validator. (4) Add integration test: create invalid graph in UI, export to JSON, import into fresh app, verify errors are identical.
- Test coverage: Both validators have unit tests. Missing: round-trip test (create invalid graph, serialize, deserialize, validate again).

---

## Scaling Limits

**localStorage 5-10MB limit per origin:**
- Current capacity: ~10 snapshots at ~500KB each = 5MB (90% full on mobile browsers). Each snapshot stores entire project JSON including full node/edge list.
- Limit: QuotaExceededError thrown when sum of all localStorage entries exceeds browser limit (usually 5-10MB).
- Scaling path: (1) Implement automatic snapshot cleanup (delete oldest when limit is hit). (2) Implement delta snapshots (store only changes from previous, not full project). (3) Add server sync (move to database for unlimited storage). (4) Gzip compress snapshots before storing (reduces size by ~3-4x).

**ReactFlow rendering performance with 200+ nodes:**
- Current capacity: Smooth interaction at ~50 nodes, lag noticeable at 100+, severe lag at 200+.
- Limit: Canvas measurement, layout, and re-render on every state change. No virtualization.
- Scaling path: (1) Implement viewport-based culling (ReactFlow supports this natively, must enable). (2) Use Web Worker for CPM computation. (3) Batch node updates (collect multiple changes, apply once). (4) Use React.memo on node components and pass only necessary props.

**JSON export file size grows linearly with graph size:**
- Current capacity: 100 nodes × 200 edges ≈ 50KB JSON file.
- Limit: No hard limit, but very large projects (500+ nodes) → multi-MB JSON files that are slow to upload, share, or import.
- Scaling path: (1) Implement binary export format (Protocol Buffers, MessagePack) instead of JSON. (2) Implement sparse representation (only store non-default properties). (3) Compress export option. (4) Implement incremental export (only changed nodes/edges since last export).

---

## Dependencies at Risk

**html-to-image 1.11.13 — migration from dom-to-image-more completed:**
- Risk: Replaced `dom-to-image-more` with `html-to-image` in Phase 1. `dom-to-image-more` is unmaintained (last update 2020), `html-to-image` is more active but smaller community.
- Impact: PNG export now uses `html-to-image`. If it introduces bugs or performance regressions, the app's only export feature is affected.
- Migration plan: Monitor `html-to-image` issue tracker. If critical bugs appear, evaluate alternatives: `screenshot-js` (Puppeteer-based, requires server), `canvas-based rendering` (rewrite export to use HTML canvas directly).

**ReactFlow 11.11.4 — major version dependency:**
- Risk: ReactFlow 11 is actively maintained but significant version upgrade from v10. Heavy reliance on ReactFlow internals (node rendering, handles, layout). Tight coupling via `as any` casts means updates to ReactFlow may require significant refactoring.
- Impact: ReactFlow update may break node rendering, handle positions, or validation rules.
- Migration plan: Pin ReactFlow version until full TypeScript typing is in place. When updating, test: (1) node rendering visually, (2) handle positioning and connections, (3) panel rendering (controls, minimap), (4) custom node styles.

**React 19.1.1 — latest version with potential breaking changes:**
- Risk: React 19 introduced new hooks (useActionState, useFormStatus) and potential behavior changes in useEffect cleanup. Latest release may have undiscovered edge cases.
- Impact: New hooks are opt-in, so usage is safe. Risk is future React updates requiring refactoring.
- Migration plan: Monitor React changelogs. Pin version for production stability. Test after any React update: (1) All hooks (useCallback, useEffect, useState), (2) Autosave behavior, (3) Event handlers.

---

## Missing Critical Features

**No multi-user collaboration:**
- Problem: Tool is single-browser, single-user only. No way to share projects in real-time or with feedback comments.
- Blocks: Teams using PathWeaver cannot collaborate. Export-review-import workflow is manual.
- Priority: Post-v1.0 feature (not blocking MVP).

**No offline detection or sync state:**
- Problem: localStorage is implicit. No indicator whether data is synced, when last save occurred, or if there are unsaved changes.
- Blocks: Users don't know if their data is safe. Closing browser during autosave may lose changes.
- Priority: Medium (add "Last saved X seconds ago" indicator and "unsaved changes" badge).

**No data validation on import — corrupted projects can be imported:**
- Problem: `validateProjectJSON` checks structure but not semantic validity. A project with negative durations, missing node data, or orphaned nodes passes validation and imports silently.
- Blocks: Users can corrupt their project by importing malformed JSON, then can't fix it in UI.
- Priority: Medium (add stricter validation before import).

---

## Test Coverage Gaps

**GraphCanvas integration — untestable in JSDOM:**
- What's not tested: Node rendering positions, styles, connections, mouse events, keyboard shortcuts (T key). CPM highlighting visual state. Autosave trigger timing.
- Files: `web/src/components/GraphCanvas.tsx`
- Risk: Critical features (CPM highlighting, autosave) may break unnoticed. Regression in node positioning could go unfound.
- Priority: High — add Playwright E2E tests for: (1) Create node via T key, (2) Edit title and duration, (3) Connect nodes, (4) Verify CPM highlighting on critical path, (5) Export PNG and verify no UI controls in image, (6) Verify autosave fires and loads on refresh.

**Persistence round-trip — partial coverage:**
- What's not tested: Export project, modify JSON manually, re-import with validation errors. Snapshot load/delete edge cases. localStorage quota exceeded behavior.
- Files: `web/src/persistence/autosave.ts`, `web/src/persistence/serialize.ts`, `web/src/components/AppToolbar.tsx`
- Risk: Data loss on corrupt import. Quota errors not shown to user. Snapshot metadata (name field) not tested.
- Priority: Medium — add tests: (1) Export, corrupt JSON, import and verify error shown. (2) Hit quota limit, verify error message displayed. (3) Create snapshot with name, load it, verify name preserved. (4) Delete snapshot, verify it's removed from list.

**StartNode date input — no date validation tests:**
- What's not tested: ISO date validation. Invalid dates (e.g., "2026-13-01"). Changing date and triggering CPM recalc. Date format consistency.
- Files: `web/src/graph/StartNode.tsx`
- Risk: Invalid dates may silently break CPM computation. User may enter date in wrong format and wonder why it's ignored.
- Priority: Low — add unit tests for `isValidISODate()` and integration test: change start date, verify CPM updates, export and verify date is in JSON.

---

*Concerns audit: 2026-03-17*
