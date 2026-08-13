/**
 * Learner-journey data model for the Stories UI (not a visual redesign).
 *
 * Conceptual layout:
 *   A1  → Luca prima di Roma (5 planned shorts) → Luca a Roma Ch1–20
 *   A1+ → Luca a Roma Ch21–24
 *   A2  → Luca a Roma Ch25–40
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

export function buildLearnerJourney(): JourneyCefrBand[] {
  const arcs = Object.fromEntries(getNarrativeArcs().map((arc) => [arc.id, arc]));
  const preRome = getCatalogStories().filter((story) => story.narrativeArc === PRE_ROME_ARC_ID);
  const luca = getCatalogStories().find((story) => story.id === LUCA_STORY_ID);
  const preRomeArc = arcs[PRE_ROME_ARC_ID];
  const lucaArc = arcs[LUCA_STORY_ID];
  if (!preRomeArc || !lucaArc || !luca) {
    throw new Error('Learner journey requires luca-prima-di-roma and luca-a-roma catalog entries');
  }

  return [
    {
      cefrLevel: 'A1',
      groups: [
        { narrativeArc: preRomeArc, stories: preRome },
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
