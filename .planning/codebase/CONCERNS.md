# CONCERNS.md — Technical Debt, Issues & Areas of Concern

> Generated: 2026-03-16

## Summary

PathWeaver is a relatively clean, focused codebase. Most concerns are manageable for a v1 product. No critical blockers.

---

## Tech Debt

### Silent Error Suppression
- **Where:** Multiple empty/silent catch blocks throughout `web/src/`
- **Impact:** Errors swallowed silently, hard to debug production issues
- **Fix:** Log errors or surface them through error state

### Excessive `as any` / Type Casting
- **Where:** 44+ instances across files, especially in `web/src/components/GraphCanvas.tsx` and `web/src/persistence/serialize.ts`
- **Impact:** TypeScript safety bypassed; runtime type errors possible
- **Fix:** Introduce proper type guards and narrowing

### Unsafe LocalStorage Operations
- **Where:** `web/src/persistence/autosave.ts`
- **Impact:** No error handling for storage quota exceeded; no bounds checking
- **Fix:** Wrap in try/catch, handle `QuotaExceededError`

### Race Conditions with setTimeout
- **Where:** `web/src/components/GraphCanvas.tsx`
- **Impact:** Timing-dependent UI behavior; may cause stale state bugs
- **Fix:** Use React's `useEffect` cleanup or refs instead of raw setTimeout

---

## Known Bugs / Risks

### Type Safety Gap with startDate Prop
- **Where:** `web/src/cpm/types.ts`, `web/src/components/GraphCanvas.tsx`
- **Impact:** startDate passed as optional string but not validated before date arithmetic
- **Fix:** Validate ISO date format before passing to `workdays.ts`

### Potential ID Collisions
- **Where:** `web/src/components/GraphCanvas.tsx` (node ID generation)
- **Impact:** Duplicate node IDs could corrupt graph state
- **Fix:** Use `crypto.randomUUID()` instead of timestamp-based IDs

### Snapshot ID Collisions
- **Where:** `web/src/persistence/autosave.ts`
- **Impact:** Snapshots created within same millisecond could collide
- **Fix:** Add random suffix to snapshot keys

---

## Security

### No JSON Input Validation
- **Where:** `web/src/persistence/serialize.ts` (import path)
- **Impact:** Malformed or oversized JSON files could cause `JSON.parse` to throw or hang
- **Fix:** Validate structure and size before parsing; use schema validation against `docs/json-schema.v1.json`

### Unencrypted LocalStorage
- **Where:** `web/src/persistence/autosave.ts`
- **Impact:** Project data visible in browser dev tools; shared computer risk
- **Severity:** Low — no authentication or sensitive personal data involved
- **Fix:** Not critical for this use case; document as known limitation

### DOM Manipulation via dom-to-image-more
- **Where:** `web/src/components/AppToolbar.tsx` (PNG export)
- **Impact:** Third-party library reads full DOM; potential XSS if node titles contain HTML
- **Fix:** Sanitize node title input; consider native Canvas API

---

## Performance

### Validation Called Multiple Times Per Action
- **Where:** `web/src/graph/validate.ts` called from `GraphCanvas.tsx`
- **Impact:** O(V+E) validation runs redundantly on every edge/node change
- **Fix:** Debounce validation or batch with CPM compute

### Full Snapshots in LocalStorage (10×)
- **Where:** `web/src/persistence/autosave.ts`
- **Impact:** Large graphs stored 10 times; may hit 5MB localStorage quota
- **Fix:** Store diffs or compress snapshots; enforce size limit per snapshot

### DOM Freezing During PNG Export
- **Where:** `web/src/components/AppToolbar.tsx`
- **Impact:** UI freezes for 1–3s on large graphs during PNG export
- **Fix:** Use Web Worker or offscreen canvas; show loading indicator

---

## Fragile Areas

### CPM Compute Function
- **Where:** `web/src/cpm/compute.ts` (174 lines, 4-pass algorithm)
- **Risk:** Complex algorithm with limited test coverage (61 lines of tests)
- **Concern:** Edge cases around cycles, single-node graphs, disconnected subgraphs
- **Fix:** Add more unit tests; especially for error paths and edge cases

### Serialization Bidirectional Transform
- **Where:** `web/src/persistence/serialize.ts`
- **Risk:** `toProjectJSON()` / `fromProjectJSON()` are inverses; round-trip correctness not tested
- **Fix:** Add round-trip serialization tests

### LocalStorage Key Management
- **Where:** `web/src/persistence/autosave.ts`
- **Risk:** Keys hardcoded as strings (`CURRENT_KEY`, snapshot prefix); namespace collisions possible
- **Fix:** Use a namespaced prefix (e.g., `pathweaver_v1_`)

---

## Scaling Limits

### No Holiday Support in Workday Calculations
- **Where:** `web/src/cpm/workdays.ts`
- **Impact:** `addWorkdays()` skips weekends but ignores public holidays
- **Fix:** Inject holiday calendar as parameter

### Performance Degradation at 500+ Nodes
- **Where:** `web/src/components/GraphCanvas.tsx` + ReactFlow rendering
- **Impact:** Re-renders become slow on very large graphs
- **Fix:** Virtualize off-screen nodes; use ReactFlow's `nodesDraggable` optimizations

---

## Dependencies

### dom-to-image-more (Unmaintained Fork)
- **Where:** `web/package.json`, used in `AppToolbar.tsx`
- **Version:** 3.7.1
- **Risk:** Fork of unmaintained library; no recent security updates
- **Fix:** Replace with `html-to-image` (actively maintained) or native Canvas API

### ReactFlow 11.x (Pre-v12 API)
- **Where:** `web/package.json`
- **Risk:** ReactFlow v12 has breaking API changes; upgrading will require significant refactor
- **Fix:** Track ReactFlow changelog; plan upgrade when stability warrants it

### Zustand Installed but Barely Used
- **Where:** `web/package.json` — Zustand 5.0.8
- **Risk:** Adds bundle weight without benefit; indicates incomplete state management refactor
- **Fix:** Either adopt Zustand for global state or remove dependency

---

## Test Gaps

| Area | Status |
|------|--------|
| CPM algorithm (happy paths) | Covered (`compute.test.ts`) |
| App smoke test | Covered (`App.test.tsx`) |
| CPM error paths / edge cases | Not covered |
| Serialization round-trip | Not covered |
| Snapshot persistence | Not covered |
| GraphCanvas integration | Not covered |
| AppToolbar (import/export) | Not covered |
| Graph validation rules | Not covered |
| Playwright E2E tests | Framework installed, tests minimal |

---

## Low-Priority / Cosmetic

- No `CHANGELOG.md` or versioned release notes
- `TopRightDebug.tsx` component is development tooling — should be removed or hidden in production builds
- `buildStamp.ts` generates build timestamp but unclear if surfaced in UI
- `web/public/vite.svg` and `assets/react.svg` are boilerplate files not cleaned up from Vite template
