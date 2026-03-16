# Roadmap: PathWeaver

## Overview

PathWeaver ships in two phases. Phase 1 hardens the codebase: eliminating silent failures, removing dead dependencies, adding type guards, and building the test suite that makes future changes safe. Phase 2 then delivers the clean, professional UI that makes PathWeaver credible as an open-source tool — removing the "(MVP)" label, establishing a real design token system, and polishing the critical path visualization that is the app's core value.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Code Quality & Stability** - Hardened codebase with honest types, surfaced errors, and a test suite covering core business logic
- [ ] **Phase 2: UI — Clean & Professional** - Professional visual redesign with consistent design tokens, polished toolbar, and clear critical path emphasis

## Phase Details

### Phase 1: Code Quality & Stability
**Goal**: The codebase has no silent failure paths, no dead dependencies, honest types at all boundaries, and a test suite covering the core business logic — making every subsequent change verifiable.
**Depends on**: Nothing (first phase)
**Requirements**: DEPS-01, DEPS-02, DEPS-03, TYPES-01, TYPES-02, TYPES-03, ERR-01, ERR-02, ERR-03, BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, TEST-01, TEST-02, TEST-03, TEST-04, SNAP-01, SNAP-02
**Success Criteria** (what must be TRUE):
  1. Running `npm run build` produces zero TypeScript errors and zero `as any` casts in `serialize.ts` and `autosave.ts`
  2. The test suite covers serialization round-trips, graph validation rules, workday arithmetic, and CPM edge cases — all tests pass with `npm test`
  3. `autosave.ts` surfaces `QuotaExceededError` to the caller instead of swallowing it silently; no empty `catch {}` blocks remain anywhere in the codebase
  4. `zustand` and `dom-to-image-more` are absent from `package.json`; `html-to-image` is the active PNG library; no `.d.ts` stub remains
  5. Node IDs are generated via `crypto.randomUUID()`, snapshot keys carry a random suffix, and `TopRightDebug` does not appear in production builds
**Plans**: 7 plans

Plans:
- [ ] 01-01-PLAN.md — Foundation: remove dead deps (zustand/immer), install html-to-image, add AppNodeData discriminated union, fix json-schema.v1.json
- [ ] 01-02-PLAN.md — Test scaffolds: create all missing test files with it.todo stubs (Nyquist compliance)
- [ ] 01-03-PLAN.md — serialize.ts: replace 6 as-any casts with AppNodeData narrowing, add isProjectJSON type guard
- [ ] 01-04-PLAN.md — autosave.ts: SaveResult API, QuotaExceededError handling, random snapshot keys, name?: string support
- [ ] 01-05-PLAN.md — AppToolbar.tsx: html-to-image migration + panel filter for clean PNG, snapshot name input UI
- [ ] 01-06-PLAN.md — GraphCanvas.tsx: fix empty catches, remove setTimeouts, UUID node IDs, T-shortcut, startDate validation, SaveResult banner
- [ ] 01-07-PLAN.md — Tests: implement all it.todo stubs green (TEST-01..04, ERR-02/03, BUG-01/02, SNAP-01)

### Phase 2: UI — Clean & Professional
**Goal**: PathWeaver reads as a professional, production-ready tool on first open — with a consistent design language, an icon-based toolbar, prominent critical path emphasis, and no prototype-era artifacts.
**Depends on**: Phase 1
**Requirements**: UI-FOUND-01, UI-FOUND-02, UI-TOOLBAR-01, UI-TOOLBAR-02, UI-TOOLBAR-03, UI-CRIT-01, UI-CRIT-02, UI-POLISH-01, UI-POLISH-02, UI-POLISH-03
**Success Criteria** (what must be TRUE):
  1. The app title reads "PathWeaver" (or "PathWeaver – Netzplan"); no "(MVP)" label appears anywhere in the UI
  2. All colors, border-radius, and shadow values are defined as named tokens in `theme.ts` or as CSS variables; no hardcoded hex values remain in component files
  3. The toolbar shows icon + label buttons visually grouped by function (Export/Import separated from Snapshots/PNG) with hover and focus-visible states on all interactive elements
  4. Critical path nodes have both a background fill and a colored border; the CP info banner is visually distinct from node highlights and clearly readable
  5. All dates display in DD.MM.YYYY format; PNG export shows a loading indicator during the 1–3 second render; snapshot panel allows naming snapshots at creation time
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Code Quality & Stability | 4/7 | In Progress|  |
| 2. UI — Clean & Professional | 0/TBD | Not started | - |
