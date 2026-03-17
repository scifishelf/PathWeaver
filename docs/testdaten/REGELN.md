# Regeln für gültige PathWeaver-Testdaten

## CPM-Engine-Constraints

### Kardinalregel: Task-Knoten dürfen nur 1 ausgehende Kante haben

Die CPM-Berechnung (`compute.ts`) wirft einen Fehler wenn ein `type: "task"`-Knoten mehr als eine ausgehende Kante hat:

```
ComputeError: MULTIPLE_OUTGOING — Mehr als 1 Ausgang an Knoten <id>
```

**Wichtig**: `validateGraph` prüft dies NICHT — deshalb erscheint kein Fehler-Banner in der UI, aber der kritische Pfad wird trotzdem nicht berechnet. Die betroffenen Knoten werden rot eingefärbt.

---

## Erlaubte Strukturen

| Knotentyp | Eingehende Kanten | Ausgehende Kanten |
|-----------|-------------------|-------------------|
| `start`   | 0                 | **beliebig viele** |
| `task`    | beliebig viele    | **max. 1**         |
| `end`     | beliebig viele    | 0                  |

---

## Parallelarbeit modellieren

Da Task-Knoten keine Verzweigungen erlauben, gibt es nur eine Möglichkeit, echte parallele Pfade zu modellieren: **Den Start-Knoten als einzigen Fork-Punkt nutzen.**

### Muster: Parallele Phasen ab Start

```
Start ──► Task A1 ──► Task A2 ──► Task A3 ──┐
      ├──► Task B1 ──► Task B2 ──► Task B3 ──┤──► Meilenstein (duration=0) ──► ...
      └──► Task C1 ──► Task C2 ──► Task C3 ──┘
```

- Start verzweigt in N parallele Ketten
- Jede Kette ist vollständig sequentiell
- Alle Ketten laufen an einem **Meilenstein-Knoten** zusammen (duration=0, viele eingehende Kanten erlaubt)
- Ab dem Meilenstein weiter sequentiell (oder wieder mit diesem Muster, falls ein weiterer Fork nötig ist)

### Was NICHT geht

```
Task X ──► Task Y   ← FEHLER: Task X hat 2 ausgehende Kanten
       └──► Task Z
```

Ein Task kann nicht selbst verzweigen. Nur Start kann das.

---

## Warum kein visueller Hinweis?

- `validateGraph` prüft nur: Zyklen, verwaiste Knoten, Start ohne Eingang, Ziel ohne Ausgang
- Die roten Kanten-Knotengrenzen (`nodesWithTooManyOut` in GraphCanvas.tsx) sind nur ein visueller Hinweis — sie blockieren die CPM-Berechnung nicht
- `computeCPM` wird aufgerufen wenn `validateGraph` keine Fehler zurückgibt, aber `computeCPM` kann selbst werfen → kritischer Pfad bleibt `undefined`, Zielknoten zeigt keine Zahlen

---

## Checkliste vor dem Speichern einer Testdatei

- [ ] Genau ein `type: "start"` Knoten
- [ ] Genau ein `type: "end"` Knoten
- [ ] Kein `task`-Knoten hat mehr als 1 ausgehende Kante (Edges mit `"from": "<taskId>"` zählen)
- [ ] Alle Knoten sind vom Start aus erreichbar (keine Orphans)
- [ ] Kein Zyklus vorhanden
- [ ] `startDate` in `settings` ist ein gültiges ISO-Datum (YYYY-MM-DD)
- [ ] Alle `task`-Knoten haben ein `duration`-Feld ≥ 0

---

## Beispieldateien

| Datei | Beschreibung | Besonderheit |
|-------|-------------|--------------|
| `doenerladen-tagesablauf.json` | Döner-Laden Tagesablauf | Start verzweigt in 2 parallele Vorbereitungsketten |
| `mars-kolonisierung.json` | Mars-Kolonisierung (~100 Knoten) | Start verzweigt in 7 R&D-Ketten, danach sequentiell |
