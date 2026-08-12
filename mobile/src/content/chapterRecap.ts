import type { Chapter, LexiconEntry } from '@/src/content/schemas';
import { recapBilingual, recapItalianPrimary } from '@/src/content/scaffolding';

const NAME_LEmmas = new Set([
  'luca',
  'sofia',
  'marco',
  'giulia',
  'nonna-rosa',
  'padrone',
  'narrator',
  'narratore',
]);

export type RecapLookFor = {
  italian: string;
  english: string;
  kind: 'word' | 'phrase';
};

export type ChapterRecap = {
  chapterNumber: number;
  titleIt: string;
  titleEn: string;
  /** English plot summary from authored events. */
  summary: string;
  /** Key story facts to remember (English, from content). */
  facts: string[];
  /** Italian anchors for the same beats (from story sentences). */
  italianFacts: string[];
  /** New words and phrases worth noticing in this chapter. */
  lookFors: RecapLookFor[];
  /** Opening Italian sentence as a story anchor. */
  openingIt: string | null;
  /** Closing Italian sentence. */
  closingIt: string | null;
  /** Show Italian facts before English (ch 11+). */
  italianPrimary: boolean;
  /** Show Italian then English for each fact (ch 6–24). */
  bilingual: boolean;
};

const MAX_LOOK_FORS = 8;
const MAX_WORDS = 6;
const MAX_PHRASES = 3;

function pickItalianAnchors(chapter: Chapter, count: number): string[] {
  const sentences = chapter.paragraphs.flatMap((p) => p.sentences.map((s) => s.text));
  if (sentences.length === 0 || count <= 0) return [];
  if (count === 1) return [sentences[sentences.length - 1]!];
  const mid = sentences[Math.floor(sentences.length / 2)]!;
  const picks = [sentences[0]!, mid, sentences[sentences.length - 1]!];
  return [...new Set(picks)].slice(0, count);
}

export function buildChapterRecap(
  chapter: Chapter,
  lexiconById: Map<string, LexiconEntry>,
): ChapterRecap {
  const sentences = chapter.paragraphs.flatMap((p) => p.sentences);
  const facts = [...new Set(chapter.events.flatMap((event) => event.rememberedFacts))];
  const summary = chapter.events.map((event) => event.summary).join(' ');

  const lemmaIdsInChapter = new Set(
    sentences.flatMap((s) => s.tokens.map((token) => token.lemmaId)),
  );

  const newWords: RecapLookFor[] = [...lexiconById.values()]
    .filter(
      (entry) =>
        entry.introducedChapter === chapter.number &&
        lemmaIdsInChapter.has(entry.lemmaId) &&
        !NAME_LEmmas.has(entry.lemmaId),
    )
    .sort((a, b) => (a.difficulty ?? 1) - (b.difficulty ?? 1) || a.italian.localeCompare(b.italian))
    .slice(0, MAX_WORDS)
    .map((entry) => ({
      italian: entry.italian,
      english: entry.english,
      kind: 'word' as const,
    }));

  const phraseSeen = new Set<string>();
  const phrases: RecapLookFor[] = [];
  for (const sentence of sentences) {
    for (const phrase of sentence.phrases) {
      const key = phrase.surface.toLowerCase();
      if (phraseSeen.has(key)) continue;
      phraseSeen.add(key);
      phrases.push({
        italian: phrase.surface,
        english: phrase.naturalEn,
        kind: 'phrase',
      });
      if (phrases.length >= MAX_PHRASES) break;
    }
    if (phrases.length >= MAX_PHRASES) break;
  }

  const lookFors = [...phrases, ...newWords].slice(0, MAX_LOOK_FORS);
  const italianFacts = pickItalianAnchors(chapter, Math.max(facts.length, 1));

  return {
    chapterNumber: chapter.number,
    titleIt: chapter.titleIt,
    titleEn: chapter.title,
    summary: summary || chapter.title,
    facts,
    italianFacts,
    lookFors,
    openingIt: sentences[0]?.text ?? null,
    closingIt: sentences[sentences.length - 1]?.text ?? null,
    italianPrimary: recapItalianPrimary(chapter.number),
    bilingual: recapBilingual(chapter.number),
  };
}

export type ChapterRecapDisplay = ChapterRecap;
