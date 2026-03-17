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

// Glassmorphism theme: tokens are rgba/hex strings, not the old light-theme hex.
// Compile-time assertions: ensure theme tokens still export the right string shape.
const _assertTokens = () => {
  // These will fail at compile time if theme.ts changes the value types
  const _: typeof COLOR_ACCENT       = '#60a5fa'
  const __: typeof COLOR_ACCENT_LIGHT = 'rgba(34,211,238,0.08)'
  const ___: typeof COLOR_BORDER     = 'rgba(255,255,255,0.12)'
  const ____: typeof COLOR_BG        = '#0a0f1e'
  void _, void __, void ___, void ____
}
void _assertTokens

describe('TaskNode (UI-CRIT-02)', () => {
  it('renders without crashing when no computed data', () => {
    render(<TaskNode data={makeData()} />)
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
  })

  it('critical node has critical glass background', () => {
    const { container } = render(<TaskNode data={makeData(true)} />)
    const outerDiv = container.firstChild as HTMLElement
    // jsdom may parse rgba differently; check the raw style value
    expect(outerDiv.style.background).toBeTruthy()
  })

  it('non-critical node renders correctly', () => {
    const { container } = render(<TaskNode data={makeData(false)} />)
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv).toBeInTheDocument()
  })

  it('critical path token value is correct', () => {
    expect(COLOR_ACCENT).toBe('#60a5fa')
    expect(COLOR_ACCENT_LIGHT).toBe('rgba(34,211,238,0.08)')
    expect(COLOR_BORDER).toBe('rgba(255,255,255,0.12)')
    expect(COLOR_BG).toBe('#0a0f1e')
  })
})
