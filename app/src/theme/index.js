export const colors = {
  bg: '#F3F7F5',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF1EE',
  surfaceDeep: '#0B2F27',
  ink: '#0E211C',
  body: '#43564F',
  muted: '#687A73',
  faint: '#95A69F',
  border: '#DFE9E4',
  borderStrong: '#C9D8D2',
  primary: '#0E7C66',
  primaryDark: '#095C4B',
  primaryDeep: '#073F34',
  primarySoft: '#E0F2EC',
  primaryTint: '#F1FAF6',
  accent: '#F2B23F',
  accentSoft: '#FDF1D8',
  danger: '#B42318',
  dangerSoft: '#FCEBE8',
  dangerBorder: '#F2CFC9',
  warn: '#946200',
  warnSoft: '#FEF3D6',
  warnBorder: '#F1DFAC',
  blue: '#2563EB',
  blueSoft: '#EAF0FE',
  purple: '#7C3AED',
  purpleSoft: '#F2EBFF',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(4, 20, 16, 0.55)',
  shadow: '#062A22',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  sheet: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
};

export const text = {
  h1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.7,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.body,
  },
  small: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.muted,
  },
  tiny: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
  },
  label: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: colors.muted,
    textTransform: 'uppercase',
  },
};

export const categoryTones = {
  elektronika: { bg: colors.blueSoft, fg: colors.blue },
  'alat-ukur': { bg: colors.warnSoft, fg: '#B45309' },
  jaringan: { bg: colors.purpleSoft, fg: colors.purple },
  perkakas: { bg: colors.primarySoft, fg: colors.primaryDark },
  lainnya: { bg: colors.surfaceMuted, fg: colors.body },
};

export function toneForCategory(slug) {
  return categoryTones[slug] || categoryTones.lainnya;
}

export const statusTone = {
  dipinjam: {
    label: 'Dipinjam',
    bg: colors.primarySoft,
    fg: colors.primaryDark,
    dot: colors.primary,
  },
  terlambat: {
    label: 'Terlambat',
    bg: colors.dangerSoft,
    fg: colors.danger,
    dot: colors.danger,
  },
  dikembalikan: {
    label: 'Dikembalikan',
    bg: colors.surfaceMuted,
    fg: colors.body,
    dot: colors.muted,
  },
};

export const layout = {
  screenPadding: 20,
  tabBarHeight: 64,
};
