## PathWeaver JSON-Format (v1.0)

Dieses Dokument beschreibt das Import/Export-Format von PathWeaver. Es ist so formuliert, dass Tools wie ChatGPT Daten erzeugen, prüfen und verändern können.

- Version: `settings.version` ist aktuell "1.0" und Pflicht.
- Koordinaten sind Pixel im Canvas; Zeiten sind Arbeitstage (AT) relativ zum Projektstart.

### Top‑Level Struktur

```json
{
  "settings": {
    "version": "1.0",
    "startDate": "2025-10-07",
    "workweek": [1,2,3,4,5]
  },
  "nodes": [],
  "edges": []
}
```

### settings
- `version` (string, Pflicht): Formatversion ("1.0").
- `startDate` (string, optional): ISO-Datum YYYY-MM-DD, Projektstart.
- `workweek` (Array<number>, optional): 1..7 (1=Mo), Arbeitstage.

### nodes
Gemeinsame Felder:
- `id` (string, Pflicht)
- `type` ("start" | "task" | "end", Pflicht)
- `x`, `y` (number, optional)

Tasks (`type: "task"`):
- `title` (string, optional)
- `duration` (number, Pflicht, >= 0)

Start/Ende (`type: "start"|"end"`):
- keine zusätzlichen Pflichtfelder

Beispiele:
```json
{"id":"start","type":"start","x":120,"y":300}
{"id":"N1","type":"task","title":"Analyse","duration":3,"x":420,"y":200}
{"id":"end","type":"end","x":1040,"y":300}
```

### edges
- `from` (string, Pflicht)
- `to` (string, Pflicht)

```json
{"from":"start","to":"N1"}
```

### Regeln (Kurzfassung)
- Genau ein Start- und ein End-Knoten.
- Start hat keine Eingänge, Ende keine Ausgänge.
- Jeder `task` max. 1 ausgehenden Edge.
- Alle Knoten außer `start` sind vom Start erreichbar.

Diese Regeln prüft die App beim Import.

### Beispielprojekt
```json
{
  "settings": { "version": "1.0", "startDate": "2025-10-07" },
  "nodes": [
    { "id": "start", "type": "start", "x": 120, "y": 300 },
    { "id": "N1", "type": "task", "title": "Analyse", "duration": 3, "x": 420, "y": 200 },
    { "id": "N2", "type": "task", "title": "Umsetzung", "duration": 4, "x": 720, "y": 220 },
    { "id": "end", "type": "end", "x": 1040, "y": 300 }
  ],
  "edges": [
    { "from": "start", "to": "N1" },
    { "from": "N1", "to": "N2" },
    { "from": "N2", "to": "end" }
  ]
}
```

### JSON‑Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://pathweaver.dev/schema/v1.json",
  "type": "object",
  "properties": {
    "settings": {
      "type": "object",
      "properties": {
        "version": { "const": "1.0" },
        "startDate": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
        "workweek": {
          "type": "array",
          "items": { "type": "integer", "minimum": 1, "maximum": 7 },
          "uniqueItems": true
        }
      },
      "required": ["version"],
      "additionalProperties": true
    },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "minLength": 1 },
          "type": { "enum": ["start", "task", "end"] },
          "title": { "type": "string" },
          "duration": { "type": "number", "minimum": 0 },
          "x": { "type": "number" },
          "y": { "type": "number" }
        },
        "required": ["id", "type"],
        "additionalProperties": true
      }
    },
    "edges": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "from": { "type": "string", "minLength": 1 },
          "to": { "type": "string", "minLength": 1 }
        },
        "required": ["from", "to"],
        "additionalProperties": false
      }
    }
  },
  "required": ["nodes", "edges"],
  "additionalProperties": false
}
```

Hinweis: Geschäftsregeln (z.B. „Start hat keine Eingänge“) sind nur teilweise im Schema abbildbar und werden zusätzlich in der App geprüft.


