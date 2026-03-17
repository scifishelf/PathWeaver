# External Integrations

**Analysis Date:** 2026-03-17

## APIs & External Services

**Note:** PathWeaver is fully client-side with **no external API integrations**. The application operates entirely within the browser and requires no backend services.

## Data Storage

**Databases:**
- None — no database required

**File Storage:**
- Local filesystem only
- Browser-based file I/O via:
  - JSON import/export (user-triggered file selection)
  - PNG image export to disk (html-to-image library)

**Client-Side Storage:**
- localStorage API
  - Current project: key `pw_autosave_current` — stores project state with timestamp
  - Snapshots: key `pw_snapshots_v1` — stores up to 10 named project snapshots
  - Implementation: `src/persistence/autosave.ts`

**Caching:**
- None — all computation is in-memory

## Authentication & Identity

**Auth Provider:**
- None — no authentication required

**Access Control:**
- Client-side only; all data is private to the user's browser

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Console logging only (`console.error()` for caught exceptions in `src/persistence/autosave.ts`)

## CI/CD & Deployment

**Hosting:**
- Hetzner Cloud static file hosting
- CI/CD pipeline: GitHub Actions workflow
- Deployment trigger: Git push to main branch
- Workflow file: `.github/workflows/deploy-hetzner.yml`

**Build Process:**
- Type checking: `tsc -b`
- Bundling: Vite build
- Output directory: `web/dist/`

## Environment Configuration

**Required env vars:**
- None — application requires no environment variables

**Optional env vars:**
- None — all configuration is compile-time via TypeScript

**Secrets location:**
- No secrets required — application is fully open-source and runs entirely client-side

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Data Format & Import/Export

**JSON Format:**
- Custom project file format defined in `docs/json-format.md`
- JSON Schema validation in `docs/json-schema.v1.json`
- Serialization: `src/persistence/serialize.ts`
- Current schema version: `1.0`

**Project Structure:**
```json
{
  "settings": { "version": "1.0", "startDate": "YYYY-MM-DD" },
  "nodes": [
    { "id": "string", "type": "start|task|end", "x": number, "y": number, ... }
  ],
  "edges": [
    { "from": "string", "to": "string" }
  ]
}
```

**Export Formats:**
1. **JSON** — Machine-readable project file for reimport or sharing
2. **PNG** — High-quality image snapshot of current canvas state
   - Implementation: `src/components/AppToolbar.tsx` uses `html-to-image` library
   - Triggers download to user's filesystem

## Browser APIs Used

**Standard Web APIs:**
- localStorage (persistent storage)
- canvas/DOM (React Flow uses canvas for rendering)
- ResizeObserver (React Flow graph responsiveness)
- Fetch API (not used — no network requests)
- File API (import projects via file selection)

**React APIs:**
- React 19 hooks: useState, useCallback, useMemo, useEffect, useRef, memo
- React Flow: useReactFlow, useNodesState, useEdgesState, addEdge

## No External Dependencies

The following are **not** integrated:

- ❌ Analytics services (Mixpanel, Google Analytics, etc.)
- ❌ Cloud storage (AWS S3, Google Cloud Storage, etc.)
- ❌ CDNs for content delivery
- ❌ Email services
- ❌ Payment processors
- ❌ Third-party UI component libraries (uses built-in components + lucide icons)
- ❌ Backend APIs (REST, GraphQL, WebSocket)
- ❌ Real-time collaboration services
- ❌ Web sockets or server push
- ❌ OAuth/authentication providers
- ❌ Error tracking (Sentry, Rollbar, etc.)
- ❌ APM (Application Performance Monitoring)

## Offline Capability

✓ **Fully offline-capable** — all functionality works without internet connection:
- Graph editing
- CPM calculations
- Project import/export
- PNG generation
- localStorage persistence

---

*Integration audit: 2026-03-17*
