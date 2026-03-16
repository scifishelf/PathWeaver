// Design tokens — single source of truth for all visual values
// Format: TypeScript UPPER_SNAKE_CASE constants (no CSS custom properties)

// Colors
export const COLOR_BG = '#ffffff'           // canvas background, normal node background
export const COLOR_SURFACE = '#f4f4f5'      // toolbar, panels, Start/End node background
export const COLOR_BORDER = '#d4d4d8'       // nodes, inputs, toolbar border
export const COLOR_TEXT = '#18181b'         // primary text
export const COLOR_TEXT_MUTED = '#71717a'   // secondary text
export const COLOR_ACCENT = '#2563eb'       // CP border, focus-visible rings, CP banner border
export const COLOR_ACCENT_LIGHT = '#dbeafe' // CP node background fill only

// Radius
export const RADIUS_SM = 6   // inputs, small elements
export const RADIUS_MD = 8   // nodes, buttons, panels

// Shadows
export const SHADOW_SM = '0 1px 3px rgba(0,0,0,.12)'  // nodes, buttons
export const SHADOW_MD = '0 4px 12px rgba(0,0,0,.12)' // dropdowns, panels

// Transitions
export const TRANSITION_DEFAULT = 'all 150ms ease' // hover states, focus rings

// Critical path (backward-compat aliases — Phase 1 code imports these by name)
export const CRITICAL_BG = COLOR_ACCENT_LIGHT  // alias: was '#dbeafe' directly, now via token
export const CRITICAL_BORDER = COLOR_ACCENT    // new in Phase 2
