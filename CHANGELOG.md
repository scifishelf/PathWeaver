# Changelog

All notable changes to PathWeaver are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [2.0.0] — 2026-03-17

### Changed

- Task nodes may now have **any number of outgoing edges** — the artificial single-outgoing-edge restriction is removed
- CPM forward pass uses `max` over all incoming EF values at merge nodes — correct ES/EF for fan-in topologies
- Critical path highlighting now covers **all** zero-slack nodes, including diamond graphs with multiple equally critical branches

### Added

- BFS cycle detection in `isValidConnection` — drag-and-drop connections that would create a cycle are silently rejected
- Duplicate edge guard — attempting to draw a second edge between the same node pair is prevented
- v1.0 project files load and compute correctly in v2.0 (backward compatibility regression test)

### Fixed

- Multi-successor task nodes no longer display a red error border (`nodesWithTooManyOut` removed)
- HelpOverlay no longer references the "max. 1 outgoing edge" constraint that no longer exists

---

## [1.4.0] — 2026-03-17

### Added
- "Why CPM?" info overlay accessible via the `BookOpen` button in the header
- Illustrative SVG network diagram showing a critical path (cyan) vs. non-critical path (dashed)
- Origin timeline: DuPont/Remington Rand 1956 → first use 1958 → NASA/PERT 1960s → today
- Benefits grid (precise project end date, bottleneck detection, resource prioritization, scenario analysis)
- CPM glossary pills: ES, EF, LS, LF, Float, CP
- `Modal` component extended with optional `maxWidth` prop (default unchanged at 512 px)

---

## [1.3.0] — 2026-03-17

### Added
- Demo dropdown in `AppToolbar` (between Import and Snapshots) listing all test-data files: PathWeaver Test, Döner-Laden Tagesablauf, Mars-Kolonisierung
- Auto-load `pathweaver_test.json` as default project when no autosave exists in localStorage

### Fixed
- Floating-point artifacts in CPM computation (e.g. `2.77e-17` instead of `0`, `0.07500000000000001` instead of `0.075`) — all ES/EF/LS/LF/slack values are now rounded to 10 decimal places
- `critical: slack === 0` check now works correctly for nodes whose slack is effectively zero
- Slack display in `TaskNode` formatted with `toFixed(6)` to suppress remaining float noise
- Döner-Laden demo layout: increased node spacing to 320 px to prevent overlap on both the parallel preparation paths and the sequential order-fulfilment chain

---

## [1.2.0] — 2026-03-17

### Added
- Glassmorphism deep-space dark theme: blurred header, glowing accents, cyan critical path highlight
- Custom SVG favicon (network diagram motif)
- Demo project files: `doenerladen-tagesablauf.json` (döner shop workflow) and `mars-kolonisierung.json` (50-node Mars colonization project)
- `docs/testdaten/REGELN.md`: authoring rules for valid CPM demo files

---

## [1.1.0] — 2026-02-01

### Added
- Full 14-token design system in `theme.ts` replacing all hardcoded hex values
- Ghost variant and icon support for `Button.tsx`
- `isProjectJSON` type guard in `serialize.ts` for safe import validation
- `SaveResult` return type and `QuotaExceededError` handling in `autosave.ts`
- Named snapshots with random storage keys (avoids key collisions)
- `focusOnMount` behaviour for newly created task nodes
- DEV-only gate for `TopRightDebug` component
- Critical-path border highlight on `TaskNode`, `StartNode`, and `EndNode`
- Restyled critical-path banner with improved contrast and spacing
- `ContextMenu` keyboard accessibility (`focus-visible` support)
- Icon buttons with visual grouping in `AppToolbar`
- PNG export loading state indicator

### Fixed
- 2-digit year bug in `formatDateShort` — years before 2000 no longer display incorrectly
- Last remaining hardcoded hex values in `StartNode` date input

### Changed
- App title no longer carries the "(MVP)" suffix
- Migrated from `dom-to-image-more` to `html-to-image` for more reliable PNG export
- Replaced `as any` casts in `serialize.ts` with typed discriminated unions (`AppNodeData`)
- Removed `zustand` and `immer` dependencies (state managed locally in components)

### Tests
- 44 unit tests covering: CPM algorithm, workday calculation, graph validation, serialization, autosave, and `TaskNode` rendering
- Test stubs and implementation added in phases 01-02 through 01-07

---

## [1.0.0] — 2025-10-01

### Added
- Interactive CPM graph editor built with React Flow
- Start, Task, and End node types with inline title and duration editing
- Forward pass (ES/EF) and backward pass (LS/LF) computation
- Slack calculation and critical path identification
- Topological sort with cycle detection (Kahn's algorithm)
- Reachability check — orphaned nodes produce a validation error
- Graph rules: start has no incoming edges, end has no outgoing edges, task nodes have at most one outgoing edge
- Project start date with workday-aware date derivation (Mon–Fri, skips weekends)
- LocalStorage autosave with 200 ms debounce
- Named snapshot system (save, load, delete)
- JSON project export and import
- PNG canvas export via `html-to-image`
- Help overlay with keyboard shortcut reference
- Right-click context menu for node deletion
- Green floating action button (+) to add task nodes
- CI/CD pipeline deploying to Hetzner on push to `main`
- JSON format specification (`docs/json-format.md`) and JSON Schema (`docs/json-schema.v1.json`)

---

[Unreleased]: https://github.com/scifishelf/pathweaver/compare/v2.0...HEAD
[2.0.0]: https://github.com/scifishelf/pathweaver/compare/v1.4.0...v2.0
[1.4.0]: https://github.com/scifishelf/pathweaver/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/scifishelf/pathweaver/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/scifishelf/pathweaver/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/scifishelf/pathweaver/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/scifishelf/pathweaver/releases/tag/v1.0.0
