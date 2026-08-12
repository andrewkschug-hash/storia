/** How much English vs Italian to show by chapter band (Phase 9 fade). */

export type ScaffoldingBand = 'a1_early' | 'a1_mid' | 'a1_late' | 'a1_plus' | 'a2';

export function scaffoldingBand(chapterNumber: number): ScaffoldingBand {
  if (chapterNumber <= 5) return 'a1_early';
  if (chapterNumber <= 10) return 'a1_mid';
  if (chapterNumber <= 15) return 'a1_late';
  if (chapterNumber <= 24) return 'a1_plus';
  return 'a2';
}

export function comprehensionUsesItalianPrompt(chapterNumber: number): boolean {
  return chapterNumber >= 6;
}

export function recapItalianPrimary(chapterNumber: number): boolean {
  return chapterNumber >= 11;
}

export function recapBilingual(chapterNumber: number): boolean {
  const band = scaffoldingBand(chapterNumber);
  return band === 'a1_mid' || band === 'a1_late' || band === 'a1_plus';
}
