# Deferred Items — Phase 02

Items discovered during execution that are out of scope for the current plan.

## From Plan 02-04

**StartNode.tsx input background uses '#fff' instead of COLOR_BG**

- File: `web/src/graph/StartNode.tsx` line 38
- Issue: `background: '#fff'` on the date input inside StartNode
- Discovered: During final verification check in Plan 02-04
- Status: Pre-existing from Plan 02-03 (not introduced by 02-04)
- Fix: Replace `'#fff'` with `COLOR_BG` import from `./theme`
- Priority: Low — visually identical value, no user-visible impact
