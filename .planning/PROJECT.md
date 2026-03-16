# PathWeaver

## What This Is

PathWeaver ist ein browserbasiertes CPM-Netzplan-Tool (Critical Path Method) nach DIN 69900. Es ermöglicht das visuelle Erstellen und Berechnen von Projektnetzplänen mit automatischer Berechnung des kritischen Pfads, Pufferzeiten und Projektdauer — vollständig client-seitig, ohne Backend.

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

### Active

#### Ziel 1 — Code-Qualität & Stabilität

- [ ] Bugfix: Node-IDs auf `crypto.randomUUID()` umstellen (keine Timestamp-Kollisionen)
- [ ] Bugfix: Snapshot-Keys mit Random-Suffix (keine Millisekunden-Kollisionen)
- [ ] Bugfix: JSON-Import gegen `docs/json-schema.v1.json` validieren vor dem Parsen
- [ ] Bugfix: `QuotaExceededError` in `autosave.ts` abfangen
- [ ] Bugfix: `startDate`-Format vor Datums-Arithmetik validieren
- [ ] Tech Debt: `dom-to-image-more` durch `html-to-image` ersetzen
- [ ] Tech Debt: Zustand-Dependency entfernen oder korrekt adoptieren
- [ ] Tech Debt: Silent catch blocks — mindestens `console.error` einbauen
- [ ] Tech Debt: `TopRightDebug.tsx` hinter `import.meta.env.DEV` verstecken
- [ ] Tech Debt: Kritische `as any`-Casts in `serialize.ts` durch Type Guards ersetzen
- [ ] Tests: Serialisierungs-Round-Trip (`toProjectJSON` ↔ `fromProjectJSON`)
- [ ] Tests: Graph-Validierungsregeln (`validate.ts`)
- [ ] Tests: Workday-Arithmetik (`workdays.ts`)
- [ ] Tests: CPM-Fehlerpfade & Edge-Cases (Zyklen, einzelner Knoten, disconnected Subgraph)

#### Ziel 2 — UI: Clean & Professional

- [ ] Header & Branding: "MVP" aus Titel entfernen, App-Name überarbeiten
- [ ] Farben & Typografie: Konsistentes Design-System, Clean & Professional
- [ ] Toolbar: Icons, Gruppierung, sauberes Layout (Export/Import/Snapshots/PNG)
- [ ] Kritischer Pfad: Überarbeiteter Banner, deutlicheres Node-Highlighting
- [ ] PNG-Export: Ladeindikator während DOM-Rendering (UI friert derzeit 1–3s ein)
- [ ] Datumformat: Konsistenz (aktuell "06.10.25" vs "06.10.2025")
- [ ] Vite-Template-Boilerplate entfernen (`vite.svg`, `react.svg`)

### Out of Scope

- Backend / Serverkomponenten — bewusst client-only
- User Authentication — kein Multi-User-Szenario geplant
- Mobile App — Web first
- Node-Labels im DIN-Grid (FAZ/FEZ etc.) — Fachpublikum kennt das Format
- Holiday-Kalender für Arbeitstags-Berechnung — v2
- ReactFlow v12 Upgrade — Breaking Change, separates Milestone-Thema
- Verschlüsselung von localStorage — kein sensitives Datenschutz-Risiko für diesen Use Case

## Context

- Bestehende Codebase: ~1000 Zeilen Produktionscode, React 19 + TypeScript + ReactFlow 11 + Vite
- Architektur: Saubere Schichttrennung (UI → Business Logic → Persistence), CPM vollständig von UI entkoppelt
- Test-Coverage: Minimal (2 Test-Dateien: `compute.test.ts`, `App.test.tsx`)
- Codebase-Map erstellt am 2026-03-16 unter `.planning/codebase/`

## Constraints

- **Tech Stack**: React + TypeScript + ReactFlow 11 — kein Framework-Wechsel
- **Node-Layout**: DIN 69900 Vorgangsknotenformat bleibt unverändert
- **Client-only**: Kein Backend, kein Build-Server — statisches Hosting reicht
- **Open Source**: Code-Qualität wird öffentlich beurteilt — keine Workarounds, die im Repo sichtbar bleiben

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| DIN 69900 Node-Layout beibehalten | Standardformat für Fachpublikum, keine Verwässerung | — Pending |
| `html-to-image` statt `dom-to-image-more` | Unmaintained Fork, Security-Risiko | — Pending |
| Zustand entfernen oder adoptieren | Aktuell installiert aber ungenutzt | — Pending |
| Clean & Professional als UI-Richtung | Open Source GitHub-Projekt, erster Eindruck zählt | — Pending |

---
*Last updated: 2026-03-16 after initialization*
