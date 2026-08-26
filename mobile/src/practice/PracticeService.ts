import type { ContentBundle } from '@/src/content/schemas';
import type { AdaptiveLearnerProfile } from '@/src/adaptive/types';
import { phraseIdFromSurface } from '@/src/vocabulary/dictionaryIndex';
import {
  scorePracticeItem,
  selectPracticeItems,
  type PracticeQueueItem,
} from '@/src/vocabulary/practicePriority';
import type { SelfAssessment } from '@/src/vocabulary/selfAssessment';
import {
  clozeText,
  findExamplesForLemma,
  findExamplesForPhrase,
} from '@/src/vocabulary/storyExamples';
import type { UserVocabularyState } from '@/src/vocabulary/types';

export type PracticePrompt = {
  kind: 'lemma' | 'phrase';
  id: string;
  italian: string;
  english: string;
  priority: number;
  reasons: string[];
  lastSelfAssessment: SelfAssessment | null;
  /** Story-context retrieval when available. */
  contextPrompt: string | null;
  contextAnswer: string | null;
  exampleSentence: string | null;
  chapterNumber: number | null;
};

export type PracticeSession = {
  items: PracticePrompt[];
};

export type PracticeSessionOptions = {
  limit?: number;
  now?: Date;
};

const CLOSED_CLASS = new Set(['article', 'preposition', 'conjunction', 'pronoun']);

export function buildPracticeQueue(
  state: UserVocabularyState,
  bundle: ContentBundle,
  profile: AdaptiveLearnerProfile | null,
  options: PracticeSessionOptions = {},
): PracticeQueueItem[] {
  const now = options.now ?? new Date();
  const adaptiveByKey = new Map(
    (profile?.adaptiveItems ?? []).map((item) => [`${item.kind}:${item.id}`, item] as const),
  );
  const candidates: PracticeQueueItem[] = [];

  for (const row of Object.values(state.lemmas)) {
    if (row.encounterCount <= 0 && !row.saved) continue;
    const entry = bundle.lexiconById.get(row.lemmaId);
    if (!entry && row.tapCount === 0 && !row.saved) continue;
    if (CLOSED_CLASS.has(entry?.partOfSpeech ?? '') && row.tapCount === 0 && !row.saved) continue;
    const adaptive = adaptiveByKey.get(`lemma:${row.lemmaId}`);
    const scored = scorePracticeItem(row, entry, adaptive, now);
    if (scored.priority <= 0) continue;
    candidates.push({
      kind: 'lemma',
      id: row.lemmaId,
      italian: entry?.italian ?? row.lemmaId,
      english: entry?.english ?? row.lemmaId,
      priority: scored.priority,
      reasons: scored.reasons,
      lastSelfAssessment: row.lastSelfAssessment,
    });
  }

  for (const row of Object.values(state.phrases)) {
    if (row.encounterCount <= 0 && !row.saved) continue;
    const adaptive = adaptiveByKey.get(`phrase:${row.phraseId}`);
    const scored = scorePracticeItem(row, undefined, adaptive, now);
    if (scored.priority <= 0) continue;
    candidates.push({
      kind: 'phrase',
      id: row.phraseId,
      italian: row.surface,
      english: phraseEnglish(bundle, row.phraseId) ?? row.surface,
      priority: scored.priority,
      reasons: scored.reasons,
      lastSelfAssessment: row.lastSelfAssessment,
    });
  }

  return selectPracticeItems(candidates, options.limit ?? 5);
}

export function createPracticeSession(
  state: UserVocabularyState,
  bundle: ContentBundle,
  profile: AdaptiveLearnerProfile | null,
  options: PracticeSessionOptions = {},
): PracticeSession {
  const queue = buildPracticeQueue(state, bundle, profile, options);
  const chapterNumberById = new Map(
    [...bundle.chapters.values()].map((chapter) => [chapter.id, chapter.number] as const),
  );

  const items: PracticePrompt[] = queue.map((item) => {
    if (item.kind === 'lemma') {
      const examples = findExamplesForLemma(bundle, item.id, 1);
      const example = examples[0];
      const sentence = example
        ? [...bundle.chapters.values()]
            .flatMap((chapter) => chapter.paragraphs.flatMap((p) => p.sentences))
            .find((row) => row.id === example.sentenceId)
        : undefined;
      const cloze = sentence ? clozeText(sentence, item.id) : null;
      const token = sentence?.tokens.find((t) => t.lemmaId === item.id);
      const surface = token?.surface ?? item.italian;
      return {
        ...item,
        contextPrompt: cloze,
        contextAnswer: cloze ? surface : item.italian,
        exampleSentence: example?.text ?? null,
        chapterNumber: example ? chapterNumberById.get(example.chapterId) ?? null : null,
      };
    }

    const examples = findExamplesForPhrase(bundle, item.id, 1);
    const example = examples[0];
    return {
      ...item,
      contextPrompt: example?.text ?? null,
      contextAnswer: item.italian,
      exampleSentence: example?.text ?? null,
      chapterNumber: example ? chapterNumberById.get(example.chapterId) ?? null : null,
    };
  });

  return { items };
}

function phraseEnglish(bundle: ContentBundle, phraseId: string): string | null {
  for (const chapter of bundle.chapters.values()) {
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        for (const phrase of sentence.phrases ?? []) {
          if (phraseIdFromSurface(phrase.surface) === phraseId) return phrase.naturalEn;
        }
      }
    }
  }
  return null;
}

export type PracticeAdvanceResult = {
  remaining: PracticePrompt[];
  repeated: boolean;
};

/** Session dequeue rules after a self-assessment. */
export function advancePracticeSession(
  items: PracticePrompt[],
  currentIndex: number,
  assessment: SelfAssessment,
  repeatCounts: Record<string, number>,
): PracticeAdvanceResult {
  const current = items[currentIndex];
  if (!current) return { remaining: items, repeated: false };
  const key = `${current.kind}:${current.id}`;
  const next = [...items];

  if (assessment === 'got_it') {
    next.splice(currentIndex, 1);
    return { remaining: next, repeated: false };
  }

  if (assessment === 'almost') {
    const [removed] = next.splice(currentIndex, 1);
    if (removed && (repeatCounts[key] ?? 0) < 1) {
      next.push(removed);
      return { remaining: next, repeated: true };
    }
    return { remaining: next, repeated: false };
  }

  const repeats = repeatCounts[key] ?? 0;
  if (repeats < 1) {
    return { remaining: next, repeated: true };
  }
  const [removed] = next.splice(currentIndex, 1);
  if (removed) next.push(removed);
  return { remaining: next, repeated: false };
}
