# Milestones

## v2.0 Multi-Predecessor CPM (Shipped: 2026-03-17)

**Phases completed:** 2 phases, 3 plans | **Requirements:** 10/10

**Key accomplishments:**
- MULTIPLE_OUTGOING Guard entfernt — Task-Knoten akzeptieren beliebig viele ausgehende Kanten (fan-out)
- CPM Forward Pass mit `Math.max` über alle Vorgänger — korrekte FAZ bei Merge-Knoten
- `criticalNodeIds` Set-Ansatz: alle null-Slack-Knoten highlighted, inklusive Diamond-Topologien
- BFS Cycle Detection in `isValidConnection` — Drag-and-Drop-Zyklen abgefangen, Duplicate-Edge-Guard
- Live Edge State via `getEdges()` in isValidConnection — keine Stale Closures mehr
- HelpOverlay bereinigt, v1.0 Backward-Compat-Regressionstest, Edge-ID-Schema dokumentiert

---

## v1.0 MVP (Shipped: 2026-03-16)

**Phases completed:** 2 phases, 12 plans, 2 tasks

**Key accomplishments:**
- Dead Dependencies entfernt (zustand, immer) + Discriminated Union für AppNodeData eingeführt
- Vollständige Test-Suite mit 44 Tests (Serialize, Validate, Workdays, CPM, Autosave)
- Type-sichere serialize.ts: isProjectJSON guard + as-any-freie API-Grenzen
- Error Handling gehärtet: SaveResult, QuotaExceededError explizit, stille Catches eliminiert
- Icon-basierte Toolbar (Lucide) mit visueller Gruppierung, Loading-State, ghost Button-Variante
- Vollständiges 23-Token Design-System in theme.ts — null hardcodierte Hex-Werte in Komponenten

---

