import type { AdaptiveItem } from '@/src/adaptive/types';
import type { LexiconEntry } from '@/src/content/schemas';
import { isDue } from '@/src/vocabulary/familiarity';
import { recentAssessmentBoost } from '@/src/vocabulary/selfAssessment';
import type { LemmaEncounter, PhraseEncounter } from '@/src/vocabulary/types';

export type PracticePriorityResult = {
  priority: number;
  reasons: string[];
};

export function scorePracticeItem(
  row: LemmaEncounter | PhraseEncounter,
  entry: LexiconEntry | undefined,
  adaptiveItem: AdaptiveItem | undefined,
  now: Date = new Date(),
): PracticePriorityResult {
  const reasons: string[] = [];
  let priority = 0;

  if (row.incorrectReviewCount > 0) {
    priority += 120 + row.incorrectReviewCount * 80;
    reasons.push('not-yet-history');
  }
  if (row.almostReviewCount > 0) {
    priority += 40 + row.almostReviewCount * 20;
    reasons.push('almost-history');
  }

  priority += recentAssessmentBoost(row.lastSelfAssessment, row.lastSelfAssessmentAt, now);
  if (row.lastSelfAssessment === 'not_yet') reasons.push('recent-not-yet');
  if (row.lastSelfAssessment === 'almost') reasons.push('recent-almost');

  if (row.tapCount >= 2) {
    priority += 35 + row.tapCount * 8;
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
  if (adaptiveItem?.state === 'reinforce' || adaptiveItem?.state === 'recovering') {
    priority += 50;
    reasons.push('story-reinforcing');
  }
  if (isDue(row.dueAt, now)) {
    priority += 45;
    reasons.push('due');
  }

  if (row.lastSelfAssessment === 'got_it') {
    const days = row.lastSelfAssessmentAt
      ? (now.getTime() - new Date(row.lastSelfAssessmentAt).getTime()) / (1000 * 60 * 60 * 24)
      : null;
    if (days !== null && days <= 3) {
      priority -= 40;
      reasons.push('recent-got-it');
    }
  }
  if (
    (row.status === 'familiar' || row.status === 'mastered') &&
    row.lastSelfAssessment !== 'not_yet' &&
    row.lastSelfAssessment !== 'almost'
  ) {
    priority -= 30;
    reasons.push('stable');
  }

  return { priority, reasons };
}

export type PracticeQueueItem = {
  kind: 'lemma' | 'phrase';
  id: string;
  italian: string;
  english: string;
  priority: number;
  reasons: string[];
  lastSelfAssessment: LemmaEncounter['lastSelfAssessment'];
};

export function selectPracticeItems(
  rows: PracticeQueueItem[],
  limit = 5,
): PracticeQueueItem[] {
  return [...rows]
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        a.italian.localeCompare(b.italian, 'it', { sensitivity: 'base' }),
    )
    .slice(0, limit);
}
