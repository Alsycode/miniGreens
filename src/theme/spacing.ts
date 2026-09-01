// ─────────────────────────────────────────────────────────────────────────────
// SPACING · RADIUS · ELEVATION TOKENS
//
// Phase 2 (Home Screen refinement — Foundation):
//   • `spacing` is already a clean 4px-based scale — kept as-is.
//   • `borderRadius` keeps every existing step; SEMANTIC aliases were added
//     (`badge` / `control` / `card` / `cardLarge` / `pill`) so the refinement
//     can consolidate onto a small, intentional set of radii.
//   • `shadows` were softened toward the reference (depth comes from contrast
//     and surface opacity, not floating drop-shadows); semantic aliases added.
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 56,
  '8xl': 64,

  // ── semantic rhythm tiers (Home refinement) ──────────────────────────────
  // Deliberate vertical rhythm, so sections stop stacking flush against each
  // other. `sectionGap` sits between major Home Screen sections; `headingGap`
  // between a section heading block and its content.
  sectionGap: 40,
  headingGap: 18,
} as const;

export const borderRadius = {
  // ── numeric scale (existing — unchanged) ──────────────────────────────────
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,

  // ── semantic aliases (Phase 2) — prefer these in the Home refinement ──────
  badge: 8,       // compact unit / status pills
  control: 14,    // steppers, small buttons, inputs
  card: 24,       // product- & category-family cards
  cardLarge: 28,  // promo / editorial blocks
  pill: 9999,     // fully rounded (search field, chips, circular actions)
} as const;

export const shadows = {
  // Softened for the dark botanical environment — barely-there lift.
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },

  // ── semantic aliases (Phase 2) ───────────────────────────────────────────
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

export const layout = {
  screenPadding: spacing.lg,
  contentMaxWidth: 500,
  headerHeight: 60,
  bottomTabHeight: 80,
  cardBorderRadius: borderRadius.card,
  heroHeight: 420,
  productCardWidth: 160,
} as const;
