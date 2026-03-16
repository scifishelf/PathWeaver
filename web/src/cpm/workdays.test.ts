import '@testing-library/jest-dom/vitest'
import { addWorkdays, nextWorkday, isWeekend, formatDateShort } from './workdays'

describe('isWeekend', () => {
  it('returns true for Saturday (day 6)', () => {
    expect(isWeekend(new Date('2025-10-04'))).toBe(true) // Saturday
  })
  it('returns true for Sunday (day 0)', () => {
    expect(isWeekend(new Date('2025-10-05'))).toBe(true) // Sunday
  })
  it('returns false for Monday (day 1)', () => {
    expect(isWeekend(new Date('2025-10-06'))).toBe(false) // Monday
  })
})

describe('nextWorkday', () => {
  it('returns the same date if already a workday (Monday)', () => {
    const d = new Date('2025-10-06') // Monday
    expect(nextWorkday(d).toISOString().slice(0, 10)).toBe('2025-10-06')
  })
  it('advances Saturday to Monday', () => {
    const d = new Date('2025-10-04') // Saturday
    expect(nextWorkday(d).toISOString().slice(0, 10)).toBe('2025-10-06')
  })
})

describe('addWorkdays (TEST-03)', () => {
  it('adds 0 workdays returns the same workday', () => {
    const d = new Date('2025-10-06') // Monday
    expect(addWorkdays(d, 0).toISOString().slice(0, 10)).toBe('2025-10-06')
  })
  it('adds 5 workdays skipping weekend', () => {
    const d = new Date('2025-10-06') // Monday → +5 workdays = next Monday 2025-10-13
    expect(addWorkdays(d, 5).toISOString().slice(0, 10)).toBe('2025-10-13')
  })
  it('addWorkdays with a NaN date does not infinite-loop (ERR-03 — completes and returns a Date)', () => {
    // new Date('not-a-date') produces a NaN date
    // The GraphCanvas guard prevents this from reaching addWorkdays in production (Plan 01-06)
    // addWorkdays itself should not infinite-loop:
    //   isWeekend(NaN date) → getDay() returns NaN → NaN===0 false, NaN===6 false → returns false
    //   nextWorkday exits immediately (while loop condition is false)
    //   addWorkdays loop: remaining=3, decrements on each non-weekend step → terminates
    const invalidDate = new Date('not-a-date')
    const result = addWorkdays(invalidDate, 3)
    // Should return a Date (even if invalid/NaN) without throwing or hanging
    expect(result instanceof Date).toBe(true)
  })
})

describe('formatDateShort (UI-POLISH-01)', () => {
  it('returns DD.MM.YYYY with 4-digit year', () => {
    const d = new Date('2026-03-16')
    expect(formatDateShort(d)).toBe('16.03.2026')
  })
  it('does not return 2-digit year', () => {
    const d = new Date('2026-03-16')
    expect(formatDateShort(d)).not.toBe('16.03.26')
  })
  it('handles year 2000 correctly', () => {
    const d = new Date('2000-01-01')
    expect(formatDateShort(d)).toBe('01.01.2000')
  })
})
