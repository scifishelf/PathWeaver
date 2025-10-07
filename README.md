# PathWeaver

PathWeaver ist ein leichtgewichtiges, interaktives Netzplan‑Tool (CPM) für den Browser. Ziel ist es, Projekte schnell zu modellieren, den kritischen Pfad zu erkennen und Termine transparent zu machen – ohne komplexe PM‑Suiten.

## Features
- Interaktiver Editor mit Drag‑&‑Drop‑Knoten (Start, Task, Ziel)
- Automatische Validierung (z. B. keine Eingänge am Start, max. ein Ausgang je Task)
- Berechnung des kritischen Pfads (CPM) inkl. ES/EF/LS/LF und Schlupf
- Visuelle Hervorhebung des kritischen Pfades über blaue Hintergrundfarbe
- Datumshandling: Projekt‑Startdatum, Termine pro Knoten (abgeleitet)
- Snapshots (lokal): anlegen, auflisten, laden, löschen
- JSON‑Export/Import des Projekts
- PNG‑Export des aktuellen Netzplans

## Sinn und Zweck
PathWeaver richtet sich an Teams, die
- Abhängigkeiten und Engpässe sichtbar machen möchten,
- schnelle Was‑wäre‑wenn‑Analysen durchführen,
- und Ergebnisse einfach teilen (PNG/JSON) wollen.

Der Fokus liegt bewusst auf Klarheit statt Feature‑Fülle. Alles ist lokal (LocalStorage), keine Server‑Abhängigkeit.

## Schnellstart (lokal)
Voraussetzung: Node.js (aktuell LTS)

```bash
cd web
npm install
npm run dev
```

Build:
```bash
npm run build
```

Die App läuft standardmäßig unter `http://localhost:5173` (Vite).

## Bedienung (Kurzüberblick)
- Start/Ende sind vorgegeben; neue Tasks mit dem grünen + hinzufügen
- Kanten durch Ziehen zwischen Handles erstellen
- Dauer und Task‑Titel direkt im Knoten bearbeiten
- Startdatum oben links im Start‑Knoten setzen
- Toolbar (oben rechts): Export, Snapshots, Import, PNG

## Datenformat (JSON)
Das Import/Export‑Format ist in `docs/json-format.md` beschrieben. Ein formales JSON‑Schema liegt unter `docs/json-schema.v1.json` bei.

- Versionierung über `settings.version` (derzeit "1.0")
- Enthält `settings`, `nodes`, `edges`; optional `computed` (nur Ausgabe)

## Architektur‑Notizen
- Frontend: React + TypeScript + React Flow + Vite
- Kernlogik CPM: `web/src/cpm/compute.ts`
- Graph‑Validierung: `web/src/graph/validate.ts`
- Persistenz/Snapshots: LocalStorage (`web/src/persistence/*`)

## Entwicklung
- Lint/Typecheck: `npm run build` im `web/`-Ordner
- Tests (Vitest) vorhanden für CPM‑Berechnung (`web/src/cpm/compute.test.ts`)

## Lizenz
Internes Projekt (MVP). Nutzung nach Absprache.
