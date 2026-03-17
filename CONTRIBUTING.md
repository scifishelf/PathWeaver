# Contributing to PathWeaver

Thank you for your interest in contributing! This document explains how to get started, how the project is structured, and what we expect from contributions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels. Harassment or exclusionary behaviour is not acceptable.

---

## Getting Started

**Prerequisites:**
- [Node.js](https://nodejs.org/) LTS (18 or later)
- [Git](https://git-scm.com/)

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/scifishelf/pathweaver.git
cd pathweaver

# Install dependencies
cd web
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Development Workflow

```bash
cd web

npm run dev          # Start development server with hot-module replacement
npm run build        # Type-check (tsc) + production build
npm run test         # Run all unit tests
npm run test:ui      # Open Vitest browser UI
npm run e2e          # Run Playwright end-to-end tests
npm run lint         # Run ESLint
npm run preview      # Preview the production build
```

Always run `npm run build` and `npm run test` before opening a pull request. Both must pass without errors.

---

## Project Structure

```
pathweaver/
├── web/src/
│   ├── cpm/               # Core algorithm — forward/backward pass, workday math
│   │   ├── compute.ts     # computeCPM() — the heart of the tool
│   │   ├── types.ts       # Shared TypeScript types (ProjectJSON, ComputedResult, …)
│   │   └── workdays.ts    # Date utilities (addWorkdays, nextWorkday)
│   ├── graph/             # Nodes and validation
│   │   ├── StartNode.tsx  # Start node React component
│   │   ├── TaskNode.tsx   # Task node React component
│   │   ├── EndNode.tsx    # End node React component
│   │   ├── validate.ts    # validateGraph() — structural rules
│   │   └── theme.ts       # Design token system (colors, shadows, transitions)
│   ├── components/        # Application UI
│   │   ├── GraphCanvas.tsx  # Main React Flow canvas, CPM integration
│   │   ├── AppToolbar.tsx   # Export / import / snapshot controls
│   │   ├── HelpOverlay.tsx  # Help modal
│   │   └── …
│   └── persistence/       # LocalStorage layer
│       ├── autosave.ts    # Debounced autosave, snapshot CRUD
│       └── serialize.ts   # JSON serialization, isProjectJSON type guard
└── docs/
    ├── json-format.md       # Data format specification
    ├── json-schema.v1.json  # JSON Schema for project files
    └── testdaten/           # Example project files + authoring rules
```

---

## Coding Standards

### TypeScript
- Strict mode is enabled (`"strict": true` in `tsconfig.app.json`). No `any` casts — use discriminated unions or type guards instead.
- Export only what is needed. Prefer named exports over default exports for utilities.
- Place shared types in `cpm/types.ts`; node-specific types stay in the component file.

### React
- Functional components with hooks only — no class components.
- Keep components focused. Extract logic into custom hooks or pure functions if a component grows beyond ~200 lines.
- Do not reach into sibling state; keep data flow top-down or via callbacks.

### Styling
- Use the design tokens in `graph/theme.ts` instead of hardcoded hex values or arbitrary Tailwind colours.
- Tailwind utility classes are fine for layout (flex, grid, padding, margin). Use the token system for colours, shadows, and transitions.

### CPM Engine Rules
The CPM engine has one hard constraint that is **not** enforced visually in the UI but will cause a `ComputeError` at runtime:

> **A `task` node may have at most one outgoing edge.**

Only the `start` node may fan out into multiple parallel branches. Refer to [`docs/testdaten/REGELN.md`](docs/testdaten/REGELN.md) for the full authoring rules when creating test or demo data.

---

## Testing

PathWeaver uses **Vitest** for unit tests and **Playwright** for end-to-end tests.

### Unit Tests

Test files live next to the source file they cover (`*.test.ts` / `*.test.tsx`).

```bash
npm run test          # Run all tests once
npm run test:ui       # Interactive Vitest UI
```

**Coverage expectations:**
- New functions in `cpm/` and `graph/validate.ts` require unit tests.
- UI components require tests for non-trivial behaviour (e.g. conditional rendering, user interaction).
- Aim for test descriptions that read as behaviour specifications, not implementation details.

```ts
// Good
it('marks a node as critical when its slack equals zero', () => { … })

// Avoid
it('sets critical to true', () => { … })
```

### End-to-End Tests

```bash
npm run e2e
```

E2E tests cover user-visible workflows (adding nodes, creating edges, exporting JSON). When introducing a significant new feature, add or update a Playwright test.

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>
```

| Type | When to use |
|---|---|
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `test` | Adding or updating tests (no production code changes) |
| `refactor` | Internal restructuring without behaviour changes |
| `docs` | Documentation only |
| `chore` | Build scripts, dependency updates, config |
| `perf` | Performance improvements |

**Examples:**

```
feat(cpm): add workweek configuration to project settings
fix(graph): prevent orphan check false-positive on start node
test(persistence): add autosave QuotaExceededError edge case
docs: update JSON format spec with workweek field
```

Keep the summary line under 72 characters and written in the imperative mood ("add", "fix", "remove" — not "added", "fixes", "removing").

---

## Submitting a Pull Request

1. **Create a branch** off `main` with a descriptive name:
   ```bash
   git checkout -b feat/workweek-configuration
   ```

2. **Make your changes.** Keep commits atomic — one logical change per commit.

3. **Verify locally:**
   ```bash
   npm run build   # Must pass (type-check + build)
   npm run test    # All tests must pass
   npm run lint    # No lint errors
   ```

4. **Update documentation** if your change affects the data format, public API, or user-visible behaviour. Update `CHANGELOG.md` under `[Unreleased]`.

5. **Open a pull request** against `main`. Fill in the PR template:
   - What does this change do and why?
   - How was it tested?
   - Are there any breaking changes?
   - Screenshots for visual changes.

6. **Address review feedback** — keep the conversation focused and constructive. Force-pushing to your PR branch is fine; force-pushing to `main` is not.

---

## Reporting Issues

Before opening an issue, please search existing issues to avoid duplicates.

When reporting a bug, include:
- PathWeaver version (visible in the toolbar) or commit SHA
- Browser and OS
- Steps to reproduce
- Expected vs. actual behaviour
- A minimal JSON project file that triggers the bug (if applicable)

For feature requests, describe the use case first — what problem are you trying to solve, and why existing features don't cover it?

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
