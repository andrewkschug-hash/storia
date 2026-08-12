import type { CEFRLevel } from '@/src/cefr/levels';
import { cefrFromScore } from '@/src/cefr/levels';
import type { LexiconEntry, Sentence } from '@/src/content/schemas';

const WORD = '(?<![\\p{L}\\p{N}_])';
const END = '(?![\\p{L}\\p{N}_])';
const SUBORDINATORS = new RegExp(
  `${WORD}(che|perché|perche|se|quando|mentre|dove|cui|benché|benche|sebbene|affinché|affinche)${END}`,
  'giu',
);
const CONNECTORS = new RegExp(
  `${WORD}(e|ma|o|però|pero|poi|allora|quindi|anche|dopo|prima|invece|infatti|perché|perche|se|quando|mentre)${END}`,
  'giu',
);
const PAST_MARKERS = new RegExp(
  `${WORD}(ieri|andato|andata|andati|stato|stata|stati|fatto|fatta|avuto|detto|voluto|potuto|dovuto|cercato|trovato|conosciuto|partito|tornato|preso|mangiato|parlato|lavorato|aiutato|risolto)${END}`,
  'giu',
);
const FUTURE_MARKERS = new RegExp(
  `${WORD}(domani|sarò|sarai|sarà|andrò|andrai|andrà|farò|voglio|vuole|devo|deve)${END}`,
  'giu',
);
const IMPERFECT_MARKERS = new RegExp(
  `${WORD}\\w+(avo|avi|ava|avamo|avate|avano|evo|evi|eva|evamo|evate|evano|ivo|ivi|iva|ivamo|ivate|ivano)${END}`,
  'giu',
);

export type SentenceComplexity = {
  cefrLevel: CEFRLevel;
  wordCount: number;
  clauseCount: number;
  subordinateClauseCount: number;
  connectorCount: number;
  tenseCount: number;
  dialogueOrNarration: 'dialogue' | 'narration';
  difficultyScore: number;
  reasons: string[];
};

export type SentenceCefrOverride = Partial<
  Pick<
    SentenceComplexity,
    | 'cefrLevel'
    | 'wordCount'
    | 'clauseCount'
    | 'subordinateClauseCount'
    | 'connectorCount'
    | 'tenseCount'
    | 'difficultyScore'
  >
>;

export function measureSentence(
  sentence: Pick<Sentence, 'text' | 'kind' | 'tokens'>,
  lexiconById?: Map<string, LexiconEntry>,
  override?: SentenceCefrOverride,
): SentenceComplexity {
  const text = sentence.text;
  const wordCount = override?.wordCount ?? (sentence.tokens.length || wordsIn(text));
  const subordinateClauseCount =
    override?.subordinateClauseCount ?? countMatches(text, SUBORDINATORS);
  const connectorCount = override?.connectorCount ?? countMatches(text, CONNECTORS);
  const clauseCount =
    override?.clauseCount ?? Math.max(1, 1 + subordinateClauseCount + extraCoordinateClauses(text));
  const tenseCount = override?.tenseCount ?? countTenses(text);
  const dialogueOrNarration = sentence.kind === 'dialogue' ? 'dialogue' : 'narration';

  const reasons: string[] = [];
  let score = 8;
  score += Math.max(0, wordCount - 5) * 3.2;
  if (wordCount <= 5) reasons.push('short sentence');
  if (wordCount >= 12) reasons.push('longer sentence');
  score += subordinateClauseCount * 12;
  if (subordinateClauseCount > 0) reasons.push('subordinate clause');
  score += Math.max(0, connectorCount - 1) * 4;
  if (connectorCount > 1) reasons.push('multiple connectors');
  score += Math.max(0, tenseCount - 1) * 10;
  if (tenseCount > 1) reasons.push('mixed tenses');

  if (lexiconById && sentence.tokens.length > 0) {
    const ranks = sentence.tokens.map((t) => cefrWordWeight(lexiconById.get(t.lemmaId)));
    const mean = ranks.reduce((s, n) => s + n, 0) / ranks.length;
    score += mean * 14;
    if (mean >= 1.5) reasons.push('less common vocabulary');
  }

  const difficultyScore = override?.difficultyScore ?? clamp(score, 0, 100);
  const cefrLevel = override?.cefrLevel ?? cefrFromScore(difficultyScore);

  return {
    cefrLevel,
    wordCount,
    clauseCount,
    subordinateClauseCount,
    connectorCount,
    tenseCount,
    dialogueOrNarration,
    difficultyScore: Math.round(difficultyScore * 10) / 10,
    reasons,
  };
}

function wordsIn(text: string): number {
  return (text.match(/[\p{L}\p{N}’']+/gu) ?? []).length;
}

function countMatches(text: string, re: RegExp): number {
  const copy = new RegExp(re.source, re.flags);
  return [...text.matchAll(copy)].length;
}

function extraCoordinateClauses(text: string): number {
  const ma = countMatches(text, new RegExp(`${WORD}(ma|però|pero)${END}`, 'giu'));
  const commas = (text.match(/,/g) ?? []).length;
  return ma + Math.min(commas, 2);
}

function countTenses(text: string): number {
  let n = 1;
  if (countMatches(text, PAST_MARKERS) > 0 || countMatches(text, IMPERFECT_MARKERS) > 0) n += 1;
  if (countMatches(text, FUTURE_MARKERS) > 0) n += 1;
  return n;
}

function cefrWordWeight(entry: LexiconEntry | undefined): number {
  const level = entry?.cefrLevel;
  if (level === 'A1' || level === 'A1+') return 0;
  if (level === 'A2' || level === 'A2+') return 1;
  if (level === 'B1' || level === 'B1+') return 2;
  if (level === 'B2' || level === 'B2+') return 3;
  if (level === 'C1') return 4;
  if (entry?.difficulty === 1) return 0;
  if (entry?.difficulty === 2) return 1;
  if (entry?.difficulty === 3) return 2;
  if (entry?.difficulty === 4) return 3;
  return 0.5;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
