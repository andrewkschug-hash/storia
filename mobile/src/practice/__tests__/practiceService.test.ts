import { describe, expect, it } from 'vitest';

import {
  advancePracticeSession,
  createPracticeSession,
  type PracticePrompt,
} from '@/src/practice/PracticeService';
import type { ContentBundle } from '@/src/content/schemas';
import type { UserVocabularyState } from '@/src/vocabulary/types';

function prompt(id: string): PracticePrompt {
  return {
    kind: 'lemma',
    id,
    italian: id,
    english: id,
    priority: 100,
    reasons: [],
    lastSelfAssessment: null,
    contextPrompt: null,
    contextAnswer: null,
    exampleSentence: null,
    chapterNumber: null,
  };
}

describe('advancePracticeSession', () => {
  it('removes item on got_it', () => {
    const items = [prompt('a'), prompt('b')];
    const result = advancePracticeSession(items, 0, 'got_it', {});
    expect(result.remaining).toHaveLength(1);
    expect(result.remaining[0]?.id).toBe('b');
  });

  it('moves almost to end once', () => {
    const items = [prompt('a'), prompt('b')];
    const result = advancePracticeSession(items, 0, 'almost', {});
    expect(result.remaining).toHaveLength(2);
    expect(result.remaining[0]?.id).toBe('b');
    expect(result.remaining[1]?.id).toBe('a');
  });

  it('keeps not_yet at front on first repeat', () => {
    const items = [prompt('a'), prompt('b')];
    const result = advancePracticeSession(items, 0, 'not_yet', {});
    expect(result.remaining).toHaveLength(2);
    expect(result.remaining[0]?.id).toBe('a');
    expect(result.repeated).toBe(true);
  });
});

describe('createPracticeSession', () => {
  it('sets contextAnswer to inflected surface form for cloze prompts', () => {
    const bundle: ContentBundle = {
      story: {
        id: 'test',
        title: 'Test',
        titleEn: 'Test',
        language: 'it',
        targetLanguage: 'it',
        supportLanguage: 'en',
        level: 'A1',
        totalChapters: 1,
        author: 'Test',
        description: 'Test',
        heroImage: 'test.jpg',
      },
      chapters: new Map([
        [
          'c1',
          {
            id: 'c1',
            number: 1,
            storyId: 'test',
            titleIt: 'Capitolo 1',
            titleEn: 'Chapter 1',
            paragraphs: [
              {
                id: 'p1',
                order: 1,
                sentences: [
                  {
                    id: 's1',
                    order: 1,
                    text: 'È alla stazione.',
                    tokens: [
                      {
                        surface: 'È',
                        lemmaId: 'essere',
                        start: 0,
                        end: 1,
                        partOfSpeech: 'verb',
                      },
                      {
                        surface: 'alla',
                        lemmaId: 'a',
                        start: 2,
                        end: 6,
                        partOfSpeech: 'preposition',
                      },
                      {
                        surface: 'stazione',
                        lemmaId: 'stazione',
                        start: 7,
                        end: 15,
                        partOfSpeech: 'noun',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      ]),
      lexicon: [
        {
          lemmaId: 'essere',
          italian: 'essere',
          english: 'to be',
          partOfSpeech: 'verb',
          frequency: 'high',
          introducedChapter: 1,
        },
      ],
      lexiconById: new Map([
        [
          'essere',
          {
            lemmaId: 'essere',
            italian: 'essere',
            english: 'to be',
            partOfSpeech: 'verb',
            frequency: 'high',
            introducedChapter: 1,
          },
        ],
      ]),
    };

    const state: UserVocabularyState = {
      lemmas: {
        essere: {
          lemmaId: 'essere',
          status: 'learning',
          encounterCount: 3,
          tapCount: 2,
          saved: false,
          savedForms: ['È'],
          lastEncounteredAt: new Date().toISOString(),
          lastReviewedAt: null,
          incorrectReviewCount: 0,
          familiarityScore: 0.2,
          lastSelfAssessment: null,
          lastSelfAssessedAt: null,
        },
      },
      phrases: {},
    };

    const session = createPracticeSession(state, bundle, null);
    expect(session.items).toHaveLength(1);
    const item = session.items[0];
    expect(item?.id).toBe('essere');
    expect(item?.italian).toBe('essere');
    expect(item?.contextPrompt).toBe('______ alla stazione.');
    expect(item?.contextAnswer).toBe('È');
  });
});
