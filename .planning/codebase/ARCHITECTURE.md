# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Layered component-driven React application with separate business logic (CPM algorithm) and persistence concerns.

**Key Characteristics:**
- Unidirectional data flow from UI state through computation to visual rendering
- Clear separation between graph visualization layer (ReactFlow) and CPM algorithm layer
- LocalStorage-based client-side persistence with no backend
- Type-safe React components using discriminated unions for node data
- State management via React hooks (useState, useCallback, useEffect)

## Layers

**Presentation Layer (Components):**
- Purpose: Renders UI and handles user interactions
- Location: `src/components/`, `src/graph/`
- Contains: React components (GraphCanvas, AppToolbar, TaskNode, StartNode, EndNode, Modal, ContextMenu, HelpOverlay)
- Depends on: ReactFlow library, design tokens (theme.ts), types from cpm/
- Used by: App.tsx

**Business Logic Layer (CPM Algorithm):**
- Purpose: Computes Critical Path Method calculations (forward/backward pass, slack, critical path)
- Location: `src/cpm/`
- Contains: compute.ts (main CPM engine), types.ts (data structures), workdays.ts (date arithmetic)
- Depends on: date-fns for date manipulation
- Used by: GraphCanvas, validation functions, AppToolbar (exports)

**Persistence Layer:**
- Purpose: Manages LocalStorage autosave, snapshots, and JSON import/export
- Location: `src/persistence/`
- Contains: serialize.ts (JSON format conversion), autosave.ts (storage operations)
- Depends on: cpm/types.ts
- Used by: GraphCanvas, AppToolbar

**Design & Validation Layer:**
- Purpose: Provides visual design tokens and graph validation
- Location: `src/graph/theme.ts`, `src/graph/validate.ts`
- Contains: Color constants, shadows, transitions; graph cycle/orphan/structural checks
- Depends on: ReactFlow types
- Used by: All components

## Data Flow

**Project Editing Flow:**

1. User edits graph in GraphCanvas (adds node, edits task, connects edge)
2. Node/edge state updated via useNodesState/useEdgesState hooks
3. validateGraph() runs continuously to check structural rules
4. computeCPM() transforms ProjectJSON → ComputedResult (ES/EF/LS/LF per node, critical path)
5. computed result injected into node.data.computed via onEditTask callback
6. Components (TaskNode, EndNode) rerender with updated ES/EF/LS/LF display
7. saveCurrent() auto-persists to LocalStorage

**Export Flow:**

1. AppToolbar.onExportClick() calls toProjectJSON(nodes, edges, computed, startDate)
2. ReactFlow nodes/edges transformed to ProjectJSON format
3. JSON stringified and downloaded as blob, or used for PNG export
4. toPng() from html-to-image renders .react-flow canvas to PNG dataURL
5. PNG downloaded or computed result stored in JSON

**Import Flow:**

1. User selects JSON file in AppToolbar
2. File parsed and validateProjectJSON() checks schema
3. fromProjectJSON() transforms JSON → ReactFlow nodes/edges + data
4. onImport callback replaces canvas state
5. GraphCanvas recomputes validation and CPM

**Date Calculation Flow:**

1. User sets startDate in StartNode (ISO format YYYY-MM-DD)
2. startDate stored in ProjectJSON.settings
3. EndNode and TaskNode receive startDate prop
4. formatWorkdayToDate(startDate, workday) calculates concrete date
5. Skips weekends via addWorkdays/nextWorkday helpers

## Key Abstractions

**ProjectJSON:**
- Purpose: Standardized machine-readable project format
- Examples: `src/cpm/types.ts` (interface definition), `docs/json-schema.v1.json` (JSON Schema)
- Pattern: Immutable data structure with clear version (1.0); nodes have id/type/title/duration/x/y; edges have from/to

**AppNodeData (Discriminated Union):**
- Purpose: Type-safe node.data differentiation based on node.type
- Examples: TaskNodeData, StartNodeData, EndNodeData in `src/cpm/types.ts`
- Pattern: Union type with type field as discriminator; each branch has specific onEdit/onChangeStartDate callbacks
- Benefit: Eliminates runtime type checking; TypeScript prevents accessing TaskNodeData.onEdit on StartNodeData

**ComputedResult:**
- Purpose: Output of CPM algorithm; contains ES/EF/LS/LF per node and critical path list
- Examples: Used in TaskNode to render timing values and highlight critical path
- Pattern: Immutable record after computation; indexed by NodeId for O(1) lookup

## Entry Points

**Browser (HTML/Vite):**
- Location: `index.html`, `src/main.tsx`
- Triggers: User opens PathWeaver URL or dev server
- Responsibilities: Mounts React app to #root DOM element

**App Component:**
- Location: `src/App.tsx`
- Triggers: Rendered by React.StrictMode in main.tsx
- Responsibilities: Renders glassmorphism header with help button, GraphCanvas main component, and HelpOverlay modal

**GraphCanvas:**
- Location: `src/components/GraphCanvas.tsx`
- Triggers: Rendered by App.tsx
- Responsibilities: ReactFlow wrapper; manages nodes/edges state; coordinates validation/CPM computation; handles autosave; listens for user interactions (connect, context menu, etc.)

**CPM Compute:**
- Location: `src/cpm/compute.ts` (exported function computeCPM)
- Triggers: Called by GraphCanvas after nodes/edges update
- Responsibilities: Validates graph rules, performs forward/backward pass, returns ES/EF/LS/LF and critical path

## Error Handling

**Strategy:** Validate early, display inline errors in UI, provide specific user-facing messages in German.

**Patterns:**

- **Graph Validation Errors:** validateGraph() in `src/graph/validate.ts` returns string[] of errors; displayed in red error banner in GraphCanvas. Examples: "Start hat Eingänge", "Zyklus erkannt", "Knoten X ist nicht mit Start verbunden"

- **CPM Computation Errors:** computeCPM() throws ComputeError with code and message; caught in GraphCanvas and displayed inline. Error codes: MISSING_START_END, CYCLE, ORPHAN, UNREACHABLE_END, MULTIPLE_OUTGOING, START_HAS_INCOMING, END_HAS_OUTGOING, INVALID_DURATION

- **Storage Quota Errors:** saveCurrent() catches DOMException with name 'QuotaExceededError' and returns { ok: false, error: '...' }; AppToolbar shows warning banner. Message directs user to delete snapshots or export

- **Import Validation Errors:** validateProjectJSON() checks schema (version, nodes/edges arrays exist); errors displayed in modal

- **Date Parsing Errors:** formatWorkdayToDate() wrapped in try/catch; returns '—' on parse failure to avoid breaking layout

## Cross-Cutting Concerns

**Logging:**
- console.error() used in persistence layer (autosave.ts, serialize.ts) for debugging storage issues
- No structured logging framework; errors logged to browser console

**Validation:**
- Two-pronged: structural validation (validateGraph) + algorithmic validation (computeCPM)
- Structural validation runs on every nodes/edges change; algorithmic only when exporting/computing
- Decorative red borders and error banners provide immediate visual feedback

**Authentication:**
- Not applicable; no backend or user accounts. All data is local to browser

**Styling:**
- Theme tokens (COLOR_*, SHADOW_*, RADIUS_*, etc.) in `src/graph/theme.ts`
- Glassmorphism design with backdropFilter blur, rgba colors, and glow effects
- Tailwind CSS (v4) for utility classes in index.css
- Inline styles in React components for dynamic theming

**State Management:**
- React hooks only; no Redux/Zustand
- GraphCanvasInner uses useNodesState/useEdgesState (from ReactFlow) for graph state
- Local component state for UI (helpOpen, menu, errors, quotaError)
- No global context; data flows down as props

---

*Architecture analysis: 2026-03-17*
