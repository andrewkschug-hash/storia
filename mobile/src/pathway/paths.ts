/** A2+ genre pathway definitions - independent of Luca chapters. */

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
  genreIt: string;
  hookEn: string;
  hookIt: string;
  descriptionEn: string;
  lucaQuoteIt: string;
  lucaQuoteEn: string;
  status: PathwayStatus;
  /** Catalog storyId when playable. */
  storyId: string | null;
};

export const A2_PLUS_PATHWAYS: PathwayDefinition[] = [
  {
    id: 'la-casa-delle-finestre',
    titleIt: 'La casa delle finestre',
    titleEn: 'The House of Windows',
    genre: 'Mystery / Thriller',
    genreIt: 'Un mistero',
    hookEn: 'The school is closed. The lights are not.',
    hookIt: 'La scuola è chiusa. Ma le luci sono ancora accese.',
    descriptionEn: 'Irene, an archivist in a quiet mountain town, notices lights flickering inside a closed school. What begins with forgotten documents uncovers secrets hidden in plain sight.',
    lucaQuoteIt: '«Questa storia mi incuriosisce...»',
    lucaQuoteEn: 'A dark closed school with lights still burning? This one has me hooked.',
    status: 'available',
    storyId: CASA_PATHWAY_STORY_ID,
  },
  {
    id: 'lettera-per-elena',
    titleIt: 'Una lettera per Elena',
    titleEn: 'A Letter for Elena',
    genre: 'Romance / Drama',
    genreIt: "Una storia d'amore",
    hookEn: 'They tell the truth in a book. Not to each other.',
    hookIt: 'Si dicono la verità in un libro. Ma non a voce.',
    descriptionEn: 'At Caffè Brenta, people leave heartfelt confessions inside a shared notebook. When Elena writes back, an unexpected connection begins to unfold.',
    lucaQuoteIt: '«Una lettera può cambiare molte cose.»',
    lucaQuoteEn: 'A secret notebook in a café? Sounds like the kind of story that stays with you.',
    status: 'available',
    storyId: 'lettera-per-elena',
  },
  {
    id: 'il-villaggio-che-non-esiste',
    titleIt: 'Il villaggio che non esiste',
    titleEn: 'The Village That Does Not Exist',
    genre: 'Fantasy / Adventure',
    genreIt: 'Un racconto fantastico',
    hookEn: 'The map shows a road the village refuses to name.',
    hookIt: "Sulla mappa c'è una strada che il paese non vuole nominare.",
    descriptionEn: 'Giada gets off at Collevento, a stop crossed out of the timetable. Following a forbidden road leads into an enchanting valley governed by ancient rules.',
    lucaQuoteIt: '«Un villaggio senza nome? Voglio sapere perché.»',
    lucaQuoteEn: 'A village erased from the map? I really want to know what happened there.',
    status: 'available',
    storyId: 'il-villaggio-che-non-esiste',
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
