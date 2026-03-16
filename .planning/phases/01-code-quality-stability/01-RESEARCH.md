# Phase 1: Code Quality & Stability - Research

**Researched:** 2026-03-16
**Domain:** TypeScript type safety, error handling, test coverage, dependency cleanup, bug fixes
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**JSON-Import-Validierung**
- `docs/json-schema.v1.json` um das optionale `computed`-Feld erweitern, damit eigene Exporte (die `computed` enthalten) die Schema-Validierung bestehen
- Manuellen Guard `validateProjectJSON()` in `serialize.ts` beibehalten — keine zusätzliche Schema-Library (kein ajv), kein Bundle-Overhead
- Bei fehlgeschlagenem Import: Fehlermeldung(en) aus `validateProjectJSON()` im bestehenden Banner anzeigen — konsistent mit Graphen-Validierungsfehlern

**QuotaExceeded UX**
- `autosave.ts` fängt `QuotaExceededError` explizit ab; `saveCurrent()` gibt `SaveResult` zurück: `{ ok: boolean, error?: string }`
- Bei `ok: false`: Banner-Anzeige mit Fehlermeldung (z.B. "Speicher voll — bitte Snapshots löschen oder Projekt als JSON exportieren")

**T-Shortcut (Neue Task-Node)**
- Neuer Node erscheint in der Viewport-Mitte (ReactFlow viewport API)
- Node startet direkt im Bearbeitungs-Modus mit fokussiertem Titel-Input — kein separater Doppelklick nötig
- Shortcut deaktiviert wenn Fokus in einem Input-Feld liegt

**Immer-Dependency**
- Entfernen — keine einzigen `import from 'immer'` im Quellcode vorhanden, nur in einem Kommentar erwähnt
- Gemeinsam mit Zustand entfernen (DEPS-01 + DEPS-03)

### Claude's Discretion
- Genaue Fehlertext-Formulierungen für Banner-Meldungen
- Default-Titel-Format für neue Nodes via T-Shortcut (z.B. "Task N" mit fortlaufender Nummer)
- Exakte ReactFlow viewport-Mitte-Berechnung (screenToFlowPosition vs. getViewport)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEPS-01 | Zustand aus `package.json` entfernen | Verified: zero `import from 'zustand'` in src — safe to delete from dependencies |
| DEPS-02 | `dom-to-image-more` durch `html-to-image` ersetzen | Verified: `html-to-image@1.11.13` available; API uses `backgroundColor` (not `bgcolor`); `filter` option for excluding nodes; named exports (`toPng`) |
| DEPS-03 | Immer-Nutzung prüfen und entfernen | Verified: zero `import from 'immer'` in src — safe to delete from dependencies |
| TYPES-01 | `isProjectJSON` Type Guard in `serialize.ts` | Pattern: use `data is ProjectJSON` return type; existing `validateProjectJSON()` does the work already — wrap it |
| TYPES-02 | Discriminated Union für ReactFlow Node-Daten | Needs three interfaces with `type` discriminant: `TaskNodeData`, `StartNodeData`, `EndNodeData`; one cast at the ReactFlow boundary |
| TYPES-03 | `as any` in `serialize.ts` durch Narrowing ersetzen | Current: 6 `as any` casts in `toProjectJSON`/`fromProjectJSON`; fixable with TYPES-02 discriminated union |
| ERR-01 | Alle leeren `catch {}` erhalten `console.error(e)` | Located: `autosave.ts` lines 10, 32, 62; `GraphCanvas.tsx` lines 140-142; fix is additive |
| ERR-02 | `QuotaExceededError` explizit abfangen in `autosave.ts` | Pattern: `e instanceof DOMException && e.name === 'QuotaExceededError'`; `saveCurrent` returns `SaveResult` |
| ERR-03 | `startDate` validieren vor Übergabe an `workdays.ts` | `addWorkdays` infinite-loops on invalid ISO date; validate with `/^\d{4}-\d{2}-\d{2}$/.test()` before calling |
| BUG-01 | Node-IDs via `crypto.randomUUID()` | `crypto.randomUUID()` available in all modern browsers and in Node 19+; no polyfill needed; jsdom supports it in vitest |
| BUG-02 | Snapshot-Keys erhalten Random-Suffix | Replace `id: \`${Date.now()}\`` with `id: \`${Date.now()}-${Math.random().toString(36).slice(2,8)}\`` |
| BUG-03 | `setTimeout`-basierte Validierungsaufrufe entfernen | Three locations in `GraphCanvas.tsx` (lines 82, 249, 280); `useEffect([nodes, edges])` already handles validation on line 114 |
| BUG-04 | `TopRightDebug.tsx` hinter `import.meta.env.DEV` | Component exists at `web/src/components/TopRightDebug.tsx`; NOT imported anywhere currently — just needs to be verified it stays unused in prod |
| BUG-05 | PNG-Export via `html-to-image` mit `filter`-Option | Exclude `.react-flow__controls`, `.react-flow__panel`, `.react-flow__minimap` via `filter: (node) => !node.classList?.contains(...)` |
| TEST-01 | Serialisierungs-Round-Trip-Tests | New file: `serialize.test.ts`; test `fromProjectJSON(toProjectJSON(state))`; 3+ graph configs |
| TEST-02 | `validateGraph()` Unit-Tests | New file: `validate.test.ts`; test valid graph, missing connections, cycles, orphaned nodes |
| TEST-03 | `workdays.ts` Unit-Tests | New file: `workdays.test.ts`; test `addWorkdays()`, weekend skipping, invalid date throws error |
| TEST-04 | CPM Edge-Cases | Extend `compute.test.ts`; add: single node (start+end only), disconnected subgraph, cycle detection, `ComputeError.code` check |
| SNAP-01 | Snapshots optional benennbar (`name?: string`) | Add `name?: string` to snapshot schema in `autosave.ts`; update `listSnapshots()` return type |
| SNAP-02 | Taste `T` fügt neuen Task-Node hinzu | `keydown` listener in `GraphCanvas.tsx` via `useEffect`; check `document.activeElement` to skip when input focused; use `useReactFlow().getViewport()` for center position |
</phase_requirements>

---

## Summary

Phase 1 is a hardening phase with no new features and no UI changes. The codebase is a Vite + React 19 + ReactFlow 11 + TypeScript 5.9 project with Vitest already configured. The test infrastructure is working — `compute.test.ts` exists and passes, vitest config points to jsdom. The biggest structural change is introducing a discriminated union for ReactFlow node data (TYPES-02), which unlocks removal of all `as any` casts in `serialize.ts` and downstream.

The two dead dependencies (Zustand, Immer) are confirmed absent from source code — their removal is a pure `package.json` edit plus `npm install`. The `dom-to-image-more` replacement (`html-to-image@1.11.13`) has a compatible API but with one option rename: `bgcolor` becomes `backgroundColor`, and the `filter` function enables clean panel exclusion from PNG exports. The `.d.ts` stub at `src/types/dom-to-image-more.d.ts` must be deleted as part of DEPS-02.

`TopRightDebug.tsx` is defined but NOT imported anywhere in the current codebase — BUG-04 is a no-op verification plus ensuring no future import bypasses the DEV guard. The most complex work items are TYPES-02 (discriminated union propagation), ERR-02 (SaveResult API change requires updating all callers in GraphCanvas.tsx), and SNAP-02 (T-shortcut with viewport-center positioning and auto-focus).

**Primary recommendation:** Implement in dependency order: DEPS first (clean package.json), then TYPES-02 (enables TYPES-01, TYPES-03), then ERR changes (SaveResult propagation), then BUGs, then SNAP, then TEST last (tests validate all prior changes).

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| vitest | ^3.2.4 | Test runner | Already configured; globals + jsdom environment |
| @testing-library/react | ^16.3.0 | React component tests | Installed but not needed for Phase 1 (pure logic tests) |
| @testing-library/jest-dom | ^6.9.1 | DOM matchers | Already in vitest.setup.ts |
| TypeScript | ~5.9.3 | Strict mode | `strict: true`, `noUnusedLocals`, `noUnusedParameters` all on |
| reactflow | ^11.11.4 | Graph canvas | Using v11 API (`useReactFlow`, `getViewport`, `screenToFlowPosition`) |

### To Install
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| html-to-image | ^1.11.13 | PNG export from DOM | Replaces dom-to-image-more; better maintained; native filter option |

### To Remove
| Library | Reason |
|---------|--------|
| dom-to-image-more | Replaced by html-to-image |
| zustand | Zero imports in source code |
| immer | Zero imports in source code |

**Installation command:**
```bash
cd web && npm install html-to-image && npm uninstall dom-to-image-more zustand immer
```

---

## Architecture Patterns

### Existing Test Pattern (follow this exactly)
Tests are co-located with source files. Inline test data, no factories. Import from `@testing-library/jest-dom/vitest` for DOM matchers.

```typescript
// Source: web/src/cpm/compute.test.ts (existing pattern)
import '@testing-library/jest-dom/vitest'
import { computeCPM } from './compute'
import type { ProjectJSON } from './types'

describe('computeCPM', () => {
  it('...', () => {
    const plan: ProjectJSON = { /* inline data */ }
    const res = computeCPM(plan)
    expect(res.criticalPath).toEqual([...])
  })
})
```

### Pattern: Discriminated Union for Node Data (TYPES-02)
**What:** Replace `(n.data as any)` with a proper union type at the ReactFlow boundary
**When to use:** Everywhere node data is accessed downstream of ReactFlow

```typescript
// New types to add to cpm/types.ts or a new graph/nodeTypes.ts
interface TaskNodeData {
  type: 'task'
  id: string
  title: string
  duration: number
  computed?: ComputedNode
  onEdit: (id: string, patch: Partial<{ title: string; duration: number }>) => void
  startDate?: string
}

interface StartNodeData {
  type: 'start'
  label: string
  startDate?: string
  onChangeStartDate: (date: string) => void
}

interface EndNodeData {
  type: 'end'
  label: string
  startDate?: string
  computed?: ComputedNode
}

type AppNodeData = TaskNodeData | StartNodeData | EndNodeData
```

### Pattern: Type Guard (TYPES-01)

```typescript
// In serialize.ts — wrap validateProjectJSON
export function isProjectJSON(data: unknown): data is ProjectJSON {
  return validateProjectJSON(data).length === 0
}
```

### Pattern: SaveResult (ERR-02)

```typescript
// In autosave.ts
export interface SaveResult {
  ok: boolean
  error?: string
}

export function saveCurrent(project: ProjectJSON): SaveResult {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ ts: Date.now(), project }))
    return { ok: true }
  } catch (e) {
    console.error(e)
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, error: 'Speicher voll — bitte Snapshots löschen oder Projekt als JSON exportieren' }
    }
    return { ok: false, error: 'Speichern fehlgeschlagen' }
  }
}
```

**Caller side in GraphCanvas.tsx:**
```typescript
// Replace current silent saveCurrent() call
const result = saveCurrent(pj)
if (!result.ok && result.error) {
  setQuotaError(result.error) // new state + banner display
}
```

### Pattern: T-Shortcut Viewport Center (SNAP-02)

```typescript
// In GraphCanvas.tsx — requires useReactFlow() hook
import { useReactFlow } from 'reactflow'

const { getViewport, screenToFlowPosition } = useReactFlow()

useEffect(() => {
  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 't' && e.key !== 'T') return
    const active = document.activeElement
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
    // Calculate viewport center in flow coordinates
    const { x, y, zoom } = getViewport()
    const centerX = (window.innerWidth / 2 - x) / zoom
    const centerY = (window.innerHeight / 2 - y) / zoom
    addTaskNode(centerX, centerY)
  }
  document.addEventListener('keydown', onKeyDown)
  return () => document.removeEventListener('keydown', onKeyDown)
}, [getViewport, addTaskNode])
```

### Pattern: html-to-image with Panel Exclusion (DEPS-02 + BUG-05)

```typescript
// Replace dom-to-image-more usage in AppToolbar.tsx
import { toPng } from 'html-to-image'

const dataUrl = await toPng(el, {
  backgroundColor: '#ffffff',
  filter: (node) => {
    if (!(node instanceof Element)) return true
    const cls = node.classList
    return (
      !cls.contains('react-flow__controls') &&
      !cls.contains('react-flow__panel') &&
      !cls.contains('react-flow__minimap')
    )
  },
})
```

Note: `html-to-image` uses named exports (`toPng`), not a default export. The import syntax changes from `import domtoimage from 'dom-to-image-more'` to `import { toPng } from 'html-to-image'`.

### Pattern: startDate Validation (ERR-03)

```typescript
// In GraphCanvas.tsx or compute invocation site
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isValidISODate(s: string | undefined): s is string {
  if (!s) return false
  if (!ISO_DATE_RE.test(s)) return false
  const d = new Date(s)
  return !isNaN(d.getTime())
}
```

Pass `startDate` through this guard before calling `addWorkdays`/`nextWorkday`. Invalid date → skip ISO date computation, return `undefined` for `earliestFinishISO`.

### Pattern: crypto.randomUUID() for Node IDs (BUG-01)

```typescript
// Replace getNextTaskId() in GraphCanvas.tsx
const id = crypto.randomUUID()
```

`crypto.randomUUID()` is available globally in browsers (Chrome 92+, Firefox 95+, Safari 15.4+) and in jsdom (vitest test environment). No import needed. The existing `idRef` counter logic and `N{num}` ID format can be dropped.

### Pattern: TopRightDebug DEV Gate (BUG-04)

TopRightDebug is currently NOT imported anywhere in App.tsx or GraphCanvas.tsx — confirmed by grep. BUG-04 implementation is: add the DEV gate inside the component or its import site if it ever gets imported. The component file itself should have the guard added proactively:

```typescript
// TopRightDebug.tsx — add guard at export
if (!import.meta.env.DEV) {
  // Component should never render in production
}
// Or: wrap the export in a conditional
export function TopRightDebug() {
  if (!import.meta.env.DEV) return null
  // ... rest of component
}
```

### json-schema.v1.json Extension (TYPES-01 context)

The schema currently has `"additionalProperties": false` at the top level. This will reject exported JSON that includes the `computed` field. Fix: add `computed` as an optional property and relax top-level additionalProperties, OR just add `computed` explicitly.

```json
{
  "properties": {
    "settings": { ... },
    "nodes": { ... },
    "edges": { ... },
    "computed": {
      "type": "object",
      "description": "Optional computed CPM results — present in app exports"
    }
  },
  "required": ["nodes", "edges"],
  "additionalProperties": false
}
```

Note: The schema is documentation-only (not used at runtime for validation — `validateProjectJSON()` is the runtime guard). But it must be updated to accurately reflect valid export format.

### Anti-Patterns to Avoid

- **Removing `setTimeout` without `useEffect` dependency array check:** The `validate()` call via setTimeout is redundant because `useEffect([validate, nodes, edges, startDate])` already fires. Simply remove the setTimeout calls in `onNodesChange`, `onEdgesChange`, `onImport`, and `addTaskNode` — do NOT add new `useEffect` hooks.
- **Changing `N{num}` ID format for existing nodes:** `crypto.randomUUID()` is for new nodes only. Existing nodes loaded from autosave keep their IDs. The `idRef` counter for seeding can be removed when new node IDs are UUIDs.
- **Treating TopRightDebug as an active import:** It is already not imported. BUG-04 is a defensive fix on the component itself, not a refactor of App.tsx.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PNG from DOM | Custom canvas rendering | `html-to-image` toPng | Cross-browser font embedding, iframe isolation, SVG handling |
| ISO date validity check | Complex date parser | `new Date(s).isNaN()` + regex | Date constructor handles edge cases |
| Unique IDs | Timestamp + counter | `crypto.randomUUID()` | RFC 4122 compliant, collision-proof, built-in |
| localStorage quota detection | Custom quota probe | `instanceof DOMException && name === 'QuotaExceededError'` | Standard web API; no library needed |

---

## Common Pitfalls

### Pitfall 1: `html-to-image` import is named, not default
**What goes wrong:** Copy-pasting the old `import domtoimage from 'dom-to-image-more'` pattern fails
**Why it happens:** `dom-to-image-more` used a default export; `html-to-image` uses named exports
**How to avoid:** `import { toPng } from 'html-to-image'`
**Warning signs:** TypeScript error "Module has no default export"

### Pitfall 2: `filter` function receives non-Element nodes
**What goes wrong:** Calling `.classList` on Text nodes or comment nodes throws
**Why it happens:** `filter` is called on all DOM nodes, not just elements
**How to avoid:** Guard with `if (!(node instanceof Element)) return true` before accessing `classList`

### Pitfall 3: ReactFlow `useReactFlow()` outside ReactFlow provider
**What goes wrong:** `useReactFlow()` throws "Could not find React Flow context"
**Why it happens:** Hook must be called inside a component that is a child of `<ReactFlow>`
**How to avoid:** `GraphCanvas` renders `<ReactFlow>` as its root — hooks inside `GraphCanvas` are safe. `AppToolbar` is rendered inside a `<Panel>` which is inside `<ReactFlow>`, so it is also safe.

### Pitfall 4: `SaveResult` return type breaks existing callers
**What goes wrong:** All existing `saveCurrent(pj)` call sites (currently void) need updating to handle `SaveResult`
**Why it happens:** Return type changes from void/undefined to `SaveResult`
**How to avoid:** After changing `autosave.ts`, grep for all `saveCurrent(` call sites and update them. There are two: `GraphCanvas.tsx` line 119 and `AppToolbar.tsx` line 119.

### Pitfall 5: `noUnusedLocals` and `noUnusedParameters` break on partial refactors
**What goes wrong:** TypeScript compile fails mid-refactor when intermediate states leave unused variables
**Why it happens:** `tsconfig.app.json` has `"noUnusedLocals": true` and `"noUnusedParameters": true`
**How to avoid:** Complete each refactor atomically — don't leave intermediate states with leftover variables. Use `_param` naming convention for intentionally unused params if needed.

### Pitfall 6: `json-schema.v1.json` `additionalProperties: false` rejects `computed`
**What goes wrong:** App exports include `computed` field; schema says `additionalProperties: false`
**Why it happens:** Schema was written before `computed` was added to exports
**How to avoid:** Add `computed` as optional property in the schema (DEPS context — this is a documentation fix, not a runtime fix, since `validateProjectJSON()` is the real guard and it already ignores `computed`)

### Pitfall 7: `describe`/`it`/`expect` globals in test files
**What goes wrong:** TypeScript complains about `describe` not being defined
**Why it happens:** These are vitest globals
**How to avoid:** `tsconfig.app.json` already has `"types": ["vite/client", "vitest/globals"]` — globals are available. No explicit import needed. Follow the existing `compute.test.ts` pattern.

---

## Code Examples

### Existing Test File Pattern (source of truth)
```typescript
// Source: web/src/cpm/compute.test.ts
import '@testing-library/jest-dom/vitest'
import { computeCPM } from './compute'
import type { ProjectJSON } from './types'

describe('computeCPM', () => {
  it('berechnet Beispiel aus PRD', () => {
    const plan: ProjectJSON = {
      settings: { version: '1.0' as const, startDate: '2025-10-07', workweek: [1, 2, 3, 4, 5] as const },
      nodes: [/* ... */],
      edges: [/* ... */],
    }
    const res = computeCPM(plan)
    expect(res.criticalPath).toEqual(['start', 'A', 'C', 'end'])
  })
})
```

### Empty Catch Locations (ERR-01)
```
autosave.ts line 10:  } catch {}              // saveCurrent
autosave.ts line 32:  } catch {}              // saveSnapshot
autosave.ts line 62:  } catch {}              // deleteSnapshot
GraphCanvas.tsx line 140-142: } catch {}      // loadCurrent on startup
AppToolbar.tsx line 121: } catch {}           // saveSnapshot in toolbar
GraphCanvas.tsx line 187: } catch {           // computeCPM (intentional — returns undefined)
  return undefined
}
```
Note: The `computeCPM` catch in GraphCanvas.tsx line 187 is intentional (returns undefined on invalid graph) — keep the behavior, add `console.error(e)` inside.

### setTimeout Removal Locations (BUG-03)
```
GraphCanvas.tsx line 82:   setTimeout(() => validate(), 0)  // inside addTaskNode
GraphCanvas.tsx line 249:  setTimeout(() => validate(), 0)  // inside onNodesChange handler
GraphCanvas.tsx line 280:  setTimeout(() => validate(), 0)  // inside onImport handler
```
All three are redundant because `useEffect([validate, nodes, edges, startDate])` at line 114 fires on every node/edge state change.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `dom-to-image-more` (unmaintained fork) | `html-to-image` (active, 1.11.13) | `filter` option, `backgroundColor` spelling, named exports |
| Timestamp-based IDs (`Date.now()`) | `crypto.randomUUID()` | Collision-proof, no sequential predictability |
| Silent `catch {}` | Structured error surfacing | Debuggability, user-visible quota errors |
| `as any` everywhere | Discriminated union + narrowing | TypeScript strict mode compliance |

---

## Open Questions

1. **Auto-focus on T-shortcut node**
   - What we know: CONTEXT.md says "Node startet direkt im Bearbeitungs-Modus mit fokussiertem Titel-Input"
   - What's unclear: ReactFlow doesn't expose a programmatic focus API for custom nodes; focus would need to be triggered from within `TaskNode.tsx` component
   - Recommendation: Pass a `focusOnMount?: boolean` prop via node data; `TaskNode` calls `inputRef.current?.focus()` in a `useEffect` when the prop is true; clear the prop after focus

2. **Snapshot `name` field UI**
   - What we know: SNAP-01 adds `name?: string` to schema; SNAP-02 is the T-shortcut
   - What's unclear: CONTEXT says "Benennung ist optional, nicht required" — whether the snapshot panel shows a name-input inline or on creation only is Claude's discretion
   - Recommendation: Add inline input to the "+ Neu" button flow in `AppToolbar.tsx` snapshot panel; keep it optional (empty = unnamed)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `web/vite.config.ts` (test section: globals=true, environment=jsdom) |
| Setup file | `web/vitest.setup.ts` |
| Quick run command | `cd web && npm test -- --run src/cpm/compute.test.ts` |
| Full suite command | `cd web && npm test -- --run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-01 | `fromProjectJSON(toProjectJSON(state))` round-trip, 3+ configs | unit | `cd web && npm test -- --run src/persistence/serialize.test.ts` | Wave 0 |
| TEST-02 | `validateGraph()`: valid, missing connections, cycles, orphans | unit | `cd web && npm test -- --run src/graph/validate.test.ts` | Wave 0 |
| TEST-03 | `addWorkdays()`: start date, weekends, invalid date throws | unit | `cd web && npm test -- --run src/cpm/workdays.test.ts` | Wave 0 |
| TEST-04 | CPM edge cases: single node, disconnected, cycle, ComputeError.code | unit | `cd web && npm test -- --run src/cpm/compute.test.ts` | Partially (extend existing) |
| TYPES-01 | `isProjectJSON` type guard narrows correctly | unit | `cd web && npm test -- --run src/persistence/serialize.test.ts` | Wave 0 |
| ERR-02 | `saveCurrent()` returns `{ ok: false, error }` on QuotaExceededError | unit | `cd web && npm test -- --run src/persistence/autosave.test.ts` | Wave 0 |
| ERR-03 | Invalid `startDate` does not cause infinite loop in `addWorkdays` | unit | `cd web && npm test -- --run src/cpm/workdays.test.ts` | Wave 0 |
| DEPS-01, DEPS-03 | No zustand/immer imports after removal | static | `cd web && npm run build` (TypeScript will error on missing modules if imported) | n/a — package.json edit |
| BUG-01, BUG-02 | UUID format, random snapshot key suffix | unit | `cd web && npm test -- --run src/persistence/autosave.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd web && npm test -- --run` (full suite, < 5 seconds for pure-logic tests)
- **Per wave merge:** `cd web && npm run build && npm test -- --run`
- **Phase gate:** Full suite green + zero TypeScript errors before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `web/src/persistence/serialize.test.ts` — covers TEST-01, TYPES-01
- [ ] `web/src/graph/validate.test.ts` — covers TEST-02
- [ ] `web/src/cpm/workdays.test.ts` — covers TEST-03, ERR-03
- [ ] `web/src/persistence/autosave.test.ts` — covers ERR-02, BUG-01, BUG-02

Note: `web/src/cpm/compute.test.ts` already exists — extend it for TEST-04, do not create a new file.

---

## Sources

### Primary (HIGH confidence)
- Direct file reads of source code — all findings above reflect actual current state
- `web/package.json` — confirmed versions and installed/missing packages
- `web/vite.config.ts` — confirmed test configuration
- `web/tsconfig.app.json` — confirmed strict TypeScript settings
- `npm show html-to-image` — confirmed version 1.11.13, main entry point
- github.com/bubkoo/html-to-image README — confirmed `backgroundColor`, `filter` option signatures

### Secondary (MEDIUM confidence)
- ReactFlow v11 `useReactFlow()` API — `getViewport()` returns `{x, y, zoom}`; `screenToFlowPosition` converts screen coords

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm registry and file system
- Architecture patterns: HIGH — derived directly from reading actual source files
- Pitfalls: HIGH — identified from actual code reading (empty catches, setTimeout anti-patterns, etc.)
- Test infrastructure: HIGH — vite.config.ts and existing test file read directly

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable tech stack, 30-day window)
