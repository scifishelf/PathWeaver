# Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

**Files:**
- PascalCase for React components: `TaskNode.tsx`, `StartNode.tsx`, `EndNode.tsx`, `HelpOverlay.tsx`
- camelCase for utilities and modules: `validate.ts`, `serialize.ts`, `autosave.ts`, `workdays.ts`, `compute.ts`
- Lowercase with hyphens for test files: `*.test.ts`, `*.test.tsx`
- Theme/constant files use camelCase: `theme.ts`, `types.ts`, `buildStamp.ts`

**Functions:**
- camelCase for all functions: `validateGraph()`, `computeCPM()`, `toProjectJSON()`, `fromProjectJSON()`, `saveCurrent()`, `formatWorkdayToDate()`
- Factory/helper functions follow the pattern `make*` or `*Node()`: `makeNode()`, `makeEdge()`, `makeData()`, `taskNode()`, `startNode()`, `endNode()`
- Prefix getters with `load` or `get`: `loadCurrent()`, `loadSnapshot()`, `listSnapshots()`
- Prefix setters with `save`: `saveCurrent()`, `saveSnapshot()`, `deleteSnapshot()`

**Variables:**
- camelCase for all variables: `titleInputRef`, `idRef`, `minimalProject`, `computedNode`, `criticalPath`
- Const MAP-like structures use camelCase: `incoming`, `outgoing`, `adj`, `reachable`, `predecessors`, `nodeType`
- State hooks follow pattern: `const [title, setTitle]`, `const [duration, setDuration]`, `const [helpOpen, setHelpOpen]`
- Event handlers use `on*` prefix: `onEdit`, `onChangeStartDate`, `onChange`, `onFocus`, `onBlur`, `onWheel`, `onMouseEnter`, `onMouseLeave`
- Queue/list variables use short names: `q`, `qq` (for BFS/DFS queues), `list`, `snap`, `order`

**Types:**
- PascalCase for all interfaces and types: `ProjectJSON`, `TaskNodeData`, `StartNodeData`, `EndNodeData`, `AppNodeData`, `ComputedNode`, `ProjectSettings`, `Edge`, `TaskNode`, `SaveResult`, `SnapshotEntry`
- Union types as `Type | Type`: `'task' | 'start' | 'end'` for node types, discriminated union pattern used for `AppNodeData`
- Type aliases for IDs: `NodeId` (string), `Workday` (number)
- Error codes as `SCREAMING_SNAKE_CASE`: `'MISSING_START_END'`, `'CYCLE'`, `'ORPHAN'`, `'INVALID_DURATION'`

**Constants:**
- SCREAMING_SNAKE_CASE for module-level constants: `CURRENT_KEY`, `SNAPSHOTS_KEY`, `MAX_SNAPSHOTS`, `COLOR_BG`, `COLOR_ACCENT`, `RADIUS_SM`
- Design token colors use SCREAMING_SNAKE_CASE with `COLOR_` prefix: `COLOR_BG`, `COLOR_SURFACE`, `COLOR_BORDER`, `COLOR_TEXT`, `COLOR_ACCENT`
- Dimensions use SCREAMING_SNAKE_CASE with `RADIUS_` prefix: `RADIUS_SM`, `RADIUS_MD`

## Code Style

**Formatting:**
- ESLint with TypeScript plugin (configured in `/Users/ansgar.simon/Desktop/coding/PathWeaver/web/eslint.config.js`)
- Prettier for code formatting (dev dependency, no separate `.prettierrc` file — uses ESLint config)
- 2-space indentation (implied by React ecosystem defaults)
- Semicolons required (TypeScript strict mode enforced)
- Single quotes for strings (default JavaScript preference)

**Linting:**
- Config: `eslint.config.js` using flat config format
- Extends: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- React 19 with hooks linting enabled (`react-hooks.configs['recommended-latest']`)
- No manual `.prettierrc` — formatting handled by ESLint + prettier integration via `eslint-config-prettier`

**TypeScript Strict Mode:**
- `strict: true` enabled in `tsconfig.app.json`
- `noUnusedLocals: true` — all variables must be used
- `noUnusedParameters: true` — all parameters must be used or prefixed with `_`
- `noFallthroughCasesInSwitch: true` — switch cases must have break/return
- `noUncheckedSideEffectImports: true` — explicit imports required

**Spacing:**
- Space around braces in object literals: `{ id, type }`
- No space before function parentheses in declarations: `function validateGraph(...)`
- Space before block statement braces: `if (...) {` not `if (...){`

## Import Organization

**Order:**
1. React and core libraries: `import { useState } from 'react'`
2. Third-party packages: `import { Handle, Position } from 'reactflow'`, `import { HelpCircle } from 'lucide-react'`
3. Type imports (separated with `type`): `import type { Node, Edge } from 'reactflow'`, `import type { ProjectJSON } from '../cpm/types'`
4. Local relative imports: `import { GraphCanvas } from './components/GraphCanvas'`
5. CSS/styles last: `import './index.css'`

**Type Imports:**
- Always use explicit `import type { ... } from ...` for type-only imports
- Separate from runtime imports: `import { computeCPM } from './compute'` then `import type { ProjectJSON } from './types'`
- Avoid type-safe casting by using discriminated unions instead

**Path Aliases:**
- No path aliases configured — all imports use relative paths: `'../cpm/types'`, `'./validate'`, `'@testing-library/react'`
- Directories are organized by feature/domain, not by type (no `utils/`, `types/`, `services/` separation across projects)

**Barrel Files:**
- No barrel (index) files found in codebase
- Direct imports preferred: `import { TaskNode } from './TaskNode'` not `import { TaskNode } from './graph'`

## Error Handling

**Patterns:**
- Custom error class: `ComputeError extends Error` with typed `code` property in `/Users/ansgar.simon/Desktop/coding/PathWeaver/web/src/cpm/types.ts`
- Error codes are TypeScript union types: `type ComputeErrorCode = 'CYCLE' | 'ORPHAN' | ...`
- Explicit error throwing: `throw new ComputeError('ORPHAN', 'Knoten ${id} ist nicht mit Start verbunden')`
- Storage operations use try-catch with sentinel values: `saveCurrent()` returns `{ ok: boolean, error?: string }` not throwing
- On LocalStorage quota exceeded, detect via `e instanceof DOMException && e.name === 'QuotaExceededError'`
- Console error logging on catch: `catch (e) { console.error(e); return undefined }`
- No error boundary components (UI errors not explicitly caught in components, rely on error throwing propagation)

**Expected Errors:**
- Graph validation errors return array of strings: `validateGraph(): string[]`
- Computation errors throw `ComputeError` with code: Allows caller to differentiate between CYCLE, ORPHAN, INVALID_DURATION
- Storage errors caught and returned as result objects: `saveCurrent()` never throws, clients check `result.ok`

## Logging

**Framework:** Console API (no structured logging library)

**Patterns:**
- Error logging: `console.error(e)` in catch blocks in `/Users/ansgar.simon/Desktop/coding/PathWeaver/web/src/persistence/autosave.ts`
- No debug/info/warn logging in production source code
- No logging middleware or interceptors
- Vitest setup imports testing-library jest-dom matchers globally

## Comments

**When to Comment:**
- Algorithm explanations for complex operations: `// Kahn` for topological sort, `// Reachability from start` for BFS
- Rule/constraint documentation: `// Start darf keine Eingänge, Ziel keine Ausgänge` (in German)
- Workarounds and edge cases: `// Debounce 200ms` in TaskNode, `// Polyfill für React Flow im JSDOM-Umfeld` in vitest.setup.ts
- Test IDs/requirements: `(TEST-02)`, `(ERR-02)`, `(BUG-01)` markers in describe/it blocks
- Implementation notes in tests: `// GraphCanvas guard prevents this from reaching addWorkdays in production (Plan 01-06)`

**JSDoc/TSDoc:**
- No explicit JSDoc comments found in codebase
- TypeScript interfaces document structure instead: `interface TaskNodeData { type: 'task'; ... }`
- Function signatures are self-documenting via type annotations
- Comments use natural language (German and English mix) for implementation details, not JSDoc syntax

**Comment Style:**
- Single-line `//` for most comments
- Inline comments on same line as code when explaining specific values
- Section separators using `// ──────` pattern in some files (e.g., `serialize.ts`)

## Function Design

**Size:**
- Most functions are 10-50 lines
- Complex functions like `computeCPM()` grow to 100+ lines but organized into sub-functions: `topoSort()`, `buildAdjacency()`
- Test helper functions are 5-20 lines
- React components may be longer due to JSX (TaskNode is ~200 lines with styles)

**Parameters:**
- Prefer single object parameter for multiple related values: `function toProjectJSON(nodes, edges, computed?, startDate?)`
- Use destructuring in function signature when available: `function TaskNodeBase({ data }: { data: TaskData })`
- Callbacks passed as data properties on objects: `onEdit?: (id: string, patch: Partial<...>) => void`

**Return Values:**
- Explicit return types required by TypeScript strict mode
- Functions returning arrays: `validateGraph(): string[]`
- Functions returning objects: `fromProjectJSON(): { nodes: Node<AppNodeData>[]; edges: Edge[] }`
- Functions returning union types for results: `SaveResult` with discriminated object `{ ok: boolean; error?: string }`
- Query functions return `undefined` on error: `loadCurrent(): { ts: number; project: ProjectJSON } | undefined`
- Void functions for side-effects: `deleteSnapshot(id: string): void`

## Module Design

**Exports:**
- Named exports for utilities: `export function validateGraph(...)`
- Default exports for React components: `export default function App()` or `export const TaskNode = memo(TaskNodeBase)`
- Type exports via `export type`: `export type AppNodeData = TaskNodeData | StartNodeData | EndNodeData`
- Interface exports: `export interface ProjectJSON { ... }`

**Barrel Files:**
- Not used in this codebase
- Every file exports explicitly what it provides, no re-exports

**Module Scope:**
- Each domain has its own directory: `cpm/`, `graph/`, `components/`, `persistence/`
- No cross-cutting utilities — feature-specific helpers live in the feature directory
- Theme tokens centralized in `graph/theme.ts` (used by graph components)
- Type definitions co-located with feature: `cpm/types.ts`, not separate `types/` directory

## Code Organization

**Patterns Observed:**
- React component functions prefixed with `Base` when wrapped with `memo`: `TaskNodeBase` wrapped as `export const TaskNode = memo(TaskNodeBase)`
- Test helper builders follow factory pattern: `taskNode()`, `startNode()`, `endNode()` creating properly typed Node objects
- Algorithm implementations in separate named functions: `topoSort()`, `buildAdjacency()` extracted from `computeCPM()`
- Inline styles used for React components (no CSS modules or Tailwind at component level, though TailwindCSS installed for future use)

---

*Convention analysis: 2026-03-17*
