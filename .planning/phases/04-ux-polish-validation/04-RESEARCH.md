# Phase 4: UX Polish & Validation - Research

**Researched:** 2026-03-17
**Domain:** UI text correction, backward-compatibility validation, code documentation
**Confidence:** HIGH

## Summary

Phase 4 is a cleanup and validation phase with three narrow, concrete tasks. No new architecture is introduced. All three requirements (UX-02, UX-03, UX-04) are surgical changes to existing files: a one-line text correction in HelpOverlay.tsx, a comment addition in serialize.ts, and a backward-compatibility test for v1.0 JSON files.

The phase is complicated by a pre-existing test-suite problem: 11 tests in 5 test files are currently failing because implementation strings are in English while the tests expect German strings. This language mismatch is a pre-existing debt from the v1.0/v2.0 development. Phase 4 must decide whether to fix the mismatch (align strings to German) or not — but at minimum it must not make things worse. The plan should note these pre-existing failures explicitly so the verifier does not interpret them as a Phase 4 regression.

The backward-compatibility question (UX-03) is the most interesting requirement. Code inspection of serialize.ts shows that `fromProjectJSON` already handles v1.0 files correctly: it reconstructs edges as `{ id: \`${e.from}-${e.to}\`, source: e.from, target: e.to }` and nodes are typed by the `type` field. The `validateProjectJSON` function enforces `settings.version === '1.0'`, which means v1.0 files pass the guard unchanged. There is no migration step needed because the data schema has not changed across the v1.0→v2.0 algorithmic refactor. The required validation is therefore a unit test, not a code change.

**Primary recommendation:** Three independent surgical tasks, each touching one file. Wrap up with a test verifying round-trip load of a v1.0 multi-successor JSON file (the format that v1.0 couldn't produce but v2.0 should read back correctly).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UX-02 | HelpOverlay contains no outdated "max. 1 outgoing edge" references | Line 132 of HelpOverlay.tsx contains the offending text; requires single-line edit |
| UX-03 | v1.0 project files (JSON) load and compute correctly without migration | serialize.ts `fromProjectJSON` already handles the format; need a test that loads a v1.0 fixture and calls `computeCPM` |
| UX-04 | `serialize.ts` documents the `${from}-${to}` edge ID scheme with an explicit comment | Line 69 of serialize.ts reconstructs edge IDs; needs a comment noting the single-handle assumption |
</phase_requirements>

## Standard Stack

No new dependencies are required for this phase. All work uses the existing stack.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^3.2.4 | Test runner | Already used across all test files |
| @testing-library/jest-dom | ^6.9.1 | DOM matchers | Already configured in vitest.setup.ts |
| TypeScript | ~5.9.3 | Language | Project standard |

### Installation
No new packages needed.

## Architecture Patterns

### File Inventory for Phase 4

| File | Change Type | What Changes |
|------|-------------|-------------|
| `web/src/components/HelpOverlay.tsx` | Edit | Remove "Max. 1 outgoing per task" from line 132 |
| `web/src/persistence/serialize.ts` | Edit | Add comment on line 69 explaining edge ID scheme |
| `web/src/persistence/serialize.test.ts` | Edit or new test | Add round-trip test with v1.0 multi-successor fixture |

### Pattern 1: HelpOverlay Text Fix (UX-02)

**What:** Line 132 of `HelpOverlay.tsx` reads:
```
Connect: drag from right handle to target node · Max. 1 outgoing per task
```
The "Max. 1 outgoing per task" fragment is the only outdated text. The connect instruction itself is still valid. The fix is to remove that fragment, keeping the connect instruction.

**Target line (line 132):**
```tsx
// BEFORE
Connect: drag from right handle to target node · Max. 1 outgoing per task

// AFTER
Connect: drag from right handle to target node
```

### Pattern 2: serialize.ts Edge ID Comment (UX-04)

**What:** Line 69 of `serialize.ts` reconstructs ReactFlow edges from the JSON format:
```typescript
const edges: Edge[] = project.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to }))
```
The edge ID scheme `${from}-${to}` assumes each node has exactly one outgoing handle (a single-handle architecture). If a node ever gains multiple handles, this scheme would produce collisions. The required comment makes this assumption explicit for future maintainers.

**Target (line 69 addition):**
```typescript
// Edge IDs use the `${from}-${to}` scheme. This assumes each node has a single
// source handle (one outgoing connection slot), so the pair (from, to) is unique.
// If multi-handle nodes are introduced, this scheme must be revisited.
const edges: Edge[] = project.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to }))
```

### Pattern 3: v1.0 Backward-Compatibility Test (UX-03)

**What:** A unit test in `serialize.test.ts` that constructs a v1.0-style JSON object (as a v1.0 file would have been saved — single-successor topology, `settings.version: '1.0'`) and asserts it loads without errors and produces correct CPM values via `computeCPM`.

**Why this validates UX-03:** The v1.0 serialization format is identical to v2.0. The schema (`ProjectJSON`) has not changed. The test provides a regression guard: if anyone changes `fromProjectJSON` or `validateProjectJSON` in a way that breaks v1.0 file loading, the test will catch it.

**Test fixture (representative v1.0 project):**
```typescript
// A simple linear chain: start → A (dur=3) → B (dur=5) → end
// This is the exact shape v1.0 would have serialized
const v1Project: ProjectJSON = {
  settings: { version: '1.0' },
  nodes: [
    { id: 'start', type: 'start' },
    { id: 'A', type: 'task', title: 'Analysis', duration: 3, x: 100, y: 100 },
    { id: 'B', type: 'task', title: 'Build', duration: 5, x: 200, y: 100 },
    { id: 'end', type: 'end' },
  ],
  edges: [
    { from: 'start', to: 'A' },
    { from: 'A', to: 'B' },
    { from: 'B', to: 'end' },
  ],
}
```

The test should:
1. Call `isProjectJSON(v1Project)` — must return `true`
2. Call `fromProjectJSON(v1Project)` — must not throw
3. Pass the deserialized nodes/edges back through `toProjectJSON` and then `computeCPM` — must produce `durationAT === 8`, `ES` of B === 3, both A and B critical
4. Verify that the restored edge IDs match `${from}-${to}` pattern

### Anti-Patterns to Avoid

- **Changing the JSON schema:** UX-03 is a test-only requirement. The schema does NOT need a version bump. Changing `validateProjectJSON` to allow `version: '2.0'` would be unnecessary scope creep.
- **Removing the version check:** `settings.version === '1.0'` is the existing guard. Leave it in place; v1.0 files satisfy it.
- **Rewriting the HelpOverlay section:** Only the offending fragment needs removal. Do not restructure the section's JSX.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON loading test | Custom file reader | In-memory fixture object in test | serialize.ts takes `ProjectJSON` directly; no file I/O needed |
| Text search for outdated strings | Grep-based audit | Direct edit to known line | Only one instance found at line 132 |

## Common Pitfalls

### Pitfall 1: Pre-Existing Failing Tests
**What goes wrong:** When running `vitest --run` after Phase 4 changes, 11 tests remain failing. A reviewer might flag this as Phase 4 regressions.
**Why it happens:** The test suite was written with German error strings (e.g., `'Start hat Eingänge'`, `'Zyklus'`, `'Ziel'`, `'Start‑Knoten fehlt'`) but the implementation (`validate.ts`, `compute.ts`, `autosave.ts`, `serialize.ts`) uses English. This pre-dates Phase 4.
**How to avoid:** Document the pre-existing failures in the plan. Phase 4 must not fix unrelated failing tests (out of scope) but also must not introduce new failures. Run `vitest --run` before and after each change; the failure count must not increase.
**Warning signs:** If the count goes from 11 failing to 12+ failing, Phase 4 introduced a regression.

**Pre-existing failing tests (as of 2026-03-17):**
- `serialize.test.ts`: 2 failures (German string expectations vs English implementation)
- `validate.test.ts`: 4 failures (German string expectations vs English implementation)
- `autosave.test.ts`: 2 failures (German string expectations vs English implementation)
- `compute.test.ts`: 2 failures (German string expectations vs English implementation)
- `App.test.tsx`: 1 failure (unrelated render issue)

### Pitfall 2: Duplicate Edge ID Collision in v1.0 Test Fixture
**What goes wrong:** If the test fixture uses two edges with the same `from-to` ID scheme (which is impossible in v1.0 single-successor topology), the restored `edges` array would have duplicate `id` fields causing silent ReactFlow issues.
**Why it happens:** The `fromProjectJSON` function derives edge IDs deterministically. Two edges `A→B` and `A→B` would both get id `A-B`.
**How to avoid:** Use a strictly linear v1.0 fixture (each node has at most one outgoing edge). The v1.0 guard itself prevented multiple outgoing edges, so authentic v1.0 files cannot have collisions.

### Pitfall 3: Searching for Other Outdated Text Instances
**What goes wrong:** Research found ONLY one instance of the outdated text at HelpOverlay.tsx line 132. If the planner adds a grep-for-all-instances step, it will find nothing else and that is the expected result.
**How to avoid:** No other file contains the "Max. 1 outgoing" or equivalent text. The WhyCPMOverlay.tsx, Banner.tsx, and AppToolbar.tsx do not reference connection limits.

## Code Examples

### Exact change sites

**HelpOverlay.tsx line 132 — before:**
```tsx
Connect: drag from right handle to target node · Max. 1 outgoing per task
```

**HelpOverlay.tsx line 132 — after:**
```tsx
Connect: drag from right handle to target node
```

**serialize.ts line 69 — before:**
```typescript
const edges: Edge[] = project.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to }))
```

**serialize.ts line 69 — after (comment added above):**
```typescript
// Edge IDs use the `${from}-${to}` scheme. This assumes each node has a single
// source handle (one outgoing connection slot), so the pair (from, to) is unique.
// If multi-handle nodes are introduced, this scheme must be revisited.
const edges: Edge[] = project.edges.map((e) => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to }))
```

### v1.0 Backward-Compatibility Test Pattern
```typescript
// Source: computed from existing serialize.ts + compute.ts interface
describe('v1.0 backward compatibility (UX-03)', () => {
  it('loads a v1.0 linear project without errors and computes correct CPM', () => {
    const v1Project: ProjectJSON = {
      settings: { version: '1.0' },
      nodes: [
        { id: 'start', type: 'start', x: 0, y: 0 },
        { id: 'A', type: 'task', title: 'Analysis', duration: 3, x: 100, y: 0 },
        { id: 'B', type: 'task', title: 'Build', duration: 5, x: 200, y: 0 },
        { id: 'end', type: 'end', x: 300, y: 0 },
      ],
      edges: [
        { from: 'start', to: 'A' },
        { from: 'A', to: 'B' },
        { from: 'B', to: 'end' },
      ],
    }
    expect(isProjectJSON(v1Project)).toBe(true)
    const { nodes, edges } = fromProjectJSON(v1Project)
    expect(nodes).toHaveLength(4)
    expect(edges).toHaveLength(3)
    // Verify edge ID scheme
    expect(edges.find(e => e.source === 'A' && e.target === 'B')?.id).toBe('A-B')
    // Round-trip back through computeCPM
    const json = toProjectJSON(nodes, edges)
    const result = computeCPM(json)
    expect(result.project.durationAT).toBe(8) // 3 + 5
    expect(result.nodes['A'].ES).toBe(0)
    expect(result.nodes['B'].ES).toBe(3)
    expect(result.criticalNodeIds.has('A')).toBe(true)
    expect(result.criticalNodeIds.has('B')).toBe(true)
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single outgoing edge limit (v1.0) | Multiple outgoing edges allowed (v2.0) | Phase 3, 2026-03-17 | HelpOverlay text became stale |
| Greedy single-path critical walk | criticalNodeIds Set (all zero-slack nodes) | Phase 3, 2026-03-17 | No UX impact for Phase 4 |

## Open Questions

1. **Should the pre-existing German/English language mismatch in tests be fixed?**
   - What we know: 11 tests fail before Phase 4 begins. The mismatch is between English implementation strings and German test expectations.
   - What's unclear: Is this intentional (tests written before implementation was localized) or an oversight?
   - Recommendation: Out of scope for Phase 4. Document the pre-existing count (11 failures) in plan verification steps. Do not fix in this phase.

2. **Should `WhyCPMOverlay.tsx` be audited for similar outdated text?**
   - What we know: `WhyCPMOverlay.tsx` is a separate overlay explaining CPM methodology; code inspection shows no connection-limit text.
   - What's unclear: N/A — file is small and was inspected as part of research.
   - Recommendation: No changes needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `web/vite.config.ts` (test section) |
| Quick run command | `cd web && npm test -- --run` |
| Full suite command | `cd web && npm test -- --run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-02 | HelpOverlay contains no "Max. 1 outgoing" text | manual / visual | Inspect rendered output or grep | ✅ (no test file — manual inspect acceptable) |
| UX-03 | v1.0 JSON loads without errors and computes correct CPM | unit | `cd web && npm test -- --run src/persistence/serialize.test.ts` | ❌ Wave 0: add test in serialize.test.ts |
| UX-04 | serialize.ts edge ID comment present | manual | Inspect serialize.ts line ~69 | ✅ (code comment, no automated test needed) |

### Sampling Rate
- **Per task commit:** `cd web && npm test -- --run`
- **Per wave merge:** `cd web && npm test -- --run`
- **Phase gate:** Failure count must not increase above 11 (pre-existing failures); all new tests added in this phase must pass

### Wave 0 Gaps
- [ ] `web/src/persistence/serialize.test.ts` — add UX-03 backward-compatibility test (file exists, add describe block)

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `HelpOverlay.tsx` — confirmed single offending text at line 132
- Direct code inspection of `serialize.ts` — confirmed edge ID scheme at line 69, no schema changes between v1.0 and v2.0
- Direct code inspection of `validate.ts`, `compute.ts` — confirmed English error strings vs German test expectations
- `web/package.json` — confirmed Vitest 3.2.4, no missing dependencies

### Secondary (MEDIUM confidence)
- Test run output (`npm test -- --run`) — confirmed exactly 11 pre-existing failures across 5 files, failure categories identified

### Tertiary (LOW confidence)
- N/A — no web searches required; all findings derived from direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, existing stack fully verified
- Architecture: HIGH — all change sites identified with exact line numbers
- Pitfalls: HIGH — pre-existing failures directly observed and counted

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable domain; only risk is if Phase 3 results are further modified)
