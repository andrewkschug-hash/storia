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
import { createLemmaEncounter, createPhraseEncounter } from '@/src/vocabulary/normalize';
import {
  conflictsWithAccepted,
  type ReviewItemRef,
} from '@/src/review/reviewClusters';

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
    const sessionSize = REVIEW_CONFIG.defaultSessionSize;
    const available = encountered.length || fallback.length;
    if (available === 0) {
      return { headline: '', detail: '', cta: null, readyCount: 0 };
    }
    return {
      headline: `Review ${sessionSize} key words`,
      detail: 'A quick optional review — skip anytime.',
      cta: 'Review',
      readyCount: sessionSize,
    };
  }

  /** Review session scoped to a chapter batch — struggle first, then story backfill. Never empty. */
  createBatchSession(
    state: UserVocabularyState,
    bundle: ContentBundle,
    chapterStart: number,
    chapterEnd: number,
    ctx: Partial<ReviewContext> = {},
  ): ReviewSession {
    const limit = Math.min(
      REVIEW_CONFIG.maxSessionSize,
      Math.max(1, ctx.limit ?? REVIEW_CONFIG.defaultSessionSize),
    );
    const batchLemmas = lemmasInChapterRange(bundle, chapterStart, chapterEnd);
    const batchPhrases = phrasesInChapterRange(bundle, chapterStart, chapterEnd);

    const scored: ReviewCandidate[] = [];
    for (const row of Object.values(state.lemmas)) {
      if (!batchLemmas.has(row.lemmaId)) continue;
      if (row.encounterCount <= 0 && !row.saved && row.tapCount <= 0 && row.incorrectReviewCount <= 0) {
        continue;
      }
      const entry = bundle.lexicon.find((l) => l.lemmaId === row.lemmaId);
      if (!isReviewableLemma(row, entry) && row.incorrectReviewCount === 0 && row.tapCount === 0) {
        continue;
      }
      scored.push(scoreBatchLemma(row, entry));
    }
    for (const row of Object.values(state.phrases)) {
      if (!batchPhrases.has(row.phraseId)) continue;
      if (row.encounterCount <= 0 && !row.saved && row.tapCount <= 0 && row.incorrectReviewCount <= 0) {
        continue;
      }
      scored.push(scoreBatchPhrase(row));
    }

    scored.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

    const picked = new Set<string>();
    const acceptedRefs: ReviewItemRef[] = [];
    const items: ReviewPrompt[] = [];

    const tryAccept = (candidate: ReviewCandidate, prompt: ReviewPrompt | null): boolean => {
      if (!prompt) return false;
      if (items.length >= limit) return false;
      const ref: ReviewItemRef = {
        kind: candidate.kind,
        id: candidate.id,
        english: prompt.english,
      };
      // Prefer variety: skip near-duplicates while the pool still has other options.
      // When under limit after the first pass, a second pass may relax — see below.
      if (conflictsWithAccepted(ref, acceptedRefs)) return false;
      items.push(prompt);
      picked.add(`${candidate.kind}:${candidate.id}`);
      acceptedRefs.push(ref);
      return true;
    };

    for (const candidate of scored) {
      if (items.length >= limit) break;
      tryAccept(candidate, this.toPrompt(state, candidate));
    }

    for (const candidate of backfillBatchCandidates(bundle, chapterStart, chapterEnd, picked)) {
      if (items.length >= limit) break;
      tryAccept(candidate, this.promptForBackfill(state, candidate));
    }

    // If the pool was too small after strict dedupe, fill remaining slots without
    // exact id duplicates (gloss/cluster conflicts allowed only as last resort).
    if (items.length < limit) {
      for (const candidate of scored) {
        if (items.length >= limit) break;
        const key = `${candidate.kind}:${candidate.id}`;
        if (picked.has(key)) continue;
        const prompt = this.toPrompt(state, candidate);
        if (!prompt) continue;
        items.push(prompt);
        picked.add(key);
      }
      for (const candidate of backfillBatchCandidates(bundle, chapterStart, chapterEnd, picked)) {
        if (items.length >= limit) break;
        const key = `${candidate.kind}:${candidate.id}`;
        if (picked.has(key)) continue;
        const prompt = this.promptForBackfill(state, candidate);
        if (!prompt) continue;
        items.push(prompt);
        picked.add(key);
      }
    }

    return { items, dueCount: scored.length };
  }

  batchRecapCopy(chapterStart: number, chapterEnd: number, session: ReviewSession): HomeReviewCopy {
    const n = session.items.length;
    return {
      headline: `Words from chapters ${chapterStart}–${chapterEnd}`,
      detail:
        session.dueCount > 0
          ? `Starting with the words you struggled with — then a few from the story.`
          : `A short recap of words from these chapters.`,
      cta: 'Review',
      readyCount: n,
    };
  }

  private promptForBackfill(state: UserVocabularyState, candidate: ReviewCandidate): ReviewPrompt | null {
    if (candidate.kind === 'phrase') {
      const existing = state.phrases[candidate.id];
      if (existing) return this.phrasePrompt(existing);
      const surface = phraseSurfaceForId(this.bundle, candidate.id) ?? candidate.id;
      return this.phrasePrompt(createPhraseEncounter(candidate.id, surface));
    }
    const existing = state.lemmas[candidate.id];
    if (existing) return this.lemmaPrompt(existing);
    return this.lemmaPrompt(createLemmaEncounter(candidate.id));
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
    const last = findSentenceById(this.bundle, row.lastSentenceId, row.lastChapterId);
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
    const last = findSentenceById(this.bundle, row.lastSentenceId, row.lastChapterId);
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

function scoreBatchLemma(row: LemmaEncounter, entry: LexiconEntry | undefined): ReviewCandidate {
  const reasons: string[] = ['batch'];
  let priority = 0;
  if (row.incorrectReviewCount > 0) {
    priority += 120 + row.incorrectReviewCount * 80;
    reasons.push('missed-review');
  }
  if (row.tapCount > 0) {
    priority += 50 + row.tapCount * 40;
    reasons.push('tapped');
  }
  if (row.status === 'new' || row.status === 'learning') {
    priority += 55;
    reasons.push('unfamiliar');
  }
  priority += Math.round((1 - Math.min(1, row.familiarityScore)) * 35);
  if (row.saved) {
    priority += 20;
    reasons.push('saved');
  }
  if (entry?.frequency === 'high') {
    priority += 12;
    reasons.push('high-value');
  }
  return {
    kind: 'lemma',
    id: row.lemmaId,
    priority,
    reasons,
    appearsInUpcomingChapter: false,
  };
}

function scoreBatchPhrase(row: PhraseEncounter): ReviewCandidate {
  const reasons = ['batch', 'phrase'];
  let priority = 40;
  if (row.incorrectReviewCount > 0) {
    priority += 100 + row.incorrectReviewCount * 70;
    reasons.push('missed-review');
  }
  if (row.tapCount > 0) {
    priority += 40 + row.tapCount * 30;
    reasons.push('tapped');
  }
  if (row.status === 'new' || row.status === 'learning') {
    priority += 30;
    reasons.push('unfamiliar');
  }
  if (row.saved) {
    priority += 20;
    reasons.push('saved');
  }
  return {
    kind: 'phrase',
    id: row.phraseId,
    priority,
    reasons,
    appearsInUpcomingChapter: false,
  };
}

const FILLER_PHRASE_IDS = new Set([
  'va_bene',
  'hai_ragione',
  'non_lo_so',
  'vediamo',
  'ci_vediamo',
  'dipende',
]);

function backfillBatchCandidates(
  bundle: ContentBundle,
  chapterStart: number,
  chapterEnd: number,
  alreadyPicked: Set<string>,
): ReviewCandidate[] {
  const contentLemmas = [...lemmasInChapterRange(bundle, chapterStart, chapterEnd)].filter((id) => {
    const entry = bundle.lexicon.find((l) => l.lemmaId === id);
    if (!entry) return false;
    if (CLOSED_CLASS.has(entry.partOfSpeech ?? '')) return false;
    if (NAME_LEMMAS.has(id)) return false;
    return true;
  });

  const introduced = contentLemmas.filter((id) => {
    const entry = bundle.lexicon.find((l) => l.lemmaId === id);
    const introducedAt = entry?.introducedChapter ?? 0;
    return introducedAt >= chapterStart && introducedAt <= chapterEnd;
  });
  const highFreq = contentLemmas.filter((id) => bundle.lexicon.find((l) => l.lemmaId === id)?.frequency === 'high');
  const phrases = [...phrasesInChapterRange(bundle, chapterStart, chapterEnd)];
  const batchPhrases = phrases.filter((id) => !FILLER_PHRASE_IDS.has(id));
  const fillerPhrases = phrases.filter((id) => FILLER_PHRASE_IDS.has(id));

  // Spaced older items: lemmas introduced before this batch (when available).
  const olderLemmas: string[] = [];
  if (chapterStart > 1) {
    const earlierEnd = chapterStart - 1;
    const earlierStart = Math.max(1, earlierEnd - 4);
    for (const id of lemmasInChapterRange(bundle, earlierStart, earlierEnd)) {
      const entry = bundle.lexicon.find((l) => l.lemmaId === id);
      if (!entry) continue;
      if (CLOSED_CLASS.has(entry.partOfSpeech ?? '')) continue;
      if (NAME_LEMMAS.has(id)) continue;
      olderLemmas.push(id);
    }
  }

  const ordered: ReviewCandidate[] = [];
  const seen = new Set<string>(alreadyPicked);

  const push = (kind: 'lemma' | 'phrase', id: string, priority: number) => {
    const key = `${kind}:${id}`;
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push({
      kind,
      id,
      priority,
      reasons: ['backfill'],
      appearsInUpcomingChapter: false,
    });
  };

  // Target mix for empty-vocab / backfill: batch-new first, then reinforcement, filler last.
  for (const id of introduced) push('lemma', id, 40);
  for (const id of contentLemmas) {
    if (introduced.includes(id)) continue;
    push('lemma', id, 28);
  }
  for (const id of batchPhrases) push('phrase', id, 22);
  for (const id of highFreq) push('lemma', id, 15);
  for (const id of olderLemmas) push('lemma', id, 12);
  for (const id of fillerPhrases) push('phrase', id, 4);

  return ordered;
}

const NAME_LEMMAS = new Set([
  'luca',
  'sofia',
  'marco',
  'giulia',
  'nonna-rosa',
  'padrone',
  'narrator',
  'narratore',
]);

function phraseSurfaceForId(bundle: ContentBundle, phraseId: string): string | null {
  for (const chapter of bundle.chapters.values()) {
    for (const p of chapter.paragraphs) {
      for (const s of p.sentences) {
        for (const phrase of s.phrases ?? []) {
          if (phraseIdFromSurface(phrase.surface) === phraseId) return phrase.surface;
        }
      }
    }
  }
  return null;
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

function lemmasInChapterRange(
  bundle: ContentBundle,
  chapterStart: number,
  chapterEnd: number,
): Set<string> {
  const ids = new Set<string>();
  for (const chapter of bundle.chapters.values()) {
    if (chapter.number < chapterStart || chapter.number > chapterEnd) continue;
    for (const id of lemmasInChapter(chapter)) ids.add(id);
  }
  return ids;
}

function phrasesInChapterRange(
  bundle: ContentBundle,
  chapterStart: number,
  chapterEnd: number,
): Set<string> {
  const ids = new Set<string>();
  for (const chapter of bundle.chapters.values()) {
    if (chapter.number < chapterStart || chapter.number > chapterEnd) continue;
    for (const id of phrasesInChapter(chapter)) ids.add(id);
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
