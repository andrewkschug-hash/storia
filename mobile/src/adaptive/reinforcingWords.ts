import type { ContentBundle } from '@/src/content/schemas';
import type { AdaptiveItem, AdaptiveLearnerProfile } from '@/src/adaptive/types';
import type { UserVocabularyState } from '@/src/vocabulary/types';

const REINFORCING_STATES = new Set<AdaptiveItem['state']>(['reinforce', 'recovering']);

export type ReinforcingWordView = {
  italian: string;
  chapterNumber: number | null;
};

function reinforcingItems(profile: AdaptiveLearnerProfile, limit: number): AdaptiveItem[] {
  return profile.adaptiveItems
    .filter((item) => REINFORCING_STATES.has(item.state))
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        a.italian.localeCompare(b.italian, 'it', { sensitivity: 'base' }),
    )
    .slice(0, limit);
}

/** Words the exposure system is currently reinforcing — read-only UI projection. */
export function selectReinforcingWords(
  profile: AdaptiveLearnerProfile,
  limit = 8,
): string[] {
  return reinforcingItems(profile, limit).map((item) => item.italian);
}

export function selectReinforcingWordViews(
  profile: AdaptiveLearnerProfile,
  vocab: UserVocabularyState,
  bundle: ContentBundle,
  limit = 8,
): ReinforcingWordView[] {
  const chapterNumberById = new Map(
    [...bundle.chapters.values()].map((chapter) => [chapter.id, chapter.number] as const),
  );

  return reinforcingItems(profile, limit).map((item) => {
    const row = item.kind === 'lemma' ? vocab.lemmas[item.id] : vocab.phrases[item.id];
    const chapterId = row?.lastChapterId ?? null;
    return {
      italian: item.italian,
      chapterNumber: chapterId ? (chapterNumberById.get(chapterId) ?? null) : null,
    };
  });
}
