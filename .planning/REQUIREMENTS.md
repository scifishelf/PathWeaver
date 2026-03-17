# Requirements: PathWeaver

**Defined:** 2026-03-17
**Core Value:** Der kritische Pfad muss korrekt berechnet und klar sichtbar sein — alles andere ist sekundär.

## v2.0 Requirements

### Algorithmus & Guards

- [ ] **ALGO-01**: Nutzer kann von einem Task-Knoten beliebig viele ausgehende Kanten zeichnen (Guard-Entfernung aus `compute.ts`, `types.ts`, `GraphCanvas.tsx` atomar)
- [ ] **ALGO-02**: CPM-Berechnung ergibt korrekte FAZ-Werte bei Merge-Knoten (FAZ = max aller eingehenden FEZ)
- [ ] **ALGO-03**: Kritische-Pfad-Highlighting zeigt alle parallelen kritischen Äste (criticalNodeIds-Ansatz statt greedy single-path walk)
- [ ] **ALGO-04**: Nutzer kann keinen Zyklus durch Drag-and-Drop erzeugen (BFS Cycle Detection in `isValidConnection` via `getEdges()`/`getOutgoers`)
- [ ] **ALGO-05**: Duplicate-Edge-Guard verhindert doppelte Kanten zwischen demselben Knoten-Paar
- [ ] **ALGO-06**: `isValidConnection` liest aktuellen Kantenzustand via `getEdges()` statt stale closure

### UX & Daten

- [ ] **UX-01**: Multi-Successor-Knoten erhalten keinen roten Fehlerrahmen (`nodesWithTooManyOut` entfernt)
- [ ] **UX-02**: HelpOverlay enthält keine veralteten "max. 1 ausgehende Kante"-Hinweise
- [ ] **UX-03**: v1.0 Projektdateien (JSON) laden und berechnen korrekt ohne Migration
- [ ] **UX-04**: `serialize.ts` dokumentiert die `${from}-${to}` Edge-ID-Annahme explizit

## v3+ Requirements

*(Deferred)*

### Erweiterte Graph-Features

- **EXT-01**: Visueller Merge-Knoten-Indikator (Badge) — nur wenn User Testing Verwirrung zeigt
- **EXT-02**: Auto-Layout via Dagre oder ELK — Bundle-Kosten nicht gerechtfertigt für aktuelle Graph-Größen
- **EXT-03**: Lag-Beziehungen (FS+n, SS, FF, SF) — bricht Algorithmus und Datenmodell, separates Milestone-Thema
- **EXT-04**: Mehrere End-Knoten — erfordert virtuellen End-Knoten-Konzept

## Out of Scope

| Feature | Reason |
|---------|--------|
| ReactFlow v12 Upgrade | Breaking API Changes, explizit aus Scope per PROJECT.md |
| Backend / Serverkomponenten | Bewusst client-only |
| Auto-Layout (Dagre/ELK) | ~150KB Bundle-Kosten, nicht im Scope |
| Multiple End-Knoten | Eigenes Milestone-Thema |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ALGO-01 | Phase 3 | Pending |
| ALGO-02 | Phase 3 | Pending |
| ALGO-03 | Phase 3 | Pending |
| ALGO-04 | Phase 3 | Pending |
| ALGO-05 | Phase 3 | Pending |
| ALGO-06 | Phase 3 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 4 | Pending |
| UX-03 | Phase 4 | Pending |
| UX-04 | Phase 4 | Pending |

**Coverage:**
- v2.0 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 — traceability updated after roadmap creation*
