# Feature Research

**Domain:** Multi-predecessor / multi-successor CPM network diagram editor
**Researched:** 2026-03-17
**Confidence:** HIGH

---

## Context: What Already Exists

The following are already shipped in v1.0 and are NOT in scope for this research:

- CPM algorithm (forward/backward pass, slack, critical path)
- Topological sort (Kahn's algorithm) — already handles arbitrary fan-in correctly
- `isValidConnection` guard blocking >1 outgoing edge on Task nodes
- Cycle detection in both `validate.ts` and `isValidConnection`
- Orphan / reachability detection from Start
- Inline edit, localStorage, JSON/PNG export, workday calculation

The v2.0 milestone removes a single artificial constraint: the `outCount >= 1` guard that limits
Task nodes to one outgoing edge. This unlocks true parallelism without replacing the algorithm.

The forward/backward pass in `compute.ts` already correctly uses:
- `Math.max(...preds.map(EF))` for ES at merge nodes (forward pass)
- `Math.min(...succs.map(LS))` for LF at fork nodes (backward pass)

Both are the exact formulae required by CPM theory with multiple predecessors. The algorithm
needs no changes — only the guard that prevents multi-successor graphs needs removal.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must work once the fan-out constraint is removed. Missing any of these makes
the milestone feel incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Arbitrary fan-out on Task nodes | Core milestone goal — the entire milestone is this | LOW | Remove the `outCount >= 1` guard in `isValidConnection` (GraphCanvas.tsx ~line 59). One condition, one line. |
| Arbitrary fan-in on Task nodes | Parallel branches must converge somewhere | NONE | Already supported. No code change needed. `compute.ts` uses `maxEF` across all predecessors already. |
| Correct CPM values after fan-out | Users trust the numbers — wrong slack is a silent bug | LOW | Algorithm already correct. After removing guard, verify with a diamond-topology test (A→B, A→C, B→D, C→D): EF(D) must equal max(EF(B),EF(C)). |
| Remove MULTIPLE_OUTGOING check in compute.ts | Without this, the algorithm throws on any fan-out graph even if the guard is removed in UI | LOW | Lines 51–58 of `compute.ts` count outgoing edges and throw `ComputeError('MULTIPLE_OUTGOING', ...)`. Must be deleted alongside the UI guard. |
| Drop MULTIPLE_OUTGOING from ComputeErrorCode | Type union must stay consistent with what the algorithm can actually throw | LOW | Remove from `ComputeErrorCode` in `types.ts`. One string in a union type. |
| No duplicate edges | Two edges A→B with identical source/target would give A twice as much weight during forward pass | NONE | ReactFlow's `addEdge()` utility already prevents same source+target pairs. No action needed. |
| Cycle detection still enforced | CPM is only defined on a DAG; cycles produce infinite loops in naive traversal | NONE | Both `isValidConnection` cycle check and `validate.ts` Kahn traversal remain unchanged. Neither is coupled to the fan-out guard. |
| Remove nodesWithTooManyOut and its consumers | This memoized Set drives false red-error styling on multi-successor nodes after fan-out becomes legal | LOW | `nodesWithTooManyOut` in `GraphCanvas.tsx` (~lines 173–179) and all downstream uses in `styledNodes` and `styledEdges` (`invalid` flag, red stroke) must be removed. |
| Multiple critical paths displayed | When two parallel paths both have zero slack, both must be highlighted | MEDIUM | Current `criticalPath` computation in `compute.ts` (lines 149–158) does a single greedy walk: `succs.find(slack===0)`. This misses the second critical path in a diamond where both branches have equal duration. See algorithm section below. |
| Valid JSON export/import roundtrip | Existing projects must still load; new fan-out graphs must save correctly | LOW | `serialize.ts` represents edges as a flat list with no fan-out constraint. Verify no validation in `fromProjectJSON` blocks multi-edge sources. No change expected. |
| Test coverage for multi-predecessor graphs | Open-source codebase — CPM correctness is publicly judged | MEDIUM | Add tests for: diamond (both branches equal → two critical paths), diamond (unequal branches → one critical path), node with 3+ successors, merge node computing maxEF correctly. |

### Differentiators (Competitive Advantage)

Features beyond the constraint removal that add real value and align with the project's core
value proposition ("critical path must be correct and clearly visible").

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Full multi-path critical highlighting | Most lightweight CPM tools show only one critical path when two are simultaneous. Highlighting all zero-slack paths is more correct and more useful. | MEDIUM | Replace single-path greedy walk with a set-based traversal that collects all zero-slack edges. `styledEdges` already uses a `cpPairs` Set for lookup — switching to a Set of all critical edges is straightforward. Requires changing `criticalPath: NodeId[]` in `ComputedResult` or adding a parallel `criticalEdges` structure. |
| Critical path banner still accurate with multiple paths | The banner shows "Critical Path: N Working Days" — this remains meaningful even with multiple paths since all share the same project duration | LOW | No change needed to the banner. Duration is `max(EF)` across all nodes, which is unchanged. Banner remains correct. |
| Inline visual confirmation that multi-edge connection was accepted | Users may be surprised the second edge connects silently after years of it being blocked | LOW | The existing red-to-neutral edge color transition on valid connection already provides this feedback through ReactFlow's built-in connection animation. No additional work needed. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| "Auto-layout" that restructures the graph when parallel branches are added | Users may want the graph to re-flow automatically on fan-out | Breaks user-positioned nodes, fights ReactFlow's drag model, requires a layout engine (ELK, Dagre) that adds substantial bundle size and complexity for marginal gain | Let users drag nodes manually. `snapGrid={[8,8]}` already helps alignment. |
| Lag relationships (FS+2, SS, FF, SF) | Power users of MS Project expect dependency types beyond Finish-to-Start | DIN 69900 defines only FS relationships. Supporting lag would break the node data model, the DIN grid display, and add significant algorithm complexity. | Document as a future milestone topic. Out of scope per PROJECT.md. |
| Multiple end nodes | Some schedules have multiple deliverables | CPM requires a single project end to compute a unique critical path duration. Multiple ends produce ambiguous project duration. | If needed later: auto-insert a virtual end node and wire all terminal nodes to it. Not in scope for v2.0. |
| Replacing criticalPath array with a richer graph structure in the public API | Correct representation of multiple paths | Would break existing consumers in `styledEdges` (the `cpPairs` Set loop) and the Banner (which reads `cp.criticalPath`). Breaking change without user-facing benefit. | Additive approach: keep `criticalPath: NodeId[]` for the banner's path display, add `criticalEdges: Set<string>` for edge styling. Both can coexist. |
| Auto-connecting orphan nodes to Start | Reduce setup friction | Silently mutating the graph violates user intent. Orphan detection exists precisely to surface unconnected nodes so users connect them intentionally. | Keep explicit orphan error feedback. |

---

## Feature Dependencies

```
[Remove fan-out guard in isValidConnection (GraphCanvas.tsx)]
    └──must be paired with──> [Remove MULTIPLE_OUTGOING check in compute.ts]
                                  └──must be paired with──> [Drop MULTIPLE_OUTGOING from ComputeErrorCode in types.ts]

[Remove fan-out guard]
    └──requires cleanup of──> [Remove nodesWithTooManyOut memoization]
                                  └──requires cleanup of──> [Remove nodesWithTooManyOut consumers in styledNodes]
                                  └──requires cleanup of──> [Remove nodesWithTooManyOut consumers in styledEdges]

[Multiple critical paths rendering]
    └──depends on──> [Fan-out guard removed] (otherwise no multi-path graphs can be created to test)
    └──requires change to──> [criticalPath walk in compute.ts lines 149-158]
    └──requires change to──> [styledEdges cpPairs Set in GraphCanvas.tsx]

[Test coverage for multi-predecessor]
    └──depends on──> [All above changes complete]
```

### Dependency Notes

- **Fan-out guard removal requires two synchronous site changes:** the `isValidConnection` check
  in `GraphCanvas.tsx` (UX layer) and the `outCounts` loop in `compute.ts` (algorithm layer).
  Removing only the UI guard leaves the algorithm throwing `MULTIPLE_OUTGOING` on any fan-out
  graph — a confusing half-broken state.

- **nodesWithTooManyOut cleanup is mandatory, not optional:** This Set currently causes nodes
  with >1 outgoing edge to get a red error border. After v2.0, that topology is legal. Leaving
  the cleanup out would mean valid multi-successor nodes permanently show as errors.

- **Multiple critical paths is the only non-trivial algorithmic change:** The ES/EF/LS/LF
  computation is already correct. Only the path *identification* step (lines 149–158 of
  `compute.ts`) uses a single greedy walk that misses parallel critical paths.

---

## MVP Definition

### Launch With (v2.0)

Minimum viable for this milestone. All items are P1 — missing any one leaves the feature broken
or misleading.

- [ ] Remove `outCount >= 1` guard from `isValidConnection` in `GraphCanvas.tsx`
- [ ] Remove `MULTIPLE_OUTGOING` check from `compute.ts` (the `outCounts` loop, ~lines 51–58)
- [ ] Drop `MULTIPLE_OUTGOING` from `ComputeErrorCode` union in `types.ts`
- [ ] Remove `nodesWithTooManyOut` memoization and all downstream consumers from `GraphCanvas.tsx`
- [ ] Fix critical path identification to collect all zero-slack paths (not just the first greedy one)
- [ ] Add regression tests: diamond topology with equal branches, diamond with unequal branches, node with 3+ successors

### Add After Validation (v2.x)

- [ ] Visual "merge node" indicator (subtle badge on nodes with 2+ incoming edges) — only if user
  testing reveals confusion about convergence topology
- [ ] Workweek / holiday calendar customization — already deferred per PROJECT.md

### Future Consideration (v3+)

- [ ] Auto-layout via Dagre or ELK — only if graph sizes regularly exceed ~20 nodes
- [ ] Lag relationships — requires algorithm and data model changes, separate milestone
- [ ] Multiple end-node support with virtual end node — separate milestone

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Remove fan-out guard (both sites: UI + algorithm) | HIGH | LOW | P1 |
| Remove nodesWithTooManyOut + all consumers | HIGH | LOW | P1 |
| Fix critical path identification for multiple paths | HIGH | MEDIUM | P1 |
| Regression test suite for multi-predecessor topologies | HIGH | MEDIUM | P1 |
| Drop MULTIPLE_OUTGOING from ComputeErrorCode | MEDIUM | LOW | P1 (type cleanup) |
| Visual merge node indicator | LOW | LOW | P3 |
| Auto-layout engine | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for v2.0 launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Algorithm Correctness Reference

CPM with multiple predecessors is mathematically well-understood (HIGH confidence — PMI,
Mosaic Projects):

**Forward pass (ES of a merge node with N predecessors):**
`ES(n) = max(EF(p) for all predecessors p of n)`
Already implemented: `compute.ts` line 104 — `Math.max(...preds.map((p) => EF.get(p) ?? 0))`

**Backward pass (LF of a fork node with N successors):**
`LF(n) = min(LS(s) for all successors s of n)`
Already implemented: `compute.ts` line 124 — `Math.min(...succs.map((s) => LS.get(s)!))`

**Topological order:**
Kahn's algorithm in `topoSort()` is agnostic to out-degree. It handles arbitrary fan-in and
fan-out without modification.

**Critical path identification (needs fix):**
A node is on the critical path if `slack = LS - ES = 0`. Multiple disconnected paths can all
satisfy this simultaneously when parallel branches have equal duration. The current greedy walk
at lines 149–158 misses this case — it follows only the first zero-slack successor per node.

Correct approach: after computing all node slacks, collect all edges `(u, v)` where both
`computedNodes[u].slack === 0` and `computedNodes[v].slack === 0`. This set of edges represents
the complete critical subgraph. The existing `cpPairs` Set in `styledEdges` is already structured
to accept this — it just needs to be populated from a complete edge enumeration rather than a
single path walk.

---

## Sources

- [PMI — Critical Path Method Calculations](https://www.pmi.org/learning/library/critical-path-method-calculations-scheduling-8040)
  — authoritative on max-EF forward pass and min-LS backward pass rules
- [Mosaic Projects — Basic CPM Calculations PDF](https://www.mosaicprojects.com.au/PDF/Schedule_Calculations.pdf)
  — detailed worked examples with merge (fan-in) and burst (fan-out) nodes
- [PMI SP — Forward and Backward Pass test](https://trustedinstitute.com/concept/pmi-sp/critical-path-method/forward-and-backward-pass/)
  — confirms max/min rules at convergence/divergence points
- [ReactFlow — Preventing Cycles example](https://reactflow.dev/examples/interaction/prevent-cycles)
  — `isValidConnection` + `getOutgoers` pattern; confirms cycle detection remains viable after removing fan-out guard
- [ReactFlow — addEdge utility](https://reactflow.dev/api-reference/utils/add-edge)
  — confirms duplicate edge prevention is built-in, no custom code needed
- [ReactFlow — IsValidConnection API](https://reactflow.dev/api-reference/types/is-valid-connection)
  — type reference for the guard function
- [ProjectSmart — Multiple Critical Paths discussion](https://www.projectsmart.co.uk/forums/viewtopic.php?t=1488)
  — confirms multiple simultaneous critical paths are a real, expected CPM scenario
- Source code analysis: `web/src/cpm/compute.ts`, `web/src/graph/validate.ts`,
  `web/src/components/GraphCanvas.tsx`, `web/src/cpm/types.ts`

---
*Feature research for: PathWeaver v2.0 — Multi-Predecessor CPM*
*Researched: 2026-03-17*
