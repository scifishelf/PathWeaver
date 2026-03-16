# STRUCTURE.md — PathWeaver Directory Layout & Organization

> Generated: 2026-03-16

## Directory Layout

```
PathWeaver/
├── README.md                          # Project overview and quick start
├── .github/                           # GitHub configuration
├── .planning/
│   └── codebase/                      # Codebase documentation
├── docs/
│   ├── json-format.md                 # Data format specification
│   ├── json-schema.v1.json            # JSON schema definition
│   └── testdaten/
│       └── pathweaver_test.json       # Sample test data
├── prds/
│   ├── 00_mvp.md                      # MVP requirements document
│   └── 00_mvp_plan.md                 # MVP planning document
└── web/                               # Main application (React)
    ├── package.json
    ├── index.html                     # Entry HTML
    ├── vite.config.ts
    ├── vitest.setup.ts
    ├── eslint.config.js               # ESLint flat config
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
    ├── public/
    │   └── netzplan.png               # Reference network diagram image
    └── src/
        ├── main.tsx                   # App entry point (DOM mount)
        ├── App.tsx                    # Root component (layout wrapper)
        ├── App.test.tsx
        ├── App.css / index.css        # Styles (global + Tailwind)
        ├── buildStamp.ts              # Build timestamp utility
        ├── assets/                    # Static assets (SVGs)
        ├── types/
        │   └── dom-to-image-more.d.ts # Third-party type definitions
        ├── components/                # React UI components
        │   ├── GraphCanvas.tsx        # Main canvas orchestrator (378 lines)
        │   ├── AppToolbar.tsx         # Toolbar (export, import, snapshots) (237 lines)
        │   ├── Button.tsx             # Reusable button (26 lines)
        │   ├── Banner.tsx             # Info/error banner (11 lines)
        │   ├── Modal.tsx              # Modal dialog (37 lines)
        │   ├── ContextMenu.tsx        # Right-click menu (39 lines)
        │   ├── HelpOverlay.tsx        # Help/legend overlay (26 lines)
        │   └── TopRightDebug.tsx      # Debug info (38 lines)
        ├── graph/                     # ReactFlow node/edge components
        │   ├── StartNode.tsx          # Non-deletable start node
        │   ├── TaskNode.tsx           # Task node with inline editing (3×3 grid)
        │   ├── EndNode.tsx            # Non-deletable end node
        │   ├── theme.ts               # Node/edge styling & colors
        │   └── validate.ts            # Graph validation rules
        ├── cpm/                       # CPM business logic (UI-independent)
        │   ├── types.ts               # Domain types: ProjectJSON, ComputedResult, etc. (64 lines)
        │   ├── compute.ts             # CPM algorithm (topological sort, forward/backward pass) (174 lines)
        │   ├── compute.test.ts        # CPM unit tests (61 lines)
        │   └── workdays.ts            # Workday/date arithmetic (47 lines)
        └── persistence/               # Data storage layer
            ├── serialize.ts           # ReactFlow ↔ ProjectJSON serialization
            └── autosave.ts            # LocalStorage management, snapshots (max 10)
```

## Key File Locations

| Role | Path |
|------|------|
| App entry | `web/src/main.tsx` |
| Root component | `web/src/App.tsx` |
| Main canvas | `web/src/components/GraphCanvas.tsx` |
| CPM algorithm | `web/src/cpm/compute.ts` |
| Domain types | `web/src/cpm/types.ts` |
| Serialization | `web/src/persistence/serialize.ts` |
| LocalStorage/Snapshots | `web/src/persistence/autosave.ts` |
| Graph validation | `web/src/graph/validate.ts` |
| Node styling | `web/src/graph/theme.ts` |
| Vite config | `web/vite.config.ts` |
| TypeScript config | `web/tsconfig.app.json` |
| ESLint config | `web/eslint.config.js` |
| Test setup | `web/vitest.setup.ts` |

## Naming Conventions

### Files
- **React components:** PascalCase — `GraphCanvas.tsx`, `TaskNode.tsx`, `Button.tsx`
- **Utilities/modules:** camelCase — `compute.ts`, `serialize.ts`, `workdays.ts`
- **Tests:** `{name}.test.ts[x]` — `compute.test.ts`, `App.test.tsx`
- **Type definitions:** camelCase — `types.ts`
- **Third-party overrides:** `{lib}.d.ts` — `dom-to-image-more.d.ts`

### Functions & Variables
- **Functions:** camelCase — `computeCPM()`, `validateGraph()`, `toProjectJSON()`
- **Event handlers:** `on` prefix — `onConnect()`, `onEditTask()`, `onNodeContextMenu()`
- **State variables:** camelCase — `nodes`, `edges`, `errors`
- **Constants:** UPPER_SNAKE_CASE — `CRITICAL_BG`, `MAX_SNAPSHOTS`, `CURRENT_KEY`

### Types & Interfaces
- **Props interfaces:** PascalCase + `Props` suffix — `ButtonProps`, `ModalProps`
- **Domain types:** PascalCase — `ProjectJSON`, `ComputedResult`, `ComputeErrorCode`
- **Type aliases:** PascalCase — `NodeId`, `Workday`

## Layer Organization

The codebase is organized by technical layer, not by feature:

```
src/
├── components/   → Presentation (React UI)
├── graph/        → Graph visualization (ReactFlow nodes + validation)
├── cpm/          → Business logic (algorithm, types — no UI dependencies)
└── persistence/  → Data storage (serialization + LocalStorage)
```

**CPM is fully decoupled from UI** — `web/src/cpm/` has no React imports and can be unit-tested in isolation.

## NPM Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # tsc + vite build
npm run lint      # ESLint
npm run preview   # Preview production build
npm run test      # Vitest (unit tests)
npm run test:ui   # Vitest with UI
npm run e2e       # Playwright E2E tests
```

## Data Format

`ProjectJSON` (defined in `web/src/cpm/types.ts`):
```typescript
{
  settings: { version: '1.0', startDate?: string }
  nodes: TaskNode[]        // id, type, title?, duration?, x?, y?
  edges: Edge[]            // from, to
  computed?: ComputedResult // ES, EF, LS, LF, slack, critical path
}
```

Schema: `docs/json-schema.v1.json`
Documentation: `docs/json-format.md`
Test data: `docs/testdaten/pathweaver_test.json`
