import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders app header and shows React Flow canvas', () => {
    render(<App />)
    expect(screen.getByText(/Netzplan/i)).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('(MVP)')
    // React Flow wrapper present
    expect(screen.getByTestId('rf__wrapper')).toBeInTheDocument()
  })
})

