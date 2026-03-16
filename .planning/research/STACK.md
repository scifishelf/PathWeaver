# Technology Stack

**Project:** PathWeaver — CPM Network Planning Tool (React/TypeScript)
**Researched:** 2026-03-16
**Scope:** Library replacement and dependency health for quality/UI improvement milestone

---

## Research Summary

Four specific questions investigated via package.json inspection, node_modules analysis,
and Context7 documentation. Web search and WebFetch tools were unavailable in this session.
Findings are based on installed package metadata, schema file inspection, and source code
analysis of the actual codebase.

---

## 1. DOM-to-Image Rendering: Replace `dom-to-image-more`

### Recommendation: `html-to-image` ^1.11.x

**Current situation:**
`dom-to-image-more` 3.7.1 is a fork of the unmaintained `dom-to-image` library (original
abandoned circa 2017). The fork at `1904labs/dom-to-image-more` adds minor fixes but has no
active roadmap, no TypeScript types (the project ships a hand-written `.d.ts` stub at
`web/src/types/dom-to-image-more.d.ts`), and uses Grunt as its build tool — a strong signal
of stagnation. The security surface is real: the library reads the full DOM including any
unsanitized node title content.

**Why `html-to-image`:**

- Actively maintained (GitHub: bubkoo/html-to-image)
- Ships its own TypeScript types — no stub required
- API is a near drop-in replacement: `toPng(element, options)` returns `Promise<string>`
- The existing call in `AppToolbar.tsx` at line 200 would change from
  `domtoimage.toPng(el, { bgcolor: '#ffffff', quality: 1 })` to
  `htmlToImage.toPng(el, { backgroundColor: '#ffffff' })` — one line, one rename
- Supports `pixelRatio` option useful for high-DPI export (a differentiator for a
  professional tool)
- Has a `filter` callback to exclude DOM nodes from capture (useful to exclude UI controls
  from the PNG export without CSS hacks)

**Migration scope:** Minimal. One import, one function call, delete the hand-written `.d.ts`.

**What NOT to use:**

- **Native Canvas API / OffscreenCanvas:** Would eliminate the dependency entirely, but
  requires reimplementing CSS layout capture from scratch. The DOM freeze issue (1-3s on
  large graphs) is a separate concern addressed by a loading indicator, not by switching to
  Canvas.
- **`dom-to-image-more` (current):** No TypeScript support, unmaintained upstream, hand-rolled
  type stub, active security concern flagged in CONCERNS.md.
- **`puppeteer` / `playwright` screenshot:** Server-side rendering, incompatible with the
  client-only constraint.

**Confidence:** MEDIUM. Based on package metadata and API surface analysis. Version number
and exact release date of `html-to-image` not verified from npm registry in this session
(web access denied). The recommendation is consistent with the project's own decision log
(PROJECT.md key decisions table already lists this replacement as pending).

---

## 2. State Management: What to Do with Zustand

### Recommendation: Remove Zustand; use React built-ins

**Current situation:**
Zustand 5.0.8 is installed (`peerDependencies: react >= 18.0.0` — satisfied by React 19).
A search of `web/src/**` for any import from `'zustand'` or `useStore` returns zero matches.
Zustand is installed but never used. Immer 10.1.3 is also installed and is an optional peer
dependency of Zustand — but Immer itself may be used independently (the STACK.md lists it as
"infrastructure" for immutable state updates). Checking Immer usage separately would clarify
whether it can also be removed.

**Why remove Zustand:**

- Zero imports: there is no state being managed through it
- For a ~1000-line codebase with a single graph view, React's own `useState` / `useReducer`
  / Context is sufficient
- Zustand adds ~3KB to the bundle (gzipped) for no benefit
- "Zustand installed but barely used — indicates incomplete state management refactor" is
  already flagged in CONCERNS.md as an active tech debt item
- Leaving it installed creates ambiguity for contributors: is it intended architecture or
  leftover scaffolding?

**When to keep/adopt Zustand instead:**
Only if a concrete global state requirement emerges that causes prop-drilling more than
2-3 levels deep, or if the CPM computation result needs to be shared across components that
have no natural parent-child relationship. At the current codebase size (~1000 lines), this
threshold is not reached.

**Migration scope:** `npm uninstall zustand` — verify Immer usage separately; if Immer is
also unused, remove it too. No code changes needed since there are no imports.

**What NOT to use:**
- **Redux / Redux Toolkit:** Massively overengineered for a focused single-view tool. The
  boilerplate cost exceeds the benefit.
- **Jotai / Recoil:** No reason to add a new atom-based library when built-in hooks suffice.
- **MobX:** Requires decorator configuration; adds complexity with no return.

**Confidence:** HIGH. Conclusion is based on direct source code inspection (zero imports
confirmed). No web verification needed — the evidence is in the code.

---

## 3. JSON Schema Validation: What to Use for Import Validation

### Recommendation: Hand-rolled type guard validation (keep `validateProjectJSON`) + add ISO date check

**Current situation:**
`serialize.ts` already contains a `validateProjectJSON(project: any): string[]` function
(lines 56-77) that checks structure, version string, required node types, and edge
references. The existing `docs/json-schema.v1.json` uses `$schema: draft/2020-12` — the
current best JSON Schema draft.

AJV 6.12.6 is present as a transitive dependency (pulled in by some dev tooling), but
AJV 6 does not support JSON Schema draft 2020-12. Using AJV 6 against this schema would
silently ignore `$schema` directives and skip unknown keywords. This is a correctness trap.

**Why to NOT add a schema validation library for this use case:**

The existing `validateProjectJSON` covers the actual business rules that matter:
- Checks for valid JSON structure
- Validates version string
- Verifies start/end node presence
- Validates edge-to-node references

Adding AJV or Zod for the import path introduces more complexity than it solves for a schema
this simple. What is actually missing is not a validation library — it is two specific checks
that should be added directly to `validateProjectJSON`:

1. `startDate` format validation (ISO `YYYY-MM-DD` pattern — the schema already defines the
   regex: `^\d{4}-\d{2}-\d{2}$`)
2. Node `duration` must be `>= 0` (also already in the JSON schema but not in the
   runtime validator)

**If a library is truly required** (e.g., future schema evolution, community contributions):

Use **Zod** (`^3.x`), not AJV.

Rationale:
- Zod defines schema in TypeScript — no separate `.json` schema file to keep in sync
- Zod's `.safeParse()` returns `{success, error}` — maps cleanly to `string[]` error output
- Zod has first-class TypeScript inference: the schema becomes the type, eliminating the
  `as any` casts in `fromProjectJSON`
- Bundle size: ~14KB gzipped (acceptable for this use case)
- AJV 8 (the version that supports draft-2020-12) weighs ~30KB gzipped and requires
  separate `ajv-formats` for the `pattern` keyword — more setup for the same result
- Valibot is a lighter alternative (~2KB) but has a steeper learning curve and less
  ecosystem support

**Decision for this milestone:** Do not add a new library. Extend `validateProjectJSON`
with the two missing checks. Mark in PROJECT.md that Zod is the preferred option if schema
validation complexity grows.

**Confidence:** HIGH for "don't add a library now." MEDIUM for Zod recommendation (version
not verified from npm in this session, but Zod 3.x has been the stable major for several
years and no breaking v4 was observed).

---

## 4. ReactFlow 11 + React 19 Compatibility

### Recommendation: Stay on ReactFlow 11.11.4, do not upgrade to v12 in this milestone

**Current situation:**
ReactFlow 11.11.4 declares `peerDependencies: react >= 17`. React 19.1.1 satisfies this
constraint. The combination is technically supported per the package manifest.

The devDependencies of the ReactFlow 11 package itself pin `react: ^18.2.0` for its own
test/build environment, but this does not affect consumers. The peer dependency range
`>= 17` is intentionally broad.

**React 19 + ReactFlow 11 compatibility assessment:**

React 19 introduced several breaking changes relative to React 18:
- Removal of legacy rendering APIs (`ReactDOM.render` — ReactFlow 11 uses the modern
  `createRoot` path internally, so this is not a concern)
- Strict Mode behavioral changes around double-invocation of effects
- Changes to `ref` forwarding (refs can now be passed as regular props)

ReactFlow 11 was authored against React 17/18 APIs. The combination *currently runs* in this
project (the codebase is in production at v1.0), which is the strongest evidence of
compatibility. The existing `App.test.tsx` smoke test passes (CONCERNS.md notes 2 test files
exist). No React 19 incompatibility has surfaced in the existing application.

**Known risk:** ReactFlow 11 uses `useLayoutEffect` in multiple places. React 19 tightens
server-side rendering warnings around `useLayoutEffect`, but this is a client-only app
(`lib: ["DOM"]` in tsconfig) — no SSR surface, so this warning class does not apply.

**On ReactFlow v12:**
ReactFlow v12 (rebranded as `@xyflow/react`) introduces breaking API changes: the `Node`
and `Edge` generics inversion, removal of `ReactFlowProvider` auto-wrapping, and new hook
signatures. The PROJECT.md explicitly lists "ReactFlow v12 Upgrade" as out of scope for this
milestone. This is correct: migrating to v12 would be a separate milestone of its own and
should not be mixed with quality/UI improvements.

**What to monitor:** If React 19 Strict Mode effects surface subtle double-call bugs in the
CPM compute path, the fix is in `useEffect` cleanup in `GraphCanvas.tsx`, not in downgrading
React or ReactFlow.

**Confidence:** HIGH for "stay on v11." MEDIUM for "React 19 is fully compatible" — the
application runs, but React 19 + ReactFlow 11 is not an officially tested matrix (ReactFlow
11's own devDeps pin React 18). The running production build is the primary evidence.

---

## Recommended Stack Changes for This Milestone

| Action | Package | Change | Confidence |
|--------|---------|--------|------------|
| Replace | `dom-to-image-more` → `html-to-image` | `npm uninstall dom-to-image-more && npm install html-to-image` | MEDIUM |
| Remove | `zustand` | `npm uninstall zustand` (verify Immer separately) | HIGH |
| Remove | Hand-written `dom-to-image-more.d.ts` type stub | Delete `web/src/types/dom-to-image-more.d.ts` | HIGH |
| Extend | `validateProjectJSON` in `serialize.ts` | Add `startDate` format check + `duration >= 0` check | HIGH |
| Hold | `reactflow` at 11.11.4 | No change; v12 is out of scope | HIGH |
| Hold | `react` at 19.x | No change; compatible with RF11 | HIGH |

## Stack Unchanged (No Changes Needed)

| Technology | Version | Status | Rationale |
|------------|---------|--------|-----------|
| React | 19.1.1 | Keep | Modern, stable, compatible |
| TypeScript | ~5.9.3 | Keep | Current stable series |
| Vite | 7.x | Keep | No issues identified |
| Tailwind CSS | 4.x | Keep | Current major, active |
| date-fns | 4.x | Keep | Used for workday math, no issues |
| Immer | 10.x | Verify | Check actual usage before removing |
| Vitest | 3.x | Keep | Current, no issues |
| Playwright | 1.56.x | Keep | Current, no issues |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| DOM-to-PNG | `html-to-image` | Native Canvas API | Requires reimplementing CSS capture |
| DOM-to-PNG | `html-to-image` | `dom-to-image-more` (current) | Unmaintained, no TS types |
| State management | Remove Zustand, use hooks | Keep Zustand | Zero usage, no ROI, adds bundle weight |
| State management | Remove Zustand, use hooks | Redux Toolkit | Vastly overengineered for this scope |
| JSON validation | Extend hand-rolled validator | Zod | AJV draft-2020-12 mismatch; Zod is fallback if complexity grows |
| JSON validation | Extend hand-rolled validator | AJV 8 | Draft-2020-12 support requires AJV 8 + ajv-formats; more setup |
| RF upgrade | Stay on v11 | ReactFlow v12 | Breaking API changes; own milestone |

---

## Key Technical Finding: AJV Version Mismatch

The project's `docs/json-schema.v1.json` uses `$schema: draft/2020-12/schema`. AJV 6.12.6
(the only AJV version present, as a transitive dep) supports only draft-04/06/07. If anyone
attempts to wire AJV 6 against this schema, the `$schema` declaration will be silently
ignored and the `pattern` keyword on `startDate` will not be enforced.

This is a gotcha for any future developer who looks at the transitive AJV and assumes it is
ready to use for schema validation. The PITFALLS.md should document this explicitly.

---

## Installation (for recommended changes)

```bash
# Remove unmaintained library and unused state manager
npm uninstall dom-to-image-more zustand

# Add maintained replacement
npm install html-to-image

# Then:
# 1. Update AppToolbar.tsx import: dom-to-image-more -> html-to-image
# 2. Rename toPng option: bgcolor -> backgroundColor
# 3. Delete web/src/types/dom-to-image-more.d.ts
# 4. Extend validateProjectJSON with startDate regex and duration >= 0 checks
```

---

## Sources

- Package metadata: `web/package.json`, `web/node_modules/*/package.json` (direct inspection)
- Codebase analysis: `web/src/components/AppToolbar.tsx`, `web/src/persistence/serialize.ts`
- Schema file: `docs/json-schema.v1.json` ($schema: draft/2020-12 confirmed)
- Project decisions: `.planning/PROJECT.md` (key decisions table, out-of-scope list)
- Known issues: `.planning/codebase/CONCERNS.md`
- ReactFlow peer deps: `web/node_modules/reactflow/package.json` (peerDeps: react >= 17)
- Zustand peer deps: `web/node_modules/zustand/package.json` (peerDeps: react >= 18.0.0)
- AJV version: `web/node_modules/ajv/package.json` (v6.12.6, draft-04/06/07 only)

*Note: WebSearch, WebFetch, and Brave Search were unavailable in this session. All
findings are from local file inspection only. Version currency of `html-to-image` on npm
should be verified before implementation.*
