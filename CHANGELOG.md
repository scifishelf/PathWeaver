# Changelog

All notable changes to PathWeaver are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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

[Unreleased]: https://github.com/scifishelf/pathweaver/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/scifishelf/pathweaver/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/scifishelf/pathweaver/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/scifishelf/pathweaver/releases/tag/v1.0.0
