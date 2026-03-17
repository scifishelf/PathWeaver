# Codebase Structure

**Analysis Date:** 2026-03-17

## Directory Layout

```
pathweaver/
├── web/                               # Browser application (React + Vite)
│   ├── src/
│   │   ├── cpm/                       # Critical Path Method algorithm
│   │   │   ├── compute.ts             # CPM forward/backward pass engine
│   │   │   ├── compute.test.ts        # CPM algorithm tests
│   │   │   ├── types.ts               # Core data types (ProjectJSON, ComputedNode, etc.)
│   │   │   ├── workdays.ts            # Date arithmetic (skip weekends)
│   │   │   └── workdays.test.ts       # Date calculation tests
│   │   ├── graph/                     # Node components & design system
│   │   │   ├── StartNode.tsx          # Project start date node (green)
│   │   │   ├── TaskNode.tsx           # Task/activity node (editable title/duration)
│   │   │   ├── TaskNode.test.tsx      # TaskNode component tests
│   │   │   ├── EndNode.tsx            # Project end/goal node (purple)
│   │   │   ├── theme.ts               # Design tokens (colors, shadows, transitions)
│   │   │   ├── validate.ts            # Graph validation (cycles, orphans, structure)
│   │   │   └── validate.test.ts       # Validation tests
│   │   ├── components/                # UI components
│   │   │   ├── GraphCanvas.tsx        # Main ReactFlow canvas wrapper & orchestrator
│   │   │   ├── AppToolbar.tsx         # Export/Import/Snapshots toolbar
│   │   │   ├── HelpOverlay.tsx        # Help modal content & keyboard shortcuts
│   │   │   ├── Modal.tsx              # Reusable modal wrapper
│   │   │   ├── ContextMenu.tsx        # Right-click delete menu
│   │   │   ├── Button.tsx             # Styled button component
│   │   │   ├── Banner.tsx             # Informational/error banner
│   │   │   └── TopRightDebug.tsx      # Debug panel (dev only)
│   │   ├── persistence/               # LocalStorage & import/export
│   │   │   ├── autosave.ts            # saveCurrent/loadCurrent, snapshots
│   │   │   ├── autosave.test.ts       # Autosave tests
│   │   │   ├── serialize.ts           # ProjectJSON ↔ ReactFlow conversion
│   │   │   └── serialize.test.ts      # Serialization tests
│   │   ├── assets/                    # Static images (favicon, etc.)
│   │   ├── App.tsx                    # Root component (header + canvas + help)
│   │   ├── App.test.tsx               # Root app tests
│   │   ├── App.css                    # Global/app-level styles (minimal)
│   │   ├── index.css                  # Tailwind imports & global CSS
│   │   ├── buildStamp.ts              # Build metadata (git hash, timestamp)
│   │   └── main.tsx                   # React entrypoint (createRoot)
│   ├── dist/                          # Production build output (gitignored in dev)
│   ├── public/                        # Static assets (favicon.svg)
│   ├── index.html                     # HTML template entry point
│   ├── vite.config.ts                 # Vite build & test config
│   ├── vitest.setup.ts                # Vitest globals setup (jsdom, Testing Library)
│   ├── tsconfig.json                  # TypeScript project references
│   ├── tsconfig.app.json              # App TypeScript config (strict)
│   ├── tsconfig.node.json             # Build tool TypeScript config
│   ├── eslint.config.js               # ESLint rules (prettier integration)
│   ├── package.json                   # Dependencies (React 19, ReactFlow, Vite, etc.)
│   └── package-lock.json              # Lockfile
├── docs/
│   ├── json-format.md                 # ProjectJSON schema documentation
│   ├── json-schema.v1.json            # JSON Schema validator (v1.0)
│   ├── testdaten/                     # Example project files
│   │   ├── doenerladen-tagesablauf.json
│   │   └── mars-kolonisierung.json
│   └── image.png                      # Screenshot for README
├── .planning/
│   └── codebase/                      # GSD codebase analysis docs (you are here)
├── .github/
│   └── workflows/                     # CI/CD pipelines (deploy to Hetzner)
├── prds/                              # Product requirement documents
├── .claude/                           # Claude work context
├── README.md                          # Main project overview
├── CONTRIBUTING.md                    # Development guidelines
├── CHANGELOG.md                       # Version history
└── .gitignore                         # Git ignores (dist, node_modules, etc.)
```

## Directory Purposes

**`web/src/cpm/`:**
- Purpose: Pure algorithm layer — computes ES/EF/LS/LF, identifies critical path, validates graph rules
- Contains: TypeScript modules (no React dependencies)
- Key files: `compute.ts` (main engine), `types.ts` (ProjectJSON, ComputedResult), `workdays.ts` (date math)
- Independently testable; can be extracted to separate package

**`web/src/graph/`:**
- Purpose: ReactFlow node components + design system
- Contains: StartNode, TaskNode, EndNode components; validation logic; color/shadow tokens
- Key files: `theme.ts` (single source of truth for visual design), `validate.ts` (graph rules), `TaskNode.tsx` (main editable node)
- Theme tokens referenced by all components for consistent glassmorphism styling

**`web/src/components/`:**
- Purpose: Application UI layer — interaction handlers, modals, toolbars
- Contains: GraphCanvas (orchestrator), AppToolbar (export/import/snapshots), HelpOverlay, Modal, Button, ContextMenu
- Key files: `GraphCanvas.tsx` (state machine + ReactFlow setup), `AppToolbar.tsx` (file I/O + snapshots)
- No business logic; purely presentation + event handling

**`web/src/persistence/`:**
- Purpose: LocalStorage operations + project format conversion
- Contains: Autosave (saveCurrent/loadCurrent/snapshots), serialization (ProjectJSON ↔ ReactFlow)
- Key files: `autosave.ts` (storage), `serialize.ts` (format conversion)
- Handles schema versioning and validation errors

**`web/src/assets/`:**
- Purpose: Static media (icons, images)
- Contains: SVG/PNG files used by components
- Currently minimal; favicon in `/public/`

**`docs/`:**
- Purpose: Documentation for users and developers
- Contains: JSON schema docs, example project files, screenshots
- Key files: `json-format.md` (specification), `json-schema.v1.json` (formal validator)

## Key File Locations

**Entry Points:**
- `web/index.html`: HTML template; loads `/src/main.tsx`
- `web/src/main.tsx`: React entrypoint; calls createRoot on #root, renders App
- `web/src/App.tsx`: Root component; renders header + GraphCanvas + HelpOverlay

**Configuration:**
- `web/vite.config.ts`: Vite build settings (React plugin, test config)
- `web/tsconfig.app.json`: TypeScript compiler options (ES2022, strict mode, jsx: react-jsx)
- `web/eslint.config.js`: ESLint config with Prettier integration
- `web/package.json`: Project metadata, scripts, dependencies

**Core Logic:**
- `web/src/cpm/compute.ts`: Topological sort, forward/backward pass, critical path
- `web/src/cpm/types.ts`: ProjectJSON, ComputedResult, error types
- `web/src/graph/validate.ts`: Graph structural validation (cycles, orphans, reachability)

**Testing:**
- `web/vitest.setup.ts`: Vitest globals (jsdom environment, Testing Library cleanup)
- `web/src/**/*.test.ts(x)`: Unit tests co-located with source files

**Persistence:**
- `web/src/persistence/autosave.ts`: LocalStorage API (saveCurrent, saveSnapshot, listSnapshots)
- `web/src/persistence/serialize.ts`: toProjectJSON, fromProjectJSON, validateProjectJSON

## Naming Conventions

**Files:**
- React components: PascalCase (.tsx) — e.g., `StartNode.tsx`, `GraphCanvas.tsx`
- Utilities/modules: camelCase (.ts) — e.g., `compute.ts`, `validate.ts`, `workdays.ts`
- Tests: co-located with source, `.test.ts(x)` suffix — e.g., `compute.test.ts`, `TaskNode.test.tsx`
- Config files: camelCase or kebab-case — `vite.config.ts`, `tsconfig.app.json`, `eslint.config.js`

**Directories:**
- Feature modules: lowercase plural (cpm, graph, components, persistence)
- Except `src/` itself and `dist/` (build output)

**Functions:**
- React components: PascalCase — `StartNode`, `AppToolbar`, `GraphCanvas`
- Utilities: camelCase — `computeCPM`, `validateGraph`, `formatWorkdayToDate`
- Event handlers: camelCase with `on` prefix — `onConnect`, `onEditTask`, `onExportClick`
- Boolean predicates: camelCase with `is`/`has` prefix — `isValidISODate`, `isCritical`

**Variables:**
- Constants: UPPER_SNAKE_CASE for design tokens — `COLOR_ACCENT`, `RADIUS_MD`, `SHADOW_SM`
- Local/state: camelCase — `nodes`, `setEdges`, `errors`, `quotaError`

**Types:**
- PascalCase — `ProjectJSON`, `ComputedResult`, `AppNodeData`, `TaskNodeData`
- Union types suffixed with union intent — `AppNodeData` (discriminated by type field)
- Error classes: PascalCase — `ComputeError`

## Where to Add New Code

**New Feature (e.g., dependency markers, milestone highlighting):**
- Core logic: Add to `src/cpm/` (e.g., new function in `compute.ts`, export in `types.ts`)
- UI component: Add to `src/graph/` if node-related, or `src/components/` if toolbar/modal
- Tests: Co-locate with implementation (`newFeature.test.ts`)
- Example: Adding "milestone" node type would add StartMilestoneNode.tsx in graph/, update types in cpm/types.ts, add test

**New Component/Module:**
- Implementation: Create in appropriate directory (components/ for UI, cpm/ for algorithm, persistence/ for storage)
- Naming: Use PascalCase for React components, camelCase for utilities
- Pattern: Export named export + inline JSDoc comments for prop/return types
- Tests: Create `ComponentName.test.tsx` in same directory immediately after implementation

**Utilities & Helpers:**
- Shared calculation logic: `src/cpm/` (algorithm-related) or new utility file in relevant module
- UI utilities: Define inline in component file or create `src/components/utils.ts`
- Example: Date formatting lives in `workdays.ts` because it's calculation-focused

## Special Directories

**`web/dist/`:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)
- Contents: Minified JS, CSS, and HTML for deployment

**`web/public/`:**
- Purpose: Static assets served as-is (favicon, etc.)
- Generated: No
- Committed: Yes
- Contents: favicon.svg (custom network diagram icon)

**`.planning/codebase/`:**
- Purpose: GSD analysis documents (this file and siblings)
- Generated: Yes (by GSD mapper)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

**`node_modules/`:**
- Purpose: Installed npm packages
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)
- Install: Run `npm install` in web/ directory

## Import Patterns

**Internal imports:**
- Prefer relative imports for co-located modules: `import { computeCPM } from '../cpm/compute'`
- Use absolute paths from `src/` root for cross-module: Not used (codebase uses relative imports)
- No path aliases (tsconfig doesn't define them)

**External imports:**
- React: `import { useState, useCallback } from 'react'`
- ReactFlow: `import { useNodesState, useEdgesState, addEdge } from 'reactflow'`
- date-fns: `import { addDays } from 'date-fns'`
- Icons: `import { HelpCircle, Download, Calendar } from 'lucide-react'`
- Utilities: `import { toPng } from 'html-to-image'`

---

*Structure analysis: 2026-03-17*
