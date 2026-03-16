# Architecture

**Analysis Date:** 2026-03-16

## Pattern Overview

**Overall:** Layered React Application with Graph-Based Project Planning

**Key Characteristics:**
- Single-page application (SPA) with interactive graph visualization
- Three-tier architecture: UI layer, business logic layer, data persistence layer
- Declarative state management through React hooks and event callbacks
- Graph validation and Critical Path Method (CPM) computation decoupled from UI
- Browser-based persistence using localStorage with snapshot management

## Layers

**UI/Presentation Layer:**
- Purpose: Render interactive elements and handle user input
- Location: `src/components/` and `src/graph/`
- Contains: React components for the canvas, toolbar, nodes, overlays, and context menus
- Depends on: ReactFlow (graph visualization library), React hooks, Tailwind CSS for styling
- Used by: Browser/end user interactions

**Business Logic Layer:**
- Purpose: Execute algorithms and validate graph state
- Location: `src/cpm/` and `src/graph/validate.ts`
- Contains: Critical Path Method (CPM) computation, graph validation rules, workday calculations
- Depends on: TypeScript type definitions from `src/cpm/types.ts`
- Used by: GraphCanvas component during rendering and after state changes

**Data Serialization Layer:**
- Purpose: Convert between UI state (ReactFlow nodes/edges) and storage format
- Location: `src/persistence/serialize.ts`
- Contains: Bidirectional transformation functions (toProjectJSON, fromProjectJSON), validation of imported data
- Depends on: Type definitions from `src/cpm/types.ts`
- Used by: AppToolbar for import/export, GraphCanvas for state management

**Persistence Layer:**
- Purpose: Manage browser storage operations
- Location: `src/persistence/autosave.ts`
- Contains: localStorage management, snapshot lifecycle (create, list, load, delete), auto-save coordination
- Depends on: Serialization functions and ProjectJSON types
- Used by: GraphCanvas for auto-save on changes, AppToolbar for snapshot management

## Data Flow

**Graph Initialization:**

1. User loads app → GraphCanvas mounts
2. `useEffect` in GraphCanvas calls `loadCurrent()` to restore autosave
3. If no autosave exists, initial nodes (Start, End) are loaded
4. Graph state (nodes, edges) becomes the source of truth

**Graph Editing:**

1. User creates/modifies/deletes nodes or edges
2. ReactFlow's state hooks (`useNodesState`, `useEdgesState`) update local state
3. GraphCanvas detects change via `onNodesChange` or `onEdgesChange`
4. Immediate actions:
   - Validation runs via `validateGraph()` → highlights errors
   - Styling applied via `styledNodes` and `styledEdges` memos
5. Debounced action (300ms):
   - Serialize current state via `toProjectJSON()`
   - Save to localStorage via `saveCurrent()`

**Computation Flow (CPM):**

1. When nodes/edges change and no errors exist, `computeCPM()` is called
2. CPM algorithm:
   - Validates graph structure (no cycles, no orphans, proper connections)
   - Performs topological sort via Kahn's algorithm
   - Computes forward pass (ES, EF) from start node
   - Computes backward pass (LS, LF) from end node
   - Calculates slack times and identifies critical path
   - Converts workdays to ISO dates if startDate is set
3. Results stored in `cp` (ComputedResult)
4. UI uses computed data to:
   - Highlight critical nodes/edges in blue
   - Display task dates (ES, EF)
   - Show project end date and critical path

**State Management:**

- **Local component state:** Nodes, edges, menu position, errors, startDate (managed via ReactFlow hooks)
- **Ephemeral state:** Computed CPM results (memoized, recalculated on graph change)
- **Persistent state:** localStorage stores current project and up to 10 snapshots
- **No external state management:** No Redux, Zustand, or Jotai (despite zustand in dependencies)

## Key Abstractions

**ProjectJSON:**
- Purpose: Canonical data format for serialization/deserialization
- Examples: `src/cpm/types.ts` (TypeScript interface)
- Pattern: Plain objects with settings, nodes array, edges array; suitable for localStorage and JSON export

**ComputedResult:**
- Purpose: Encapsulates CPM algorithm output
- Examples: `src/cpm/types.ts`
- Pattern: Record of computed node data (ES, EF, LS, LF, slack, critical flag), critical path array, project metadata

**Node Types (ReactFlow):**
- Purpose: Distinguish between task nodes and special nodes (start, end)
- Examples: Custom React components at `src/graph/StartNode.tsx`, `src/graph/TaskNode.tsx`, `src/graph/EndNode.tsx`
- Pattern: Each type implements custom rendering via ReactFlow's NodeTypes map; start/end are non-deletable

**Validation Result:**
- Purpose: Accumulate and surface graph errors
- Examples: `src/graph/validate.ts`
- Pattern: Returns array of error strings; errors block CPM computation

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser load (HTML script tag)
- Responsibilities: Mount React app to DOM, render App component

**Root Component:**
- Location: `src/App.tsx`
- Triggers: Initial render after main.tsx
- Responsibilities: Layout wrapper (header, main content area), delegates graph rendering

**Graph Canvas (Main UI):**
- Location: `src/components/GraphCanvas.tsx`
- Triggers: Part of App hierarchy
- Responsibilities: Orchestrate entire graph editing experience (state management, event handling, validation, computation, rendering)

## Error Handling

**Strategy:** Graceful degradation with error display

**Patterns:**

- **Validation errors:** Caught immediately on graph change, displayed in red banner at top of canvas, prevent CPM computation
- **Serialization errors:** Wrapped in try-catch blocks (autosave, import); silently fail or show user-facing message
- **Computation errors:** ComputeError class with code and message; caught and ignored (undefined result shown to user as "invalid graph")
- **Storage errors:** localStorage operations wrapped in try-catch; fallback to undefined/empty arrays
- **File import errors:** Caught, collected in importErrors array, displayed in modal dialog

## Cross-Cutting Concerns

**Logging:** None detected; no logging framework used

**Validation:** Two layers:
  - GraphCanvas validates interactively via `validateGraph()` before computation
  - ComputeCPM validates during computation to catch logical errors (orphans, cycles, etc.)

**Authentication:** Not applicable (single-user browser app)

**Date Handling:**
  - `src/cpm/workdays.ts` provides `addWorkdays()` and `nextWorkday()` for calendar calculations
  - Workdays represent 0-based offsets from project start
  - Conversion to ISO date only when start date is set

---

*Architecture analysis: 2026-03-16*
