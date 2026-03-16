---
phase: 1
slug: code-quality-stability
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `web/vite.config.ts` (test section: globals=true, environment=jsdom) |
| **Quick run command** | `cd web && npm test -- --run` |
| **Full suite command** | `cd web && npm run build && npm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd web && npm test -- --run`
- **After every plan wave:** Run `cd web && npm run build && npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-??-01 | 01 | 0 | TEST-01, TYPES-01 | unit | `cd web && npm test -- --run src/persistence/serialize.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-02 | 01 | 0 | TEST-02 | unit | `cd web && npm test -- --run src/graph/validate.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-03 | 01 | 0 | TEST-03, ERR-03 | unit | `cd web && npm test -- --run src/cpm/workdays.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-04 | 01 | 0 | ERR-02, BUG-01, BUG-02 | unit | `cd web && npm test -- --run src/persistence/autosave.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-05 | 01 | 0 | TEST-04 | unit | `cd web && npm test -- --run src/cpm/compute.test.ts` | ✅ (extend) | ⬜ pending |
| 1-??-06 | 01 | 1 | DEPS-01, DEPS-03 | static | `cd web && npm run build` | n/a | ⬜ pending |
| 1-??-07 | 01 | 1 | DEPS-02 | static | `cd web && npm run build` | n/a | ⬜ pending |
| 1-??-08 | 01 | 1 | TYPES-01, TYPES-02, TYPES-03 | static+unit | `cd web && npm run build && npm test -- --run src/persistence/serialize.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-09 | 01 | 1 | ERR-01, ERR-02, ERR-03 | unit | `cd web && npm test -- --run src/persistence/autosave.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-10 | 01 | 1 | BUG-01, BUG-02, BUG-03, BUG-04, BUG-05 | unit+static | `cd web && npm test -- --run && npm run build` | ❌ W0 | ⬜ pending |
| 1-??-11 | 01 | 1 | SNAP-01, SNAP-02 | manual | see Manual-Only Verifications | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `web/src/persistence/serialize.test.ts` — stubs for TEST-01, TYPES-01
- [ ] `web/src/graph/validate.test.ts` — stubs for TEST-02
- [ ] `web/src/cpm/workdays.test.ts` — stubs for TEST-03, ERR-03
- [ ] `web/src/persistence/autosave.test.ts` — stubs for ERR-02, BUG-01, BUG-02

*`web/src/cpm/compute.test.ts` already exists — extend for TEST-04, do not create new file.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| T-shortcut creates node in viewport center | BUG-05 | ReactFlow viewport integration — no automated test for visual placement | Open app, press T, confirm node appears in visible canvas center |
| T-shortcut node starts in edit mode | BUG-05 | DOM focus behavior — jsdom cannot verify actual input focus in browser | Press T, confirm title input is focused immediately without double-click |
| T-shortcut disabled when input focused | BUG-05 | Event propagation — requires browser interaction | Click into a title input field, press T, confirm no new node is created |
| Snapshot key has random suffix | SNAP-02 | Random suffix verified in unit test; UI display is manual | Create snapshot, check localStorage key in DevTools |
| `html-to-image` PNG export works | DEPS-02 | Requires actual canvas rendering in browser | Open app, export PNG, confirm file downloads with correct content |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
