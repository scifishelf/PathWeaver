# Technology Stack

**Analysis Date:** 2026-03-16

## Languages

**Primary:**
- TypeScript ~5.9.3 - Source code, components, utilities
- JSX/TSX - React component markup

**Secondary:**
- JavaScript - Configuration files
- CSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js (version from .nvmrc or package manager default)

**Browser:**
- Modern ES2022+ browsers with DOM, DOM.Iterable support

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- React 19.1.1 - UI library and component framework
- Vite 7.1.7 - Build tool and dev server
- ReactFlow 11.11.4 - Graph/node visualization library for network diagrams

**State Management:**
- Zustand 5.0.8 - Lightweight state management (though not extensively used in current codebase)
- Immer 10.1.3 - Immutable state updates

**Utilities:**
- date-fns 4.1.0 - Date parsing and manipulation for workday calculations
- dom-to-image-more 3.7.1 - DOM-to-image rendering for PNG export

**Testing:**
- Vitest 3.2.4 - Unit test runner
- Playwright 1.56.0 - E2E testing framework
- Testing Library React 16.3.0 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @testing-library/user-event 14.6.1 - User interaction simulation
- jsdom 27.0.0 - DOM implementation for Node.js

**Build/Dev:**
- TypeScript 5.9.3 - Type checking and compilation
- ESLint 9.36.0 - Code linting
- Prettier 3.6.2 - Code formatting
- Tailwind CSS 4.1.14 - Utility-first CSS framework
- PostCSS 8.5.6 - CSS transformations
- Autoprefixer 10.4.21 - Vendor prefixes for CSS

**Development:**
- @vitejs/plugin-react 5.0.4 - React support in Vite
- @types/react 19.1.16 - React type definitions
- @types/react-dom 19.1.9 - ReactDOM type definitions
- @types/node 24.6.0 - Node.js type definitions
- @types/jsdom 27.0.0 - jsdom type definitions
- eslint-plugin-react-hooks 5.2.0 - React Hooks linting
- eslint-plugin-react-refresh 0.4.22 - React Fast Refresh support
- typescript-eslint 8.45.0 - TypeScript linting support
- globals 16.4.0 - Global variables for linting

## Key Dependencies

**Critical:**
- reactflow 11.11.4 - Why it matters: Core visualization engine for network/project graphs; custom node types (StartNode, EndNode, TaskNode) depend entirely on this
- react 19.1.1 - Why it matters: UI framework; all components built on React

**Infrastructure:**
- date-fns 4.1.0 - Workday and date calculations for Critical Path Method (CPM) timelines
- immer 10.1.3 - Safe immutable state updates across node/edge modifications

## Configuration

**Environment:**
- No .env files detected - Application is static/client-only with no external service dependencies
- Configuration via TypeScript compile options and Vite config

**Build:**
- `vite.config.ts` - Vite build configuration with React plugin and Vitest setup
- `tsconfig.json` - TypeScript root configuration with project references
- `tsconfig.app.json` - Application compilation target ES2022, JSX support, strict mode enabled
- `tsconfig.node.json` - Configuration for build/Node files
- `eslint.config.js` - ESLint configuration with TypeScript, React hooks, React refresh rules
- `vitest.setup.ts` - Test environment setup with Testing Library and ResizeObserver polyfill for jsdom

## Platform Requirements

**Development:**
- Node.js with npm
- Modern code editor (TypeScript support recommended)

**Production:**
- Static file hosting (HTML + bundled assets)
- No backend required - entirely client-side application
- No external services or APIs required

**Browser Support:**
- ES2022 compatible browsers
- DOM ResizeObserver API support (polyfilled for testing)

---

*Stack analysis: 2026-03-16*
