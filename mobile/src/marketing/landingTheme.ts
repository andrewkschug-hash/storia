/** Fixed dark marketing palette for public landing / legal pages (Cozy Italian reading room palette). */
export const LandingColors = {
  background: '#211C19',
  backgroundElevated: '#302A25',
  backgroundCard: '#38312B',
  surface: '#28221E',
  text: '#F4EBDD',
  textSecondary: '#B9AA9A',
  textMuted: '#8C7F72',
  accent: '#C97858',
  onAccent: '#FAF6EE',
  border: 'rgba(244, 235, 221, 0.10)',
  locked: '#2A2420',
  betaBar: '#191513',
} as const;

export type LandingColors = typeof LandingColors;

