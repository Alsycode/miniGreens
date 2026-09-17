// ─────────────────────────────────────────────────────────────────────────────
// COLOR TOKENS
//
// ⚠️ TEA-FOCUS LIGHT THEME (2026-09-08) — app-wide flip to the reference
// "Microgreen Tea" design language: a pale-green canvas, white cards, a deep
// forest green for CTAs / active nav / emphasis, and an olive green for price /
// links / selected marks. Previous dark botanical palette is preserved in
// `colors.dark.bak.ts`:
//   Move-Item -Force src/theme/colors.dark.bak.ts src/theme/colors.ts
// Every key kept its name; only values changed, so components need no edits.
// ─────────────────────────────────────────────────────────────────────────────

// ── Brand green (one, unified: #6f8f4a) ─────────────────────────────────────
// 2026-09-09 — collapsed the former two-tone system (deep forest CTA + olive
// accent) onto a single brand green. Pressed / light variants are derived from
// the same hue so depth cues survive.
const PRIMARY = '#6f8f4a';       // brand green — primary CTA, active tab, emphasis
const PRIMARY_SOFT = '#5a7539';  // pressed / darker
const ACCENT = '#6f8f4a';        // same green — price, links, selected, filter icon, underline
const ACCENT_SOFT = '#5a7539';   // pressed / small green text
const ON_ACCENT = '#FFFFFF';     // text/icons on green fills

export const colors = {
  // ═══ SEMANTIC TOKENS ═════════════════════════════════════════════════════

  // Environment — pale green canvas
  backgroundSunken:   '#EAF0DB',
  background:          '#F3F7EA', // app base — barely-there green tint
  backgroundElevated:  '#EDF3DF', // ground behind card groups / sections

  // Surfaces
  surface:            '#FFFFFF', // standard card
  surfaceElevated:    '#FFFFFF', // card that must separate from another card
  surfaceVariant:     '#EFF3E4', // inputs, secondary fills, image placeholders
  surfaceDark:        '#E7EFD5', // editorial / promo tint blocks
  surfaceDarkMid:     '#DBE7C4',
  surfaceTranslucent: '#FFFFFF', // search field / bottom nav layer (solid white)

  // Borders
  borderFaint:        'rgba(30,45,25,0.05)',
  borderSubtle:       'rgba(30,45,25,0.08)',
  border:             '#E2E8D3',
  borderLight:        '#EDF1E2',
  borderStrong:       'rgba(30,45,25,0.16)',
  borderAccent:       'rgba(111,143,74,0.42)', // selected category / focus ring

  // Text
  textPrimary:        '#1D2B20',
  text:               '#1D2B20',
  textSecondary:      '#5B6B52',
  textMuted:          '#8A957E',
  textTertiary:       '#8A957E',
  textInverse:        '#FFFFFF', // text over photography / dark promo blocks
  onAccent:           ON_ACCENT,
  textAcid:           ACCENT_SOFT,

  // Accent system
  accent:             ACCENT,
  accentSoft:         ACCENT_SOFT,
  accentDim:          'rgba(111,143,74,0.55)',
  accentSurface:      '#E7EFD5', // pale green chip / icon-pill bg
  accentSurfaceStrong:'rgba(111,143,74,0.16)',

  // ═══ BRAND ═══════════════════════════════════════════════════════════════
  primary:      PRIMARY,       // CTAs, active states, emphasis
  primaryLight: '#9DBA80',      // lighter tint of the brand green
  primaryDark:  PRIMARY_SOFT,
  primaryBg:    '#E7EFD5',

  secondary:      PRIMARY,     // headings emphasis, key marks
  secondaryLight: '#C6D9A9',

  accentLight: '#E7EFD5',

  // ═══ STATUS ══════════════════════════════════════════════════════════════
  error: '#D64545',
  errorLight: '#FBEAEA',
  success: '#6f8f4a',
  successLight: '#E7EFD5',
  warning: '#D98A1F',
  warningLight: '#FBF0DE',
  info: '#3B7FD1',
  infoLight: '#E7F0FB',

  overlay: 'rgba(20, 28, 18, 0.45)',
  shadow: 'rgba(30, 45, 20, 0.14)',

  // Monochrome ramp of the brand green (#6f8f4a at 500)
  green: {
    50: '#F0F3E9',
    100: '#DDE5CB',
    200: '#C7D4AC',
    300: '#A9BE85',
    400: '#8CA664',
    500: '#6f8f4a',
    600: '#5E7A3E',
    700: '#4B6132',
    800: '#394B26',
    900: '#29371B',
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
