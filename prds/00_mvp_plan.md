MVP Umsetzungsplan – Netzplan-Tool

1. Entscheidungen (MVP-konform)

• Light-Theme + Tailwind Standard.
• Export: PNG und SVG im MVP; PDF später.
• Autosave/Snapshots: einfache Lösung (Ringpuffer), Keep it Simple.
• Telemetrie: opt-in, anonymisiert, ohne Task-Titel.
• Shortcuts: Enter/F2 (Edit), ESC (Abbruch), Pfeile (Nudge).

2. Iterationen (inkrementell lieferbar)

Iteration 0 – Projekt-Setup
• Deliverables: Vite + React + TypeScript, Tailwind, Zustand+immer, ESLint/Prettier, Vitest/RTL, Playwright, Basis-Layout (min. 1200×700), UI-Grundkomponenten (Button, Banner, Modal), sichtbare Fokus-Ringe.
• Abnahme: App startet, Lint/Test grün.

Iteration 1 – cpm/ Kernbibliothek
• Deliverables: Toposort (Kahn), Forward/Backward-Pass, addWorkdays/nextWorkday (Mo–Fr), Typen gem. PRD 14.10, eindeutige Fehlercodes; 25+ Unit-Tests inkl. PRD-Beispiel.
• Abnahme: Testfälle „kritischer Pfad”, „Zyklus”, „Orphans” grün; O(|V|+|E|).

Iteration 2 – graph/ Canvas-Fundament (React Flow)
• Deliverables: Start/End-Nodes, FAB (+) für Tasks, Drag/Drop, Pan/Zoom, Snap-to-Grid (8px), Ports, Connect-Flow; Entfernen via Kontextmenü (Start/End geschützt), Doppelklick Reset-Zoom.
• Abnahme: Knoten platzierbar, Verbindungen FS-konform.

Iteration 3 – Regeln & Validierung im UI
• Deliverables: Guard „max. 1 Ausgang”, Start ohne Eingänge/Ende ohne Ausgänge, Zyklus-Prävention, Orphan-Erkennung; visuelles Feedback (rote Ports/Edges + Tooltip), Banner mit Ursache.
• Abnahme: PRD-Testfälle 2–4 im UI erfüllt.

Iteration 4 – 3×3-Knoten & Inline-Editing
• Deliverables: 3×3-Raster (FB|Dauer|FA | Titel | LS|Schlupf|LA), Controlled Inputs mit 200 ms Debounce, Dauer ≥ 0, Tooltip für Anmerkung; Shortcuts Enter/F2/ESC, ARIA-Labels.
• Abnahme: Edit wirkt sofort; Read-only Felder korrekt; AA-Kontrast.

Iteration 5 – Live-Berechnung, CP-Banner, Highlighting
• Deliverables: Debounced Recompute on change, CP-Pfad-Highlight (Linienbreite + Muster), CP-Banner (Pfad + Projektdauer + frühestes Enddatum), Fehlerzustände „—” mit eindeutiger Ursache.
• Abnahme: PRD-Testfall 1 vollständig grün.

Iteration 6 – persistence/ + Import/Export
• Deliverables: IndexedDB (Dexie) Autosave „Current State” + Snapshots als Ringpuffer (10), Import/Export JSON v1.0 (Replace + Confirm), strikte Schema-Validierung mit Fehlersammlung.
• Abnahme: PRD-Testfall 6 grün; Round-trip stabil (berechnete Felder dürfen abweichen).

Iteration 7 – Undo/Redo (produceWithPatches)
• Deliverables: Command-Stack past/present/future, 50 Schritte, Gruppierung kleiner Moves; Shortcuts Strg/⌘+Z / Strg/⌘+Y.
• Abnahme: PRD-Testfall 5 grün; deterministische Wiederherstellung.

Iteration 8 – Hilfe-Overlay, A11y, Export (PNG/SVG)
• Deliverables: Hilfe-Overlay (Legende), ARIA-Rollen/Labels (node/edge/handle), Hit-Targets ≥ 44×44 px; Export: SVG + PNG.
• Abnahme: Legende verständlich (qualitativ); Export funktioniert auf Beispielplan.

Iteration 9 – Performance & QA
• Deliverables: Daten-Generator (200 Knoten/400 Kanten), Profiling/Memoization/React-Flow-Tuning, Playwright-Flows für alle PRD-Tests, klare Fehlertexte.
• Abnahme: Recompute ≤ 100 ms; alle PRD-Akzeptanztests grün.

3. Meilensteine
• M1: Iteration 1–3 (Engine + Canvas + Regeln).
• M2: Iteration 4–6 (3×3-Knoten, Live-CP, Persistenz/Import/Export).
• M3: Iteration 7–9 (Undo/Redo, Hilfe, Export, Performance/QA).

4. Leitplanken
• A11y: Fokus sichtbar, Tastatur vollständig, CP-Highlight nicht nur Farbe.
• Telemetrie (opt-in): project_created, cp_success, import, export, error_cycle, error_orphan – ohne Inhalte der Task-Titel.
• Autosave/Snapshots: Autosave bei Idle/Blur; Snapshots als Ringpuffer (10) pro Projekt (FIFO Cleanup).


