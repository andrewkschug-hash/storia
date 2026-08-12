import { ADAPTIVE_CONFIG } from '@/src/adaptive/config';
import type { AdaptiveItem, AdaptationLog, AdaptiveHit } from '@/src/adaptive/types';
import type { Chapter, ContentBundle, Sentence, SentenceVariant } from '@/src/content/schemas';

export type SelectionResult = {
  chapter: Chapter;
  logs: AdaptationLog[];
  hits: AdaptiveHit[];
};

export function selectAdaptiveChapter(
  authored: Chapter,
  bundle: ContentBundle,
  items: AdaptiveItem[],
  recentHits: AdaptiveHit[],
  now: Date = new Date(),
): SelectionResult {
  const logs: AdaptationLog[] = [];
  const hits: AdaptiveHit[] = [];
  const usedTargets = new Map<string, number>();
  let reinforcements = 0;

  const byId = new Map(items.map((i) => [`${i.kind}:${i.id}`, i]));
  const paragraphs = authored.paragraphs.map((paragraph) => ({
    ...paragraph,
    sentences: paragraph.sentences.map((sentence) => {
      if (reinforcements >= ADAPTIVE_CONFIG.maxReinforcementsPerChapter) {
        return cloneSentence(sentence, 'standard');
      }
      const picked = pickVariant(sentence, authored, bundle, byId, recentHits, usedTargets);
      if (picked.variant.id !== 'standard') {
        reinforcements += 1;
        for (const lemma of picked.variant.reinforces) {
          usedTargets.set(`lemma:${lemma}`, (usedTargets.get(`lemma:${lemma}`) ?? 0) + 1);
          hits.push({
            kind: 'lemma',
            id: lemma,
            chapterId: authored.id,
            chapterNumber: authored.number,
          });
        }
        for (const phrase of picked.variant.phraseReinforces) {
          usedTargets.set(`phrase:${phrase}`, (usedTargets.get(`phrase:${phrase}`) ?? 0) + 1);
          hits.push({
            kind: 'phrase',
            id: phrase,
            chapterId: authored.id,
            chapterNumber: authored.number,
          });
        }
        logs.push({
          at: now.toISOString(),
          chapterId: authored.id,
          chapterNumber: authored.number,
          sentenceId: sentence.id,
          sceneId: paragraph.id,
          selectedVariantId: picked.variant.id,
          reinforcedLemmas: [...picked.variant.reinforces],
          reinforcedPhrases: [...picked.variant.phraseReinforces],
          reason: picked.reason,
          priority: picked.priority,
          rejected: picked.rejected,
        });
      }
      return cloneSentence(sentence, picked.variant.id);
    }),
  }));

  return {
    chapter: {
      ...authored,
      events: authored.events.map((e) => ({ ...e })),
      locationIds: [...authored.locationIds],
      characterIds: [...authored.characterIds],
      questions: authored.questions,
      paragraphs,
    },
    logs,
    hits,
  };
}

function pickVariant(
  sentence: Sentence,
  chapter: Chapter,
  bundle: ContentBundle,
  byId: Map<string, AdaptiveItem>,
  recentHits: AdaptiveHit[],
  usedTargets: Map<string, number>,
): {
  variant: SentenceVariant;
  reason: string;
  priority: number;
  rejected: { variantId: string; reason: string }[];
} {
  const standard = sentence.variants.find((v) => v.id === 'standard') ?? sentence.variants[0];
  const rejected: { variantId: string; reason: string }[] = [];
  let best: { variant: SentenceVariant; reason: string; priority: number } | null = null;

  for (const variant of sentence.variants) {
    if (variant.id === 'standard') continue;
    const invalid = rejectReason(variant, sentence, chapter, bundle, byId, recentHits, usedTargets);
    if (invalid) {
      rejected.push({ variantId: variant.id, reason: invalid });
      continue;
    }
    const scored = variantPriority(variant, byId);
    if (!scored) {
      rejected.push({ variantId: variant.id, reason: 'No struggling target' });
      continue;
    }
    if (!best || scored.priority > best.priority) {
      best = { variant, reason: scored.reason, priority: scored.priority };
    }
  }

  if (!best || !standard) {
    return {
      variant: standard ?? sentence.variants[0],
      reason: 'Normal story content',
      priority: 0,
      rejected,
    };
  }
  return { ...best, rejected };
}

export function rejectReason(
  variant: SentenceVariant,
  sentence: Sentence,
  chapter: Chapter,
  bundle: ContentBundle,
  byId: Map<string, AdaptiveItem>,
  recentHits: AdaptiveHit[],
  usedTargets: Map<string, number>,
): string | null {
  for (const token of variant.tokens) {
    const entry = bundle.lexiconById.get(token.lemmaId);
    const introduced = entry?.introducedChapter;
    if (introduced && introduced > chapter.number) {
      return `Future vocabulary "${token.lemmaId}"`;
    }
    const standardHas = sentence.tokens.some((t) => t.lemmaId === token.lemmaId);
    if (!standardHas && introduced && introduced > chapter.number) {
      return `Premature vocabulary "${token.lemmaId}"`;
    }
  }

  if (variant.difficulty > chapter.difficultyLevel + 1) {
    return 'Variant too difficult';
  }

  const targets = [
    ...variant.reinforces.map((id) => `lemma:${id}`),
    ...variant.phraseReinforces.map((id) => `phrase:${id}`),
  ];
  if (targets.length === 0) return 'No reinforcement tags';

  for (const key of targets) {
    if ((usedTargets.get(key) ?? 0) >= ADAPTIVE_CONFIG.maxRepeatsPerTargetPerChapter) {
      return `Target ${key} already used this chapter`;
    }
    const id = key.slice(key.indexOf(':') + 1);
    const kind = key.startsWith('lemma:') ? 'lemma' : 'phrase';
    const consecutive = consecutiveHits(recentHits, kind, id, chapter.number);
    if (consecutive >= ADAPTIVE_CONFIG.maxConsecutiveChapterHits) {
      return 'Consecutive overexposure';
    }
    const natural = naturalCount(chapter, kind, id);
    const alreadyInSentence =
      kind === 'lemma'
        ? sentence.tokens.some((t) => t.lemmaId === id)
        : sentence.phraseReinforces.includes(id) ||
          variant.phraseReinforces.includes(id);
    if (!alreadyInSentence && natural >= ADAPTIVE_CONFIG.skipIfNaturalCount) {
      return 'Already appears naturally';
    }
    const item = byId.get(key);
    if (item?.state === 'mastered' || item?.state === 'stable') {
      return 'Target already stable';
    }
  }

  return null;
}

function variantPriority(
  variant: SentenceVariant,
  byId: Map<string, AdaptiveItem>,
): { priority: number; reason: string } | null {
  let best: AdaptiveItem | null = null;
  for (const id of variant.reinforces) {
    const item = byId.get(`lemma:${id}`);
    if (item && (!best || item.priority > best.priority)) best = item;
  }
  for (const id of variant.phraseReinforces) {
    const item = byId.get(`phrase:${id}`);
    if (item && (!best || item.priority > best.priority)) best = item;
  }
  if (!best) return null;
  if (best.state !== 'reinforce' && best.state !== 'recovering' && !best.saved && best.priority < 0.35) {
    return null;
  }
  return {
    priority: best.priority,
    reason: best.reasons[0] ?? `${best.italian} needs exposure`,
  };
}

function consecutiveHits(
  hits: AdaptiveHit[],
  kind: 'lemma' | 'phrase',
  id: string,
  chapterNumber: number,
): number {
  const numbers = hits
    .filter((h) => h.kind === kind && h.id === id)
    .map((h) => h.chapterNumber)
    .filter((n) => n < chapterNumber);
  const uniq = [...new Set(numbers)].sort((a, b) => b - a);
  let streak = 0;
  for (let i = 0; i < uniq.length; i++) {
    if (uniq[i] === chapterNumber - 1 - i) streak += 1;
    else break;
  }
  return streak;
}

function naturalCount(chapter: Chapter, kind: 'lemma' | 'phrase', id: string): number {
  let n = 0;
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) {
      if (kind === 'lemma') {
        if (s.tokens.some((t) => t.lemmaId === id)) n += 1;
      } else if (s.phraseReinforces.includes(id)) n += 1;
    }
  }
  return n;
}

function cloneSentence(sentence: Sentence, variantId: string): Sentence {
  const variant = sentence.variants.find((v) => v.id === variantId) ?? sentence.variants[0];
  return {
    ...sentence,
    text: variant.text,
    english: variant.english,
    tokens: variant.tokens,
    phrases: variant.phrases,
    reinforces: variant.reinforces,
    phraseReinforces: variant.phraseReinforces,
    introduces: variant.introduces,
    difficulty: variant.difficulty,
    selectedVariantId: variant.id,
    variants: sentence.variants,
  };
}
