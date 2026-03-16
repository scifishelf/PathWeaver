# Architecture Patterns

**Domain:** Code quality improvement of an existing React 19 + TypeScript + ReactFlow 11 app
**Researched:** 2026-03-16
**Confidence note:** Research is based on direct codebase inspection plus training-data knowledge (cutoff August 2025). External web search was unavailable. Confidence levels reflect this.

---

## Recommended Architecture

The current architecture is already well-structured with clean layer separation. The improvement work targets **hardening existing layers** — not restructuring them. The goal is to remove uncertainty (silent errors, type gaps, untested paths) within the established three-tier model.

```
┌─────────────────────────────────────────────────────────┐
│  UI / Presentation Layer                                 │
│  GraphCanvas.tsx  AppToolbar.tsx  TaskNode.tsx  etc.    │
│                                                         │
│  Problems here: as any casts, silent catch blocks,      │
│  setTimeout-as-side-effect, missing error surfaces       │
└─────────────┬───────────────────────────────────────────┘
              │ calls
┌─────────────▼───────────────────────────────────────────┐
│  Business Logic Layer                                    │
│  compute.ts  validate.ts  workdays.ts                   │
│                                                         │
│  Problems here: edge cases untested, startDate not      │
│  validated before arithmetic, no test for orphan graph  │
└─────────────┬───────────────────────────────────────────┘
              │ reads/writes
┌─────────────▼───────────────────────────────────────────┐
│  Serialization + Persistence Layer                      │
│  serialize.ts  autosave.ts                              │
│                                                         │
│  Problems here: as any everywhere, QuotaExceededError   │
│  silently swallowed, no schema validation on import,    │
│  round-trip correctness untested                        │
└─────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `GraphCanvas.tsx` | Orchestrates graph state, validation triggers, CPM compute, autosave | `validate.ts`, `compute.ts`, `serialize.ts`, `autosave.ts`, `AppToolbar.tsx` |
| `AppToolbar.tsx` | Import/export UI, snapshot management UI | `serialize.ts`, `autosave.ts` (via props/callbacks from `GraphCanvas`) |
| `validate.ts` | Graph structural validation (cycles, orphans, start/end rules) | Accepts `Node[]`, `Edge[]` from ReactFlow — no dependency on persistence layer |
| `compute.ts` | CPM algorithm (forward/backward pass, critical path) | Accepts `ProjectJSON` (pure domain types) — no dependency on ReactFlow types |
| `serialize.ts` | Bidirectional transform: ReactFlow nodes/edges ↔ `ProjectJSON` | Bridges UI layer types (`reactflow`) and domain types (`cpm/types.ts`) |
| `autosave.ts` | localStorage read/write, snapshot lifecycle | Accepts/returns `ProjectJSON` — no dependency on UI |
| `workdays.ts` | Workday arithmetic, date formatting | Pure functions, no external dependencies beyond `date-fns` |
| `types.ts` | Canonical domain types (`ProjectJSON`, `ComputedResult`, `ComputeError`) | Imported by all other modules — foundational |

**Key boundary to preserve:** `compute.ts` and `validate.ts` accept only domain types (`ProjectJSON`, not ReactFlow `Node[]`). The `serialize.ts` layer is the only place that knows both type worlds. This boundary must not be dissolved during improvement work.

---

## Data Flow

### Testing Data Flow (how test inputs map to system)

```
Test fixture (ProjectJSON literal)
        │
        ▼
computeCPM(plan)           ← pure function, no ReactFlow dependency
        │
        ▼
ComputedResult             ← assert against this
```

```
Test fixture (ProjectJSON literal)
        │
        ▼
toProjectJSON(nodes, edges)  ← serialize
        │
        ▼
fromProjectJSON(json)        ← deserialize
        │
        ▼
assert original ≈ reconstructed  ← round-trip test
```

```
Test fixture (Node[], Edge[])
        │
        ▼
validateGraph(nodes, edges)  ← pure function returning string[]
        │
        ▼
assert errors array          ← check specific error messages
```

### Error Propagation Flow (current vs. improved)

**Current (broken):**
```
localStorage.setItem() throws QuotaExceededError
        │
        ▼
empty catch {}  ← error swallowed, nothing logged, no user feedback
```

**Improved:**
```
localStorage.setItem() throws QuotaExceededError
        │
        ▼
catch (e) { if (e instanceof DOMException && e.name === 'QuotaExceededError') {...} }
        │
        ├─ console.error(...)     ← always log for debugging
        └─ optional: surface to UI state via callback
```

---

## Patterns to Follow

### Pattern 1: Typed Node Data via Discriminated Union

**What:** Replace `as any` on `n.data` in `serialize.ts` and `GraphCanvas.tsx` with discriminated union types.

**When:** Any time code branches on `n.type === 'task' | 'start' | 'end'`.

**Why:** The branching already exists — TypeScript just does not know the narrowed type inside each branch. Adding discriminated unions gives compile-time safety with zero runtime cost.

**Current problem in `serialize.ts`:**
```typescript
const base: any = { id: n.id, type: (n.type as any) || 'task' }
if (base.type === 'task') {
  base.title = (n.data as any)?.title ?? n.id  // as any hides the type
}
```

**Recommended approach:**
```typescript
// In types or a local interface file:
interface TaskNodeData { id: string; title: string; duration: number }
interface StartNodeData { label: string; startDate?: string }
interface EndNodeData { label: string }

// Narrowing in serialize.ts:
if (n.type === 'task') {
  const data = n.data as TaskNodeData  // single cast at boundary, not scattered casts
  base.title = data.title ?? n.id
  base.duration = data.duration ?? 1
}
```

**Confidence:** HIGH — standard TypeScript discriminated union pattern.

---

### Pattern 2: Type Guard for Unknown/Parsed JSON

**What:** Replace `as any` casts on parsed JSON with a runtime type guard that narrows `unknown` to `ProjectJSON`.

**When:** `validateProjectJSON()` in `serialize.ts` and anywhere `JSON.parse()` result is used.

**Current problem:** `JSON.parse(raw)` returns `any`, which TypeScript lets flow through without narrowing. The existing `validateProjectJSON()` function already validates structure but returns `string[]` (errors) rather than acting as a type predicate.

**Recommended approach — type predicate guard:**
```typescript
function isProjectJSON(value: unknown): value is ProjectJSON {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (!Array.isArray(v.nodes)) return false
  if (!Array.isArray(v.edges)) return false
  if (!v.settings || typeof v.settings !== 'object') return false
  return true
}

// Usage:
const parsed: unknown = JSON.parse(raw)
if (!isProjectJSON(parsed)) return undefined  // or throw
// parsed is now ProjectJSON — no cast needed
```

**Benefit:** A single type guard at the parse boundary eliminates all downstream `as any` casts caused by parse results flowing into the system untyped.

**Confidence:** HIGH — standard TypeScript `unknown`/type predicate pattern.

---

### Pattern 3: Named Error Classes for localStorage

**What:** Distinguish between `QuotaExceededError` (recoverable: offer snapshot cleanup) and other storage errors (unexpected: log and continue).

**When:** `autosave.ts` — every `localStorage.setItem()` call.

**Current problem in `autosave.ts`:**
```typescript
export function saveCurrent(project: ProjectJSON) {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ ts: Date.now(), project }))
  } catch {}  // completely silent — QuotaExceededError is swallowed
}
```

**Recommended approach:**
```typescript
export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unknown'; message: string }

export function saveCurrent(project: ProjectJSON): SaveResult {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ ts: Date.now(), project }))
    return { ok: true }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('[autosave] localStorage quota exceeded', e)
      return { ok: false, reason: 'quota', message: 'Speicherlimit erreicht' }
    }
    console.error('[autosave] unexpected storage error', e)
    return { ok: false, reason: 'unknown', message: String(e) }
  }
}
```

**Caller responsibility:** `GraphCanvas.tsx` currently ignores the return value of `saveCurrent`. After this change, it can surface quota errors to the user (e.g., suggest deleting old snapshots).

**Confidence:** HIGH — `DOMException` with `name === 'QuotaExceededError'` is the standard cross-browser pattern (MEDIUM confidence that exact name string is correct across all browsers, but this is the documented MDN approach).

---

### Pattern 4: ISO Date Validation Before Arithmetic

**What:** Validate `startDate` string format before passing it to `addWorkdays()`/`nextWorkday()`.

**When:** `computeCPM()` and `formatWorkdayToDate()` — any function that calls `new Date(startISO)`.

**Current problem:** `new Date('not-a-date')` returns a `Date` object with `Invalid Date` state. `addWorkdays()` will then produce an infinite loop (the `while (isWeekend(d))` loop in `nextWorkday()` never terminates on `Invalid Date`) or produce `NaN` results silently.

**Recommended approach:**
```typescript
function isValidISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s))
}

// In computeCPM, before date computation:
if (startISO && !isValidISODate(startISO)) {
  // Proceed without date conversion rather than crashing
  // Log warning but do not throw — date is optional
  console.warn('[computeCPM] invalid startDate format, skipping ISO conversion:', startISO)
}
```

**Confidence:** HIGH — this is a defensive programming pattern, no library dependency needed.

---

### Pattern 5: Round-Trip Testing for Serialization

**What:** Test that `toProjectJSON(fromProjectJSON(json).nodes, fromProjectJSON(json).edges)` produces JSON structurally equivalent to the original input.

**When:** As a unit test in a new `serialize.test.ts` file.

**Why `serialize.ts` needs this:** The current code has 44+ `as any` casts. Some of these are load-bearing (e.g., `(jn as any).x ?? 0` in `fromProjectJSON`). A round-trip test will catch regressions when the type casts are cleaned up.

**Recommended test structure:**
```typescript
// serialize.test.ts
import { toProjectJSON, fromProjectJSON } from './serialize'
import type { ProjectJSON } from '../cpm/types'

const fixture: ProjectJSON = {
  settings: { version: '1.0', startDate: '2025-10-07' },
  nodes: [
    { id: 'start', type: 'start' },
    { id: 'N1', type: 'task', title: 'Task 1', duration: 3, x: 100, y: 200 },
    { id: 'end', type: 'end' },
  ],
  edges: [{ from: 'start', to: 'N1' }, { from: 'N1', to: 'end' }],
}

it('round-trips: fromProjectJSON → toProjectJSON preserves nodes and edges', () => {
  const { nodes, edges } = fromProjectJSON(fixture)
  const result = toProjectJSON(nodes, edges, undefined, fixture.settings?.startDate)

  expect(result.nodes).toHaveLength(fixture.nodes.length)
  expect(result.edges).toHaveLength(fixture.edges.length)

  const taskNode = result.nodes.find(n => n.id === 'N1')
  expect(taskNode?.title).toBe('Task 1')
  expect(taskNode?.duration).toBe(3)
  expect(taskNode?.x).toBe(100)
  expect(taskNode?.y).toBe(200)
})
```

**Confidence:** HIGH — this directly tests existing functions with existing types.

---

### Pattern 6: ReactFlow Component Testing Strategy

**What:** Test `GraphCanvas` and individual node components without fighting ReactFlow's internal DOM setup.

**When:** Writing component-level tests for node components (`TaskNode.tsx`, `StartNode.tsx`, `EndNode.tsx`) and integration tests for `GraphCanvas`.

**Key insight from existing `App.test.tsx`:** ReactFlow renders fine in the jsdom test environment without mocking — the existing `App.test.tsx` already proves this (`screen.getByTestId('rf__wrapper')` passes). This means heavy ReactFlow mocking is not needed.

**Recommended strategy — three levels:**

**Level 1: Node component tests (no ReactFlow needed)**
`TaskNode`, `StartNode`, `EndNode` are React components that accept `data` props. They can be tested in isolation by rendering with `@testing-library/react` without a ReactFlow context, passing typed `data` props directly.

```typescript
// TaskNode.test.tsx
import { render, screen } from '@testing-library/react'
import { TaskNode } from './TaskNode'

it('displays task title and duration', () => {
  render(<TaskNode
    id="N1"
    data={{ id: 'N1', title: 'My Task', duration: 5, onEdit: vi.fn() }}
    // minimal ReactFlow node props
    type="task" selected={false} dragging={false}
    xPos={0} yPos={0} zIndex={0} isConnectable={true}
  />)
  expect(screen.getByText('My Task')).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()
})
```

**Level 2: GraphCanvas smoke test (existing pattern)**
The existing `App.test.tsx` renders `<App />` which includes `<GraphCanvas />`. This verifies the canvas mounts without errors. Extend this test with `data-testid` attributes on key UI elements to assert rendered state.

**Level 3: Do NOT attempt full interaction tests on ReactFlow canvas**
Drag-and-drop, edge connection, and context menu interactions depend on ReactFlow's internal pointer event handling. These are brittle in jsdom. Use Playwright E2E tests for these interactions instead.

**Vitest mock for localStorage in unit tests:**
```typescript
// In test setup or per-test:
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

**Confidence:** MEDIUM — based on codebase inspection and training knowledge of ReactFlow 11 test patterns. ReactFlow's jsdom compatibility may have quirks in edge cases not covered by the existing smoke test.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Mocking ReactFlow in Unit Tests

**What:** Using `vi.mock('reactflow', ...)` to replace the entire ReactFlow library with stub components.

**Why bad:** The existing `App.test.tsx` shows ReactFlow renders in jsdom without mocking. Adding a mock creates a maintenance burden and tests the mock, not the real behavior. If ReactFlow's internal hooks change, the mock silently diverges.

**Instead:** Test node components in isolation (they do not need ReactFlow context). Test `GraphCanvas` with the real ReactFlow rendered (as already done). Use Playwright for interaction tests.

---

### Anti-Pattern 2: Scattering `as any` at Every Access Site

**What:** Adding type casts at each point where typed data is accessed (`(n.data as any).title`).

**Why bad:** 44+ cast sites in the current code already illustrate the problem — each cast is a potential silent runtime error. One wrong assumption propagates everywhere.

**Instead:** Apply a single type cast at the data boundary (parse boundary for JSON, at the node data setter for ReactFlow node data) and derive typed variables. All downstream code then works with typed values.

---

### Anti-Pattern 3: Silent Catch Blocks in User-Facing Code

**What:** `try { ... } catch {}` with no logging or error state update.

**Why bad:** Five silent catch blocks exist in the current codebase. `GraphCanvas.tsx` has one around the autosave trigger and one around the autosave load. `autosave.ts` has three. These make production debugging impossible.

**Instead:** Minimum: `console.error('[module] operation failed', e)`. For user-facing operations (import, snapshot save): surface error via state/callback so the UI can display a message.

---

### Anti-Pattern 4: Using `setTimeout` for Validation Side Effects

**What:** `setTimeout(() => validate(), 0)` called inside `setNodes()` callback and inside `onNodesChange`.

**Why bad:** `setTimeout` runs after the current React render cycle but makes no guarantee about state freshness. If nodes/edges are stale in the validate closure, validation runs on old data. The existing code partially mitigates this with a separate `useEffect` on `[nodes, edges]`, making the `setTimeout` calls redundant.

**Instead:** Rely entirely on the `useEffect([nodes, edges])` for validation. Remove the `setTimeout` calls — they are defensive code added to work around React's async state updates but create timing ambiguity.

---

## Scalability Considerations

| Concern | Current State | At 100 nodes | At 500+ nodes |
|---------|--------------|--------------|---------------|
| localStorage quota | 10 snapshots × full project JSON | ~50KB total, fine | ~500KB+ per snapshot, quota risk |
| CPM compute speed | O(V+E) topological sort | <1ms | May notice lag; memoization already in place |
| Validation redundancy | Runs 2-3× per interaction (useEffect + setTimeout) | Negligible | Perceptible if not consolidated |
| Type safety | `as any` cast density | Already a bug source | More nodes = more serialization paths = more risk |

**Storage quota math:** A project with 100 nodes × ~200 bytes/node ≈ 20KB per snapshot. 10 snapshots = 200KB. Total localStorage budget is typically 5MB. Risk threshold is roughly 200-500 nodes with 10 snapshots. The `QuotaExceededError` handling must be in place before the project is published, as users cannot predict their graph size.

---

## Build Order Implications

The improvement work has a natural dependency order:

**Step 1 — Foundation (no UI risk):** Types and type guards
- Add `NodeData` discriminated union types
- Add `isProjectJSON` type guard replacing `as any` at parse boundary
- Add ISO date validator
- These are purely additive, zero breakage risk

**Step 2 — Tests (validates assumptions before changing code):**
- `serialize.test.ts` round-trip tests (run before cleaning up `as any` in `serialize.ts`)
- `validate.test.ts` (run before changing `validate.ts`)
- `workdays.test.ts` (pure functions, easiest to test)
- CPM edge case tests (run before any CPM changes)

**Step 3 — Error handling (changes function signatures):**
- `autosave.ts` — return `SaveResult` type from `saveCurrent`/`saveSnapshot`
- `GraphCanvas.tsx` — handle `SaveResult`, surface quota errors
- `workdays.ts` — add guard in `formatWorkdayToDate` (already has a catch; improve it)

**Step 4 — Type cleanup (relies on Step 1 types and Step 2 tests as safety net):**
- `serialize.ts` — replace `as any` with proper discriminated unions
- `GraphCanvas.tsx` — replace `as any` casts using defined `NodeData` types

**Step 5 — Debug/housekeeping (independent, low risk):**
- Hide `TopRightDebug.tsx` behind `import.meta.env.DEV`
- Replace timestamp IDs with `crypto.randomUUID()`
- Add snapshot key random suffix

**Ordering rationale:** Tests must precede type cleanup so the cleanup can be verified. Error handling changes signature contracts, so they come before UI-layer refactors that depend on those signatures. Foundation types must precede the refactors that use them.

---

## Sources

- Direct inspection of `web/src/persistence/autosave.ts`, `serialize.ts`, `compute.ts`, `validate.ts`, `workdays.ts`, `GraphCanvas.tsx`, `App.test.tsx`, `compute.test.ts`, `types.ts` (HIGH confidence — primary source)
- `.planning/codebase/ARCHITECTURE.md`, `TESTING.md`, `CONCERNS.md` — codebase analysis documents (HIGH confidence)
- TypeScript handbook discriminated unions and type predicates — training knowledge (HIGH confidence, stable language feature)
- MDN Web API `DOMException.name` / `QuotaExceededError` — training knowledge (MEDIUM confidence, should be verified against current MDN docs if browser compatibility is a concern)
- ReactFlow 11 testing patterns — training knowledge (MEDIUM confidence — ReactFlow 11 is not in Context7 and web search was unavailable; the existing `App.test.tsx` passing is the strongest evidence that jsdom works)
