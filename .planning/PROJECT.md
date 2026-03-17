# PathWeaver

## What This Is

PathWeaver ist ein browserbasiertes CPM-Netzplan-Tool (Critical Path Method) nach DIN 69900. Es ermöglicht das visuelle Erstellen und Berechnen von Projektnetzplänen — einschließlich Multi-Successor- und Multi-Predecessor-Topologien (Fan-out, Merge, Diamond) — mit automatischer Berechnung des kritischen Pfads, Pufferzeiten und Projektdauer. Vollständig client-seitig, ohne Backend.

Zielgruppe: Entwickler und Projektmanager, die ein schlankes, selbst gehostetes oder lokal nutzbares Planungstool suchen. Veröffentlichung als Open-Source-Projekt auf GitHub.

## Core Value

Der kritische Pfad muss korrekt berechnet und klar sichtbar sein — alles andere ist sekundär.

## Requirements

### Validated

- ✓ CPM-Algorithmus (Vorwärts-/Rückwärtsrechnung, kritischer Pfad, Puffer) — existing
- ✓ Interaktiver Graph-Editor mit ReactFlow (Nodes hinzufügen, verbinden, löschen) — existing
- ✓ DIN 69900-konformes Vorgangsknotenformat (FAZ/Dauer/FEZ | Name | SAZ/Puffer/SEZ) — existing
- ✓ LocalStorage-Persistenz mit Autosave und Snapshots (max. 10) — existing
- ✓ JSON-Export und -Import — existing
- ✓ PNG-Export — existing
- ✓ Startdatum wählbar, Arbeitstage-Berechnung (Mo–Fr) — existing
- ✓ Node-IDs via `crypto.randomUUID()`, Snapshot-Keys mit Random-Suffix — v1.0
- ✓ `QuotaExceededError` explizit abgefangen, SaveResult API, stille Catches eliminiert — v1.0
- ✓ `dom-to-image-more` durch `html-to-image` ersetzt, Zustand + immer entfernt — v1.0
- ✓ Discriminated Union für AppNodeData, isProjectJSON type guard, as-any-frei in serialize.ts — v1.0
- ✓ Test-Suite: 44+ Tests für Serialize, Validate, Workdays, CPM, Autosave — v1.0
- ✓ App-Titel "PathWeaver" ohne "(MVP)"-Label — v1.0
- ✓ 23-Token Design-System in theme.ts — null hardcodierte Hex-Werte in Komponenten — v1.0
- ✓ Icon-basierte Toolbar (Lucide) mit visueller Gruppierung, hover/focus-visible — v1.0
- ✓ CP-Banner und Node-Highlighting visuell klar abgegrenzt, farbiger Border auf kritischen Nodes — v1.0
- ✓ Datumformat DD.MM.YYYY durchgängig (4-stelliges Jahr) — v1.0
- ✓ PNG-Export mit Ladeindikator, Snapshot-Panel mit Benennung — v1.0
- ✓ Multi-Successor-Topologien: Task-Knoten dürfen beliebig viele ausgehende Kanten haben — v2.0
- ✓ CPM korrekt für Merge-Knoten (FAZ = max aller eingehenden FEZ) — v2.0
- ✓ Kritische Pfade in Diamond-/Parallel-Graphen vollständig highlighted (criticalNodeIds Set) — v2.0
- ✓ BFS Cycle Detection, Duplicate-Edge-Guard, Live Edge State in isValidConnection — v2.0
- ✓ Multi-Successor-Knoten: kein roter Fehlerrahmen (nodesWithTooManyOut entfernt) — v2.0
- ✓ v1.0-Projektdateien laden korrekt in v2.0 (Backward-Compat-Test) — v2.0

### Active

*(Nächstes Milestone wird mit /gsd:new-milestone definiert)*

### Out of Scope

- Backend / Serverkomponenten — bewusst client-only
- User Authentication — kein Multi-User-Szenario geplant
- Mobile App — Web first
- Node-Labels im DIN-Grid (FAZ/FEZ etc.) — Fachpublikum kennt das Format
- Holiday-Kalender für Arbeitstags-Berechnung — v3+
- ReactFlow v12 Upgrade — Breaking Change, separates Milestone-Thema
- Dark Mode — widerspricht DIN 69900 Weißhintergrund-Konvention
- Multiple Color Themes / Theme Picker — Scope Creep
- Animierte kritische-Pfad-Kanten — visuelles Risiko (Noise)
- Node-Slack-Gradient-Visualisierung — zu hohe visuelle Komplexität
- Auto-Layout via Dagre/ELK — Bundle-Kosten nicht gerechtfertigt
- Visueller Merge-Knoten-Indikator (Badge) — nur wenn User Testing Verwirrung zeigt
- Lag-Beziehungen (FS+n, SS, FF, SF) — bricht Algorithmus, separates Milestone-Thema
- Mehrere End-Knoten — erfordert virtuellen End-Knoten-Konzept

## Context

- Codebase: ~3.467 Zeilen TypeScript/TSX (v2.0)
- Tech Stack: React 19 + TypeScript + ReactFlow 11 + Vite + Vitest + Tailwind CSS + Lucide React
- Architektur: Saubere Schichttrennung (UI → Business Logic → Persistence), CPM vollständig von UI entkoppelt
- Test-Coverage: 45 Tests (serialize, validate, workdays, CPM, autosave) — 11 pre-existing failures (deutsche Fehlertexte in Tests vs. englische in Impl.)
- Design-System: 23 Named Tokens in `theme.ts`, konsistentes Color/Border/Shadow-System
- Shipped: v1.0 am 2026-03-16, v2.0 am 2026-03-17
- Tech Debt: Stale Kommentar `compute.ts:46` ("max. 1 Ausgang je Task"), pre-existing String-Mismatch in serialize.test.ts

## Constraints

- **Tech Stack**: React + TypeScript + ReactFlow 11 — kein Framework-Wechsel
- **Node-Layout**: DIN 69900 Vorgangsknotenformat bleibt unverändert
- **Client-only**: Kein Backend, kein Build-Server — statisches Hosting reicht
- **Open Source**: Code-Qualität wird öffentlich beurteilt — keine Workarounds, die im Repo sichtbar bleiben

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| DIN 69900 Node-Layout beibehalten | Standardformat für Fachpublikum, keine Verwässerung | ✓ Good — unverändert in v1.0 |
| `html-to-image` statt `dom-to-image-more` | Unmaintained Fork, Security-Risiko | ✓ Good — Migration sauber, filter-Callback funktioniert |
| Zustand entfernen | Kein einziger Import im Produktionscode — tote Dependency | ✓ Good — entfernt in v1.0 |
| Clean & Professional als UI-Richtung | Open Source GitHub-Projekt, erster Eindruck zählt | ✓ Good — Design-Token-System etabliert |
| Discriminated Union für AppNodeData | Single cast at boundary, downstream type-safe | ✓ Good — enablet as-any-freie serialize.ts |
| SaveResult API statt throws/swallows | Explizite Fehlerbehandlung ohne Exceptions | ✓ Good — QuotaExceededError surfaced |
| CP Banner background '#eff6ff' (blue-50) ≠ CRITICAL_BG | Visuell klar abgegrenzt von Node-Highlight-Farbe | ✓ Good — CP Info vs. CP Node klar unterscheidbar |
| TaskNode border-longhand statt border-shorthand | jsdom ignoriert Shorthand-Properties | ✓ Good — Tests stabil |
| criticalNodeIds Set statt greedy single-path walk | Alle null-Slack-Knoten korrekt identified — Diamond-Graphen vollständig | ✓ Good — v2.0 core algorithm |
| BFS für Cycle Detection statt DFS | getOutgoers-API von ReactFlow direkt nutzbar, kein manueller Stack | ✓ Good — sauber integriert |
| Edge-IDs `${from}-${to}` (implizit, jetzt dokumentiert) | Single-Handle-Architektur — max. 1 Kante pro Richtung zwischen Paar | ✓ Good — Duplicate-Edge-Guard konsistent damit |

---
*Last updated: 2026-03-17 after v2.0 milestone*
