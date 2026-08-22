/** A2+ genre pathway definitions — independent of Luca chapters. */

export const CASA_PATHWAY_STORY_ID = 'la-casa-delle-finestre';
export const LUCA_A2_FINAL_CHAPTER_ID = 'luca-a-roma-40';

export type PathwayStatus = 'available' | 'coming_soon';

export type PathwayId =
  | 'la-casa-delle-finestre'
  | 'lettera-per-elena'
  | 'il-villaggio-che-non-esiste';

export type PathwayDefinition = {
  id: PathwayId;
  titleIt: string;
  titleEn: string;
  genre: string;
  hookEn: string;
  status: PathwayStatus;
  /** Catalog storyId when playable. */
  storyId: string | null;
};

export const A2_PLUS_PATHWAYS: PathwayDefinition[] = [
  {
    id: 'la-casa-delle-finestre',
    titleIt: 'La casa delle finestre',
    titleEn: 'The house of windows',
    genre: 'Thriller',
    hookEn: 'The school is closed. The lights are not.',
    status: 'available',
    storyId: CASA_PATHWAY_STORY_ID,
  },
  {
    id: 'lettera-per-elena',
    titleIt: 'Una lettera per Elena',
    titleEn: 'A letter for Elena',
    genre: 'Romance',
    hookEn: 'They tell the truth in a book. Not to each other.',
    status: 'coming_soon',
    storyId: null,
  },
  {
    id: 'il-villaggio-che-non-esiste',
    titleIt: 'Il villaggio che non esiste',
    titleEn: 'The village that does not exist',
    genre: 'Fantasy',
    hookEn: 'The map shows a road the village refuses to name.',
    status: 'coming_soon',
    storyId: null,
  },
];

export function getPathway(id: PathwayId): PathwayDefinition {
  const found = A2_PLUS_PATHWAYS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown pathway ${id}`);
  return found;
}

export function getAvailablePathwayStoryIds(): string[] {
  return A2_PLUS_PATHWAYS.filter((p) => p.status === 'available' && p.storyId).map((p) => p.storyId!);
}
