# Project Research Summary

**Project:** PathWeaver v2.0 — Multi-Predecessor CPM
**Domain:** CPM network diagram editor — constraint removal and algorithm correctness
**Researched:** 2026-03-17
**Confidence:** HIGH

## Executive Summary

PathWeaver v2.0 is a surgical, well-scoped milestone: remove one artificial constraint (the 1-outgoing-edge limit on Task nodes) and make the critical path display correct for the topologies that constraint was hiding. Research confirms the CPM algorithm already handles multi-predecessor graphs correctly — the forward pass (`ES = max(EF of predecessors)`) and backward pass (`LF = min(LS of successors)`) are both DIN 69900 compliant and topology-agnostic. The topological sort (Kahn's algorithm) is also multi-predecessor safe. No new dependencies are required: everything needed is already in the installed `node_modules`, and all required ReactFlow utilities (`getOutgoers`, `getEdges`, `getIncomers`) are confirmed present in the installed `@reactflow/core` package.

The recommended approach is to execute this as a strictly ordered sequence of removals and targeted fixes. Remove the algorithm guard in `compute.ts` first, prove it correct with tests, then remove the UI guard in `GraphCanvas.tsx`, then clean up the dead error-visualization code. The single non-trivial change is replacing the greedy single-path critical path traversal with an edge-set approach derived from per-node `critical` flags — this is necessary to correctly highlight parallel critical paths (e.g., a diamond graph where both branches have equal duration).

The key risk is partial removal: removing only the UI guard leaves the algorithm throwing `MULTIPLE_OUTGOING` on every fan-out graph, producing a visually broken state with no CPM values. An equally important risk is leaving the `nodesWithTooManyOut` error visualization in place after the constraint is removed — it would mark every valid multi-successor node with a permanent red error border. Both risks are avoided by treating all three removal sites (UI guard, algorithm guard, error visualization) as a single atomic operation, with tests verifying each step before merging.

---

## Key Findings

### Recommended Stack

No new runtime dependencies are needed for v2.0. The base stack is frozen: React 19.1.1, TypeScript ~5.9.3, ReactFlow 11.11.4, Vite, Vitest, Tailwind CSS, Lucide React. All required utilities (`getOutgoers`, `getEdges`, `getIncomers`) are already exported from the installed `@reactflow/core` package and confirmed present in `node_modules` via direct inspection of `web/node_modules/@reactflow/core/dist/esm/index.d.ts`.

**Core technologies (unchanged):**
- ReactFlow 11.11.4: graph canvas, edge/node state, connection validation — `getOutgoers` available for cycle detection without any install
- Vitest: test runner — existing 44 tests remain the regression baseline; `compute.test.ts` already has a passing multi-predecessor (diamond) test
- `cpm/compute.ts` (internal): pure CPM engine — already multi-predecessor correct, only guard removal needed

**Type system change required (internal only):**
- `ComputedResult.criticalPath: NodeId[]` continues to serve the duration banner (no consumer impact)
- Critical edge highlighting switches to a `criticalNodeIds: Set<string>` derived from per-node `ComputedNode.critical` flags — this eliminates one intermediate transformation step and correctly handles parallel paths

**Do not add:**
- Dagre / ELK (auto-layout): ~150KB bundle cost, not in scope
- ReactFlow v12: breaking API changes, explicitly out of scope per PROJECT.md
- Zod / Yup: existing `validateProjectJSON` is sufficient; multi-predecessor adds no new schema fields
- `toposort` npm package: existing Kahn's algorithm is correct and tested

See `.planning/research/STACK.md` for full analysis.

### Expected Features

The full v2.0 feature set is well-defined with high confidence. Every item maps to a specific file and line range in the codebase.

**Must have (table stakes — all P1 for v2.0 launch):**
- Remove fan-out guard from `isValidConnection` in `GraphCanvas.tsx` (lines 57–61) — the core capability
- Remove `MULTIPLE_OUTGOING` guard from `compute.ts` (lines 51–58) — must be atomic with the UI change or the graph appears broken
- Drop `'MULTIPLE_OUTGOING'` from `ComputeErrorCode` union in `types.ts` — dead code after guard removal
- Remove `nodesWithTooManyOut` useMemo (lines 173–179) and all consumers in `GraphCanvas.tsx` — prevents false error styling on valid nodes
- Fix critical path identification: replace greedy single-branch walk with `criticalNodeIds` set approach — correctness for diamond topologies
- Add duplicate-edge guard to `isValidConnection` — 2-line replacement for the outgoing-count guard
- Add cycle-detection to `isValidConnection` using `getEdges()` and `getOutgoers` — required because the 1-outgoing limit previously made cycles structurally impossible
- Switch `isValidConnection` to use `getEdges()` from `useReactFlow` instead of stale `edges` closure
- Regression tests: diamond with equal branches, diamond with unequal branches, 3+ successors from one node, merge node ES verification, cycle rejection at connection time

**Should have (differentiators included in v2.0):**
- Full multi-path critical highlighting via `criticalNodeIds` set — most lightweight CPM tools show only one critical path; this is a correctness differentiator
- HelpOverlay update to document that Tasks can now have multiple successors

**Defer to v2.x / v3+:**
- Visual "merge node" indicator badge — only if user testing reveals confusion
- Auto-layout via Dagre or ELK — bundle cost not justified at current graph sizes
- Lag relationships (FS+n, SS, FF, SF) — breaks algorithm and data model, separate milestone
- Multiple end nodes — requires virtual end node concept, separate milestone

See `.planning/research/FEATURES.md` for full analysis including anti-feature rationale.

### Architecture Approach

The existing architecture cleanly separates concerns across four layers: UI (App.tsx, GraphCanvas.tsx, AppToolbar.tsx), Graph/Node (TaskNode, StartNode, EndNode), Business Logic (compute.ts, validate.ts), and Persistence (serialize.ts, autosave.ts). All v2.0 changes are targeted modifications within existing files — no new files, no new components, no structural changes. The `computeCPM` pure function pattern is the key enabler: all algorithm changes are unit-testable without mounting any React component.

**Major components and their v2.0 change surface:**
1. `cpm/compute.ts` — remove MULTIPLE_OUTGOING guard block (lines 46, 51–58); the forward/backward pass requires no changes
2. `cpm/types.ts` — remove `'MULTIPLE_OUTGOING'` from `ComputeErrorCode` union; add/keep `ComputedNode.critical` boolean (already present)
3. `components/GraphCanvas.tsx` — three targeted changes: remove outgoing-count guard from `isValidConnection`, remove `nodesWithTooManyOut` memo and consumers, replace `cpPairs` (path-based) with `criticalNodeIds` (node-based) in `styledEdges`
4. `cpm/compute.test.ts` — add multi-predecessor test cases, remove/update MULTIPLE_OUTGOING test expectations
5. `graph/validate.ts` — no change required (never checked outgoing counts)

**Recommended data flow change for critical path display (v1.0 vs v2.0):**
- v1.0: `criticalPath: NodeId[]` linear array → greedy single-branch walk → `cpPairs: Set<string>` → edge highlight
- v2.0: `cp.nodes[id].critical` boolean per node (already set correctly) → `criticalNodeIds: Set<NodeId>` derived in `GraphCanvas` → edge is critical if both source and target are in the set → edge highlight

**ReactFlow 11 specifics confirmed:** A Handle without an `id` prop supports multiple outgoing edges by default in RF11. The 1-outgoing constraint was entirely application code, not a ReactFlow framework limitation. `isValidConnection` is the only RF11 hook controlling edge creation at the drag level.

See `.planning/research/ARCHITECTURE.md` for full analysis including build order and anti-patterns.

### Critical Pitfalls

1. **Partial constraint removal (UI guard removed, algorithm guard not removed)** — Users can draw fan-out edges but `computeCPM` throws `MULTIPLE_OUTGOING`, `cp` becomes `undefined`, and all CPM values disappear from the graph. Fix: remove both guards atomically in a single commit, with tests passing before merge.

2. **`nodesWithTooManyOut` left in place after removing the limit** — Every valid multi-successor node gets a permanent red error border. Fix: remove the `useMemo` and both its consumers (`styledNodes`, `styledEdges`) in the same step as the algorithm guard removal.

3. **Greedy single-path critical path traversal on parallel diamond graphs** — In a symmetric diamond, `criticalPath` picks one branch arbitrarily via `Array.find()`. Highlighting is asymmetric and incorrect. Fix: switch to `criticalNodeIds` approach (mark edge critical if both endpoints have `ComputedNode.critical === true`) before any user-facing changes ship.

4. **No cycle detection at connection time after removing the 1-outgoing constraint** — The 1-outgoing limit previously made cycles structurally impossible. After v2.0, cycles are reachable through normal drag interactions. `validateGraph` detects cycles post-hoc but allows the cyclic edge to persist in state. Fix: add a synchronous BFS reachability check to `isValidConnection` using `getEdges()` / `getOutgoers` to block cycle creation at the drag level.

5. **Stale `edges` closure in `isValidConnection`** — The duplicate-edge guard and cycle check must not read from the closed-over `edges` React state snapshot, which may lag under rapid connection attempts. Fix: use `useReactFlow().getEdges()` (always current) for all guard logic inside `isValidConnection`.

See `.planning/research/PITFALLS.md` for full analysis including integration gotchas, performance traps, and a "looks done but isn't" verification checklist.

---

## Implications for Roadmap

Based on the dependency graph discovered in research, a two-phase structure is strongly recommended. All blocking correctness work concentrates in Phase 1; Phase 2 is polish and backward-compatibility validation.

### Phase 1: Algorithm and Guard Removal

**Rationale:** Every other change depends on the algorithm guard being removed and proven correct first. Tests written in this phase become the regression baseline for all subsequent work. All five critical pitfalls are prevented in this phase. The build order within this phase is itself dependency-driven: pure-function changes (algorithm) before integration changes (UI), type cleanup before consumers, removals before replacements.

**Delivers:** A fully functional multi-predecessor CPM engine, correct critical path identification for all topologies (including diamonds and parallel chains), and a codebase with no dead error-code artifacts or false error styling.

**Addresses:**
- Remove `MULTIPLE_OUTGOING` guard from `compute.ts` (table stakes)
- Remove `'MULTIPLE_OUTGOING'` from `ComputeErrorCode` in `types.ts` (type cleanup)
- Fix critical path identification to `criticalNodeIds` set approach (correctness)
- Remove `nodesWithTooManyOut` memo and consumers (prevents false error styling)
- Remove outgoing-count guard from `isValidConnection` in `GraphCanvas.tsx` (core feature)
- Add duplicate-edge guard to `isValidConnection`
- Add cycle-detection to `isValidConnection` using `getEdges()` and `getOutgoers`
- Switch `isValidConnection` to use `getEdges()` instead of stale closure
- Regression tests: diamond equal branches, diamond unequal branches, 3+ successors, merge node ES, cycle rejection

**Avoids:** Pitfall 1 (partial removal), Pitfall 2 (false error borders), Pitfall 3 (greedy path traversal), Pitfall 4 (cycles reachable), Pitfall 5 (stale closure)

**Recommended build order within Phase 1 (dependency-aware):**
1. Remove algorithm guard in `compute.ts` + add multi-predecessor tests — proves correctness before touching UI
2. Remove `'MULTIPLE_OUTGOING'` from `types.ts` — dead code; unblocks clean TypeScript compile
3. Remove UI guard + add duplicate-edge guard + add cycle-detection in `GraphCanvas.tsx` — the user-visible change, safe because algorithm is now proven
4. Remove `nodesWithTooManyOut` memo and all consumers in `GraphCanvas.tsx`
5. Replace `cpPairs` with `criticalNodeIds` in `styledEdges`
6. Run full 44-test regression suite + new topology tests — all must pass

### Phase 2: UX and Validation Polish

**Rationale:** After Phase 1 the feature is functionally correct, but users may encounter confusing UX: help text may still reference the old "1 outgoing edge" limitation, and backward compatibility with saved v1.0 JSON files needs explicit verification.

**Delivers:** A polished user-facing experience with updated documentation and confirmed backward compatibility with all existing project files.

**Implements:**
- Update HelpOverlay: remove any "1 outgoing edge" wording; document that tasks can now have multiple successors
- Verify v1.0 JSON round-trip: existing localStorage saves load and compute correctly in v2.0 without migration (by definition, v1.0 files have max 1 outgoing edge per task — they are a strict subset of valid v2.0 graphs)
- Manual end-to-end test: create diamond graph, verify both branches highlighted when equal duration, only one branch highlighted when unequal
- Verify edge ID generation in `serialize.ts` does not produce duplicate IDs for multi-edge sources (current scheme `"${from}-${to}"` is adequate for single-handle graphs; document the assumption explicitly)

### Phase Ordering Rationale

- Phase 1 must precede Phase 2 because UX polish and documentation are meaningless if the underlying algorithm or guard removal is incomplete or incorrect.
- All five critical pitfalls map to Phase 1 because they are algorithmic or integration concerns that must be resolved before any user interaction change is visible.
- The build order within Phase 1 follows the data flow: algorithm purity (pure function, testable without React) before UI integration (React component hooks) before visual display (styled edges memo).
- No separate architecture phase is needed: the existing layer separation cleanly contains all changes within five existing files.

### Research Flags

**Phases with standard, well-documented patterns — no additional research needed:**
- **Phase 1:** All changes are precisely located (specific line numbers identified). Algorithm correctness is verified against PMI and DIN 69900 standards. ReactFlow cycle-detection pattern is officially documented with a working example. The existing test suite already passes a multi-predecessor diamond fixture.
- **Phase 2:** UX copy updates and JSON round-trip verification are standard validation steps.

No phases in this milestone require a `research-phase` invocation. The research base is complete and high-confidence across all areas.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All required utilities confirmed present via direct inspection of installed `node_modules`; no new dependencies; ReactFlow 11 Handle behavior confirmed via source; algorithm correctness verified against PMI/DIN 69900 |
| Features | HIGH | Every feature maps to a specific file and line range; algorithm correctness verified by existing passing tests (multi-predecessor diamond fixture already in `compute.test.ts`); anti-feature decisions grounded in PROJECT.md scope constraints |
| Architecture | HIGH | Based on direct codebase inspection of all relevant source files with exact line numbers; build order verified against concrete dependency analysis; no external or undocumented patterns relied upon |
| Pitfalls | HIGH | Every pitfall is grounded in actual code locations with exact line references; no hypothetical pitfalls; latent bugs (stale closure, greedy path walk) verified by reading the exact code paths affected |

**Overall confidence: HIGH**

### Gaps to Address

- **`?? 0` fallback in forward pass (`EF.get(p) ?? 0`):** Silently produces wrong FAZ if a predecessor's EF is undefined due to data inconsistency (e.g., an edge referencing a deleted node ID). Adding a strict assertion (`if (!EF.has(p)) throw new ComputeError('INTERNAL_ORDER', ...)`) would convert silent wrong-answer bugs into detectable failures. This is an optional robustness improvement — not a blocker for v2.0 — but worth noting during Phase 1 implementation.

- **`computeCPM` recomputes on node position changes (drag):** The `useMemo` in `GraphCanvas.tsx` depends on full `nodes`/`edges` arrays. Node drag moves update `nodes` positions, triggering unnecessary CPM recomputation. Not a correctness issue; becomes visible as jank at ~30+ nodes. Document the assumption (acceptable for typical CPM network sizes) to prevent future confusion.

- **`fromProjectJSON` edge ID scheme (`"${from}-${to}"`):** Currently adequate because duplicate edges are prevented at the UX layer. If PathWeaver ever supports multiple handles per node, this scheme produces duplicate ReactFlow edge IDs on import. Explicitly document the single-handle assumption in `serialize.ts` during Phase 2 to prevent future regression.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `web/src/cpm/compute.ts` — forward/backward pass, MULTIPLE_OUTGOING guard, criticalPath traversal, all inspected with line numbers
- `web/src/components/GraphCanvas.tsx` — isValidConnection, nodesWithTooManyOut, styledEdges, all inspected with line numbers
- `web/src/cpm/types.ts` — ComputeErrorCode union, ComputedNode, ComputedResult
- `web/src/graph/validate.ts` — confirmed: no outgoing-count check; cycle and orphan detection only
- `web/src/persistence/serialize.ts` — edge ID generation scheme `"${from}-${to}"` confirmed
- `web/src/cpm/compute.test.ts` — existing 44 tests; multi-predecessor diamond fixture confirmed passing
- `web/node_modules/@reactflow/core/dist/esm/index.d.ts` — `getOutgoers`, `getIncomers`, `getConnectedEdges` exports confirmed
- `web/node_modules/reactflow/package.json` — version 11.11.4, peer dep `react >= 17` confirmed

### Secondary (HIGH confidence — official documentation)

- [ReactFlow IsValidConnection API](https://reactflow.dev/api-reference/types/is-valid-connection) — callback type and behavior confirmed
- [ReactFlow prevent-cycles example](https://reactflow.dev/examples/interaction/prevent-cycles) — `getNodes()`/`getEdges()` in `isValidConnection` pattern confirmed
- [ReactFlow getOutgoers docs](https://reactflow.dev/api-reference/utils/get-outgoers) — function signature confirmed (v11 import path: `reactflow`)
- [ReactFlow addEdge utility](https://reactflow.dev/api-reference/utils/add-edge) — duplicate edge prevention behavior confirmed
- [PMI — Critical Path Method Calculations](https://www.pmi.org/learning/library/critical-path-method-calculations-scheduling-8040) — max-EF forward pass and min-LS backward pass rules; authoritative
- [Mosaic Projects — CPM Schedule Calculations PDF](https://www.mosaicprojects.com.au/PDF/Schedule_Calculations.pdf) — merge (fan-in) and burst (fan-out) node worked examples

### Tertiary (MEDIUM confidence — community sources)

- [PMI SP — Forward and Backward Pass](https://trustedinstitute.com/concept/pmi-sp/critical-path-method/forward-and-backward-pass/) — confirms max/min rules at convergence/divergence points
- [ProjectSmart — Multiple Critical Paths](https://www.projectsmart.co.uk/forums/viewtopic.php?t=1488) — confirms multiple simultaneous critical paths are a real, expected CPM scenario
- [Boyle Project Consulting — Multiple Critical Paths](https://boyleprojectconsulting.com/tomsblog/2017/09/16/multiple-critical-paths-in-a-single-cpm-schedule/) — confirms edge-set approach for displaying all critical paths

---
*Research completed: 2026-03-17*
*Ready for roadmap: yes*
