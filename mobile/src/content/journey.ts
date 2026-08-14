/**
 * Learner-journey data model for the Stories UI (not a visual redesign).
 *
 * Conceptual layout:
 *   A1  → available pre-Rome shorts (recommended order) → Luca a Roma Ch1–20
 *   A1+ → Luca a Roma Ch21–24
 *   A2  → Luca a Roma Ch25–40
 *
 * Completing one pre-Rome story is not A1 mastery. Future A1 stories with other
 * casts/settings can appear as additional A1 groups without replacing this arc.
 */

import {
  ELENA_STORY_ID,
  LUCA_STORY_ID,
  PRE_ROME_ARC_ID,
  getCatalogStories,
  getNarrativeArcs,
} from '@/src/content/catalog';
import type { CatalogStory, CefrLevel, NarrativeArcCatalog } from '@/src/content/schemas';

export type JourneyChapterRange = {
  storyId: string;
  chapterStart: number;
  chapterEnd: number;
  cefrLevel: CefrLevel;
};

export type JourneyStoryGroup = {
  narrativeArc: NarrativeArcCatalog;
  stories: CatalogStory[];
  /** Present for Luca a Roma CEFR bands that map to chapter ranges, not new story IDs. */
  chapterRange?: JourneyChapterRange;
};

export type JourneyCefrBand = {
  cefrLevel: CefrLevel;
  groups: JourneyStoryGroup[];
};

function a1StoriesOutsideLuca(): CatalogStory[] {
  return getCatalogStories().filter(
    (story) =>
      story.id !== LUCA_STORY_ID &&
      story.status === 'available' &&
      (story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1')),
  );
}

function groupStoriesByArc(
  stories: CatalogStory[],
  arcs: Record<string, NarrativeArcCatalog>,
): JourneyStoryGroup[] {
  const byArc = new Map<string, CatalogStory[]>();
  for (const story of stories) {
    const list = byArc.get(story.narrativeArc) ?? [];
    list.push(story);
    byArc.set(story.narrativeArc, list);
  }
  const groups: JourneyStoryGroup[] = [];
  for (const [arcId, arcStories] of byArc) {
    const narrativeArc = arcs[arcId];
    if (!narrativeArc) continue;
    groups.push({
      narrativeArc,
      stories: [...arcStories].sort((a, b) => a.narrativeOrder - b.narrativeOrder),
    });
  }
  return groups.sort((a, b) => a.narrativeArc.narrativeOrder - b.narrativeArc.narrativeOrder);
}

export function buildLearnerJourney(): JourneyCefrBand[] {
  const arcs = Object.fromEntries(getNarrativeArcs().map((arc) => [arc.id, arc]));
  const luca = getCatalogStories().find((story) => story.id === LUCA_STORY_ID);
  const preRomeArc = arcs[PRE_ROME_ARC_ID];
  const lucaArc = arcs[LUCA_STORY_ID];
  if (!preRomeArc || !lucaArc || !luca) {
    throw new Error('Learner journey requires luca-prima-di-roma and luca-a-roma catalog entries');
  }

  const a1StoryGroups = groupStoriesByArc(a1StoriesOutsideLuca(), arcs);

  return [
    {
      cefrLevel: 'A1',
      groups: [
        ...a1StoryGroups,
        {
          narrativeArc: lucaArc,
          stories: [luca],
          chapterRange: {
            storyId: LUCA_STORY_ID,
            chapterStart: 1,
            chapterEnd: 20,
            cefrLevel: 'A1',
          },
        },
      ],
    },
    {
      cefrLevel: 'A1+',
      groups: [
        {
          narrativeArc: lucaArc,
          stories: [luca],
          chapterRange: {
            storyId: LUCA_STORY_ID,
            chapterStart: 21,
            chapterEnd: 24,
            cefrLevel: 'A1+',
          },
        },
      ],
    },
    {
      cefrLevel: 'A2',
      groups: [
        {
          narrativeArc: lucaArc,
          stories: [luca],
          chapterRange: {
            storyId: LUCA_STORY_ID,
            chapterStart: 25,
            chapterEnd: 40,
            cefrLevel: 'A2',
          },
        },
      ],
    },
  ];
}

export function independentDraftStories(): CatalogStory[] {
  return getCatalogStories().filter((story) => story.id === ELENA_STORY_ID || story.status === 'draft');
}
