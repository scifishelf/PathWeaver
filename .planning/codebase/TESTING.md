# Testing Patterns

**Analysis Date:** 2026-03-17

## Test Framework

**Runner:**
- Vitest 3.2.4
- Config: `/Users/ansgar.simon/Desktop/coding/PathWeaver/web/vite.config.ts`
- Environment: jsdom (simulated browser DOM)
- Setup file: `/Users/ansgar.simon/Desktop/coding/PathWeaver/web/vitest.setup.ts`

**Assertion Library:**
- Vitest built-in assertions
- Testing Library matchers via `@testing-library/jest-dom/vitest` (imported globally in test files)
- React Testing Library for component testing

**Run Commands:**
```bash
npm test                 # Run all tests
npm run test:ui         # Vitest UI mode
npm run lint            # ESLint check
# No coverage command configured in package.json
```

## Test File Organization

**Location:**
- Co-located with source files using `.test.ts` / `.test.tsx` suffix
- Found in: `src/App.test.tsx`, `src/graph/validate.test.ts`, `src/graph/TaskNode.test.tsx`, `src/persistence/serialize.test.ts`, `src/persistence/autosave.test.ts`, `src/cpm/compute.test.ts`, `src/cpm/workdays.test.ts`

**Naming:**
- Pattern: `{filename}.test.ts` or `{filename}.test.tsx`
- Test IDs in describe/it blocks reference requirements: `(TEST-01)`, `(TEST-02)`, `(ERR-02)`, `(BUG-01)`, `(UI-CRIT-02)`, `(SNAP-01)`

**Structure:**
```
test-file/
├── imports (@testing-library imports, vitest, src)
├── test fixtures/helpers (factory functions)
└── describe blocks (one per exported function/component)
    └── it blocks (one per behavior)
```

## Test Structure

**Suite Organization:**

```typescript
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('functionName (REQUIREMENT-ID)', () => {
  beforeEach(() => {
    // Setup (e.g., localStorage.clear())
  })

  it('should return X when Y', () => {
    // Arrange
    const input = ...
    // Act
    const result = functionName(input)
    // Assert
    expect(result).toEqual(...)
  })
})
```

**Patterns:**

1. **Import pattern — Test imports at top:**
   ```typescript
   import '@testing-library/jest-dom/vitest'  // Global matchers
   import { render, screen } from '@testing-library/react'
   import { vi } from 'vitest'
   import { ComponentUnderTest } from './ComponentUnderTest'
   ```

2. **Setup/Teardown:**
   ```typescript
   beforeEach(() => localStorage.clear())
   // Or: vi.spyOn(...).mockImplementationOnce(...)
   // Cleanup: vi.restoreAllMocks() at end of test
   ```

3. **Assertion pattern:**
   ```typescript
   expect(value).toBe(expected)         // Exact match
   expect(value).toEqual(expected)      // Deep equality
   expect(value).toMatch(/regex/)       // String regex
   expect(fn).toThrow(Error)            // Exception throwing
   expect(fn).toHrowError(/message/)    // Exception with message check
   expect(element).toBeInTheDocument()  // DOM matchers
   expect(element).toHaveProperty('key')  // Object/array property check
   ```

## Mocking

**Framework:** Vitest `vi` object

**Patterns:**

```typescript
// Mock a module
vi.mock('reactflow', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

// Spy and override method
vi.spyOn(Storage.prototype, 'setItem')
  .mockImplementationOnce(() => { throw quotaError })

// Create mock function
const onEdit = vi.fn()

// Restore mocks
vi.restoreAllMocks()
```

**What to Mock:**
- DOM-unavailable third-party components: `reactflow` Handle, Position (jsdom doesn't support React Flow's native features)
- Browser APIs like Storage when testing error cases
- Event handlers passed as props: `onEdit()`, `onChangeStartDate()`

**What NOT to Mock:**
- Standard library functions unless testing error paths
- Application logic — test real computation functions
- DOM query/manipulation — use real React Testing Library queries
- Date operations — test with real `Date` objects

## Fixtures and Factories

**Test Data:**

```typescript
// Factory helpers in test files
function makeNode(id: string, type: string): Node {
  return { id, type, position: { x: 0, y: 0 }, data: {} }
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target }
}

function taskNode(id: string, title: string, duration: number): Node<TaskNodeData> {
  return {
    id,
    type: 'task',
    position: { x: 10, y: 20 },
    data: { type: 'task', id, title, duration, onEdit: () => {} },
  }
}

// Shared minimal test data
const minimalProject: ProjectJSON = {
  settings: { version: '1.0' },
  nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
  edges: [],
}
```

**Location:**
- Defined at top of test file after imports
- Kept minimal to focus tests on what varies

**Naming:**
- Factory functions named `make*` or `*Node()` pattern
- Test data constants like `minimalProject`

## Coverage

**Requirements:** Not enforced (no coverage threshold in config)

**View Coverage:**
```bash
# No coverage command in package.json
# Would need to add: npm test -- --coverage
```

**Current Test Coverage:**

Tested modules (by frequency of test files):
- CPM computation: `compute.test.ts` (6 test suites, 15+ assertions)
- Workday calculations: `workdays.test.ts` (4 test suites, 7+ tests)
- Serialization: `serialize.test.ts` (3 test suites, 15+ tests)
- Autosave/persistence: `autosave.test.ts` (6 test suites, 13+ tests)
- Graph validation: `validate.test.ts` (1 test suite, 5 tests)
- Task node component: `TaskNode.test.tsx` (1 test suite, 5 tests)
- App component: `App.test.tsx` (1 test suite, 1 test)

Untested areas (no test files):
- `StartNode.tsx`, `EndNode.tsx` (React components)
- `GraphCanvas.tsx` and other UI components in `components/`
- `AppToolbar.tsx`, `ContextMenu.tsx`, `Modal.tsx`, `Banner.tsx`, `HelpOverlay.tsx`
- Build metadata: `buildStamp.ts`

## Test Types

**Unit Tests:**
- Scope: Single function or component in isolation
- Approach: Pure logic functions (compute.ts, validate.ts, workdays.ts) tested with various inputs
- Example: `computeCPM()` with different graph configurations in `compute.test.ts`
- Libraries used: Direct assertions on return values, no DOM interaction

**Integration Tests:**
- Scope: Multiple modules working together (serialization round-trip, storage persistence)
- Approach: Test serialize + deserialize cycle, storage save + load
- Example: `serialize.test.ts` round-trip tests converting React Flow nodes to ProjectJSON and back
- Libraries used: TypeScript type guards for data validation

**Component Tests:**
- Scope: React components rendered and user interactions
- Approach: `render()` from Testing Library, query elements, assert properties
- Example: `TaskNode.test.tsx` renders component and checks style properties
- Libraries used: React Testing Library, vitest mocks for external components
- Test IDs used: Components found via `screen.getByDisplayValue()`, `screen.getByTestId('rf__wrapper')`

**E2E Tests:**
- Framework: Playwright (`@playwright/test` in devDependencies)
- Command: `npm run e2e`
- Location: Not found in codebase yet (config exists but no test files)

## Common Patterns

**Async Testing:**

Not heavily used in current tests — most functions are synchronous. When needed:

```typescript
// Standard async function
async function loadData() { ... }

// Test pattern (if async)
it('loads data', async () => {
  const data = await loadData()
  expect(data).toBeDefined()
})
```

**Error Testing:**

```typescript
// Pattern 1: Function throws custom error
it('throws ComputeError with code ORPHAN on orphaned node', () => {
  let thrown: ComputeError | undefined
  try { computeCPM(invalidPlan) } catch (e) { thrown = e as ComputeError }
  expect(thrown).toBeInstanceOf(ComputeError)
  expect(thrown?.code).toBe('ORPHAN')
})

// Pattern 2: Function throws on bad input (shorthand)
it('erkennt Zyklen und Start/End-Regeln', () => {
  expect(() => computeCPM(badPlan)).toThrowError(/Start hat Eingänge/i)
})

// Pattern 3: Function returns error object (non-throwing)
it('returns { ok: false, error: "message" } on storage failure', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
    throw new DOMException('QuotaExceeded')
  })
  const result = saveCurrent(project)
  expect(result.ok).toBe(false)
  expect(result.error).toBe('expected message')
  vi.restoreAllMocks()
})
```

**Mocking Event Handlers:**

```typescript
// In test data factory
function makeData(critical?: boolean) {
  return {
    id: 'test-node-1',
    title: 'Test Task',
    duration: 3,
    computed: critical !== undefined ? { ... } : undefined,
    onEdit: vi.fn(),  // Mock callback
  }
}

// In component test
it('renders without crashing', () => {
  render(<TaskNode data={makeData()} />)
  // Component calls onEdit internally after debounce
  // No assertion on onEdit (side effect not tested)
})
```

**Type Guard Testing:**

```typescript
it('returns true for valid ProjectJSON', () => {
  const valid: ProjectJSON = {
    settings: { version: '1.0' },
    nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
    edges: [],
  }
  expect(isProjectJSON(valid)).toBe(true)
})

it('returns false for invalid input', () => {
  expect(isProjectJSON(null)).toBe(false)
  expect(isProjectJSON({ nodes: [] })).toBe(false)  // missing edges
})
```

**Vitest Setup and Global State:**

```typescript
// vitest.setup.ts provides polyfills
;(globalThis as any).ResizeObserver =
  (globalThis as any).ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

// Tests can use global objects
describe('test', () => {
  beforeEach(() => localStorage.clear())
  // localStorage available in jsdom environment
})
```

## Test Requirements & IDs

Tests are tagged with requirement IDs in describe blocks:

| ID | Area | File |
|----|----|------|
| TEST-01 | Serialization round-trip | `serialize.test.ts` |
| TEST-02 | Graph validation | `validate.test.ts` |
| TEST-03 | Workday arithmetic | `workdays.test.ts` |
| TEST-04 | CPM edge cases | `compute.test.ts` |
| ERR-02 | Storage error handling | `autosave.test.ts` |
| ERR-03 | NaN date handling | `workdays.test.ts` |
| BUG-01 | Snapshot ID uniqueness | `autosave.test.ts` |
| BUG-02 | Snapshot ID generation | `autosave.test.ts` |
| SNAP-01 | Snapshot naming | `autosave.test.ts` |
| TYPES-01 | Type guard validation | `serialize.test.ts` |
| UI-CRIT-02 | TaskNode critical path styling | `TaskNode.test.tsx` |
| UI-POLISH-01 | Date formatting | `workdays.test.ts` |

These IDs link to implementation plans and requirements documentation.

---

*Testing analysis: 2026-03-17*
