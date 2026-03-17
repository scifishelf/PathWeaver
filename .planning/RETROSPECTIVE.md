# Retrospective: PathWeaver

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-16
**Phases:** 2 | **Plans:** 12

### What Was Built

- Phase 1 (Code Quality & Stability): Dead dependencies entfernt, Discriminated Union für AppNodeData, Type-sichere serialize.ts, SaveResult API, QuotaExceededError-Handling, UUID Node-IDs, T-Shortcut, 44-Test-Suite
- Phase 2 (UI — Clean & Professional): 23-Token Design-System, Icon-Toolbar (Lucide), CP-Banner Redesign, focus-visible Accessibility, 4-stelliges Datumsformat, Snapshot-Benennung, PNG-Ladeindikator, null hardcodierte Hex-Werte

### What Worked

- **Dependency-first Planung:** Phase 1 vor Phase 2 — die hardened Codebase machte UI-Änderungen sicherer und deterministischer
- **Discriminated Union als Enabler:** AppNodeData Union in Plan 01-01 ermöglichte as-any-freie Serialize.ts in Plan 01-03 — klare Phase-zu-Phase-Abhängigkeit
- **Test-Stubs vor Implementierung:** `it.todo()`-Pattern in Plan 01-02 definierte die Contracts, bevor die Implementierungen geschrieben wurden
- **Design-Token-First:** theme.ts in Plan 02-01 zu erweitern bevor Komponenten migriert wurden sparte Konflikte und machte den Hex-Cleanup in 02-05 mechanisch
- **Granulare Pläne:** Jeder Plan hatte einen klaren Scope (1–3 Dateien), was schnelle Ausführung und wenig Kontext-Overhead ermöglichte

### What Was Inefficient

- **CP Banner Hex-Werte:** '#eff6ff' und '#1d4ed8' im CP-Banner wurden in Plan 02-03 bewusst hartcodiert, aber in Plan 02-05 als Ausnahme dokumentiert — hätte von Anfang an als Ausnahme markiert werden sollen
- **ROADMAP.md Progress-Tabelle:** Zeigte in Plan 02-05 `4/5` statt `5/5` — wurde nicht nach Abschluss von Plan 02-04 aktualisiert; manuelles Tracking-Overhead
- **Plan-Nummerierung und Archiv:** `gsd-tools milestone complete` extrahierte keine Accomplishments aus SUMMARY.md-Dateien automatisch — musste manuell nachgeführt werden

### Patterns Established

- `SaveResult { ok: boolean, error?: string }` als Rückgabe-Pattern für persistenz-seitige Funktionen
- `instanceof Element` guard vor `classList` in html-to-image filter-Callbacks
- CSS border-longhands statt border-shorthand in jsdom-Test-Szenarien (jsdom ignoriert Shorthand)
- Design-Tokens als UPPER_SNAKE_CASE TypeScript-Konstanten in `theme.ts` — Single Source of Truth
- Backward-compat-Alias-Pattern: `CRITICAL_BG = COLOR_ACCENT_LIGHT` erhält existierende Imports

### Key Lessons

1. **Type-Boundaries zuerst:** Discriminated Unions an API-Grenzen definieren bevor as-any-Cleanup beginnt — spart Iterationen
2. **Explizite Ausnahmen dokumentieren:** Bewusst hartcodierte Werte (z.B. CP Banner) sofort im SUMMARY als "by design, not a gap" markieren
3. **Token-System bevor Komponenten-Migration:** theme.ts komplett ausbauen in einem Plan, dann alle Komponenten migrieren — nicht beides gleichzeitig
4. **jsdom-Fallstricke:** CSS-Shorthand-Properties werden von jsdom ignoriert; immer Longhands in Test-Assertions verwenden

### Cost Observations

- Sessions: 1 Tag (2026-03-16)
- Execution speed: Pläne dauerten 2–9 Minuten im Durchschnitt (gemessen in SUMMARY-Metriken)
- Total plans: 12 in einem Tag — effiziente, parallelisierbare Ausführung durch kurze Pläne

---

## Milestone: v2.0 — Multi-Predecessor CPM

**Shipped:** 2026-03-17
**Phases:** 2 | **Plans:** 3

### What Was Built

- Phase 3 (Algorithm & Guard Removal): MULTIPLE_OUTGOING Guard entfernt, CPM Forward Pass mit Math.max für Merge-Knoten, criticalNodeIds Set-Ansatz für vollständige Highlighting-Korrektheit, BFS Cycle Detection in isValidConnection, Duplicate-Edge-Guard, Live Edge State via getEdges()
- Phase 4 (UX Polish & Validation): HelpOverlay bereinigt (veralteter "max. 1 Ausgang"-Hinweis), v1.0 Backward-Compat-Regressionstest, Edge-ID-Schema `${from}-${to}` mit explizitem Kommentar dokumentiert

### What Worked

- **TDD-First für Algorithmus-Änderungen:** Plan 03-01 schrieb Tests für Fan-out, Diamond-Equal, Diamond-Unequal und Merge-Knoten-FAZ bevor die Guard-Entfernung begann — sofortige Rückmeldung bei Regression
- **Set-Ansatz für criticalNodeIds:** Ersetzte greedy single-path walk komplett mit `new Set<NodeId>(entries where slack === 0)` — eleganter, erweiterbar, korrekt für alle Topologien
- **Atomare Guard-Entfernung:** compute.ts, types.ts und GraphCanvas.tsx in einem Plan behandelt (03-01 + 03-02 klar getrennt) — verhinderte Intermediate States mit inkonsistentem Algorithmus
- **Backward-Compat-Test als Abschluss:** Plan 04-01 validierte v1.0 → v2.0 Migration explizit und regressiert nicht in Zukunft

### What Was Inefficient

- **Stale Kommentar in compute.ts:46:** "max. 1 Ausgang je Task" überlebte die Guard-Entfernung in 03-01 — hätte im selben Commit entfernt werden sollen; bleibt als Tech Debt
- **Pre-existing Test-String-Mismatch:** serialize.test.ts:141/149 assertiert deutsche Strings, die `validateProjectJSON` nicht mehr ausgibt — pre-existing seit v1.0, aber nie behoben; 2 Tests sind dauerhaft rot
- **Kurzes Milestone:** v2.0 mit 3 Plänen an einem Tag — effizient, aber Nyquist-Validierung (VALIDATION.md) blieb in draft/uncompleted

### Patterns Established

- `criticalNodeIds: Set<NodeId>` statt Array/single-path als kritischer Pfad-Repräsentation
- BFS mit `getOutgoers()` von ReactFlow für Cycle Detection in `isValidConnection`
- `getEdges()` / `getNodes()` via `useReactFlow()` statt closed-over state für isValidConnection-Dependency-Array
- v1.0 Backward-Compat-Test als Fixture + `fromProjectJSON → toProjectJSON → computeCPM` Round-trip Muster

### Key Lessons

1. **Guard-Entfernung atomisch:** Multi-file Änderungen (compute.ts + types.ts + GraphCanvas) besser in aufeinanderfolgenden abhängigen Plänen als in einem überladenen Plan — 03-01 (Algorithm) / 03-02 (UI) war die richtige Trennung
2. **Kommentare mit Code löschen:** Wenn ein Guard entfernt wird, sofort den zugehörigen Kommentar mitentfernen — Stale Comments sind langfristig teurer als der Commit-Overhead
3. **Nyquist rechtzeitig:** VALIDATION.md in `draft` hinterlassen und `nyquist_compliant: false` ist technische Schuld — besser `/gsd:validate-phase` nach Execution ausführen

### Cost Observations

- Sessions: 1 Tag (2026-03-17)
- Execution speed: 3 Pläne — ~3-6 Minuten pro Plan
- Total: ~15 Commits für 2 Phasen

---

## Cross-Milestone Trends

| Metric | v1.0 | v2.0 |
|--------|------|------|
| Phases | 2 | 2 |
| Plans | 12 | 3 |
| Files modified | 82 | 7 |
| LOC (TS/TSX) | ~2.317 | ~3.467 |
| Test count | 44 | 45 |
| Avg plan duration | ~3.7 min | ~4 min |

| Pattern | First seen |
|---------|-----------|
| SaveResult API | v1.0 |
| Discriminated Union at boundaries | v1.0 |
| Design Token system | v1.0 |
| jsdom border-longhand | v1.0 |
| criticalNodeIds Set for critical path | v2.0 |
| BFS Cycle Detection via getOutgoers | v2.0 |
| Live edge state via getEdges() in callbacks | v2.0 |
