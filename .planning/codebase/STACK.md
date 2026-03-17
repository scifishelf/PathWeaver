# Technology Stack

**Analysis Date:** 2026-03-17

## Languages

**Primary:**
- TypeScript 5.9 - All source code in `web/src/`

**Secondary:**
- JavaScript (ESM modules) - Runtime execution in browsers

## Runtime

**Environment:**
- Node.js LTS (18 or later) - Development environment

**Package Manager:**
- npm
- Lockfile: `web/package-lock.json` (present)

## Frameworks

**Core:**
- React 19.1.1 - UI component framework
- ReactFlow 11.11.4 - Graph visualization and node-based editor

**Testing:**
- Vitest 3.2.4 - Unit test runner with JSDOM environment
- @testing-library/react 16.3.0 - React component testing utilities
- @testing-library/user-event 14.6.1 - User interaction simulation
- @playwright/test 1.56.0 - End-to-end testing framework

**Build/Dev:**
- Vite 7.1.7 - Development server and production bundler
- @vitejs/plugin-react 5.0.4 - React JSX transformation for Vite
- TypeScript compiler (tsc) - Pre-build type checking with `tsc -b`

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS framework
- PostCSS 8.5.6 - CSS transformation pipeline
- Autoprefixer 10.4.21 - Vendor prefix auto-addition

**Linting & Formatting:**
- ESLint 9.36.0 - JavaScript/TypeScript linter
- @eslint/js 9.36.0 - ESLint recommended JS rules
- typescript-eslint 8.45.0 - TypeScript-specific ESLint support
- eslint-plugin-react-hooks 5.2.0 - React Hooks linting rules
- eslint-plugin-react-refresh 0.4.22 - Fast Refresh validation
- Prettier 3.6.2 - Code formatter
- eslint-config-prettier 10.1.8 - Disables ESLint rules conflicting with Prettier

## Key Dependencies

**Critical:**
- date-fns 4.1.0 - Date manipulation and formatting; used for workday calculations and date-aware scheduling in `src/cpm/workdays.ts`
- html-to-image 1.11.13 - PNG export functionality; converts canvas to downloadable image in toolbar
- lucide-react 0.577.0 - Icon library; used throughout UI components for buttons, help, context menus

**Utilities:**
- @types/react 19.1.16 - React type definitions
- @types/react-dom 19.1.9 - React DOM type definitions
- @types/node 24.6.0 - Node.js type definitions for dev tools
- globals 16.4.0 - ESLint globals configuration

**Testing Utilities:**
- @testing-library/jest-dom 6.9.1 - DOM matchers for assertions
- jsdom 27.0.0 - DOM implementation for JSDOM environment in Vitest

## Configuration

**Environment:**
- No `.env` file required — application is fully client-side with no backend
- All configuration is done via TypeScript/JavaScript constants

**Build:**
- `web/tsconfig.json` - TypeScript references configuration
- `web/tsconfig.app.json` - Application compilation settings
  - Target: ES2022
  - Module: ESNext
  - Strict mode enabled
  - JSX: react-jsx
- `web/tsconfig.node.json` - Build tool TypeScript configuration
- `web/vite.config.ts` - Vite bundler configuration
- `web/eslint.config.js` - ESLint configuration (flat config format)
- `web/vitest.setup.ts` - Vitest test environment setup
  - jsdom environment
  - ResizeObserver polyfill for React Flow

**Output:**
- Built application: `web/dist/`
- Package: ES modules (type: "module" in package.json)

## Platform Requirements

**Development:**
- Node.js 18+ LTS
- npm (included with Node.js)
- Modern browser with ES2022 support
- 1200px minimum viewport width (enforced in `src/App.tsx`)

**Production:**
- Static file hosting (Hetzner Cloud deployment via GitHub Actions)
- No backend server required
- No database required
- Browser compatibility: ES2022-capable browsers (Chrome 51+, Firefox 67+, Safari 14+, Edge 79+)

## Scripts

**Development:**
- `npm run dev` - Start Vite dev server (port 5173)
- `npm run preview` - Preview production build locally

**Production:**
- `npm run build` - Type-check with `tsc -b` then build with `vite build`
- Output: `web/dist/` directory

**Quality:**
- `npm run lint` - Run ESLint on all TS/TSX files
- `npm run test` - Run Vitest unit tests
- `npm run test:ui` - Run Vitest with browser UI

**Testing:**
- `npm run e2e` - Run Playwright end-to-end tests

## Build Output

- Single-page application (SPA)
- Code splitting at component level via Vite
- Production bundle: minified JavaScript and CSS
- Static assets: SVG favicons, images
- No server-side rendering (SSR)

---

*Stack analysis: 2026-03-17*
