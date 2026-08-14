/**
 * Story catalog — narrative arcs and story availability.
 * Pre-Rome A1 stories and Luca a Roma are available. Elena remains draft.
 */

import catalogJson from '../../content/story-catalog.json';
import {
  StoryCatalogSchema,
  type CatalogStory,
  type NarrativeArcCatalog,
  type StoryAvailability,
  type StoryCatalog,
} from '@/src/content/schemas';

export const LUCA_STORY_ID = 'luca-a-roma';
export const PRE_ROME_ARC_ID = 'luca-prima-di-roma';
export const ELENA_STORY_ID = 'elena-torna-a-casa';
export const CASA_STORY_ID = 'la-casa-delle-finestre';
export const A2_PLUS_GENRE_ARC_ID = 'a2-plus-genre-paths';

let cached: StoryCatalog | null = null;

export function getStoryCatalog(): StoryCatalog {
  if (!cached) cached = StoryCatalogSchema.parse(catalogJson);
  return cached;
}

/** Tests only */
export function __resetStoryCatalogCache() {
  cached = null;
}

export function getNarrativeArcs(): NarrativeArcCatalog[] {
  return [...getStoryCatalog().narrativeArcs].sort((a, b) => a.narrativeOrder - b.narrativeOrder);
}

export function getNarrativeArc(arcId: string): NarrativeArcCatalog | undefined {
  return getStoryCatalog().narrativeArcs.find((arc) => arc.id === arcId);
}

export function getCatalogStories(): CatalogStory[] {
  return [...getStoryCatalog().stories].sort((a, b) => a.narrativeOrder - b.narrativeOrder);
}

export function getCatalogStory(storyId: string): CatalogStory | undefined {
  return getStoryCatalog().stories.find((story) => story.id === storyId);
}

export function getStoriesInArc(arcId: string): CatalogStory[] {
  return getCatalogStories().filter((story) => story.narrativeArc === arcId);
}

export function getAvailableStories(): CatalogStory[] {
  return getCatalogStories().filter((story) => story.status === 'available');
}

export function journeyOrder(): CatalogStory[] {
  return getAvailableStories();
}

export function storyStatus(storyId: string): StoryAvailability | 'unknown' {
  return getCatalogStory(storyId)?.status ?? 'unknown';
}

export function isPlannedStory(storyId: string): boolean {
  return storyStatus(storyId) === 'planned';
}

export function isDraftStory(storyId: string): boolean {
  return storyStatus(storyId) === 'draft';
}

export function isAvailableStory(storyId: string): boolean {
  return storyStatus(storyId) === 'available';
}
