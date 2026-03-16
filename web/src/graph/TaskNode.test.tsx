import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { TaskNode } from './TaskNode'
import { COLOR_ACCENT, COLOR_ACCENT_LIGHT, COLOR_BORDER, COLOR_BG } from './theme'

// Mock ReactFlow Handle component — not available in jsdom
vi.mock('reactflow', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
  memo: (c: unknown) => c,
}))

function makeData(critical?: boolean) {
  return {
    id: 'test-node-1',
    title: 'Test Task',
    duration: 3,
    computed: critical !== undefined ? { critical, ES: 0, EF: 3, LS: 0, LF: 3, slack: 0 } : undefined,
    onEdit: vi.fn(),
  }
}

// jsdom converts hex to rgb() for color properties.
// COLOR_ACCENT  #2563eb → rgb(37, 99, 235)
// COLOR_ACCENT_LIGHT #dbeafe → rgb(219, 234, 254)
// COLOR_BORDER  #d4d4d8 → rgb(212, 212, 216)
// COLOR_BG      #ffffff → rgb(255, 255, 255)
const RGB_ACCENT       = 'rgb(37, 99, 235)'
const RGB_ACCENT_LIGHT = 'rgb(219, 234, 254)'
const RGB_BORDER       = 'rgb(212, 212, 216)'
const RGB_BG           = 'rgb(255, 255, 255)'

// Silence the assertion: verify token constant has the expected hex value
// so tests remain tied to theme.ts values
const _assertTokens = () => {
  // These will fail at compile time if theme.ts changes the values
  const _: typeof COLOR_ACCENT       = '#2563eb'
  const __: typeof COLOR_ACCENT_LIGHT = '#dbeafe'
  const ___: typeof COLOR_BORDER     = '#d4d4d8'
  const ____: typeof COLOR_BG        = '#ffffff'
  void _, void __, void ___, void ____
}
void _assertTokens

describe('TaskNode (UI-CRIT-02)', () => {
  it('renders without crashing when no computed data', () => {
    render(<TaskNode data={makeData()} />)
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
  })

  it('critical node has COLOR_ACCENT border (#2563eb)', () => {
    const { container } = render(<TaskNode data={makeData(true)} />)
    const outerDiv = container.firstChild as HTMLElement
    // jsdom stores borderColor as rgb(); check against both the token hex and the rgb equivalent
    expect(outerDiv.style.borderColor).toBe(RGB_ACCENT)
    expect(COLOR_ACCENT).toBe('#2563eb')
  })

  it('critical node has COLOR_ACCENT_LIGHT background (#dbeafe)', () => {
    const { container } = render(<TaskNode data={makeData(true)} />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.style.background).toBe(RGB_ACCENT_LIGHT)
    expect(COLOR_ACCENT_LIGHT).toBe('#dbeafe')
  })

  it('non-critical node has COLOR_BORDER border (#d4d4d8)', () => {
    const { container } = render(<TaskNode data={makeData(false)} />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.style.borderColor).toBe(RGB_BORDER)
    expect(COLOR_BORDER).toBe('#d4d4d8')
  })

  it('non-critical node has COLOR_BG background (#ffffff)', () => {
    const { container } = render(<TaskNode data={makeData(false)} />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.style.background).toBe(RGB_BG)
    expect(COLOR_BG).toBe('#ffffff')
  })
})
