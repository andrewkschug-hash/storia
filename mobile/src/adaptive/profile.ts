import { ADAPTIVE_CONFIG, ADAPTIVE_LEMMA_SET, ADAPTIVE_PHRASE_SET } from '@/src/adaptive/config';
import { recentTapRate, round2, tapRate } from '@/src/adaptive/metrics';
import { scoreLemma, scorePhrase, type ScoreContext } from '@/src/adaptive/scoring';
import type {
  AdaptiveHit,
  AdaptiveItem,
  AdaptiveLearnerProfile,
  QuestionBias,
  ReadingLevel,
} from '@/src/adaptive/types';
import type { Chapter, ContentBundle } from '@/src/content/schemas';
import { phraseIdFromSurface } from '@/src/vocabulary/dictionaryIndex';
import type { UserVocabularyState } from '@/src/vocabulary/types';
import type { ReadingProgressRecord } from '@/src/progress/types';

export type ProfileContext = {
  currentChapterId: string | null;
  completedChapterIds: string[];
  recentHits: AdaptiveHit[];
  now?: Date;
};

export function buildAdaptiveProfile(
  bundle: ContentBundle,
  vocab: UserVocabularyState,
  progress: ReadingProgressRecord,
  ctx: ProfileContext,
): AdaptiveLearnerProfile {
  const current = ctx.currentChapterId ? bundle.chapters.get(ctx.currentChapterId) : undefined;
  const upcoming = upcomingChapter(bundle, ctx.completedChapterIds, current);

  const scoreCtx: ScoreContext = {
    upcomingLemmaIds: upcoming ? lemmasIn(upcoming) : new Set(),
    upcomingPhraseIds: upcoming ? phrasesIn(upcoming) : new Set(),
    currentChapterLemmaIds: current ? lemmasIn(current) : new Set(),
    currentChapterPhraseIds: current ? phrasesIn(current) : new Set(),
    variantLemmaIds: current ? variantLemmasIn(current) : new Set(),
    variantPhraseIds: current ? variantPhrasesIn(current) : new Set(),
    recentHitChapterNumbers: hitMap(ctx.recentHits),
    now: ctx.now,
  };

  const items: AdaptiveItem[] = [];
  for (const row of Object.values(vocab.lemmas)) {
    if (row.encounterCount <= 0 && !row.saved) continue;
    if (!ADAPTIVE_LEMMA_SET.has(row.lemmaId) && !row.saved && row.tapCount < 2) continue;
    const entry = bundle.lexiconById.get(row.lemmaId);
    items.push(scoreLemma(row, entry, scoreCtx));
  }
  for (const row of Object.values(vocab.phrases)) {
    if (row.encounterCount <= 0 && !row.saved) continue;
    if (!ADAPTIVE_PHRASE_SET.has(row.phraseId) && !row.saved && row.tapCount < 2) continue;
    items.push(scorePhrase(row, scoreCtx));
  }
  items.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

  const lemmaRows = Object.values(vocab.lemmas).filter((r) => r.encounterCount > 0);
  const phraseRows = Object.values(vocab.phrases).filter((r) => r.encounterCount > 0);
  const allRows = [...lemmaRows, ...phraseRows];
  const avgTap =
    allRows.length === 0
      ? 0
      : allRows.reduce((s, r) => s + tapRate(r.tapCount, r.encounterCount), 0) / allRows.length;
  const recentCombined = allRows.flatMap((r) => r.recentEncounters).sort((a, b) => a.at.localeCompare(b.at));
  const recent = recentTapRate(recentCombined);

  const comprehension = comprehensionStrength(progress);
  const vocabStrength = vocabularyStrength(items.filter((i) => i.kind === 'lemma'));
  const phraseStrength = vocabularyStrength(items.filter((i) => i.kind === 'phrase'));
  const completed = progress.completedChapterIds.length;
  const avgLen = averageSentenceLength(bundle, progress);
  const recentComprehension = recentComprehensionScore(progress);
  const totalChapters = bundle.story.chapters.length || 1;

  return {
    readingLevel: readingLevel(completed, avgTap, comprehension),
    currentCEFRLevel: progress.currentCEFRLevel ?? 'A1',
    estimatedCEFRConfidence: round2(Math.min(1, completed / 8) * (1 - avgTap) * Math.max(comprehension, 0.2)),
    vocabularyStrength: round2(vocabStrength),
    phraseStrength: round2(phraseStrength),
    comprehensionStrength: round2(comprehension),
    averageTapRate: round2(avgTap),
    recentTapRate: round2(recent.rate),
    recentComprehensionScore: round2(recentComprehension),
    readingCompletionRate: round2(completed / totalChapters),
    preferredReinforcementCount: ADAPTIVE_CONFIG.maxReinforcementsPerChapter,
    questionBias: questionBias(comprehension, completed),
    averageSentenceLength: round2(avgLen),
    averageSentenceDifficulty: round2(avgLen * 3.2),
    averageChapterDifficulty: round2(avgLen * 3.2 + (1 - comprehension) * 8),
    adaptiveItems: items,
    lastUpdatedAt: (ctx.now ?? new Date()).toISOString(),
  };
}

function readingLevel(completed: number, avgTap: number, comprehension: number): ReadingLevel {
  if (completed >= 8 && avgTap < 0.15 && comprehension >= 0.8) return 'beginner_plus';
  if (completed < 3 || avgTap > 0.4) return 'beginner_early';
  return 'beginner';
}

function questionBias(comprehension: number, completed: number): QuestionBias {
  if (completed < 2) return 'direct';
  if (comprehension >= 0.9 && completed >= 6) return 'inference';
  if (comprehension < 0.5) return 'direct';
  return 'balanced';
}

function vocabularyStrength(items: AdaptiveItem[]): number {
  if (items.length === 0) return 0;
  const stable = items.filter((i) => i.state === 'stable' || i.state === 'mastered').length;
  return stable / items.length;
}

function comprehensionStrength(progress: ReadingProgressRecord): number {
  const records = Object.values(progress.comprehensionByChapter);
  if (records.length === 0) return 0;
  return records.reduce((s, r) => s + r.score, 0) / records.length;
}

function recentComprehensionScore(progress: ReadingProgressRecord): number {
  const ids = progress.completedChapterIds.slice(-5);
  if (ids.length === 0) return 0;
  const scores = ids.map((id) => progress.comprehensionByChapter[id]?.score ?? 0);
  return scores.reduce((s, n) => s + n, 0) / scores.length;
}

function averageSentenceLength(bundle: ContentBundle, progress: ReadingProgressRecord): number {
  const ids = progress.completedChapterIds;
  if (ids.length === 0) {
    const first = [...bundle.chapters.values()].find((c) => c.number === 1);
    if (!first) return 0;
    return meanTokens(first);
  }
  let total = 0;
  let n = 0;
  for (const id of ids) {
    const ch = bundle.chapters.get(id);
    if (!ch) continue;
    total += meanTokens(ch);
    n += 1;
  }
  return n === 0 ? 0 : total / n;
}

function meanTokens(chapter: Chapter): number {
  const sentences = chapter.paragraphs.flatMap((p) => p.sentences);
  if (sentences.length === 0) return 0;
  return sentences.reduce((s, sent) => s + sent.tokens.length, 0) / sentences.length;
}

export function upcomingChapter(
  bundle: ContentBundle,
  completed: string[],
  reading?: Chapter,
): Chapter | undefined {
  const ordered = [...bundle.chapters.values()].sort((a, b) => a.number - b.number);
  if (reading) return ordered.find((c) => c.number === reading.number + 1);
  return ordered.find((c) => !completed.includes(c.id));
}

export function lemmasIn(chapter: Chapter): Set<string> {
  const ids = new Set<string>();
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) {
      for (const t of s.tokens) ids.add(t.lemmaId);
    }
  }
  return ids;
}

export function phrasesIn(chapter: Chapter): Set<string> {
  const ids = new Set<string>();
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) {
      for (const phrase of s.phrases ?? []) ids.add(phraseIdFromSurface(phrase.surface));
    }
  }
  return ids;
}

function variantLemmasIn(chapter: Chapter): Set<string> {
  const ids = new Set<string>();
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) {
      for (const v of s.variants) {
        if (v.id === 'standard') continue;
        for (const t of v.tokens) ids.add(t.lemmaId);
        for (const id of v.reinforces) ids.add(id);
      }
    }
  }
  return ids;
}

function variantPhrasesIn(chapter: Chapter): Set<string> {
  const ids = new Set<string>();
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) {
      for (const v of s.variants) {
        if (v.id === 'standard') continue;
        for (const id of v.phraseReinforces) ids.add(id);
      }
    }
  }
  return ids;
}

function hitMap(hits: AdaptiveHit[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  for (const hit of hits) {
    (map[hit.id] ??= []).push(hit.chapterNumber);
  }
  return map;
}
