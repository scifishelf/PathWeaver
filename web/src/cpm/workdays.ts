import { addDays } from 'date-fns'

export function isWeekend(d: Date): boolean {
  const day = d.getDay() // 0=So,6=Sa
  return day === 0 || day === 6
}

export function nextWorkday(date: Date): Date {
  let d = new Date(date)
  while (isWeekend(d)) d = addDays(d, 1)
  return d
}

export function addWorkdays(start: Date, n: number): Date {
  let d = nextWorkday(start)
  let remaining = n
  while (remaining > 0) {
    d = addDays(d, 1)
    if (!isWeekend(d)) remaining--
  }
  return d
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

export function formatDateShort(d: Date): string {
  const dd = pad2(d.getDate())
  const mm = pad2(d.getMonth() + 1)
  const yy = pad2(d.getFullYear() % 100)
  return `${dd}.${mm}.${yy}`
}

// Formatiert eine Arbeitstag-Offset (ab Projektstart) zu TT.MM.JJ
export function formatWorkdayToDate(startISO: string | undefined, workday?: number): string {
  if (!startISO || workday === undefined || workday === null) return '—'
  try {
    const start = nextWorkday(new Date(startISO))
    const d = addWorkdays(start, workday)
    return formatDateShort(d)
  } catch {
    return '—'
  }
}


