export const colors = {
  // Brand — deep forest, quiet and grounded
  primary: '#0E2A20',
  primaryPressed: '#0A1F18',
  primaryDeep: '#071710',
  primarySoft: '#E8EEE7',
  accent: '#B9CD9A',
  accentPressed: '#A6BC84',
  accentSoft: '#F0F4E9',
  accentInk: '#4C6B32',
  gold: '#B98A3E',
  goldSoft: '#F6EFE2',

  // Canvas & surfaces
  bg: '#F4F5F2',
  surface: '#FFFFFF',
  surfaceMuted: '#ECEFEA',
  surfaceStrong: '#DEE4DC',

  // Text
  text: '#141C17',
  muted: '#5C6961',
  faint: '#6F7C73',

  // Lines
  border: '#E2E7E1',
  borderStrong: '#CBD4CB',

  // Status — muted, readable
  success: '#2F7D5B',
  successSoft: '#E9F2EC',
  warning: '#94631A',
  warningSoft: '#F7EFDF',
  danger: '#B54A43',
  dangerSoft: '#F8E9E7',

  white: '#FFFFFF',
  overlay: 'rgba(7, 23, 16, 0.6)',
  shadow: '#07130E',
};

export const gradients = {
  hero: ['#081C15', '#0D2A20', '#16382A'],
  primary: ['#12352A', '#0A1F18'],
  accent: ['#D2E0BC', '#B4C993'],
  success: ['#3E9370', '#2F7D5B'],
  danger: ['#C96A62', '#A9433C'],
  gold: ['#D0A865', '#B98A3E'],
  surface: ['#FFFFFF', '#F4F5F2'],
  limeSoft: ['#F5F8EF', '#EDF2E3'],
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
  xl: 24,
  xxl: 30,
  pill: 999,
};

export const type = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 22,
  xl: 30,
  display: 36,
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
    lineHeight: 42,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: weight.heavy,
    color: colors.text,
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: type.lg,
    lineHeight: 29,
    fontWeight: weight.bold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: type.md,
    lineHeight: 23,
    fontWeight: weight.semibold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: type.sm,
    lineHeight: 22,
    fontWeight: weight.regular,
    color: colors.text,
  },
  small: {
    fontSize: type.xs,
    lineHeight: 18,
    fontWeight: weight.regular,
    color: colors.muted,
  },
  label: {
    fontSize: type.xxs,
    lineHeight: 14,
    fontWeight: weight.bold,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 5,
  },
  sheet: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 14,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 10,
  },
  glowAccent: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const categoryTones = {
  elektronika: { bg: '#E9EEF5', fg: '#3D5A78' },
  jaringan: { bg: '#E8F0E9', fg: '#3F6B4D' },
  'alat-ukur': { bg: '#F6EFE1', fg: '#8A6224' },
  komponen: { bg: '#EFEBF4', fg: '#63507B' },
  lainnya: { bg: colors.surfaceMuted, fg: colors.muted },
};

export function toneForCategory(slug) {
  return categoryTones[slug] || categoryTones.lainnya;
}

export const statusTone = {
  dipinjam: {
    label: 'Dipinjam',
    bg: '#E9EEF5',
    fg: '#3D5A78',
    dot: '#3D5A78',
  },
  terlambat: {
    label: 'Terlambat',
    bg: colors.dangerSoft,
    fg: colors.danger,
    dot: colors.danger,
  },
  dikembalikan: {
    label: 'Dikembalikan',
    bg: '#EDF0EC',
    fg: colors.muted,
    dot: colors.muted,
  },
};

export const layout = {
  screenPadding: 20,
  gap: 16,
  tabBarHeight: 64,
};
