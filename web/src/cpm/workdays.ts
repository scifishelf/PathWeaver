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


