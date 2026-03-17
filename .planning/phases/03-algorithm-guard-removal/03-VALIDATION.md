---
phase: 3
slug: algorithm-guard-removal
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `web/vite.config.ts` (test section) |
| **Quick run command** | `cd web && npx vitest run src/cpm/compute.test.ts` |
| **Full suite command** | `cd web && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd web && npx vitest run src/cpm/compute.test.ts`
- **After every plan wave:** Run `cd web && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green (40+ passing, same 11 pre-existing failures)
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-W0-01 | Wave 0 | 0 | ALGO-01 | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-02 | Wave 0 | 0 | ALGO-02, ALGO-03 | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ W0 | ⬜ pending |
| 3-W0-03 | Wave 0 | 0 | ALGO-03 | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-01 | 01 | 1 | ALGO-01 | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | ALGO-03 | unit | `cd web && npx vitest run src/cpm/compute.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | ALGO-04, ALGO-05, ALGO-06 | unit | `cd web && npx vitest run` | ✅ exists | ⬜ pending |
| 3-03-01 | 03 | 1 | UX-01 | manual | n/a | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `web/src/cpm/compute.test.ts` — add: "fan-out: multi-successor node does not throw MULTIPLE_OUTGOING" (ALGO-01)
- [ ] `web/src/cpm/compute.test.ts` — add: "diamond graph: both branches highlighted, durationAT correct" (ALGO-02, ALGO-03)
- [ ] `web/src/cpm/compute.test.ts` — add: `criticalNodeIds` is a `Set<string>` containing all zero-slack nodes (ALGO-03)
- [ ] `web/src/cpm/compute.test.ts` — update: `criticalPath` references → `criticalNodeIds` after type change (ALGO-03)

*Note: Pre-existing 11 failing tests (German/English message mismatch) are out of scope — do not fix during Phase 3.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stale closure fix: `isValidConnection` reads live edge state on rapid drag-drop | ALGO-06 | Stale closure behavior not unit-testable in isolation — requires real ReactFlow rendering and rapid interaction | 1. Open app, 2. Create A→B→C chain, 3. Rapidly drag two edges from A — only one should connect; verify no duplicates appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
