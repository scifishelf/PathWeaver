# Roadmap: PathWeaver

## Milestones

- ✅ **v1.0 MVP** — Phases 1–2 (shipped 2026-03-16)
- 🚧 **v2.0 Multi-Predecessor CPM** — Phases 3–4 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–2) — SHIPPED 2026-03-16</summary>

- [x] Phase 1: Code Quality & Stability (7/7 plans) — completed 2026-03-16
- [x] Phase 2: UI — Clean & Professional (5/5 plans) — completed 2026-03-16

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v2.0 Multi-Predecessor CPM (In Progress)

**Milestone Goal:** Remove the artificial 1-outgoing-edge constraint and deliver a CPM engine that correctly handles fan-out, merge, and diamond topologies — with cycle safety and correct multi-path highlighting.

- [x] **Phase 3: Algorithm & Guard Removal** - Remove all constraint guards atomically and fix critical path correctness for multi-predecessor graphs (completed 2026-03-17)
- [ ] **Phase 4: UX Polish & Validation** - Clean up outdated help text and confirm backward compatibility with v1.0 project files

## Phase Details

### Phase 3: Algorithm & Guard Removal
**Goal**: Users can draw Task nodes with any number of outgoing edges; CPM values are correct and all parallel critical paths are highlighted
**Depends on**: Phase 2 (v1.0 complete)
**Requirements**: ALGO-01, ALGO-02, ALGO-03, ALGO-04, ALGO-05, ALGO-06, UX-01
**Success Criteria** (what must be TRUE):
  1. User can drag a second (and third, fourth...) edge from a single Task node without seeing an error or losing CPM values
  2. A diamond graph where both branches have equal duration shows both branches highlighted as critical — not just one
  3. User cannot create a cycle by drag-and-drop; the connection is silently rejected at the point of release
  4. Multi-successor Task nodes do not display a red error border
  5. The CPM forward pass produces the correct FAZ at merge nodes (maximum of all incoming FEZ values)
**Plans:** 2/2 plans complete

Plans:
- [ ] 03-01-PLAN.md — TDD: Remove MULTIPLE_OUTGOING guard, replace greedy walk with criticalNodeIds Set
- [ ] 03-02-PLAN.md — Fix isValidConnection (BFS cycle detection, stale-closure fix), remove nodesWithTooManyOut

### Phase 4: UX Polish & Validation
**Goal**: Users encounter no contradictory help text and their existing v1.0 project files load and compute correctly in v2.0
**Depends on**: Phase 3
**Requirements**: UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. HelpOverlay contains no references to a "max. 1 outgoing edge" limit
  2. A v1.0 JSON file opened in v2.0 loads without errors and displays correct CPM values
  3. The `serialize.ts` edge ID scheme is documented with an explicit comment noting the single-handle assumption
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Code Quality & Stability | v1.0 | 7/7 | Complete | 2026-03-16 |
| 2. UI — Clean & Professional | v1.0 | 5/5 | Complete | 2026-03-16 |
| 3. Algorithm & Guard Removal | 2/2 | Complete   | 2026-03-17 | - |
| 4. UX Polish & Validation | v2.0 | 0/? | Not started | - |
