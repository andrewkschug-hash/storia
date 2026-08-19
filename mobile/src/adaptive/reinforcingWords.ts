import type { AdaptiveItem, AdaptiveLearnerProfile } from '@/src/adaptive/types';

const REINFORCING_STATES = new Set<AdaptiveItem['state']>(['reinforce', 'recovering']);

/** Words the exposure system is currently reinforcing — read-only UI projection. */
export function selectReinforcingWords(
  profile: AdaptiveLearnerProfile,
  limit = 8,
): string[] {
  return profile.adaptiveItems
    .filter((item) => REINFORCING_STATES.has(item.state))
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        a.italian.localeCompare(b.italian, 'it', { sensitivity: 'base' }),
    )
    .slice(0, limit)
    .map((item) => item.italian);
}
