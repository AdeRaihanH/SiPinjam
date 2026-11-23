export const colors = {
  primary: '#1B2559',
  primaryPressed: '#141C45',
  primaryDeep: '#0E1736',
  primarySoft: '#EEF1FA',
  accent: '#14B8A6',
  accentPressed: '#0E9384',
  accentSoft: '#E6F8F5',
  gold: '#E9A32B',
  goldSoft: '#FEF5E3',
  bg: '#F5F7FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3F9',
  text: '#0F172A',
  muted: '#64748B',
  faint: '#94A3B8',
  border: '#E6EAF3',
  borderStrong: '#CBD5E1',
  success: '#0F9D6E',
  successSoft: '#E7F7F0',
  warning: '#B7791F',
  warningSoft: '#FDF3E1',
  danger: '#D64545',
  dangerSoft: '#FDECEC',
  white: '#FFFFFF',
  overlay: 'rgba(10, 17, 40, 0.56)',
  shadow: '#0B1224',
};

export const gradients = {
  hero: ['#0E1736', '#1B2559', '#2C3C7C'],
  primary: ['#26336F', '#1B2559'],
  accent: ['#22C9B4', '#0E9384'],
  success: ['#24C78E', '#0F9D6E'],
  danger: ['#EF5B5B', '#C53030'],
  gold: ['#F8C65A', '#E9A32B'],
  surface: ['#FFFFFF', '#F5F7FC'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 32,
  pill: 999,
};

export const type = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 22,
  xl: 30,
  display: 34,
};

export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
};

export const text = {
  display: {
    fontSize: type.display,
    lineHeight: 40,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: -0.8,
  },
  h1: {
    fontSize: type.xl,
    lineHeight: 37,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: -0.6,
  },
  h2: {
    fontSize: type.lg,
    lineHeight: 29,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: type.md,
    lineHeight: 22,
    fontWeight: weight.semibold,
    color: colors.text,
  },
  body: {
    fontSize: type.sm,
    lineHeight: 21,
    fontWeight: weight.regular,
    color: colors.text,
  },
  small: {
    fontSize: type.xs,
    lineHeight: 17,
    fontWeight: weight.regular,
    color: colors.muted,
  },
  label: {
    fontSize: type.xxs,
    lineHeight: 14,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  sheet: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 14,
  },
  floating: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
};

export const categoryTones = {
  elektronika: { bg: '#E9EDFA', fg: '#27357A' },
  jaringan: { bg: colors.accentSoft, fg: '#087A6B' },
  'alat-ukur': { bg: colors.warningSoft, fg: colors.warning },
  komponen: { bg: '#F0EDFB', fg: '#5B4B9E' },
  lainnya: { bg: colors.surfaceMuted, fg: colors.muted },
};

export function toneForCategory(slug) {
  return categoryTones[slug] || categoryTones.lainnya;
}

export const statusTone = {
  dipinjam: {
    label: 'Dipinjam',
    bg: colors.primarySoft,
    fg: colors.primary,
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
    fg: colors.muted,
    dot: colors.muted,
  },
};

export const layout = {
  screenPadding: 18,
  gap: 16,
  tabBarHeight: 64,
};
