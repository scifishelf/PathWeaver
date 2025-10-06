import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders MVP header and shows React Flow canvas', () => {
    render(<App />)
    expect(screen.getByText(/Netzplan/i)).toBeInTheDocument()
    // React Flow wrapper present
    expect(screen.getByTestId('rf__wrapper')).toBeInTheDocument()
  })
})

