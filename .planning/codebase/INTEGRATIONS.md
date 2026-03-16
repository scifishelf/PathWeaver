# External Integrations

**Analysis Date:** 2026-03-16

## APIs & External Services

**None detected** - This is a client-only application with no external API integrations.

## Data Storage

**Databases:**
- None - Application uses browser localStorage only

**Local Storage:**
- Browser localStorage via Web Storage API
  - Current project: Key `pw_autosave_current` - stores last working state with timestamp
  - Project snapshots: Key `pw_snapshots_v1` - maintains up to 10 historical snapshots
  - Location: `src/persistence/autosave.ts`

**File Storage:**
- Local filesystem only (user-initiated file downloads)
  - Export format: JSON (`.json` files)
  - Export format: PNG via dom-to-image-more (`src/components/AppToolbar.tsx`)
  - Import format: JSON files with ProjectJSON schema validation

**Caching:**
- Browser caching via Vite build output
- No external cache service

## Authentication & Identity

**Auth Provider:**
- None - No authentication required
- Application is public/anonymous - no user accounts

## Monitoring & Observability

**Error Tracking:**
- None - No external error tracking service

**Logs:**
- Console logging only (development/debugging)
- No persistent logging

## CI/CD & Deployment

**Hosting:**
- Not specified in codebase - Typically static hosting (Netlify, Vercel, GitHub Pages, etc.)

**CI Pipeline:**
- GitHub Actions workflow files present in `.github/workflows/`
- No other CI/CD services detected in codebase

## Environment Configuration

**Required env vars:**
- None - Application requires no environment variables

**Secrets location:**
- Not applicable - No secrets used

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Data Exchange Formats

**Project Export/Import:**
- Format: JSON (ProjectJSON schema)
- Location: `src/persistence/serialize.ts`
- Schema enforced via `validateProjectJSON()` function
- Structure:
  - `settings` - Project configuration (version: "1.0", optional startDate for timeline calculations)
  - `nodes` - Array of tasks with id, type (start/task/end), title, duration, coordinates
  - `edges` - Array of task dependencies (from → to)
  - Optional: `computed` - Critical Path Method results (ES, EF, LS, LF, slack, critical path)

## Persistence Architecture

**Autosave:**
- Trigger: On any change to nodes/edges/startDate
- Debounce: 300ms (prevents excessive writes)
- Location: `src/components/GraphCanvas.tsx` line 114-123
- Storage: `localStorage` key `pw_autosave_current`

**Snapshots:**
- Manual save on user action
- Maximum retention: 10 snapshots
- Location: `src/persistence/autosave.ts`
- Storage: `localStorage` key `pw_snapshots_v1`

**Load on Startup:**
- Automatic restore of last working state from `pw_autosave_current`
- Location: `src/components/GraphCanvas.tsx` line 126-142

## Third-Party Libraries (No Integration)

**Libraries that are NOT external integrations:**
- ReactFlow: Component library, no backend services
- date-fns: Pure utility library for date calculations
- dom-to-image-more: Client-side DOM rendering, no external calls
- Tailwind CSS: CSS framework bundled at build time
- Immer: JavaScript utility library

---

*Integration audit: 2026-03-16*
