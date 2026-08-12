import type { Chapter, ContentBundle, LexiconEntry } from '@/src/content/schemas';
import { phraseIdFromSurface } from '@/src/vocabulary/dictionaryIndex';
import { isDue } from '@/src/vocabulary/familiarity';
import {
  clozeText,
  findExamplesForLemma,
  findExamplesForPhrase,
  findSentenceById,
} from '@/src/vocabulary/storyExamples';
import type {
  LemmaEncounter,
  PhraseEncounter,
  UserVocabularyState,
  VocabularyStatus,
} from '@/src/vocabulary/types';

export const REVIEW_CONFIG = {
  defaultSessionSize: 5,
  maxSessionSize: 10,
} as const;

const CLOSED_CLASS = new Set(['article', 'preposition', 'conjunction', 'pronoun']);

export type ReviewPromptType = 'meaning' | 'cloze' | 'phrase';

export type ReviewCandidate = {
  kind: 'lemma' | 'phrase';
  id: string;
  priority: number;
  reasons: string[];
  appearsInUpcomingChapter: boolean;
};

export type ReviewPrompt = {
  kind: 'lemma' | 'phrase';
  id: string;
  promptType: ReviewPromptType;
  question: string;
  stem: string;
  exampleAfter: string | null;
  choices: string[];
  correctIndex: number;
  italian: string;
  english: string;
};

export type ReviewSession = {
  items: ReviewPrompt[];
  dueCount: number;
};

export type HomeReviewCopy = {
  headline: string;
  detail: string;
  cta: string | null;
  readyCount: number;
};

export type ReviewContext = {
  currentChapterId: string | null;
  completedChapterIds: string[];
  now?: Date;
  limit?: number;
};

export class ReviewService {
  constructor(private readonly bundle: ContentBundle) {}

  buildQueue(state: UserVocabularyState, ctx: ReviewContext): ReviewCandidate[] {
    const now = ctx.now ?? new Date();
    const upcoming = upcomingChapter(this.bundle, ctx.currentChapterId, ctx.completedChapterIds);
    const upcomingLemmas = upcoming ? lemmasInChapter(upcoming) : new Set<string>();
    const upcomingPhrases = upcoming ? phrasesInChapter(upcoming) : new Set<string>();

    const scored: ReviewCandidate[] = [];

    for (const row of Object.values(state.lemmas)) {
      if (row.encounterCount <= 0 && !row.saved) continue;
      const entry = this.bundle.lexicon.find((l) => l.lemmaId === row.lemmaId);
      if (!isReviewableLemma(row, entry)) continue;
      if (!isDue(row.dueAt, now) && row.reviewCount > 0) continue;
      const appears = upcomingLemmas.has(row.lemmaId);
      scored.push(scoreLemma(row, entry, appears));
    }

    for (const row of Object.values(state.phrases)) {
      if (row.encounterCount <= 0 && !row.saved) continue;
      if (!isDue(row.dueAt, now) && row.reviewCount > 0) continue;
      const appears = upcomingPhrases.has(row.phraseId);
      scored.push(scorePhrase(row, appears));
    }

    scored.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
    return scored;
  }

  createSession(state: UserVocabularyState, ctx: ReviewContext): ReviewSession {
    const limit = Math.min(
      REVIEW_CONFIG.maxSessionSize,
      Math.max(1, ctx.limit ?? REVIEW_CONFIG.defaultSessionSize),
    );
    const queue = this.buildQueue(state, ctx);
    const dueCount = queue.length;
    const picked = queue.filter((c) => !c.appearsInUpcomingChapter).slice(0, limit);
    const items = picked
      .map((c) => this.toPrompt(state, c))
      .filter((p): p is ReviewPrompt => p !== null);
    return { items, dueCount };
  }

  homeCopy(session: ReviewSession): HomeReviewCopy {
    const n = session.items.length;
    if (n === 0) {
      return {
        headline: "You're all caught up.",
        detail: 'Keep reading — the story is the best review.',
        cta: null,
        readyCount: 0,
      };
    }
    const learningHeavy = session.items.length >= 3;
    return {
      headline: 'Keep your Italian fresh',
      detail: learningHeavy
        ? `${n} words are becoming familiar.`
        : n === 1
          ? '1 word ready'
          : `${n} words ready`,
      cta: 'Review',
      readyCount: n,
    };
  }

  /** Short optional review prompt after chapter comprehension. */
  chapterNudgeCopy(
    chapterNumber: number,
    bundle: ContentBundle,
    state: UserVocabularyState,
  ): HomeReviewCopy {
    const chapter = [...bundle.chapters.values()].find((c) => c.number === chapterNumber);
    if (!chapter) {
      return { headline: '', detail: '', cta: null, readyCount: 0 };
    }

    const lemmaIds = new Set(
      chapter.paragraphs.flatMap((p) =>
        p.sentences.flatMap((s) => s.tokens.map((t) => t.lemmaId)),
      ),
    );
    const encountered = Object.values(state.lemmas).filter(
      (row) => row.encounterCount > 0 && lemmaIds.has(row.lemmaId),
    );
    const fallback = bundle.lexicon.filter(
      (entry) => entry.introducedChapter === chapterNumber && lemmaIds.has(entry.lemmaId),
    );
    const n = Math.min(3, encountered.length || fallback.length);
    if (n === 0) {
      return { headline: '', detail: '', cta: null, readyCount: 0 };
    }
    return {
      headline: `${n} word${n === 1 ? '' : 's'} from this chapter`,
      detail: 'A quick optional review — skip anytime.',
      cta: 'Review',
      readyCount: n,
    };
  }

  toPrompt(state: UserVocabularyState, candidate: ReviewCandidate): ReviewPrompt | null {
    if (candidate.kind === 'phrase') {
      return this.phrasePrompt(state.phrases[candidate.id]);
    }
    return this.lemmaPrompt(state.lemmas[candidate.id]);
  }

  private lemmaPrompt(row: LemmaEncounter | undefined): ReviewPrompt | null {
    if (!row) return null;
    const entry = this.bundle.lexicon.find((l) => l.lemmaId === row.lemmaId);
    if (!entry) return null;
    const examples = findExamplesForLemma(this.bundle, row.lemmaId, 4);
    const last = findSentenceById(this.bundle, row.lastSentenceId);
    const useCloze = row.encounterCount >= 3 && (last || examples[0]);
    const example = last
      ? { text: last.sentence.text, sentence: last.sentence }
      : examples[0]
        ? {
            text: examples[0].text,
            sentence: findSentenceById(this.bundle, examples[0].sentenceId)?.sentence,
          }
        : null;

    if (useCloze && example?.sentence) {
      const cloze = clozeText(example.sentence, row.lemmaId);
      if (cloze) {
        const surface =
          example.sentence.tokens.find((t) => t.lemmaId === row.lemmaId)?.surface ?? entry.italian;
        const distractors = italianDistractors(this.bundle.lexicon, entry, 2);
        const { choices, correctIndex } = mixChoices(surface, distractors, row.lemmaId);
        return {
          kind: 'lemma',
          id: row.lemmaId,
          promptType: 'cloze',
          question: 'What belongs here?',
          stem: cloze,
          exampleAfter: example.text,
          choices,
          correctIndex,
          italian: surface,
          english: entry.english,
        };
      }
    }

    const surface = row.savedForms[0] ?? entry.italian;
    const distractors = englishDistractors(this.bundle.lexicon, entry, 2);
    const { choices, correctIndex } = mixChoices(entry.english, distractors, row.lemmaId);
    return {
      kind: 'lemma',
      id: row.lemmaId,
      promptType: 'meaning',
      question: 'What does this mean?',
      stem: surface,
      exampleAfter: example?.text ?? examples[0]?.text ?? null,
      choices,
      correctIndex,
      italian: surface,
      english: entry.english,
    };
  }

  private phrasePrompt(row: PhraseEncounter | undefined): ReviewPrompt | null {
    if (!row) return null;
    const examples = findExamplesForPhrase(this.bundle, row.phraseId, 3);
    const last = findSentenceById(this.bundle, row.lastSentenceId);
    const english = naturalEnglishForPhrase(this.bundle, row.phraseId) ?? row.surface;
    const distractors = phraseEnglishDistractors(this.bundle, row.phraseId, english, 2);
    const { choices, correctIndex } = mixChoices(english, distractors, row.phraseId);
    return {
      kind: 'phrase',
      id: row.phraseId,
      promptType: 'phrase',
      question: 'What does this mean?',
      stem: `“${row.surface}”`,
      exampleAfter: last?.sentence.text ?? examples[0]?.text ?? null,
      choices,
      correctIndex,
      italian: row.surface,
      english,
    };
  }
}

function scoreLemma(
  row: LemmaEncounter,
  entry: LexiconEntry | undefined,
  appearsInUpcomingChapter: boolean,
): ReviewCandidate {
  const reasons: string[] = [];
  let priority = 0;

  if (row.saved) {
    priority += 120;
    reasons.push('saved');
  }
  if (row.status === 'new' || row.status === 'learning') {
    if (row.encounterCount >= 3) {
      priority += 40 + Math.min(30, row.encounterCount * 3);
      reasons.push('unfamiliar-frequent');
    }
  }
  if (row.tapCount >= 2) {
    priority += 35 + row.tapCount * 8;
    reasons.push('tapped');
  }
  if (entry?.frequency === 'high' && row.encounterCount <= 4) {
    priority += 28;
    reasons.push('high-value-new');
  }
  if (isDecaying(row.status, row.lastEncounteredAt, row.lastReviewedAt)) {
    priority += 32;
    reasons.push('decaying');
  }
  if (appearsInUpcomingChapter) {
    priority -= 80;
    reasons.push('upcoming-story');
  }

  return {
    kind: 'lemma',
    id: row.lemmaId,
    priority,
    reasons,
    appearsInUpcomingChapter,
  };
}

function scorePhrase(row: PhraseEncounter, appearsInUpcomingChapter: boolean): ReviewCandidate {
  const reasons = ['phrase'];
  let priority = 55;
  if (row.saved) {
    priority += 120;
    reasons.push('saved');
  }
  if (row.tapCount >= 1) {
    priority += 25 + row.tapCount * 6;
    reasons.push('tapped');
  }
  if (row.status === 'new' || row.status === 'learning') {
    priority += 20;
  }
  if (appearsInUpcomingChapter) {
    priority -= 80;
    reasons.push('upcoming-story');
  }
  return {
    kind: 'phrase',
    id: row.phraseId,
    priority,
    reasons,
    appearsInUpcomingChapter,
  };
}

function isReviewableLemma(row: LemmaEncounter, entry: LexiconEntry | undefined): boolean {
  if (row.saved || row.tapCount >= 2) return true;
  if (row.status === 'mastered' && !isDecaying(row.status, row.lastEncounteredAt, row.lastReviewedAt)) {
    return false;
  }
  const pos = entry?.partOfSpeech ?? '';
  if (CLOSED_CLASS.has(pos) && row.tapCount === 0) return false;
  return row.encounterCount > 0;
}

function isDecaying(
  status: VocabularyStatus,
  lastEncounteredAt: string | null,
  lastReviewedAt: string | null,
): boolean {
  if (status !== 'familiar' && status !== 'mastered') return false;
  const iso = lastReviewedAt ?? lastEncounteredAt;
  if (!iso) return false;
  const days = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  return days >= 14;
}

function upcomingChapter(
  bundle: ContentBundle,
  _currentChapterId: string | null,
  completed: string[],
): Chapter | undefined {
  const ordered = [...bundle.chapters.values()].sort((a, b) => a.number - b.number);
  return ordered.find((c) => !completed.includes(c.id));
}

function lemmasInChapter(chapter: Chapter): Set<string> {
  const ids = new Set<string>();
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) {
      for (const t of s.tokens) ids.add(t.lemmaId);
    }
  }
  return ids;
}

function phrasesInChapter(chapter: Chapter): Set<string> {
  const ids = new Set<string>();
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) {
      for (const phrase of s.phrases ?? []) {
        ids.add(phraseIdFromSurface(phrase.surface));
      }
    }
  }
  return ids;
}

function englishDistractors(lexicon: LexiconEntry[], entry: LexiconEntry, count: number): string[] {
  const same = lexicon.filter(
    (l) => l.lemmaId !== entry.lemmaId && l.partOfSpeech === entry.partOfSpeech && l.english !== entry.english,
  );
  const pool = same.length >= count ? same : lexicon.filter((l) => l.lemmaId !== entry.lemmaId);
  return uniqueTake(
    pool.map((l) => l.english),
    count,
    entry.lemmaId,
  );
}

function italianDistractors(lexicon: LexiconEntry[], entry: LexiconEntry, count: number): string[] {
  const same = lexicon.filter(
    (l) => l.lemmaId !== entry.lemmaId && l.partOfSpeech === entry.partOfSpeech,
  );
  const pool = same.length >= count ? same : lexicon.filter((l) => l.lemmaId !== entry.lemmaId);
  return uniqueTake(
    pool.map((l) => l.italian),
    count,
    entry.lemmaId,
  );
}

function phraseEnglishDistractors(
  bundle: ContentBundle,
  phraseId: string,
  correct: string,
  count: number,
): string[] {
  const phrases: string[] = [];
  for (const chapter of bundle.chapters.values()) {
    for (const p of chapter.paragraphs) {
      for (const s of p.sentences) {
        for (const phrase of s.phrases ?? []) {
          if (phraseIdFromSurface(phrase.surface) === phraseId) continue;
          if (phrase.naturalEn !== correct) phrases.push(phrase.naturalEn);
        }
      }
    }
  }
  const extra = bundle.lexicon.map((l) => l.english).filter((e) => e !== correct);
  return uniqueTake([...phrases, ...extra], count, phraseId);
}

function naturalEnglishForPhrase(bundle: ContentBundle, phraseId: string): string | null {
  for (const chapter of bundle.chapters.values()) {
    for (const p of chapter.paragraphs) {
      for (const s of p.sentences) {
        for (const phrase of s.phrases ?? []) {
          if (phraseIdFromSurface(phrase.surface) === phraseId) return phrase.naturalEn;
        }
      }
    }
  }
  return null;
}

function uniqueTake(values: string[], count: number, seed: string): string[] {
  const unique = [...new Set(values)];
  if (unique.length === 0) return ['sleeps', 'eats'].slice(0, count);
  const start = hash(seed) % unique.length;
  const out: string[] = [];
  for (let i = 0; i < unique.length && out.length < count; i++) {
    out.push(unique[(start + i) % unique.length]);
  }
  while (out.length < count) out.push(out[0] ?? 'eats');
  return out;
}

function mixChoices(
  correct: string,
  distractors: string[],
  seed: string,
): { choices: string[]; correctIndex: number } {
  const choices = [correct, ...distractors.filter((d) => d !== correct)].slice(0, 3);
  while (choices.length < 3) choices.push(choices[0] === 'eats' ? 'sleeps' : 'eats');
  const offset = hash(seed) % choices.length;
  const rotated = [...choices.slice(offset), ...choices.slice(0, offset)];
  return { choices: rotated, correctIndex: rotated.indexOf(correct) };
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}
