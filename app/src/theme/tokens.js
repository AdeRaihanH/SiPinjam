export const colors = {
  primary: '#1E2A5A',
  primaryPressed: '#162042',
  primarySoft: '#EDF0F7',
  accent: '#0E9F8A',
  accentSoft: '#E8F6F3',
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F8',
  text: '#111827',
  muted: '#6B7280',
  faint: '#9CA3AF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  success: '#047857',
  successSoft: '#E9F4EF',
  warning: '#B45309',
  warningSoft: '#FBF1E5',
  danger: '#B91C1C',
  dangerSoft: '#FBECEC',
  white: '#FFFFFF',
  overlay: 'rgba(17, 24, 39, 0.48)',
  shadow: '#111827',
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
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const type = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
};

export const weight = {
  regular: '400',
  semibold: '600',
  bold: '700',
};

export const text = {
  h1: {
    fontSize: type.xl,
    lineHeight: 34,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: type.lg,
    lineHeight: 26,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.2,
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
    fontSize: type.xs,
    lineHeight: 16,
    fontWeight: weight.semibold,
    color: colors.muted,
  },
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sheet: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  floating: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
};

export const categoryTones = {
  elektronika: { bg: '#EDF0F8', fg: '#1E2A5A' },
  jaringan: { bg: colors.accentSoft, fg: '#087A6B' },
  'alat-ukur': { bg: colors.warningSoft, fg: colors.warning },
  komponen: { bg: '#F2F1F8', fg: '#4B4A78' },
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
  screenPadding: 16,
  gap: 16,
  tabBarHeight: 64,
};
