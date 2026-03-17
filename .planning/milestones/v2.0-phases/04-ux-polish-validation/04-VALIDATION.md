---
phase: 4
slug: ux-polish-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `web/vite.config.ts` (test section) |
| **Quick run command** | `cd web && npm test -- --run` |
| **Full suite command** | `cd web && npm test -- --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd web && npm test -- --run`
- **After every plan wave:** Run `cd web && npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green (max 11 failures — pre-existing)
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | UX-03 | unit | `cd web && npm test -- --run src/persistence/serialize.test.ts` | ❌ W0: add test | ⬜ pending |
| 4-01-02 | 01 | 1 | UX-02 | manual | `grep -r "Max. 1 outgoing" web/src/` | ✅ | ⬜ pending |
| 4-01-03 | 01 | 1 | UX-04 | manual | `grep -A3 "Edge IDs use" web/src/persistence/serialize.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `web/src/persistence/serialize.test.ts` — add UX-03 backward-compatibility test (file exists, add `describe('v1.0 backward compatibility')` block)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HelpOverlay contains no "Max. 1 outgoing" text | UX-02 | UI text change; no automated render test for this string | `grep -r "Max. 1 outgoing" web/src/` must return 0 matches |
| serialize.ts edge ID comment present | UX-04 | Code comment; no automated test needed | Read `web/src/persistence/serialize.ts` line ~69; comment must be present |

---

## Pre-Existing Test Failures (Do Not Fix in Phase 4)

**Count:** 11 failures across 5 files (German/English string mismatch)

| File | Count | Root Cause |
|------|-------|------------|
| `serialize.test.ts` | 2 | German string expectations vs English implementation |
| `validate.test.ts` | 4 | German string expectations vs English implementation |
| `autosave.test.ts` | 2 | German string expectations vs English implementation |
| `compute.test.ts` | 2 | German string expectations vs English implementation |
| `App.test.tsx` | 1 | Unrelated render issue |

**Phase 4 gate:** Failure count must NOT increase above 11. Any new tests added must pass.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
