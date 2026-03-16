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

// Canvas
export const COLOR_CANVAS_BG = '#eef2f7'    // ReactFlow canvas background (lighter than white nodes)

// Validation / Error state
export const COLOR_ERROR = '#ef4444'         // invalid edge stroke, orphaned node border (red-500)
export const COLOR_ERROR_BG = '#fee2e2'      // error banner background (red-100)
export const COLOR_ERROR_BORDER = '#fecaca'  // error banner border (red-200)

// Warning / Quota state
export const COLOR_WARNING_BG = '#fefce8'    // quota warning background (yellow-50)
export const COLOR_WARNING_BORDER = '#fef08a' // quota warning border (yellow-200)
export const COLOR_WARNING_TEXT = '#854d0e'   // quota warning text (yellow-800)

// FAB (Floating Action Button — Add Task)
export const COLOR_FAB = '#16a34a'           // FAB background (green-600)
export const COLOR_FAB_BORDER = '#065f46'    // FAB border (green-900)

// Critical path (backward-compat aliases — Phase 1 code imports these by name)
export const CRITICAL_BG = COLOR_ACCENT_LIGHT  // alias: was '#dbeafe' directly, now via token
export const CRITICAL_BORDER = COLOR_ACCENT    // new in Phase 2
