# Requirements: PathWeaver

**Defined:** 2026-03-16
**Core Value:** Der kritische Pfad muss korrekt berechnet und klar sichtbar sein — alles andere ist sekundär.

---

## v1 Requirements

### DEPS — Dependency-Bereinigung

- [x] **DEPS-01**: Zustand-Dependency aus `package.json` entfernt (kein einziger `import from 'zustand'` im Quellcode)
- [x] **DEPS-02**: `dom-to-image-more` durch `html-to-image` ersetzt — Import umbenannt, `.d.ts`-Stub gelöscht, `bgcolor` → `backgroundColor` Option angepasst
- [x] **DEPS-03**: Immer-Nutzung geprüft; Dependency entfernt wenn keine Imports vorhanden

### TYPES — Type Safety

- [x] **TYPES-01**: `isProjectJSON`-Type-Guard an der `JSON.parse()`-Grenze in `serialize.ts` — gibt `boolean` zurück, typed als `data is ProjectJSON`
- [x] **TYPES-02**: Discriminated Union für ReactFlow Node-Daten (`TaskNodeData | StartNodeData | EndNodeData`) eingeführt — ein Cast an der Grenze, downstream durchgängig typisiert
- [x] **TYPES-03**: `as any`-Casts in `serialize.ts` durch Type Guards / Narrowing ersetzt

### ERR — Error Handling

- [x] **ERR-01**: Alle leeren `catch {}` Blöcke in `autosave.ts` und `GraphCanvas.tsx` erhalten mindestens `console.error(e)` — keine stillen Fehler mehr
- [x] **ERR-02**: `QuotaExceededError` in `autosave.ts` explizit abgefangen (`instanceof DOMException && name === 'QuotaExceededError'`); `saveCurrent()` gibt strukturiertes `SaveResult` zurück
- [x] **ERR-03**: `startDate` vor Übergabe an `workdays.ts` auf valides ISO-Datumsformat validiert — verhindert Infinite Loop in `addWorkdays()`

### BUG — Bug Fixes

- [x] **BUG-01**: Node-IDs durch `crypto.randomUUID()` generiert statt Timestamp-basiert
- [x] **BUG-02**: Snapshot-Keys erhalten Random-Suffix — keine Millisekunden-Kollisionen mehr
- [x] **BUG-03**: `setTimeout`-basierte Validierungsaufrufe in `GraphCanvas.tsx` entfernt; Validierung läuft ausschließlich über `useEffect([nodes, edges])`
- [x] **BUG-04**: `TopRightDebug.tsx` hinter `import.meta.env.DEV` versteckt — wird in Production-Build nicht mitgeliefert
- [x] **BUG-05**: PNG-Export via `html-to-image` mit `filter`-Option — `.react-flow__controls`, `.react-flow__panel`, `.react-flow__minimap` werden aus dem exportierten Bild ausgeschlossen

### TEST — Test Coverage

- [x] **TEST-01**: Serialisierungs-Round-Trip-Test: `fromProjectJSON(toProjectJSON(state))` ergibt identischen State — für mindestens 3 verschiedene Graph-Konfigurationen
- [x] **TEST-02**: `validateGraph()` Unit-Tests: gültiger Graph, fehlende Verbindungen, Zyklen, orphaned Nodes
- [x] **TEST-03**: `workdays.ts` Unit-Tests: `addWorkdays()` mit Startdatum, Wochenendes überspringen, ungültiges Datum wirft Fehler statt Infinite Loop
- [x] **TEST-04**: CPM-Edge-Cases: einzelner Node (nur Start+End), disconnected Subgraph, Zyklus-Erkennung, Fehlercode-Prüfung via `ComputeError.code`

### SNAP — Snapshot-Verbesserungen

- [x] **SNAP-01**: Snapshots können optional benannt werden — `name?: string` im Snapshot-Schema; Benennung ist optional, nicht required
- [x] **SNAP-02**: Taste `T` fügt neuen Task-Node hinzu — `keydown`-Listener in `GraphCanvas.tsx` mit `useEffect`; deaktiviert wenn Fokus in einem Input-Feld liegt

### UI-FOUND — UI Foundation

- [ ] **UI-FOUND-01**: `"(MVP)"` aus dem App-Titel entfernt; Titel lautet schlicht `"PathWeaver"` oder `"PathWeaver – Netzplan"`
- [ ] **UI-FOUND-02**: `theme.ts` zu einem vollständigen Design-Token-System ausgebaut — alle Farben, Border-Radius, Shadows als benannte Konstanten oder CSS-Variablen; kein hardcodierter Hex-Wert mehr in Komponenten

### UI-TOOLBAR — Toolbar Redesign

- [ ] **UI-TOOLBAR-01**: Toolbar-Buttons mit Icons ausgestattet (z.B. Lucide-Icons) — Text bleibt als Label, Icon gibt visuellen Anker
- [ ] **UI-TOOLBAR-02**: Toolbar-Aktionen visuell gruppiert mit Separator: `[Export | Import]` · `[Snapshots | PNG]`
- [ ] **UI-TOOLBAR-03**: Hover- und `focus-visible`-Styles auf allen interaktiven Elementen (Toolbar-Buttons, Node-Inputs, Context-Menu-Einträge)

### UI-CRIT — Kritischer Pfad Visualisierung

- [ ] **UI-CRIT-01**: CP-Banner redesigned — klar von Node-Highlight-Farbe abgegrenzt; gut lesbar, visuell prominent
- [ ] **UI-CRIT-02**: Kritische Nodes erhalten zusätzlichen Border-Highlight — nicht nur Hintergrundfarbe sondern auch farbiger Rand

### UI-POLISH — Visual Polish

- [ ] **UI-POLISH-01**: Datumformat durchgängig 4-stelliges Jahr (DD.MM.YYYY) in allen Node-Anzeigen und Banners
- [ ] **UI-POLISH-02**: Ladeindikator während PNG-Export — User-Feedback während der 1–3s DOM-Rendering-Phase
- [ ] **UI-POLISH-03**: Snapshot-Panel zeigt Namen der Snapshots (aus SNAP-01); Benennung beim Erstellen über Input-Feld möglich

---

## v2 Requirements

### Performance

- **PERF-01**: Validierung debounced / gebatcht mit CPM-Compute — bei jedem Node/Edge-Change nur ein Durchlauf
- **PERF-02**: Snapshot-Diff-Speicherung statt 10× Full Snapshots — verhindert localStorage-Quota bei großen Graphen
- **PERF-03**: Virtualisierung für Graphen mit 500+ Nodes

### Erweiterte Features

- **EXT-01**: Feiertagskalender-Unterstützung in `workdays.ts` — als Parameter injizierbar
- **EXT-02**: Tastaturkürzel-Übersicht im `HelpOverlay.tsx` (aktuell auskommentiert in `App.tsx`)
- **EXT-03**: `as any`-Casts in `GraphCanvas.tsx` (ReactFlow-Boundary) durch korrekte Generics ersetzt — nach TYPES-02

### Infrastruktur

- **INFRA-01**: ReactFlow v12 (`@xyflow/react`) Migration — eigenes Milestone-Thema
- **INFRA-02**: Coverage-Thresholds in Vitest konfiguriert

---

## Out of Scope

| Feature | Begründung |
|---------|-----------|
| Dark Mode | Widerspricht DIN 69900 Weißhintergrund-Konvention; kein User-Demand |
| Backend / Serverkomponenten | Bewusst client-only |
| Multiple Color Themes / Theme Picker | Scope Creep, kein konkreter Bedarf |
| Animierte kritische-Pfad-Kanten | Visuelles Risiko (Noise); erst validieren wenn Basis steht |
| Node-Labels (FAZ/FEZ etc.) | Fachpublikum kennt DIN-Format |
| Mobile App | Web-first |
| Toolbar Drag-and-Drop Reordering | Keine User-Anforderung |
| Node-Slack-Gradient-Visualisierung | Zu hohe visuelle Komplexität für v1 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEPS-01 | Phase 1 | Complete |
| DEPS-02 | Phase 1 | Complete |
| DEPS-03 | Phase 1 | Complete |
| TYPES-01 | Phase 1 | Complete |
| TYPES-02 | Phase 1 | Complete |
| TYPES-03 | Phase 1 | Complete |
| ERR-01 | Phase 1 | Complete |
| ERR-02 | Phase 1 | Complete |
| ERR-03 | Phase 1 | Complete |
| BUG-01 | Phase 1 | Complete |
| BUG-02 | Phase 1 | Complete |
| BUG-03 | Phase 1 | Complete |
| BUG-04 | Phase 1 | Complete |
| BUG-05 | Phase 1 | Complete |
| TEST-01 | Phase 1 | Complete |
| TEST-02 | Phase 1 | Complete |
| TEST-03 | Phase 1 | Complete |
| TEST-04 | Phase 1 | Complete |
| SNAP-01 | Phase 1 | Complete |
| SNAP-02 | Phase 1 | Complete |
| UI-FOUND-01 | Phase 2 | Pending |
| UI-FOUND-02 | Phase 2 | Pending |
| UI-TOOLBAR-01 | Phase 2 | Pending |
| UI-TOOLBAR-02 | Phase 2 | Pending |
| UI-TOOLBAR-03 | Phase 2 | Pending |
| UI-CRIT-01 | Phase 2 | Pending |
| UI-CRIT-02 | Phase 2 | Pending |
| UI-POLISH-01 | Phase 2 | Pending |
| UI-POLISH-02 | Phase 2 | Pending |
| UI-POLISH-03 | Phase 2 | Pending |

**Coverage:**
- v1 Requirements: 30 total
- Mapped zu Phasen: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after initial definition*
