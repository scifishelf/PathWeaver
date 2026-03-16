# Coding Conventions

**Analysis Date:** 2026-03-16

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `Button.tsx`, `GraphCanvas.tsx`, `StartNode.tsx`)
- Utility/function files: camelCase (e.g., `compute.ts`, `serialize.ts`, `workdays.ts`)
- Type definition files: camelCase (e.g., `types.ts`)
- Test files: Same name as source with `.test` suffix (e.g., `compute.test.ts`, `App.test.tsx`)

**Functions:**
- camelCase for all function names: `computeCPM()`, `validateGraph()`, `formatDateShort()`, `buildAdjacency()`
- Callback handlers use `on` prefix: `onConnect()`, `onEditTask()`, `onNodeContextMenu()`, `onClose()`
- Internal utility functions use camelCase: `topoSort()`, `getNextTaskId()`, `isWeekend()`
- Helper functions with clear purpose: `addWorkdays()`, `nextWorkday()`, `formatWorkdayToDate()`

**Variables:**
- camelCase: `idRef`, `nodes`, `edges`, `errors`, `incoming`, `outgoing`, `reachable`
- Constants: UPPER_SNAKE_CASE (e.g., `CRITICAL_BG`, `CURRENT_KEY`, `MAX_SNAPSHOTS`)
- React state variables: camelCase (e.g., `value`, `menu`, `helpOpen`)
- Map/Set variables match structure: `incoming`, `outgoing`, `idToType`, `reach`
- Short variable names acceptable in algorithms: `n` (node), `e` (edge), `d` (duration), `q` (queue), `adj` (adjacency)

**Types:**
- Interface names: PascalCase prefix (e.g., `ButtonProps`, `ModalProps`, `ProjectJSON`, `TaskNode`)
- Type aliases: PascalCase (e.g., `ButtonVariant`, `NodeId`, `Workday`, `ComputeErrorCode`)
- Generic type parameters: Single uppercase letters (e.g., `<T>`)

## Code Style

**Formatting:**
- ESLint with TypeScript plugin enforces style
- Assumes Prettier integration (dependencies include `prettier` v3.6.2)
- Line length appears to be around 120 characters (observed in code)
- No explicit prettier config file found; using defaults

**Linting:**
- ESLint with `@eslint/js` recommended config
- TypeScript ESLint plugin: `typescript-eslint` configs recommended
- React hooks plugin: `eslint-plugin-react-hooks` enforces hooks rules
- React refresh plugin: `eslint-plugin-react-refresh` for Vite fast refresh
- Config file: `eslint.config.js` (new flat config format)

**Strict Mode:**
- TypeScript strict mode enabled in `tsconfig.app.json`
- `noUnusedLocals` and `noUnusedParameters` enforced
- `noFallthroughCasesInSwitch` enabled
- `noUncheckedSideEffectImports` enabled

## Import Organization

**Order:**
1. External dependencies (React, libraries)
2. Type imports (marked with `type` keyword)
3. Internal module imports (relative paths)
4. CSS/style imports (last)

**Examples:**
```typescript
// App.tsx
import { useState } from 'react'
import type { ReactNode } from 'react'
import { GraphCanvas } from './components/GraphCanvas'
import { computeCPM } from './cpm/compute'
import 'reactflow/dist/style.css'

// Button.tsx
import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
```

**Path Aliases:**
- No path aliases configured; imports use relative paths
- Modular structure by directory: `./components/`, `./cpm/`, `./graph/`, `./persistence/`

## Error Handling

**Patterns:**
- Custom Error class for domain errors: `ComputeError` extends `Error`
  - Has `code` property for typed error codes
  - Constructor takes `code` and `message`
  - Example: `throw new ComputeError('CYCLE', 'Zyklus erkannt')`

- Validation functions return error arrays: `validateGraph()`, `validateProjectJSON()`
  - Returns `string[]` of error messages
  - Empty array = valid
  - Used for checking graph topology, project structure

- React components show errors in UI
  - GraphCanvas stores errors in state: `const [errors, setErrors] = useState<string[]>([])`
  - Validation happens on graph changes via `validate()` callback

- Try-catch for date operations: `formatWorkdayToDate()` catches exceptions
  - Returns fallback value on error: `'—'` (em dash)

## Logging

**Framework:** No explicit logging framework; code uses `console` implicitly

**Patterns:**
- No console.log statements observed in production code
- Debug info could be in `TopRightDebug.tsx` component
- Error reporting through exception throwing and validation returns

## Comments

**When to Comment:**
- Algorithm explanation: `// Kahn` (topological sort using Kahn's algorithm)
- Rule/constraint documentation: `// Guards: Start hat keine Eingänge, Ende keine Ausgänge, Task max. 1 Ausgang`
- Purpose of data structures: `// 0‑basiert ab Projektstart` (workday indexing)
- Commented-out code includes purpose: `// Hilfe temporär ausgeblendet`

**JSDoc/TSDoc:**
- Not heavily used in codebase
- Function signatures are self-documenting via TypeScript types
- Interface properties sometimes have brief comments

## Function Design

**Size:**
- Functions range from small (5-15 lines) to medium (30-50 lines)
- `computeCPM()` is largest at ~170 lines: complex algorithm with multiple passes
- `GraphCanvas()` component is ~220 lines: main UI orchestrator
- Preference for focused utility functions

**Parameters:**
- Destructuring used for object parameters: `({ variant = 'outline', className = '', ...props }, ref)`
- Callback handlers passed in props: `onChangeStartDate`, `onClose`, `onEditTask`
- Type annotations always present in functions
- Default values used for optional parameters: `variant = 'outline'`

**Return Values:**
- Explicit return types in function signatures
- Components return JSX.Element or ReactNode
- Utility functions return specific types: `string[]`, `Map<>`, `ComputedResult`, `Node[]`
- No implicit returns; all return statements explicit

## Module Design

**Exports:**
- Named exports for functions and components: `export function`, `export const`
- Only App uses default export: `export default function App()`
- Type exports use `export type` or `export interface`
- Barrel files not used; direct imports from modules

**Barrel Files:**
- No barrel files (index.ts) observed
- Imports are specific to module: `import { computeCPM } from '../cpm/compute'`

**Module Organization:**
- Clear separation by feature/layer:
  - `src/cpm/`: CPM algorithm and types
  - `src/graph/`: Graph nodes and validation
  - `src/components/`: React UI components
  - `src/persistence/`: Data serialization and storage
  - `src/types/`: Type definitions and augmentation

---

*Convention analysis: 2026-03-16*
