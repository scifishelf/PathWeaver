import type { ReactNode } from 'react'

export function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-yellow-50 text-yellow-900 border border-yellow-200 rounded px-3 py-2 text-sm">
      {children}
    </div>
  )
}


