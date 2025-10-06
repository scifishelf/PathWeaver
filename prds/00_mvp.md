PRD – AI Code Agent: Netzplan-Tool (MVP)

1. Zweck & Vision

Ein leichtgewichtiges, webbasiertes WYSIWYG‑Netzplan‑Tool zur schnellen Planung von Initiativen (z. B. Epics/User‑Stories) mit automatischer Berechnung des kritischen Pfads (CPM). Fokus: minimaler Klickaufwand, sofort verständliche Visualisierung, nahtlose Zusammenarbeit mit Kund:innen.

2. Zielgruppen & Jobs‑to‑Be‑Done
	•	Scrum‑/Kanban‑Teams: Abhängigkeiten, Parallelisierbarkeit, früheste/späteste Termine und kritischen Pfad sichtbar machen.
	•	Stakeholder/Kund:innen: Eine zeitliche Aussage „frühestens/spätestens“ und Risiken erkennen, ohne PM‑Vorkenntnisse.

3. Begriffe (CPM)
	•	FB/ES Frühester Beginn; FA/EF Frühester Abschluss; LS Letzter (spätester) Start; LA/LF Letzter (spätester) Abschluss; Schlupf/Slack = LS − ES = LF − EF.
	•	Kritischer Pfad (CP): Längste Dauer über alle Pfade Start→Ziel; Schlupf = 0 auf allen Vorgängen des CP. Verzögerungen verschieben das Projektende 1:1.

4. Annahmen & Rahmen (MVP)
	•	Zeitmodell standardmäßig Arbeitstage (Mo–Fr); Wochenenden nicht arbeitsfähig. (Optional: projektweiter Starttermin; Feiertage später.)
	•	Abhängigkeitstyp: Finish‑to‑Start (FS, keine Offset‑Lags im MVP).
	•	Jeder Knoten max. 1 Ausgang (mehrere Eingänge erlaubt). Hinweis: Dies vereinfacht das Modell; Mehrfach‑Ausgänge als Post‑MVP.
	•	Der CP wird nur berechnet, wenn alle Knoten von Start aus erreichbar sind, Ziel erreichen und der Graph zyklenfrei ist.

5. Funktionsumfang (MVP)

5.1 Canvas & Interaktion
	•	Automatisch erzeugte Knoten: Start und Ziel beim Anlegen eines Plans.
	•	FAB (+) unten rechts: fügt einen Task‑Knoten hinzu.
	•	Drag & Drop: freie Positionierung aller Knoten; Snap‑to‑Grid (8px) zur sauberen Ausrichtung.
	•	Verbinden: Pfeilzug durch Ziehen vom rechten „Port“ eines Knotens zu einem Zielknoten (mehrere Eingänge erlaubt). UI verhindert 2. Ausgang; vorhandenen Ausgang erst lösen.
	•	Lösen/Entfernen: Kontextmenü oder Entf für Knoten/Verbindungen (Start/Ziel geschützt, außer „Neues Projekt“).
	•	Pan/Zoom: Maus/Trackpad (Strg/⌘+Scroll; Doppelklick auf leere Fläche = 100 %).
	•	Undo/Redo: Strg/⌘+Z / Strg/⌘+Y, Mindest‑Historie 50 Schritte.

5.2 Knotenlayout & Inline‑Editing

Jeder Task‑Knoten besitzt das 3×3‑Raster gemäß Referenzgrafik:
	•	Oberzeile: FB | Dauer | FA
	•	Mitte: Name der Tätigkeit
	•	Unterzeile: LS | Schlupf | LA

Eingabefelder (inline editierbar):
	•	Pflicht: Name, Dauer (AT), optional Anmerkung (Tooltip).
	•	Berechnet/Read‑only: FB/FA/LS/LA/Schlupf.

5.3 Hilfe & Status
	•	Help‑Icon (unten links): blendet Overlay mit Legende (Bedeutung der Segmente) ein/aus.
	•	CP‑Banner (oben mittig): zeigt kritischen Pfad (Knotenfolge) und Projektdauer/frühestes Enddatum. Wenn keine Berechnung möglich: „—“ mit Fehlerhinweis (z. B. „nicht alle Knoten verbunden“, „Zyklus erkannt“, „mehr als 1 Ausgang an Knoten X“).
	•	Highlighting: Knoten/Kanten auf CP werden fett/kontrastreich dargestellt.

5.4 Live‑Berechnung & Validierung
	•	Recalculate‑on‑change: Bei jeder Änderung (Dauer, Verbindung, Position irrelevant) werden ES/EF/LS/LF/Slack neu berechnet.
	•	Validierungen (synchron):
	•	Zyklen‑Erkennung;
	•	Orphan‑Nodes (nicht von Start erreichbar);
	•	Multiple Ausgänge blockiert;
	•	Ziel darf keine Ausgänge haben; Start darf keine Eingänge haben.

5.5 Import/Export
	•	JSON‑Export (Layout + Daten + Berechnungsergebnis):

{
  "version": "1.0",
  "settings": {"units": "AT", "startDate": "2025-10-07", "workweek": [1,2,3,4,5]},
  "nodes": [
    {"id": "start", "type": "start", "x": 120, "y": 300},
    {"id": "A", "type": "task", "title": "User Story A", "duration": 5, "x": 420, "y": 160},
    {"id": "B", "type": "task", "title": "User Story B", "duration": 3, "x": 420, "y": 420},
    {"id": "C", "type": "task", "title": "User Story C", "duration": 2, "x": 720, "y": 160},
    {"id": "end", "type": "end", "x": 1040, "y": 300}
  ],
  "edges": [
    {"from": "start", "to": "A"},
    {"from": "start", "to": "B"},
    {"from": "A", "to": "C"},
    {"from": "B", "to": "end"},
    {"from": "C", "to": "end"}
  ],
  "computed": {
    "nodes": {
      "A": {"ES": "2025-10-07", "EF": "2025-10-13", "LS": "2025-10-07", "LF": "2025-10-13", "slack": 0},
      "B": {"ES": "2025-10-07", "EF": "2025-10-09", "LS": "2025-10-13", "LF": "2025-10-15", "slack": 4},
      "C": {"ES": "2025-10-14", "EF": "2025-10-15", "LS": "2025-10-14", "LF": "2025-10-15", "slack": 0}
    },
    "criticalPath": ["start","A","C","end"],
    "project": {"durationAT": 7, "earliestFinish": "2025-10-15"}
  }
}

	•	JSON‑Import: ersetzt den aktuellen Plan vollständig; Validierung wie oben (inkonsistente Objekt‑IDs, doppelte Ausgänge etc.).
	•	(Optional) PNG/PDF‑Export des Canvas (Screenshot‑Render) für Folien.

6. Algorithmen (Engineering‑Spezifikation)

6.1 Graph‑Modell
	•	Oriented Graph G = (V, E) mit start ∈ V, end ∈ V.
	•	outdegree(v) ≤ 1 für alle Task‑Knoten; outdegree(end) = 0, indegree(start) = 0.
	•	Azyklisch: topologische Sortierung erforderlich (Kahn/DFS). Bei Zyklus → Berechnung stoppen, UI‑Fehler.

6.2 CPM‑Berechnung (Arbeitstage)
	•	Forward‑Pass (FB/FA): ES(v) = max(EF(u)) für alle Vorgänger u; EF(v) = ES(v) + d(v) in AT, gemappt auf Kalender (Mo–Fr, keine Wochenenden). FS‑Start: Nach dem EF des Vorgängers → nächster Arbeitstag.
	•	Backward‑Pass (LS/LA): LF(v) = min(LS(w)) für Nachfolger w; LS(v) = LF(v) − d(v).
	•	Schlupf: Slack(v) = LS(v) − ES(v); kritisch iff Slack = 0.
	•	Projektdauer: maximale EF am end (oder Pfad‑Summe). Mapping in Daten: Arbeits‑tage → Datum via Kalenderfunktion.

6.3 Performance & Grenzen
	•	Ziel: ≤ 100 ms Rechenzeit für ≤ 200 Knoten / 400 Kanten auf Mittelklasse‑Hardware (2024+). Rechenkomplexität: O(|V|+|E|).

7. UX/UI‑Anforderungen
	•	Responsives Canvas (min. 1200×700) mit Auto‑Layout‑Vorschlag beim Import.
	•	Visuelles Feedback: rote Ports/Edges bei Regelverstoß (zweiter Ausgang, Zyklusverdacht), Tooltip mit Ursache.
	•	Fokus/Barrierefreiheit: Tastatur‑Nutzung (Tab‑Reihenfolge), ARIA‑Labels für Knoten/Ports, Kontrast AA.
	•	Error‑States: prominentes Banner mit eindeutiger, handlungsleitender Nachricht.

8. Nicht‑Ziele (MVP)
	•	Kein Ressourcen‑/Kostenausgleich, keine Mehrkalender/Feiertage pro Region, keine PERT‑Dreipunktwerte, keine Lags/Leads, keine Deadlines/Constraints pro Knoten, keine Multi‑Projekt‑Ansicht, keine Kollaboration in Echtzeit.

9. Telemetrie & Erfolgskriterien
	•	Aktivierungs‑Metriken: 1) Erstes Projekt erstellt, 2) Erster kritischer Pfad erfolgreich berechnet, 3) Export durchgeführt.
	•	Nutzungs‑Metriken: mittlere Knotenanzahl pro Plan, Rechenfehlerquote (<1 %), Zeit bis „CP ok“.
	•	Qualitativ: 90 % der Testnutzenden verstehen die Legende ohne weitere Erklärung.

10. Sicherheits‑ & Datenschutzanforderungen
	•	Keine personenbezogenen Daten erforderlich; Daten verbleiben im Browser (Local‑First). Export/Import lokal; keine Übermittlung ohne explizite Aktion.

11. Testfälle (Akzeptanzkriterien)
	1.	Kritischer Pfad sichtbar
Gegeben ein Plan mit Start→A(5)→C(2)→Ziel und Start→B(3)→Ziel,
Wenn Dauer eingegeben und Verbindungen gesetzt sind,
Dann zeigt das CP‑Banner Start–A–C–Ziel, Projektdauer 7 AT und markiert A/C/zugehörige Kanten.
	2.	Zyklus verhindert
Wenn Nutzer A→B und B→A verbinden will,
Dann wird die zweite Verbindung blockiert und eine Fehlermeldung erklärt „Zyklus“.
	3.	Zweiter Ausgang blockiert
Wenn Node A bereits einen Ausgang besitzt,
Dann verhindert die UI zusätzliche Ausgänge und bietet „Ausgang lösen“ an.
	4.	Orphan‑Node Hinweis
Wenn ein Task nicht mit Start verbunden ist,
Dann erscheint ein Banner „Nicht alle Knoten sind mit Start/Ziel verbunden“ und CP‑Banner zeigt „—“.
	5.	Undo/Redo
Wenn zuletzt eine Verbindung gelöscht wurde,
Dann stellt Strg/⌘+Z sie wieder her; Strg/⌘+Y löscht sie erneut.
	6.	Import überschreibt
Wenn ein JSON importiert wird,
Dann ersetzt es die aktuelle Canvas vollständig (mit Bestätigungsdialog) und berechnet sofort neu.

12. Offene Punkte / Risiken
	•	Einschränkung „max. 1 Ausgang“ kann echte PERT‑Fälle limitieren → Risiko: Nutzererwartung. Mit Stakeholdern validieren; ggf. sehr früh als Option „Mehrfach‑Ausgänge zulassen (experimentell)“.
	•	Kalenderlogik: Feiertage und unterschiedliche Arbeitswochen sind wichtig, aber Post‑MVP.
	•	Große Pläne: Performance/Zoom‑Handling früh testen (Prototyp‑Benchmark).

13. Roadmap (nach MVP)
	•	Mehrfach‑Ausgänge je Knoten; Lags/Leads; Deadlines/Constraints; PERT (optimistisch/most likely/pessimistisch).
	•	Feiertage/Kalender; Ressourcen‑/Kostensichten; Gantt‑Ansicht synchron zum Netzplan.
	•	Echtzeit‑Kollaboration, Kommentare, Freigaben.
	•	Export nach PNG/PDF/SVG; Versionierung/Autosave mit Snapshots.

⸻

Deliverables MVP: lauffähige Web‑App (Desktop Chrome/Edge/Firefox, min. 1200×700), JSON Import/Export, Hilfe‑Overlay, Drag&Drop‑Canvas, CPM‑Engine mit Live‑Rechnung, CP‑Banner, Undo/Redo, Validierungen, PNG/PDF‑Export (falls in MVP aufgenommen).

14. Technik- & Architekturentscheidungen (MVP)

14.1 Tech‑Stack (empfohlen)
	•	Frontend: React + TypeScript, Build mit Vite.
	•	Canvas/Graph: React Flow (Nodes/Edges, Ports, Pan/Zoom, Connection‑Events, Export über SVG).
	•	State‑Management: Zustand (leichtgewichtig) + immer.
	•	Form/Inline‑Editing: Controlled Inputs (React), Debounce 200 ms.
	•	Styling: TailwindCSS; Iconset: Lucide.
	•	Testing: Vitest + Testing Library (Unit), Playwright (E2E Canvas‑Flows).

Begründung: Sehr kurze Time‑to‑MVP, ausgereifte Canvas‑Interaktionen „out of the box“, geringe Bundle‑Size, gute Typisierung.

14.2 Architektur & Module
	•	graph/ – Adapter über React‑Flow (Ports, Verbindungshooks, Edge‑Guards: max. 1 Ausgang).
	•	cpm/ – reine TS‑Lib (CPM‑Engine, ohne React): Toposort (Kahn), Forward/Backward‑Pass, Workday‑Funktionen.
	•	persistence/ – Local‑First (IndexedDB) + Import/Export (JSON Schema v1.0).
	•	ui/ – CP‑Banner, Help‑Overlay, Modals, Toasts.
	•	export/ – PNG/PDF/SVG‑Export.

14.3 Persistenzstrategie (Local‑First)
	•	Autosave alle 2 s nach Idle oder bei Blur in IndexedDB (via Dexie). Snapshots pro Projekt.
	•	Import/Export: JSON (Schema v1.0). Import ersetzt Current State nach Confirm‑Dialog.
	•	Optional: PWA‑Flag für Offline‑Nutzung (Post‑MVP Sync).

14.4 Undo/Redo‑Strategie
	•	Command‑Stack „past/present/future“ mit immer produceWithPatches ⇒ speichert nur Diffs.
	•	Begrenzung 50 Schritte (konfigurierbar). Aktionen: Knoten/Edge hinzufügen/löschen/verschieben, Dauer/Name ändern, Import, Layout.

14.5 Kalender/Workdays
	•	Basis: date‑fns; Utility addWorkdays(date, n) und nextWorkday(date) (Sa/So ausgenommen).
	•	Projektweite Einstellung Startdatum (Default = heute). Feiertage Post‑MVP (Hook vorbereitet: isHoliday(date) → immer false).

14.6 Export/Druck
	•	SVG‑Export direkt aus React‑Flow DOM.
	•	PNG‑Export: svg-to-png (Canvas‑Rasterisierung via canvas.toDataURL).
	•	PDF‑Export: svg2pdf.js + jsPDF (Seitenformat A4/Quer). Alternativ „Browser‑Druck“ mit Print‑Styles.

14.7 Accessibility (A11y)
	•	Tastatur: Tab‑Navi, Pfeile zum Nudge (1/10 px mit Shift), Enter/F2 für Inline‑Edit, ESC zum Abbrechen.
	•	ARIA‑Rollen/Labels („node“, „edge“, „connect handle“). Fokus‑Ringe sichtbar.
	•	Kontrast ≥ AA; CP‑Highlight nicht nur Farbe (z. B. dicke Linien + Muster).
	•	Hit‑Targets ≥ 44×44 px.

14.8 Telemetrie & Fehlertracking
	•	PostHog (self‑hosted möglich) – opt‑in; Event‑Plan: project_created, cp_success, import, export, error_cycle, error_orphan.
	•	Fehlertracking optional: Sentry/GlitchTip (DSN via Env, PII off).

14.9 Sicherheits‑/Privacy‑Konzept
	•	Standard: kein Server; Daten bleiben lokal. Export ausschließlich per Nutzeraktion.
	•	Opt‑in Telemetrie anonymisiert; kein Task‑Titel‑Inhalt.

14.10 TypeScript‑Typen (Auszug)

export type NodeId = string;
export type Workday = number; // AT ab Projektstart (0‑basiert)

export interface ProjectSettings {
  version: '1.0';
  startDate?: string; // ISO
  workweek?: number[]; // 1..5
}

export interface TaskNode {
  id: NodeId;
  type: 'start' | 'task' | 'end';
  title?: string; // Pflicht bei type='task'
  duration?: number; // AT, Pflicht bei task
  x: number; y: number;
}

export interface Edge { from: NodeId; to: NodeId; }

export interface ProjectJSON {
  settings: ProjectSettings;
  nodes: TaskNode[];
  edges: Edge[];
}

export interface ComputedNode {
  ES: Workday; EF: Workday; LS: Workday; LF: Workday; slack: number; critical: boolean;
}

export interface ComputedResult {
  nodes: Record<NodeId, ComputedNode>;
  criticalPath: NodeId[];
  project: { durationAT: number; earliestFinishISO?: string };
}

14.11 Entscheidungslog für Lücken aus dem Review
	•	Stack: React+TS, Vite, React Flow, Zustand+immer → MVP‑geeignet.
	•	Persistenz: Local‑First (IndexedDB/Dexie) + JSON Import/Export; PWA optional.
	•	Undo/Redo: produceWithPatches‑basierter Diff‑Stack (50 Schritte).
	•	Canvas‑Lib: React Flow statt Eigenbau (Zeitgewinn, stabiler Connector‑Flow).
	•	Kalenderlib: date‑fns + eigene Workday‑Utils (Holidays Post‑MVP).
	•	Export: SVG→PNG/PDF wie oben.
	•	A11y‑Details: definiert (Fokus/ARIA/Kontrast/Targets).
	•	Telemetrie‑Technik: PostHog (opt‑in), Events festgelegt.

14.12 Offene Architektur‑Topics (nach MVP)
	•	Feiertagskalender (ics‑Import), Mehrkalender, regionale Arbeitswochen.
	•	Mehrfach‑Ausgänge je Knoten; Lags/Leads; Constraints/Deadlines.
	•	Realtime‑Kollaboration (Yjs/CRDT), Mehrbenutzer‑Undo/Redo.
	•	Server‑Sync/Share‑Links; Auth (nur wenn wirklich nötig).