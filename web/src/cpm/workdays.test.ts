import '@testing-library/jest-dom/vitest'
import { addWorkdays, nextWorkday, isWeekend } from './workdays'

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
  it.todo('throws or returns invalid date on non-ISO startDate (ERR-03 — after ERR-03 fix in Plan 01-06)')
})
