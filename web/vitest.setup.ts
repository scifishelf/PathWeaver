import '@testing-library/jest-dom/vitest'
// Polyfill für React Flow im JSDOM-Umfeld
;(globalThis as any).ResizeObserver =
  (globalThis as any).ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

