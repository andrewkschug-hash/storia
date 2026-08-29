import type { VocabBrowseItem } from '@/src/vocabulary/catalog';
import type { NotebookGrammarInsight, NotebookPhrase } from '@/src/vocabulary/notebookData';

export type NotebookLens = 'words' | 'phrases' | 'grammar';

export type CefrBandKey = 'all' | 'A1' | 'A1+' | 'A2' | 'B1' | 'B1+';

export const CEFR_CURRICULUM_BANDS: Record<
  Exclude<CefrBandKey, 'all'>,
  { label: string; min: number; max: number; levelName: string }
> = {
  A1: { label: 'A1 (Ch 1–20)', min: 1, max: 20, levelName: 'A1' },
  'A1+': { label: 'A1+ (Ch 21–24)', min: 21, max: 24, levelName: 'A1+' },
  A2: { label: 'A2 (Ch 25–40)', min: 25, max: 40, levelName: 'A2' },
  B1: { label: 'B1 (Ch 41–55)', min: 41, max: 55, levelName: 'B1' },
  'B1+': { label: 'B1+ (Ch 56–70)', min: 56, max: 70, levelName: 'B1+' },
};

export type WordsFilterState = {
  search: string;
  pos: 'all' | 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  status: 'all' | 'learning' | 'familiar' | 'mastered';
  chapterRange: CefrBandKey;
  savedOnly: boolean;
  groupBy: 'chronology' | 'part_of_speech';
};

export type PhrasesFilterState = {
  search: string;
  speaker: 'ALL' | string;
  chapterRange: CefrBandKey;
  savedOnly: boolean;
};

export type GrammarFilterState = {
  search: string;
  level: CefrBandKey;
  chapterRange: CefrBandKey;
};

/** Compute reading footprint label from vocabulary count and highest completed chapter */
export function getReadingFootprint(
  uniqueWordsCount: number,
  highestChapterUnlockedOrRead: number,
): { wordCount: number; chapterCount: number; label: string } {
  const words = Math.max(0, uniqueWordsCount);
  const chapters = Math.max(1, highestChapterUnlockedOrRead);
  const chapterText = chapters === 1 ? '1 chapter in Rome' : `${chapters} chapters in Rome`;
  const wordsText = words === 1 ? '1 word from your reading' : `${words} words from your reading`;
  return {
    wordCount: words,
    chapterCount: chapters,
    label: `${wordsText} · ${chapterText}`,
  };
}

/** Check if chapter number falls within the selected CEFR band */
export function matchesCefrBand(chapterNumber: number, band: CefrBandKey): boolean {
  if (band === 'all') return true;
  const config = CEFR_CURRICULUM_BANDS[band];
  if (!config) return true;
  return chapterNumber >= config.min && chapterNumber <= config.max;
}

/** Filter word items */
export function filterNotebookWords(
  items: VocabBrowseItem[],
  filter: WordsFilterState,
  optimisticSaved: Record<string, boolean>,
): VocabBrowseItem[] {
  let list = items;

  // Saved filter
  if (filter.savedOnly) {
    list = list.filter((item) => {
      const opt = optimisticSaved[`${item.kind}:${item.id}`];
      return opt !== undefined ? opt : item.saved;
    });
  }

  // Status filter
  if (filter.status !== 'all') {
    list = list.filter((item) => item.status === filter.status);
  }

  // Part of speech filter
  if (filter.pos !== 'all') {
    if (filter.pos === 'other') {
      list = list.filter(
        (item) =>
          !item.partOfSpeech ||
          !['noun', 'verb', 'adjective', 'adverb'].includes(item.partOfSpeech.toLowerCase()),
      );
    } else {
      list = list.filter((item) => item.partOfSpeech?.toLowerCase() === filter.pos);
    }
  }

  // Chapter range filter
  if (filter.chapterRange !== 'all') {
    list = list.filter((item) => {
      const ch = item.introducedChapter ?? 1;
      return matchesCefrBand(ch, filter.chapterRange);
    });
  }

  // Search filter
  const q = filter.search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (item) =>
        item.italian.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }

  return list;
}

/** Filter phrase items */
export function filterNotebookPhrases(
  phrases: readonly NotebookPhrase[],
  filter: PhrasesFilterState,
  optimisticSaved: Record<string, boolean>,
  highestChapter?: number,
): NotebookPhrase[] {
  let list = [...phrases];

  // Restrict to unlocked reading horizon if chapterRange is 'all'
  if (filter.chapterRange === 'all' && highestChapter !== undefined) {
    list = list.filter((p) => p.chapterNumber <= highestChapter);
  } else if (filter.chapterRange !== 'all') {
    list = list.filter((p) => matchesCefrBand(p.chapterNumber, filter.chapterRange));
  }

  // Saved filter
  if (filter.savedOnly) {
    list = list.filter((p) => optimisticSaved[`phrase:${p.id}`] ?? false);
  }

  // Speaker filter
  if (filter.speaker !== 'ALL') {
    list = list.filter((p) => p.speaker.toLowerCase() === filter.speaker.toLowerCase());
  }

  // Search filter
  const q = filter.search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (p) =>
        p.textIt.toLowerCase().includes(q) ||
        p.textEn.toLowerCase().includes(q) ||
        p.speaker.toLowerCase().includes(q) ||
        (p.whyMemorable && p.whyMemorable.toLowerCase().includes(q)),
    );
  }

  return list;
}

/** Filter grammar insights */
export function filterNotebookGrammar(
  insights: readonly NotebookGrammarInsight[],
  filter: GrammarFilterState,
  highestChapter?: number,
): NotebookGrammarInsight[] {
  let list = [...insights];

  // Level filter
  if (filter.level !== 'all') {
    list = list.filter((g) => g.level.toLowerCase() === filter.level.toLowerCase());
  }

  // Chapter range filter
  if (filter.chapterRange === 'all' && highestChapter !== undefined) {
    list = list.filter((g) => g.chapterRange.start <= highestChapter);
  } else if (filter.chapterRange !== 'all') {
    list = list.filter((g) => matchesCefrBand(g.sampleChapterNumber, filter.chapterRange));
  }

  // Search filter
  const q = filter.search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (g) =>
        g.titleIt.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.explanation.toLowerCase().includes(q) ||
        g.formula.toLowerCase().includes(q) ||
        g.exampleIt.toLowerCase().includes(q) ||
        g.exampleEn.toLowerCase().includes(q),
    );
  }

  return list;
}

/** Resolve the latest chapter where a word was encountered by the learner, bounded by maxChapter */
export function getItemChapter(item: VocabBrowseItem, maxChapter?: number): number {
  // Determine the highest chapter where the learner actually encountered the word.
  let max = 0;
  for (const chId of item.chaptersEncountered ?? []) {
    const match = chId.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > max && (maxChapter === undefined || num <= maxChapter)) {
        max = num;
      }
    }
  }
  // If we have any recorded encounter, return it.
  if (max > 0) return max;

  // No recorded encounters. Fall back to the static introduced chapter.
  const intro = item.introducedChapter ?? 1;
  if (maxChapter !== undefined) return Math.min(intro, maxChapter);
  return intro;
}

export type ChronologySection<T> = {
  id: string;
  title: string;
  items: T[];
};

/** Group words chronologically into 'RECENTLY ENCOUNTERED' and 'EARLIER IN YOUR JOURNEY' */
export function groupWordsByChronology(
  items: VocabBrowseItem[],
  highestChapter?: number,
): ChronologySection<VocabBrowseItem>[] {
  if (items.length === 0) return [];

  // Sort descending by highest encountered chapter, but treat items with no encounters as earliest
  const sorted = [...items].sort((a, b) => {
    const hasEncA = (a.chaptersEncountered?.length ?? 0) > 0;
    const hasEncB = (b.chaptersEncountered?.length ?? 0) > 0;
    const chA = hasEncA ? getItemChapter(a, highestChapter) : 0;
    const chB = hasEncB ? getItemChapter(b, highestChapter) : 0;
    if (chB !== chA) return chB - chA;
    if (b.encounterCount !== a.encounterCount) {
      return b.encounterCount - a.encounterCount;
    }
    return a.italian.localeCompare(b.italian, 'it');
  });

  if (sorted.length <= 6) {
    return [{ id: 'all', title: 'YOUR WORDS', items: sorted }];
  }

  // Split into recent (top 35%) and earlier (remaining)
  const splitIndex = Math.max(4, Math.ceil(sorted.length * 0.35));
  const recent = sorted.slice(0, splitIndex);
  const earlier = sorted.slice(splitIndex);

  return [
    { id: 'recent', title: 'RECENTLY ENCOUNTERED', items: recent },
    { id: 'earlier', title: 'EARLIER IN YOUR JOURNEY', items: earlier },
  ];
}

/** Group words grammatically by category (Verbs, Nouns, Describing words / Adjectives, Adverbs, Other) */
export function groupWordsByPartOfSpeech(items: VocabBrowseItem[]): ChronologySection<VocabBrowseItem>[] {
  if (items.length === 0) return [];

  const verbs: VocabBrowseItem[] = [];
  const nouns: VocabBrowseItem[] = [];
  const adjectives: VocabBrowseItem[] = [];
  const adverbs: VocabBrowseItem[] = [];
  const other: VocabBrowseItem[] = [];

  for (const item of items) {
    const pos = (item.partOfSpeech || '').toLowerCase();
    if (pos === 'verb') {
      verbs.push(item);
    } else if (pos === 'noun') {
      nouns.push(item);
    } else if (pos === 'adjective' || pos === 'adj') {
      adjectives.push(item);
    } else if (pos === 'adverb' || pos === 'adv') {
      adverbs.push(item);
    } else {
      other.push(item);
    }
  }

  const sections: ChronologySection<VocabBrowseItem>[] = [];

  if (verbs.length > 0) {
    sections.push({ id: 'verbs', title: 'VERBS · AZIONI', items: verbs });
  }
  if (nouns.length > 0) {
    sections.push({ id: 'nouns', title: 'NOUNS · SOSTANTIVI', items: nouns });
  }
  if (adjectives.length > 0) {
    sections.push({ id: 'adjectives', title: 'DESCRIBING WORDS · AGGETTIVI', items: adjectives });
  }
  if (adverbs.length > 0) {
    sections.push({ id: 'adverbs', title: 'ADVERBS · AVVERBI', items: adverbs });
  }
  if (other.length > 0) {
    sections.push({ id: 'other', title: 'OTHER WORDS & PHRASES', items: other });
  }

  return sections;
}

/** Group phrases chronologically */
export function groupPhrasesByChronology(phrases: NotebookPhrase[]): ChronologySection<NotebookPhrase>[] {
  if (phrases.length === 0) return [];

  // Sort descending by chapter number
  const sorted = [...phrases].sort((a, b) => b.chapterNumber - a.chapterNumber);

  if (sorted.length <= 4) {
    return [{ id: 'all', title: 'MEMORABLE LINES', items: sorted }];
  }

  const splitIndex = Math.max(3, Math.ceil(sorted.length * 0.4));
  const recent = sorted.slice(0, splitIndex);
  const earlier = sorted.slice(splitIndex);

  return [
    { id: 'recent', title: 'RECENTLY ENCOUNTERED', items: recent },
    { id: 'earlier', title: 'EARLIER IN YOUR JOURNEY', items: earlier },
  ];
}
