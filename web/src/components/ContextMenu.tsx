import { useEffect } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  items: { label: string; onClick: () => void; disabled?: boolean }[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const onAny = () => onClose()
    // Nur auf Click schließen, nicht auf dasselbe contextmenu‑Event, das das Menü öffnet
    window.addEventListener('click', onAny)
    return () => {
      window.removeEventListener('click', onAny)
    }
  }, [onClose])

  return (
    <div
      className="fixed bg-white border rounded shadow text-sm"
      style={{ left: x, top: y, zIndex: 10000, minWidth: 140 }}
    >
      {items.map((it, idx) => (
        <button
          key={idx}
          className="block w-full text-left px-3 py-2 hover:bg-neutral-50 disabled:text-neutral-400"
          onClick={it.onClick}
          disabled={it.disabled}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}


