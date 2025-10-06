import { Modal } from './Modal'

interface HelpOverlayProps {
  open: boolean
  onClose: () => void
}

export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  return (
    <Modal open={open} onClose={onClose} title="Legende">
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">3×3 Knotenlayout:</span> FB | Dauer | FA · Name · LS | Schlupf | LA
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verbinden: vom rechten Port zum Zielknoten (FS)</li>
          <li>Max. 1 Ausgang je Task; Start ohne Eingänge, Ziel ohne Ausgänge</li>
          <li>CP‑Highlight: Pfad und Kanten fett/kontrastreich</li>
          <li>Undo/Redo: Strg/⌘+Z / Strg/⌘+Y</li>
        </ul>
      </div>
    </Modal>
  )
}


