# Pitfalls Research

**Domain:** Adding multi-predecessor/multi-successor CPM support to existing single-outgoing-edge tool
**Project:** PathWeaver v2.0
**Researched:** 2026-03-17
**Confidence:** HIGH (grounded in direct codebase analysis + verified CPM algorithm theory + ReactFlow 11 source patterns)

---

## Critical Pitfalls

### Pitfall 1: Single-Path Critical Path Traversal Breaks on Diamond Graphs

**What goes wrong:**
`computeCPM` in `compute.ts` calculates slack and `critical: boolean` correctly for all nodes (lines 134–146), but the `criticalPath` array is built by a greedy single-next-node walk (lines 149–159). The loop picks the first successor with `slack === 0` and moves to it. In a diamond graph (A branches to B and C, both converge at D), both B→D and C→D may have `slack === 0` — two parallel critical paths. The current traversal picks one branch arbitrarily (whichever `Array.find()` returns first), produces a path like `[start, A, B, D, end]`, and silently drops the parallel branch `C`. The CP Banner says "7 Working Days", which is correct, but the highlighting only shows half the critical path — a correctness failure visible to users.

**Why it happens:**
The existing code was designed for a linear-chain constraint (max 1 outgoing edge per task), so a fork could never produce two parallel zero-slack branches. Removing the `MULTIPLE_OUTGOING` constraint without updating the traversal algorithm exposes this assumption.

**How to avoid:**
Replace the greedy-walk with a set-based approach: after computing `critical: boolean` for all nodes, mark all edges `(u → v)` where both `computedNodes[u].critical && computedNodes[v].critical` as critical edges. The critical "path" becomes a critical subgraph (set of nodes + edges), not a single array. The CP Banner can display duration from the result; edge highlighting uses the edge set directly. If a single path array is required downstream (e.g., for the banner or export), use a topological DFS collecting all zero-slack nodes.

**Warning signs:**
- Test with diamond topology (Start → A → B → End, Start → A → C → End, B and C same duration) passes `criticalPath.length` check but shows only one branch highlighted
- `criticalPath` array does not contain all nodes with `slack === 0`
- Banner shows correct duration but graph highlights are asymmetric on a symmetric diamond

**Phase to address:** Algorithm Phase (first phase of v2.0) — fix before any UI work

---

### Pitfall 2: `isValidConnection` Reads Stale `edges` Closure in the Existing Guard

**What goes wrong:**
In `GraphCanvas.tsx` lines 50–65, `isValidConnection` closes over `edges` from `useEdgesState`. When a user rapidly creates multiple connections in quick succession, React may batch updates such that `edges` inside the closure still reflects the pre-connection state. The current guard `edges.filter(e => e.source === from.id).length` reads the stale array and incorrectly allows a second outgoing connection that should be blocked (in the old 1-outgoing regime). After removing the outgoing-edge limit, the stale-closure issue becomes relevant for different guards (e.g., duplicate-edge prevention), but the underlying problem remains. **This is a latent bug that already exists; v2.0 work must not reproduce it in any new guard logic.**

**Why it happens:**
`isValidConnection` is defined with `useCallback([nodes, edges])`. React batches state updates, so between two fast connection events, the `edges` snapshot inside the callback can be the pre-first-connection value. `addEdge` (the ReactFlow utility used in `onConnect`) itself deduplicates edges by `source+target`, so it provides partial protection, but `isValidConnection` running before `addEdge` can still let through connections that `addEdge` deduplicates silently — creating a phantom "connection allowed" visual followed by a "nothing happened" result that confuses users.

**How to avoid:**
Use `useReactFlow().getEdges()` inside `isValidConnection` instead of the closed-over `edges` state snapshot. `getEdges()` returns the current live edges at call time, not the snapshot from the last render. For v2.0 guards (cycle prevention, duplicate edge), always use `getEdges()` / `getNodes()` inside the callback body, not the closure variables.

**Warning signs:**
- `isValidConnection` callback has `edges` in its `useCallback` dependency array rather than calling `getEdges()`
- User can create a duplicate edge between two nodes by clicking very fast
- New cycle-detection guard inside `isValidConnection` uses `nodes`/`edges` from closure rather than `getNodes()`/`getEdges()`

**Phase to address:** Algorithm + ReactFlow integration phase — fix the guard before removing the outgoing-edge limit

---

### Pitfall 3: Cycle Detection Not Enforced at the UI Level After Removing the 1-Outgoing Constraint

**What goes wrong:**
Currently, the 1-outgoing-edge constraint in `isValidConnection` makes cycles structurally impossible (a linear chain cannot form a cycle). After removing this constraint, cycles become reachable through normal user interaction (e.g., connect A→B, then B→A). The existing `validateGraph` in `graph/validate.ts` detects cycles using Kahn's algorithm and adds "Cycle detected" to the error array — but this is a *display-only* guard: it shows an error banner but does not prevent the edge from existing in the graph state. The `computeCPM` call is skipped when `errors.length > 0`, so the algorithm never sees the cycle. However, the edge persists in `edges` state and is saved to localStorage.

The gap: a user can create a cycle, see the red banner, close the browser, and reopen — the cycle is still there. More importantly, without real-time cycle prevention in `isValidConnection`, users can accidentally create cycles and have no interactive guidance that their drag attempt was rejected.

**Why it happens:**
`validateGraph` was designed as a post-hoc display validator, not a connection-time preventer. The 1-outgoing constraint served as an accidental cycle preventer. Removing it without adding a proper connection-time cycle check leaves the graph vulnerable.

**How to avoid:**
Add cycle detection to `isValidConnection`: before allowing a connection `(source → target)`, check whether `target` can already reach `source` through existing edges (i.e., adding this edge would create a cycle). Use a BFS/DFS from `target` using `getEdges()` and `getNodes()` to check reachability. ReactFlow's official "Preventing Cycles" example demonstrates this exact pattern and is available at `reactflow.dev/examples/interaction/prevent-cycles`. This check runs synchronously during the drag connection — if it returns `false`, ReactFlow shows the connection as invalid (grey/disabled) before the user releases the mouse.

**Warning signs:**
- `isValidConnection` does not include a cycle-reachability check after removing the outgoing-edge limit
- User can drag B→A after A→B exists and the connection is accepted (green indicator) even momentarily
- Cycle error appears in the banner but the edge was created (edge is visible in the graph)

**Phase to address:** Algorithm + ReactFlow integration phase — cycle guard must be in place before removing the outgoing-edge limit in production

---

### Pitfall 4: `MULTIPLE_OUTGOING` Error Code Removal Breaks Existing Tests

**What goes wrong:**
`compute.ts` lines 51–58 throw `ComputeError('MULTIPLE_OUTGOING', ...)` for any task node with more than 1 outgoing edge. `compute.test.ts` does not explicitly test this code path, but `validate.test.ts` and indirect tests may assert on the full list of valid error codes (the `ComputeErrorCode` union in `types.ts` line 45–53 includes `'MULTIPLE_OUTGOING'`). When the guard is removed from `computeCPM`, any test that constructs a graph with multiple outgoing edges and expects a `ComputeError` with code `MULTIPLE_OUTGOING` will start failing — or worse, passing for the wrong reason (the error is no longer thrown, so `expect(() => ...).toThrow()` would fail).

Additionally, `GraphCanvas.tsx` computes `nodesWithTooManyOut` (lines 173–179) and applies error styling to those nodes. After removing the limit, this logic becomes dead code that marks valid nodes as errors. If it is not removed, users will see red borders on nodes that have valid multiple outgoing edges.

**Why it happens:**
The `MULTIPLE_OUTGOING` concept is embedded in three places: the type union, the compute guard, and the UI highlighting. A partial removal (e.g., only removing the compute guard) leaves the type definition and UI code contradicting each other.

**How to avoid:**
Remove `'MULTIPLE_OUTGOING'` from the `ComputeErrorCode` union only after confirming no test asserts on it. Remove the `nodesWithTooManyOut` memo and its usage in `styledNodes` and `styledEdges` simultaneously with removing the compute guard. Run the full test suite after each removal step, not just at the end. Add a new test that explicitly verifies a diamond graph computes without error (regression guard for the removal).

**Warning signs:**
- `compute.test.ts` has a test that expects `MULTIPLE_OUTGOING` and the test is simply deleted rather than updated
- `nodesWithTooManyOut` still computed in `GraphCanvas.tsx` after removing the outgoing-edge limit
- Red border appears on a task node with 2 outgoing edges (the node is valid in v2.0)
- TypeScript still references `MULTIPLE_OUTGOING` in a `switch` case that is now unreachable

**Phase to address:** Algorithm phase — remove all three locations atomically

---

### Pitfall 5: Forward Pass Produces Incorrect FAZ When Predecessors Are Processed Out of Order

**What goes wrong:**
The forward pass in `computeCPM` (lines 97–109) iterates in topological order and for each node computes `maxEF = Math.max(...preds.map(p => EF.get(p) ?? 0))`. This is correct in principle — FAZ = MAX(FEZ of all predecessors). However, there is a subtle initialization risk: if `EF.get(p)` returns `undefined` for a predecessor that has not yet been processed, the `?? 0` fallback silently treats that predecessor as having EF=0 rather than throwing. In a well-formed DAG processed in topological order, this cannot happen. But if a graph has a hidden dependency ordering bug (e.g., an edge `A→B` that topological sort omits because of a data inconsistency between `edges` and `nodes` arrays), the `?? 0` silently produces wrong results instead of a detectable error.

This becomes more likely in v2.0 because multi-predecessor graphs have more edges, increasing the surface area for `edges` array inconsistency (e.g., an edge referencing a node ID that exists in `edges` but was deleted from `nodes`).

**Why it happens:**
The `?? 0` fallback was safe under the single-outgoing constraint because the graph was simpler. In complex DAGs, undefined-EF is a data integrity signal that should surface as a compute error, not a silent zero.

**How to avoid:**
Assert that all predecessors have a defined EF at the point of computation. Replace `EF.get(p) ?? 0` with a strict lookup: `if (!EF.has(p)) throw new ComputeError('INTERNAL_ORDER', ...)`. This converts silent wrong-answer bugs into visible failures. The `validateProjectJSON` and `validateGraph` functions should also verify that all edge `from`/`to` IDs reference existing nodes — strengthen the import-time check before the algorithm runs.

**Warning signs:**
- Forward pass produces FAZ values of 0 for nodes with multiple predecessors
- `EF.get(predecessor)` evaluates to `undefined` in a test scenario
- Two-predecessor merge node shows FAZ equal to the shorter predecessor's FEZ instead of the longer

**Phase to address:** Algorithm phase — add assertions alongside forward pass rewrite

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `criticalPath` as a single `NodeId[]` array even in multi-path cases | No downstream API change | Silently drops parallel critical branches; misleading for diamond graphs | Never for v2.0 — must represent full critical subgraph |
| Keep `nodesWithTooManyOut` memo but just make it always-empty | Quick code change, no test breakage | Dead computation on every render; confuses future readers | Never — remove it entirely |
| Guard `isValidConnection` with stale `edges` closure instead of `getEdges()` | No refactor needed | Occasional duplicate edges or incorrect "valid" signals under rapid input | Never — closure staleness is a known ReactFlow anti-pattern |
| Extend `settings.version` to `'2.0'` immediately | Clear versioning signal | Breaks `validateProjectJSON` for all existing v1.0 JSON files until migration code is added | Only if migration code ships in the same commit |
| Skip updating `validate.test.ts` when removing `MULTIPLE_OUTGOING` | Faster PR | Tests do not cover the newly valid topology; regression surface grows | Never — tests must verify what is now valid, not just what was always valid |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| ReactFlow `isValidConnection` | Close over `edges` from `useEdgesState` for cycle check | Use `useReactFlow().getEdges()` inside the callback body — always live, never stale |
| ReactFlow `addEdge` | Assume it prevents all duplicate edges | `addEdge` deduplicates by `source+target+sourceHandle+targetHandle`; if handles are not set, it works; but don't rely on it as the only guard |
| ReactFlow edge `id` generation | Use auto-generated `id` from `source+target` string concat | Duplicate IDs can appear if user deletes and recreates the same connection; use `crypto.randomUUID()` or ReactFlow's default handle-aware ID |
| `fromProjectJSON` edge mapping | Maps `{from, to}` to `{source, target}` with id `${from}-${to}` | If two edges share the same `from-to` pair (not currently possible, but possible after v2.0 with different handles), this creates duplicate ReactFlow edge IDs — add `id: crypto.randomUUID()` or encode handles in the ID |
| `toProjectJSON` / `fromProjectJSON` round-trip | Serialize only `from`/`to` — sufficient for single-handle graphs | Adequate for v2.0 since PathWeaver uses single source/target handles per node; document this assumption explicitly |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `nodes.find(x => x.id === n)` inside forward/backward pass loop (lines 106, 125) | O(n²) for large graphs | Build a `Map<NodeId, TaskNode>` once before the loops | Noticeable at ~200+ nodes; PathWeaver's use case likely never reaches this, but flagged for awareness |
| `isValidConnection` cycle-reachability check doing full BFS on every drag hover | UI lag during drag-to-connect on graphs with 50+ nodes | Acceptable for typical CPM network sizes (< 50 nodes) — no optimization needed at this scale | Not a concern for PathWeaver's use case |
| `computeCPM` called in a `useMemo` that depends on full `nodes`/`edges` arrays | Recomputes on every node position change (drag) | Add a separate memo that extracts only IDs + durations + edge pairs, and only recompute CPM when that lightweight memo changes | Becomes visible as jank when dragging nodes with 30+ nodes |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Removing the 1-outgoing-edge limit with no user communication | Users who knew about the limit are confused why previous behavior changed; users who did not know may accidentally create unintended fan-out | Update HelpOverlay to explicitly describe that tasks can now have multiple successors |
| Connection rejected silently (isValidConnection returns false) without tooltip | User drags to create a connection, it disappears, no explanation | ReactFlow 11 does not natively show rejection tooltips; the existing error banner is the only feedback — acceptable for now, but a note in the UX phase |
| Critical path highlighting showing only one branch of a multi-branch critical path | User sees partial highlighting and thinks something is broken | Fix the critical subgraph traversal (Pitfall 1) before any user-facing visual change |
| Error border on task nodes with multiple outgoing edges (the `nodesWithTooManyOut` red border) still showing after the limit is removed | Valid connections look broken | Remove the `nodesWithTooManyOut` highlighting atomically with the algorithm change |

---

## "Looks Done But Isn't" Checklist

- [ ] **Multi-predecessor forward pass:** CPM computes correct FAZ for a merge node (diamond: two predecessors with different durations — FAZ must equal MAX not MIN)
- [ ] **Critical path completeness:** All zero-slack nodes are highlighted, not just a single traversal path — verify with a symmetric diamond where both branches are critical
- [ ] **Cycle prevention at connection time:** `isValidConnection` rejects B→A when A→B already exists — not just the post-hoc error banner
- [ ] **Dead error code removal:** `'MULTIPLE_OUTGOING'` no longer in `ComputeErrorCode` union AND no test still expects it AND no UI code still references `nodesWithTooManyOut`
- [ ] **Backward compatibility of existing JSON:** A v1.0 JSON file (which by definition has max 1 outgoing edge per task) loads and computes correctly in v2.0 without migration — verify with an actual saved file
- [ ] **Test coverage for new topologies:** At minimum: diamond, parallel chains, multiple successors from Start, multiple predecessors to End — all with expected FAZ/FEZ/slack values explicitly asserted
- [ ] **Duplicate edge prevention:** Two connections from A to B cannot be created — `addEdge` deduplication alone is sufficient, but verify with a rapid-click test or an explicit `isValidConnection` check
- [ ] **End node backward pass:** LF of End is initialized to `maxEF` over all nodes (line 118) — this works correctly for multi-predecessor End but verify with test that End has multiple predecessors

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Critical path shows only one branch (Pitfall 1) | MEDIUM | Replace `criticalPath` array with critical edge set; update Banner to use `project.durationAT`; update edge styling to use edge set; run tests |
| Stale closure in isValidConnection creates duplicate edges (Pitfall 2) | LOW | Replace `edges.filter(...)` with `getEdges().filter(...)`; no test changes needed |
| Cycles reachable after constraint removal (Pitfall 3) | MEDIUM | Add BFS reachability check to `isValidConnection`; add test that confirms cycle is blocked |
| MULTIPLE_OUTGOING removal breaks tests (Pitfall 4) | LOW | Remove from type union + compute guard + UI highlighting atomically; update test expectations |
| Silent wrong FAZ from `?? 0` fallback (Pitfall 5) | LOW | Add `EF.has(p)` assertion; run all 44 existing tests + new diamond tests |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Single-path critical path traversal (Pitfall 1) | Phase 1: CPM Algorithm Upgrade | Test: symmetric diamond shows both branches highlighted |
| Stale `edges` closure in `isValidConnection` (Pitfall 2) | Phase 1: CPM Algorithm Upgrade (guard refactor) | Test: rapid double-connection does not create duplicate edge |
| No cycle prevention at connection time (Pitfall 3) | Phase 1: CPM Algorithm Upgrade | Test: B→A rejected when A→B exists |
| MULTIPLE_OUTGOING removal incomplete (Pitfall 4) | Phase 1: CPM Algorithm Upgrade | TypeScript compiles with no reference to MULTIPLE_OUTGOING; no red border on valid multi-successor node |
| Incorrect FAZ from `?? 0` fallback (Pitfall 5) | Phase 1: CPM Algorithm Upgrade | Test: merge node with unequal predecessor durations shows correct FAZ |
| Backward compatibility of v1.0 JSON | Phase 1: CPM Algorithm Upgrade | Load existing saved JSON from localStorage after upgrade; verify no compute errors |
| UX confusion from undocumented capability change | Phase 2: UX and Validation Polish | HelpOverlay updated; manual test: user can create fork and understand it is intentional |

---

## Sources

- Direct codebase analysis: `web/src/cpm/compute.ts`, `web/src/graph/validate.ts`, `web/src/components/GraphCanvas.tsx`, `web/src/persistence/serialize.ts`, `web/src/cpm/compute.test.ts`, `web/src/graph/validate.test.ts`
- ReactFlow 11 `isValidConnection` API: https://reactflow.dev/api-reference/types/is-valid-connection
- ReactFlow official cycle prevention example: https://reactflow.dev/examples/interaction/prevent-cycles
- ReactFlow `addEdge` deduplication behavior: https://reactflow.dev/api-reference/utils/add-edge
- CPM forward pass merge node rule (FAZ = MAX of predecessor FEZ): https://www.pmi.org/learning/library/critical-path-method-calculations-scheduling-8040
- Multiple critical paths in CPM networks: https://boyleprojectconsulting.com/tomsblog/2017/09/16/multiple-critical-paths-in-a-single-cpm-schedule/

---
*Pitfalls research for: PathWeaver v2.0 — Multi-Predecessor CPM*
*Researched: 2026-03-17*
