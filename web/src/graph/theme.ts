// Design tokens — single source of truth for all visual values
// Format: TypeScript UPPER_SNAKE_CASE constants (no CSS custom properties)

// ─── Legacy tokens (preserved for backward-compat imports) ───────────────────
export const COLOR_BG = '#0a0f1e'            // formerly white; now deep-space base
export const COLOR_SURFACE = 'rgba(255,255,255,0.06)'  // glass panel surface
export const COLOR_BORDER = 'rgba(255,255,255,0.12)'   // glass border
export const COLOR_TEXT = '#f8fafc'          // primary text (white)
export const COLOR_TEXT_MUTED = 'rgba(255,255,255,0.55)' // secondary text
export const COLOR_ACCENT = '#60a5fa'        // electric blue
export const COLOR_ACCENT_LIGHT = 'rgba(34,211,238,0.08)' // critical path bg tint

// Radius
export const RADIUS_SM = 6   // inputs, small elements
export const RADIUS_MD = 12  // nodes, panels

// Shadows
export const SHADOW_SM = '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
export const SHADOW_MD = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'

// Transitions
export const TRANSITION_DEFAULT = 'all 200ms ease'

// Canvas
export const COLOR_CANVAS_BG = '#0a0f1e'

// Validation / Error state
export const COLOR_ERROR = '#f87171'
export const COLOR_ERROR_BG = 'rgba(248,113,113,0.1)'
export const COLOR_ERROR_BORDER = 'rgba(248,113,113,0.25)'

// Warning / Quota state
export const COLOR_WARNING_BG = 'rgba(251,191,36,0.1)'
export const COLOR_WARNING_BORDER = 'rgba(251,191,36,0.25)'
export const COLOR_WARNING_TEXT = '#fbbf24'

// FAB (Floating Action Button — Add Task)
export const COLOR_FAB = '#34d399'
export const COLOR_FAB_BORDER = 'rgba(52,211,153,0.2)'

// Critical path (backward-compat aliases)
export const CRITICAL_BG = COLOR_ACCENT_LIGHT
export const CRITICAL_BORDER = 'rgba(34,211,238,0.35)'

// ─── New Glassmorphism tokens ─────────────────────────────────────────────────
export const GLASS_BG = 'rgba(255,255,255,0.06)'
export const GLASS_BG_HOVER = 'rgba(255,255,255,0.10)'
export const GLASS_BG_ACTIVE = 'rgba(255,255,255,0.14)'
export const GLASS_BORDER = 'rgba(255,255,255,0.12)'
export const GLASS_BORDER_STRONG = 'rgba(255,255,255,0.20)'
export const GLASS_BLUR = 'blur(20px)'
export const GLASS_SHADOW = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'

// Glow Effects
export const GLOW_ACCENT = '0 0 20px rgba(96,165,250,0.35)'
export const GLOW_CRITICAL = '0 0 24px rgba(34,211,238,0.45)'
export const GLOW_ERROR = '0 0 16px rgba(248,113,113,0.3)'
export const GLOW_SUCCESS = '0 0 16px rgba(52,211,153,0.3)'

// New accent colors
export const COLOR_ACCENT_VIOLET = '#a78bfa'
export const COLOR_CRITICAL = '#22d3ee'
export const BG_GRADIENT = 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #1a0533 100%)'
