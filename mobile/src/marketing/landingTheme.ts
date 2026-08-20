/** Fixed dark marketing palette for public landing / legal pages. */
export const LandingColors = {
  background: '#1A1512',
  backgroundElevated: '#241E1A',
  backgroundCard: '#2A2320',
  surface: '#1F1A17',
  text: '#F4EFEA',
  textSecondary: '#C8C0B8',
  textMuted: '#8F877F',
  accent: '#E07A5F',
  onAccent: '#1A1512',
  border: '#3A322C',
  locked: '#2E2824',
  betaBar: '#15110F',
} as const;

export type LandingColors = typeof LandingColors;
