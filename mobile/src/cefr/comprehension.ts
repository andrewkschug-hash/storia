import type { CEFRLevel } from '@/src/cefr/levels';
import { cefrFromScore, cefrRank } from '@/src/cefr/levels';
import type { ComprehensionQuestion, ComprehensionQuestionType } from '@/src/content/schemas';

/** CEFR band this question type is typical of. Not a grammar test. */
export function questionTypeCEFR(type: ComprehensionQuestionType): CEFRLevel {
  switch (type) {
    case 'direct':
      return 'A1';
    case 'character':
      return 'A1+';
    case 'event':
      return 'A2';
    case 'sequence':
      return 'A2';
    case 'inference':
      return 'B1';
    case 'story_memory':
      return 'A2';
    default:
      return 'A1';
  }
}

export function comprehensionDifficultyScore(questions: ComprehensionQuestion[]): {
  score: number;
  cefrLevel: CEFRLevel;
  types: ComprehensionQuestionType[];
} {
  if (questions.length === 0) {
    return { score: 10, cefrLevel: 'A1', types: [] };
  }
  const types = questions.map((q) => q.type);
  const ranks = types.map((t) => cefrRank(questionTypeCEFR(t)));
  const meanRank = ranks.reduce((s, n) => s + n, 0) / ranks.length;
  const score = Math.min(100, 12 + meanRank * 14 + (types.includes('inference') ? 8 : 0));
  return { score, cefrLevel: cefrFromScore(score), types };
}

export function comprehensionFitsLevel(questions: ComprehensionQuestion[], target: CEFRLevel): boolean {
  const { cefrLevel } = comprehensionDifficultyScore(questions);
  return cefrRank(cefrLevel) <= cefrRank(target) + 1;
}
