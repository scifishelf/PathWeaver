---
phase: 2
slug: ui-clean-professional
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 (globals: true) |
| **Config file** | `web/vite.config.ts` — `test.environment: 'jsdom'`, `test.setupFiles: ['./vitest.setup.ts']` |
| **Quick run command** | `cd web && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd web && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd web && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd web && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-??-01 | 01 | 1 | UI-FOUND-01 | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ needs update | ⬜ pending |
| 2-??-02 | 01 | 1 | UI-FOUND-02 | manual/lint | `grep -rn '#[0-9a-fA-F]\{3,6\}' web/src/` | ❌ W0 | ⬜ pending |
| 2-??-03 | 01 | 1 | UI-TOOLBAR-01 | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ needs update | ⬜ pending |
| 2-??-04 | 01 | 1 | UI-TOOLBAR-02 | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ needs update | ⬜ pending |
| 2-??-05 | 01 | 1 | UI-TOOLBAR-03 | manual | Browser keyboard nav | manual-only | ⬜ pending |
| 2-??-06 | 02 | 2 | UI-CRIT-01 | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ needs update | ⬜ pending |
| 2-??-07 | 02 | 2 | UI-CRIT-02 | unit | `cd web && npx vitest run src/graph/TaskNode.test.tsx` | ❌ W0 | ⬜ pending |
| 2-??-08 | 03 | 3 | UI-POLISH-01 | unit | `cd web && npx vitest run src/cpm/workdays.test.ts` | ✅ needs update | ⬜ pending |
| 2-??-09 | 03 | 3 | UI-POLISH-02 | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ needs update | ⬜ pending |
| 2-??-10 | 03 | 3 | UI-POLISH-03 | unit | `cd web && npx vitest run src/App.test.tsx` | ✅ likely covered | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `web/src/graph/TaskNode.test.tsx` — stubs for UI-CRIT-02 (critical node border render)
- [ ] `web/src/App.test.tsx` assertion updates — update description "MVP header" → "app header"; add assertion that `(MVP)` text is NOT present in rendered output

*Existing `workdays.test.ts` infrastructure covers UI-POLISH-01 with one new test case — no new file needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| focus-visible on all toolbar interactive elements | UI-TOOLBAR-03 | CSS `:focus-visible` states are not testable in jsdom environment | Tab through all toolbar buttons in Chrome DevTools; verify blue outline appears on each; test with keyboard-only navigation |
| No hardcoded hex values remain in component files | UI-FOUND-02 | ESLint rule would need custom plugin; grep check is fast and reliable | Run `grep -rn '#[0-9a-fA-F]\{3,6\}' web/src/components/ web/src/graph/` and verify zero matches |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
