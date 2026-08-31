export const colors = {
  // ── Brand green (accent) ────────────────────────────────────────────────
  primary: '#96FF1F',      // olive-green accent: CTAs, active states, links, price highlights
  primaryLight: '#6EE7B7',
  primaryDark: '#10B981',  // deeper green: emphasis text + icons (must stay readable on dark)
  primaryBg: '#0F241B',    // dark green tint: icon chips, pill backgrounds

  secondary: '#96FF1F',    // acid lime pop: bestseller pills, highlights
  secondaryLight: '#DDF590',

  accent: '#96FF1F',
  accentLight: '#1E2A0C',  // dark lime tint

  // ── Surfaces ────────────────────────────────────────────────────────────
  background: '#0A0A0A',   // near-black app background
  surface: '#161616',      // cards
  surfaceVariant: '#1F1F1F', // inputs, secondary fills
  surfaceDark: '#0C1F16',  // editorial blocks (kept green-tinted, darker)
  surfaceDarkMid: '#12281C',

  // ── Text ────────────────────────────────────────────────────────────────
  text: '#F5F5F5',
  textSecondary: '#A1A1AA',
  textTertiary: '#6B7280',
  textInverse: '#FFFFFF',  // white text on green fills, dark blocks, image overlays
  textAcid: '#96FF1F',

  // ── Lines ───────────────────────────────────────────────────────────────
  border: '#2A2A2A',
  borderLight: '#232323',

  // ── Status ──────────────────────────────────────────────────────────────
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
