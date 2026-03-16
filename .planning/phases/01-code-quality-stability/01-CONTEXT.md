# Phase 1: Code Quality & Stability - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Hardening der bestehenden Codebase: stille Fehler beseitigen, tote Dependencies entfernen, Type Guards einführen, Test-Suite für Core Business Logic aufbauen. Keine neuen Features, keine UI-Änderungen — Phase 2 übernimmt das UI.

</domain>

<decisions>
## Implementation Decisions

### JSON-Import-Validierung
- `docs/json-schema.v1.json` um das optionale `computed`-Feld erweitern, damit eigene Exporte (die `computed` enthalten) die Schema-Validierung bestehen
- Manuellen Guard `validateProjectJSON()` in `serialize.ts` beibehalten — keine zusätzliche Schema-Library (kein ajv), kein Bundle-Overhead
- Bei fehlgeschlagenem Import: Fehlermeldung(en) aus `validateProjectJSON()` im bestehenden Banner anzeigen — konsistent mit Graphen-Validierungsfehlern

### QuotaExceeded UX
- `autosave.ts` fängt `QuotaExceededError` explizit ab; `saveCurrent()` gibt `SaveResult` zurück: `{ ok: boolean, error?: string }`
- Bei `ok: false`: Banner-Anzeige mit Fehlermeldung (z.B. "Speicher voll — bitte Snapshots löschen oder Projekt als JSON exportieren")

### T-Shortcut (Neue Task-Node)
- Neuer Node erscheint in der Viewport-Mitte (ReactFlow viewport API)
- Node startet direkt im Bearbeitungs-Modus mit fokussiertem Titel-Input — kein separater Doppelklick nötig
- Shortcut deaktiviert wenn Fokus in einem Input-Feld liegt

### Immer-Dependency
- Entfernen — keine einzigen `import from 'immer'` im Quellcode vorhanden, nur in einem Kommentar erwähnt
- Gemeinsam mit Zustand entfernen (DEPS-01 + DEPS-03)

### Claude's Discretion
- Genaue Fehlertext-Formulierungen für Banner-Meldungen
- Default-Titel-Format für neue Nodes via T-Shortcut (z.B. "Task N" mit fortlaufender Nummer)
- Exakte ReactFlow viewport-Mitte-Berechnung (screenToFlowPosition vs. getViewport)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Schema
- `.planning/REQUIREMENTS.md` — Alle Phase-1-Anforderungen (DEPS-01..03, TYPES-01..03, ERR-01..03, BUG-01..05, TEST-01..04, SNAP-01..02) mit Acceptance Criteria
- `docs/json-schema.v1.json` — JSON-Schema v1; muss um optionales `computed`-Feld erweitert werden
- `docs/json-format.md` — Datenformat-Spezifikation

### Kern-Dateien (zu ändern)
- `web/src/persistence/serialize.ts` — `validateProjectJSON()`, `toProjectJSON()`, `fromProjectJSON()`, `as any`-Casts (TYPES-01, TYPES-03)
- `web/src/persistence/autosave.ts` — `QuotaExceededError`, Snapshot-Keys, SaveResult (ERR-02, BUG-02)
- `web/src/components/GraphCanvas.tsx` — setTimeout-Validierung, Node-ID-Generierung, T-Shortcut (BUG-01, BUG-03, SNAP-02)
- `web/src/cpm/types.ts` — Discriminated Union für ReactFlow Node-Daten (TYPES-02)

### Business Logic (zu testen)
- `web/src/cpm/compute.ts` — CPM-Algorithmus (TEST-04)
- `web/src/cpm/workdays.ts` — Workday-Arithmetik (TEST-03)
- `web/src/graph/validate.ts` — Graph-Validierungsregeln (TEST-02)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `web/src/components/Banner.tsx`: Bestehende Banner-Komponente für Fehleranzeige — nutzen für QuotaExceeded und Import-Fehler
- `web/src/persistence/serialize.ts`: `validateProjectJSON()` existiert bereits als manueller Guard — erweitern statt neu schreiben
- `web/src/cpm/compute.ts`: `computeCPM()` hat bereits `ComputeError`-Klasse mit `code`-Property — Muster für strukturierte Errors

### Established Patterns
- Tests co-located mit Source-Dateien (`compute.test.ts` neben `compute.ts`)
- Inline Test-Data ohne Factories — bestehende Tests in `compute.test.ts` als Vorlage
- Fehler als `string[]` aus Validierungsfunktionen (`validateGraph()`, `validateProjectJSON()`)
- Named Exports durchgängig (kein Default außer App)

### Integration Points
- `Banner.tsx` wird in `App.tsx` oder `GraphCanvas.tsx` gerendert — QuotaExceeded-Fehler muss über State nach oben propagiert werden
- ReactFlow viewport API (`useReactFlow().getViewport()`) für T-Shortcut Node-Position
- `TopRightDebug.tsx` muss hinter `import.meta.env.DEV` Gate — Import in Eltern-Komponente prüfen

</code_context>

<specifics>
## Specific Ideas

Keine spezifischen Referenzen oder "I want it like X"-Momente — alle Entscheidungen folgen den bestehenden Patterns der Codebase.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-code-quality-stability*
*Context gathered: 2026-03-16*
