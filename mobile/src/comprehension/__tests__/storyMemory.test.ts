import { describe, expect, it } from 'vitest';

import { selectComprehensionQuestions } from '@/src/comprehension/selectQuestions';
import type { Chapter, ComprehensionQuestion } from '@/src/content/schemas';
import { createInitialProgress, type ReadingProgressRecord } from '@/src/progress/types';

function chapterWith(questions: ComprehensionQuestion[]): Chapter {
  return {
    id: 'luca-a-roma-20',
    storyId: 'luca-a-roma',
    number: 20,
    title: 'Home again',
    titleIt: 'Tornare a casa',
    difficultyLevel: 2,
    locationIds: [],
    characterIds: [],
    events: [],
    paragraphs: [],
    questions,
    arcId: null,
    cefrTarget: 'A1',
  };
}

function progress(completed: string[]): ReadingProgressRecord {
  return {
    ...createInitialProgress('luca-a-roma'),
    completedChapterIds: completed,
    currentChapterId: 'luca-a-roma-20',
  };
}

describe('selectComprehensionQuestions', () => {
  const regular: ComprehensionQuestion = {
    id: 'ch20_q01',
    chapterId: 'luca-a-roma-20',
    type: 'event',
    question: 'Where do they go at the end?',
    choices: ['Back to Rome', 'To a new country', 'Nowhere—they stay on the train'],
    correctChoice: 0,
    explanation: 'They return to Rome.',
    difficulty: 1,
  };

  const memory: ComprehensionQuestion = {
    id: 'luca-a-roma-memory-20-01',
    chapterId: 'luca-a-roma-20',
    type: 'story_memory',
    sourceChapterIds: ['luca-a-roma-12'],
    question: 'Why does Marco need the ticket?',
    choices: [
      'He must go to his mother’s house',
      'He wants to leave Rome forever',
      'He lost his job at the café',
    ],
    correctChoice: 0,
    explanation: 'Marco’s mother was not well and he needed to visit her.',
    difficulty: 1,
  };

  it('keeps regular questions first and appends eligible story-memory questions', () => {
    const selected = selectComprehensionQuestions(
      chapterWith([regular, memory]),
      progress(['luca-a-roma-12']),
    );
    expect(selected.map((q) => q.id)).toEqual(['ch20_q01', 'luca-a-roma-memory-20-01']);
  });

  it('omits story-memory questions when source chapters are not complete', () => {
    const selected = selectComprehensionQuestions(chapterWith([regular, memory]), progress([]));
    expect(selected.map((q) => q.id)).toEqual(['ch20_q01']);
  });
});
