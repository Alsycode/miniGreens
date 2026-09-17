// ─────────────────────────────────────────────────────────────────────────────
// COLOR TOKENS
//
// Phase 2 (Home Screen refinement — Foundation) introduced a semantic layer that
// maps the reference `assets/homescreen.png` visual language onto the app:
//
//   • a deep charcoal-green ENVIRONMENT, not cold pure black
//   • barely-there surfaces + borders, so cards stop reading as "outlined black
//     boxes" and start feeling elevated inside one environment
//   • ONE bright brand green used strictly as an ACCENT (price, links, active
//     nav, selected state, key badges) plus a soft/dark green reserved for
//     structure — chips, icon pills, hairlines, pressed states
//
// Every key that existed before Phase 2 is kept (as an alias where its value was
// re-pointed) so other screens and components keep working unchanged. Only the
// shared dark-environment values were nudged; brand + status hues are untouched.
// ─────────────────────────────────────────────────────────────────────────────

// ── Raw brand green ──────────────────────────────────────────────────────────
// Nudged off fluorescent lime (#96FF1F) toward a fresher *botanical* green so it
// reads as part of the environment rather than a highlighter. Still bright
// enough to anchor price / active nav / primary CTA / selected state.
const ACCENT = '#8BE04B';       // fresh botanical green — the single brand accent
const ACCENT_SOFT = '#6FB83C';  // darker green — pressed/hover, secondary marks
const ON_ACCENT = '#06130D';    // near-black used for text/icons on green fills

export const colors = {
  // ═══ SEMANTIC TOKENS (prefer these going forward) ═════════════════════════

  // Environment — the dark botanical base
  backgroundSunken:   '#070908', // deepest wells / status area
  background:          '#0A0D0B', // app base: near-black with a forest cast
  backgroundElevated:  '#0E1310', // ground behind card groups / sections

  // Surfaces — subtly raised, green-charcoal, translucent where useful
  surface:            '#141A15', // standard card
  surfaceElevated:    '#1A211B', // card that must separate from another card
  surfaceVariant:     '#1B221C', // inputs, secondary fills, image placeholders
  surfaceDark:        '#0C1F16', // editorial / promo blocks (green-tinted)
  surfaceDarkMid:     '#12281C',
  surfaceTranslucent: 'rgba(18,24,19,0.72)', // search field / bottom nav layer

  // Borders — define structure without becoming the visual
  borderFaint:        'rgba(255,255,255,0.04)',
  borderSubtle:       'rgba(255,255,255,0.06)',
  border:             '#232A24', // legacy alias — softened from #2A2A2A
  borderLight:        '#1A201B', // legacy alias — softened from #232323
  borderStrong:       'rgba(255,255,255,0.12)',
  borderAccent:       'rgba(139,224,75,0.34)', // selected category / focus ring

  // Text
  textPrimary:        '#F3F5F0',
  text:               '#F3F5F0', // legacy alias → textPrimary
  textSecondary:      '#9BA69B', // supporting copy
  textMuted:          '#69736B', // captions / least emphasis
  textTertiary:       '#69736B', // legacy alias → textMuted
  textInverse:        '#FFFFFF', // white text over product photography / overlays
  onAccent:           ON_ACCENT, // dark text/icons on green fills
  textAcid:           ACCENT,

  // Accent system
  accent:             ACCENT,
  accentSoft:         ACCENT_SOFT,
  accentDim:          'rgba(139,224,75,0.55)',
  accentSurface:      '#16281B',                 // dark green chip / icon-pill bg
  accentSurfaceStrong:'rgba(139,224,75,0.14)',   // tint over imagery / hover

  // ═══ BRAND (unchanged) ═══════════════════════════════════════════════════
  primary:      ACCENT,     // CTAs, active states, links, price highlights
  primaryLight: '#6EE7B7',
  primaryDark:  '#10B981',  // deeper green: emphasis text + icons on dark
  primaryBg:    '#13251A',  // legacy alias → accentSurface

  secondary:      ACCENT,   // bestseller pills, highlights
  secondaryLight: '#DDF590',

  accentLight: '#1E2A0C',   // dark lime tint

  // ═══ STATUS (unchanged) ══════════════════════════════════════════════════
  error: '#F87171',
  errorLight: '#2A1416',
  success: '#4ADE80',
  successLight: '#12251A',
  warning: '#FBBF24',
  warningLight: '#2A2010',
  info: '#60A5FA',
  infoLight: '#111E33',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.55)',

  green: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  warm: {
    50: '#FEF7EE',
    100: '#FDE8D6',
    200: '#F9D0A8',
    300: '#F5B87A',
    400: '#F1A04C',
    500: '#ED881E',
    600: '#CC6D14',
    700: '#A0520F',
    800: '#74370A',
    900: '#481C05',
  },
} as const;

export type ColorName = keyof typeof colors;
