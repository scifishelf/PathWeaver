import { useEffect, useState } from 'react'

export function TopRightDebug() {
  if (!import.meta.env.DEV) return null
  const [counter, setCounter] = useState(0)
  const [time, setTime] = useState('')
  useEffect(() => {
    const key = 'pw_edit_counter'
    const current = Number(localStorage.getItem(key) || '0') + 1
    localStorage.setItem(key, String(current))
    setCounter(current)
    setTime(new Date().toLocaleTimeString())
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        fontSize: 12,
        padding: '4px 8px',
        borderRadius: 6,
        boxShadow: '0 2px 6px rgba(0,0,0,.25)',
        zIndex: 9999,
      }}
    >
      <span>Edits: {counter}</span>
      <span style={{ marginLeft: 8 }}>{time}</span>
    </div>
  )
}


