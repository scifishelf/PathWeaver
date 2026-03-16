# Testing Patterns

**Analysis Date:** 2026-03-16

## Test Framework

**Runner:**
- Vitest 3.2.4
- Config: No separate vitest config file; using TypeScript config with `types: ["vitest/globals"]`
- ESM modules configured via `package.json` type: "module"

**Assertion Library:**
- `@testing-library/jest-dom` (v6.9.1) for DOM matchers
- Vitest built-in matchers (expect API compatible with Jest)

**Run Commands:**
```bash
npm run test              # Run all tests (vitest)
npm run test:ui          # Vitest UI for interactive debugging
npm run e2e              # Run E2E tests with Playwright
```

## Test File Organization

**Location:**
- Co-located with source files in same directory
- Pattern: `SourceFile.ts` → `SourceFile.test.ts`

**Naming:**
- `.test.ts` suffix for unit tests: `compute.test.ts`, `App.test.tsx`

**Structure:**
```
web/src/
├── cpm/
│   ├── compute.ts
│   ├── compute.test.ts      # CPM algorithm tests
│   ├── types.ts
│   └── workdays.ts
└── App.tsx
└── App.test.tsx              # Component tests
```

## Test Structure

**Suite Organization:**
```typescript
import '@testing-library/jest-dom/vitest'  // Register matchers
import { computeCPM } from './compute'
import type { ProjectJSON } from './types'

describe('computeCPM', () => {
  it('berechnet Beispiel aus PRD', () => {
    // Test setup
    const plan: ProjectJSON = { ... }

    // Execution
    const res = computeCPM(plan)

    // Assertion
    expect(res.criticalPath).toEqual(['start', 'A', 'C', 'end'])
    expect(res.project.durationAT).toBe(7)
  })
})
```

**Patterns:**
- Setup: Create test data objects directly (no factories)
- Execution: Call function with test data
- Assertion: Use expect() with specific matchers
- No setup/teardown hooks observed; each test is self-contained

## Mocking

**Framework:**
- Uses `@testing-library/react` for component mocking
- No explicit mock libraries (Jest mocks, MSW) detected
- Vitest has built-in mock support available but not currently used

**Patterns:**
- Component rendering: `render(<App />`
- Screen queries for assertions: `screen.getByText()`, `screen.getByTestId()`
- No mocking of internal dependencies observed

```typescript
// App.test.tsx
import { render, screen } from '@testing-library/react'
import App from './App'

render(<App />)
expect(screen.getByText(/Netzplan/i)).toBeInTheDocument()
expect(screen.getByTestId('rf__wrapper')).toBeInTheDocument()
```

**What to Mock:**
- External libraries: ReactFlow components render naturally in tests
- DOM elements: Testing library handles this

**What NOT to Mock:**
- Business logic: CPM algorithm tested with real data structures
- Internal functions: Called directly with test inputs
- Data structures: Use actual data objects matching types

## Fixtures and Factories

**Test Data:**
- Inline test data objects (no factory pattern used)
- `ProjectJSON` test objects created with all required fields
- Example from `compute.test.ts`:

```typescript
const plan: ProjectJSON = {
  settings: {
    version: '1.0' as const,
    startDate: '2025-10-07',
    workweek: [1, 2, 3, 4, 5] as const
  },
  nodes: [
    { id: 'start', type: 'start' },
    { id: 'A', type: 'task', title: 'User Story A', duration: 5 },
    // ...
  ],
  edges: [
    { from: 'start', to: 'A' },
    // ...
  ],
}
```

**Location:**
- Test data defined at test start, not in separate fixtures directory
- Each test creates its own minimal data objects

## Coverage

**Requirements:** No enforced coverage thresholds detected

**View Coverage:**
- Command not configured; coverage likely available via `vitest --coverage` (Vitest feature)

**Current State:**
- 2 test files: `compute.test.ts`, `App.test.tsx`
- Core business logic (CPM algorithm) has basic test coverage
- Many utilities and components lack test coverage
- `workdays.ts`, `serialize.ts`, `validate.ts` untested

## Test Types

**Unit Tests:**
- Scope: Individual functions and algorithms
- Approach: Direct function calls with typed inputs, assertion on outputs
- Example: `computeCPM()` tested with various graph topologies
- Example: Component rendering tested with mocked React Flow

```typescript
// Algorithm unit test
it('berechnet Beispiel aus PRD', () => {
  const plan: ProjectJSON = { ... }
  const res = computeCPM(plan)
  expect(res.criticalPath).toEqual(['start', 'A', 'C', 'end'])
})

// Error case unit test
it('erkennt Zyklen (allgemein) und Start/End-Regeln', () => {
  const plan: ProjectJSON = { ... }
  expect(() => computeCPM(plan)).toThrowError(/Start hat Eingänge/i)
})
```

**Integration Tests:**
- Scope: Not currently present
- Potential areas: GraphCanvas with computeCPM, persistence with serialization
- E2E tests via Playwright handle high-level flows

**E2E Tests:**
- Framework: Playwright 1.56.0
- Run command: `npm run e2e`
- No test files found in glob patterns; likely in separate `e2e/` or `playwright/` directory

## Common Patterns

**Async Testing:**
- No async/await patterns in current test files
- React Testing Library handles async rendering naturally
- Vitest supports async test functions when needed

```typescript
// Pattern (if needed):
it('async operation', async () => {
  const result = await someAsyncFunction()
  expect(result).toBeDefined()
})
```

**Error Testing:**
- Exception testing with `toThrowError()`
- Matches error message with regex for human-readable errors (German):

```typescript
it('erkennt Zyklen', () => {
  const plan: ProjectJSON = { ... }
  expect(() => computeCPM(plan)).toThrowError(/Start hat Eingänge/i)
})
```

- Alternative: Custom error class properties

```typescript
// Potential pattern for error codes:
try {
  computeCPM(badPlan)
} catch (e) {
  if (e instanceof ComputeError && e.code === 'CYCLE') {
    // Handle specific error
  }
}
```

**Setup & Execution:**
- Before each test: No setup hooks; data created in test
- During test: Function call or component render
- After test: Automatic cleanup from React Testing Library

---

*Testing analysis: 2026-03-16*
