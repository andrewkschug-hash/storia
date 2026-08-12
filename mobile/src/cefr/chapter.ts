import { comprehensionDifficultyScore } from '@/src/cefr/comprehension';
import type { CEFRLevel } from '@/src/cefr/levels';
import { profileFor } from '@/src/cefr/profiles';
import { combineDifficulty, fitAgainstTarget, noveltyScore, type DifficultyBreakdown, type TargetFit } from '@/src/cefr/score';
import { measureSentence, type SentenceComplexity } from '@/src/cefr/sentence';
import type { Chapter, ContentBundle, LexiconEntry } from '@/src/content/schemas';
import { auditStoryVocabulary } from '@/src/content/vocabAudit';

export type NarrativeComplexity = 'simple' | 'connected' | 'multi_scene' | 'sustained';
export type AudioCompletion = 'none' | 'partial' | 'complete';

export type ChapterCefrAudit = {
  chapterId: string;
  chapterNumber: number;
  titleIt: string;
  target: CEFRLevel;
  estimated: CEFRLevel;
  status: TargetFit;
  vocabularyScore: number;
  sentenceScore: number;
  noveltyScore: number;
  comprehensionScore: number;
  grammarScore: number;
  overallScore: number;
  breakdown: DifficultyBreakdown;
  averageSentenceLength: number;
  knownPercent: number;
  learningPercent: number;
  newPercent: number;
  sentenceComplexity: number;
  dialoguePercent: number;
  wordCount: number;
  paragraphCount: number;
  sceneCount: number;
  averageParagraphLength: number;
  longestSentence: number;
  narrativeComplexity: NarrativeComplexity;
  adaptiveOpportunities: number;
  audioCompletion: AudioCompletion;
  incompleteFlags: string[];
  sentences: SentenceComplexity[];
};

export function analyzeChapter(
  chapter: Chapter,
  bundle: ContentBundle,
  known?: { familiarPercent: number; learningPercent: number; newPercent: number },
  audioIndex?: AudioCatalogIndex,
): ChapterCefrAudit {
  const target = chapter.cefrTarget ?? 'A1';
  const sentences = chapter.paragraphs.flatMap((p) => p.sentences);
  const measured = sentences.map((s) => measureSentence(s, bundle.lexiconById));
  const avgLen =
    measured.length === 0 ? 0 : measured.reduce((s, m) => s + m.wordCount, 0) / measured.length;
  const avgSentenceScore =
    measured.length === 0 ? 0 : measured.reduce((s, m) => s + m.difficultyScore, 0) / measured.length;
  const avgClauses =
    measured.length === 0 ? 1 : measured.reduce((s, m) => s + m.clauseCount, 0) / measured.length;
  const dialoguePercent =
    sentences.length === 0
      ? 0
      : sentences.filter((s) => s.kind === 'dialogue').length / sentences.length;
  const tenseMix =
    measured.length === 0 ? 1 : measured.reduce((s, m) => s + m.tenseCount, 0) / measured.length;

  const vocabScore = vocabularyScore(sentences, bundle.lexiconById);
  const sentenceScore = clamp(avgSentenceScore, 0, 100);
  const grammarScore = clamp((avgClauses - 1) * 28 + (tenseMix - 1) * 22, 0, 100);
  const novelty = known?.newPercent ?? estimateNewPercent(chapter, bundle);
  const comprehension = comprehensionDifficultyScore(chapter.questions);

  const breakdown = combineDifficulty({
    vocabulary: vocabScore,
    sentence: sentenceScore,
    grammar: grammarScore,
    novelty: noveltyScore(novelty, target),
    inference: comprehension.score,
  });

  const wordCount = measured.reduce((n, m) => n + m.wordCount, 0);
  const paragraphCount = chapter.paragraphs.length;
  const sceneCount = Math.max(1, chapter.locationIds.length);
  const averageParagraphLength =
    paragraphCount === 0 ? 0 : wordCount / paragraphCount;
  const longestSentence = measured.reduce((n, m) => Math.max(n, m.wordCount), 0);
  const adaptiveOpportunities = sentences.filter((s) => s.variants.length > 1).length;
  const catalogHits = countCatalogAudioHits(chapter, sentences, audioIndex);
  const pinnedHits = sentences.filter((s) => Boolean(s.audioAssetId)).length;
  const audioHits = Math.max(catalogHits, pinnedHits);
  const audioCompletion: AudioCompletion =
    sentences.length === 0 || audioHits === 0
      ? 'none'
      : audioHits >= sentences.length
        ? 'complete'
        : 'partial';
  const narrativeComplexity = classifyNarrative({
    wordCount,
    paragraphCount,
    sceneCount,
    avgClauses,
  });

  const incompleteFlags: string[] = [];
  if (chapter.questions.length < 3) incompleteFlags.push('fewer than 3 comprehension questions');
  if (target !== 'A1' && target !== 'A1+' && adaptiveOpportunities === 0) {
    incompleteFlags.push('no adaptive opportunities');
  }
  if (audioCompletion !== 'complete') incompleteFlags.push(`audio ${audioCompletion}`);
  const [minWords, maxWords] = profileFor(target).wordCountRange;
  if (target !== 'A1' && target !== 'A1+') {
    if (wordCount < minWords) {
      incompleteFlags.push(`word count ${wordCount} below ${target} stamina range ${minWords}–${maxWords}`);
    } else if (wordCount > maxWords) {
      incompleteFlags.push(`word count ${wordCount} above ${target} stamina range ${minWords}–${maxWords}`);
    }
  }

  return {
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    titleIt: chapter.titleIt,
    target,
    estimated: breakdown.estimatedLevel,
    status: fitAgainstTarget(breakdown.estimatedLevel, target),
    vocabularyScore: round1(vocabScore),
    sentenceScore: round1(sentenceScore),
    noveltyScore: round1(breakdown.novelty),
    comprehensionScore: round1(comprehension.score),
    grammarScore: round1(grammarScore),
    overallScore: breakdown.overall,
    breakdown,
    averageSentenceLength: round1(avgLen),
    knownPercent: round1(known?.familiarPercent ?? Math.max(0, 100 - novelty - (known?.learningPercent ?? 15))),
    learningPercent: round1(known?.learningPercent ?? 15),
    newPercent: round1(novelty),
    sentenceComplexity: round1(avgClauses),
    dialoguePercent: round1(dialoguePercent * 100),
    wordCount,
    paragraphCount,
    sceneCount,
    averageParagraphLength: round1(averageParagraphLength),
    longestSentence,
    narrativeComplexity,
    adaptiveOpportunities,
    audioCompletion,
    incompleteFlags,
    sentences: measured,
  };
}

function classifyNarrative(input: {
  wordCount: number;
  paragraphCount: number;
  sceneCount: number;
  avgClauses: number;
}): NarrativeComplexity {
  if (input.wordCount >= 500 && input.paragraphCount >= 5 && input.avgClauses >= 1.6) {
    return 'sustained';
  }
  if (input.sceneCount >= 3 || input.paragraphCount >= 5) return 'multi_scene';
  if (input.paragraphCount >= 3 && input.avgClauses >= 1.3) return 'connected';
  return 'simple';
}

export function auditStoryCefr(bundle: ContentBundle): ChapterCefrAudit[] {
  const vocab = auditStoryVocabulary(bundle);
  const byId = new Map(vocab.chapters.map((c) => [c.chapterId, c]));
  const audioIndex = loadAudioCatalogIndex();
  return [...bundle.chapters.values()]
    .sort((a, b) => a.number - b.number)
    .map((chapter) => {
      const v = byId.get(chapter.id);
      return analyzeChapter(chapter, bundle, v, audioIndex);
    });
}

type AudioCatalogIndex = {
  contentIds: Set<string>;
  textsBySpeaker: Set<string>;
};

function loadAudioCatalogIndex(): AudioCatalogIndex {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const catalog = require('../../content/audio/catalog.json') as {
      assets?: { contentId?: string; text?: string; speakerId?: string; status?: string }[];
    };
    const contentIds = new Set<string>();
    const textsBySpeaker = new Set<string>();
    for (const asset of catalog.assets ?? []) {
      if (asset.status && asset.status !== 'approved' && asset.status !== 'review_required') continue;
      if (asset.contentId) contentIds.add(asset.contentId);
      if (asset.text && asset.speakerId) textsBySpeaker.add(`${asset.speakerId}|${asset.text}`);
    }
    return { contentIds, textsBySpeaker };
  } catch {
    return { contentIds: new Set(), textsBySpeaker: new Set() };
  }
}

function countCatalogAudioHits(
  chapter: Chapter,
  sentences: Chapter['paragraphs'][number]['sentences'],
  audioIndex?: AudioCatalogIndex,
): number {
  if (!audioIndex) return 0;
  let hits = 0;
  for (const sentence of sentences) {
    const speakerId = sentence.speakerId || 'narrator';
    const contentId = `sentence:${chapter.id}:${sentence.id}:${sentence.selectedVariantId ?? 'standard'}`;
    if (
      audioIndex.contentIds.has(contentId) ||
      audioIndex.textsBySpeaker.has(`${speakerId}|${sentence.text}`)
    ) {
      hits += 1;
    }
  }
  return hits;
}

function vocabularyScore(
  sentences: Chapter['paragraphs'][number]['sentences'],
  lexiconById: Map<string, LexiconEntry>,
): number {
  const ids = new Set<string>();
  for (const s of sentences) for (const t of s.tokens) ids.add(t.lemmaId);
  if (ids.size === 0) return 10;
  let total = 0;
  for (const id of ids) {
    const entry = lexiconById.get(id);
    const level = entry?.cefrLevel ?? 'A1';
    const map: Record<string, number> = {
      A1: 8,
      'A1+': 16,
      A2: 32,
      'A2+': 42,
      B1: 58,
      'B1+': 70,
      B2: 84,
      'B2+': 90,
      C1: 96,
    };
    total += map[level] ?? 20;
  }
  return total / ids.size;
}

function estimateNewPercent(chapter: Chapter, bundle: ContentBundle): number {
  const seen = new Set<string>();
  for (const other of bundle.chapters.values()) {
    if (other.number >= chapter.number) continue;
    for (const p of other.paragraphs) {
      for (const s of p.sentences) for (const t of s.tokens) seen.add(t.lemmaId);
    }
  }
  const here = new Set<string>();
  for (const p of chapter.paragraphs) {
    for (const s of p.sentences) for (const t of s.tokens) here.add(t.lemmaId);
  }
  if (here.size === 0) return 0;
  let n = 0;
  for (const id of here) if (!seen.has(id)) n += 1;
  return (n / here.size) * 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
