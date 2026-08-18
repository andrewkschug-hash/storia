import { afterEach, describe, expect, it } from 'vitest';

import {
  LUCA_STORY_ID,
  __resetContentCache,
  getCatalogStories,
  getContentBundle,
} from '@/src/content';
import {
  __resetSpeakSceneCache,
  getSpeakSceneById,
  getSpeakSceneForBatch,
  speakLineToExercise,
} from '@/src/content/speakScenes';
import { recapBlocksChapter } from '@/src/content/storyPath';
import {
  __resetProgressService,
  __setProgressRepository,
  getProgressService,
} from '@/src/progress';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { completeBatchCheckpointsAfterChapter } from '@/src/progress/testHelpers';
import type { ProgressService } from '@/src/progress/ProgressService';
import { scoreProductionAnswer } from '@/src/production/score';

afterEach(() => {
  __resetContentCache();
  __resetSpeakSceneCache();
  __resetProgressService();
  __setProgressRepository(null);
});

async function completeLucaThrough(service: ProgressService, throughChapter: number) {
  const bundle = getContentBundle(LUCA_STORY_ID);
  for (let n = 1; n <= throughChapter; n++) {
    const chapter = [...bundle.chapters.values()].find((item) => item.number === n)!;
    await service.openChapter(chapter.id);
    await service.finishComprehensionAndComplete(
      chapter.id,
      chapter.questions.map((q) => ({ questionId: q.id, correct: true, attempts: 1 })),
    );
    await completeBatchCheckpointsAfterChapter(service, LUCA_STORY_ID, n);
  }
  return bundle;
}

describe('speak scene — chapter 15', () => {
  it('is an authored Chapter 15 milestone, not a catalog story', () => {
    expect(getSpeakSceneForBatch(LUCA_STORY_ID, 5)).toBeNull();
    expect(getSpeakSceneForBatch(LUCA_STORY_ID, 10)).toBeNull();
    expect(getSpeakSceneForBatch(LUCA_STORY_ID, 20)).toBeNull();
    const scene = getSpeakSceneForBatch(LUCA_STORY_ID, 15);
    expect(scene?.id).toBe('luca-a-roma-speak-15');
    expect(scene?.storyId).toBe(LUCA_STORY_ID);
    expect(scene?.batchEnd).toBe(15);
    expect(scene?.title).toBe('Help Marco');
    expect(scene?.summaryEn).toContain('Marco is back at the café');
    expect(scene?.sourceRange).toEqual({ start: 11, end: 15 });
    expect(scene?.lines).toHaveLength(5);
    expect(scene?.lines.map((line) => line.en)).toEqual([
      'Marco goes back to the café.',
      'He has a problem.',
      'He has to go home.',
      'He needs to buy a ticket.',
      "He doesn't have money.",
    ]);
    expect(getCatalogStories().some((story) => story.id === 'luca-a-roma-speak-15')).toBe(false);
  });

  it('scores meaning, person, and polarity rather than string equality', () => {
    const scene = getSpeakSceneById('luca-a-roma-speak-15')!;
    const cafe = scene.lines.find((line) => line.id.endsWith('l01'))!;
    const problem = scene.lines.find((line) => line.id.endsWith('l02'))!;
    const money = scene.lines.find((line) => line.id.endsWith('l05'))!;

    expect(scoreProductionAnswer(speakLineToExercise(scene, cafe), cafe.it).result).toBe('correct');
    expect(scoreProductionAnswer(speakLineToExercise(scene, cafe), 'Torna al caffè.').result).toBe(
      'correct',
    );
    expect(scoreProductionAnswer(speakLineToExercise(scene, problem), 'Ha un problema.').result).toBe(
      'correct',
    );
    expect(
      scoreProductionAnswer(speakLineToExercise(scene, problem), 'Marco ha un problema.').result,
    ).toBe('correct');
    expect(scoreProductionAnswer(speakLineToExercise(scene, money), 'Non ha soldi.').result).toBe(
      'correct',
    );
    expect(scoreProductionAnswer(speakLineToExercise(scene, money), 'Non ha i soldi.').result).toBe(
      'correct',
    );
    expect(scoreProductionAnswer(speakLineToExercise(scene, money), 'Ha soldi.').result).toBe(
      'incorrect',
    );
    expect(scoreProductionAnswer(speakLineToExercise(scene, money), 'Ha soldi.').reason).toBe(
      'wrong_polarity',
    );
    expect(
      scoreProductionAnswer(speakLineToExercise(scene, problem), 'Non ha un problema.').result,
    ).toBe('incorrect');
  });

  it('does not block chapter 16 if the scene is skipped or completed', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const service = getProgressService(LUCA_STORY_ID);
    const bundle = await completeLucaThrough(service, 15);
    const chapter16 = [...bundle.chapters.values()].find((item) => item.number === 16)!;
    const chapterNumberById = new Map([...bundle.chapters.values()].map((c) => [c.id, c.number]));

    expect(await service.getChapterStatus(chapter16.id)).not.toBe('locked');
    expect(
      recapBlocksChapter(await service.getOrCreate(), LUCA_STORY_ID, 16, chapterNumberById),
    ).toBe(false);

    await service.recordSpeakScene({
      sceneId: 'luca-a-roma-speak-15',
      skipped: true,
      completedAt: new Date().toISOString(),
      lines: [],
    });
    expect(await service.getChapterStatus(chapter16.id)).not.toBe('locked');

    await service.recordSpeakScene({
      sceneId: 'luca-a-roma-speak-15',
      skipped: false,
      completedAt: new Date().toISOString(),
      lines: [
        {
          lineId: 'luca-a-roma-speak-15-l01',
          vote: 'got_it',
          score: 'correct',
          attempts: 1,
          learnerText: 'Marco torna al caffè.',
          timestamp: new Date().toISOString(),
        },
      ],
    });
    expect(await service.getChapterStatus(chapter16.id)).not.toBe('locked');
    expect(
      recapBlocksChapter(await service.getOrCreate(), LUCA_STORY_ID, 16, chapterNumberById),
    ).toBe(false);
  });

  it('appends line attempts without overwriting earlier sessions', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const service = getProgressService(LUCA_STORY_ID);
    const line = (vote: 'got_it' | 'almost', timestamp: string) => ({
      lineId: 'luca-a-roma-speak-15-l01',
      vote,
      score: 'correct' as const,
      attempts: 1,
      learnerText: 'Torna al caffè.',
      timestamp,
    });

    await service.recordSpeakScene({
      sceneId: 'luca-a-roma-speak-15',
      skipped: false,
      completedAt: null,
      lines: [line('got_it', '2026-08-18T00:00:00.000Z')],
    });
    await service.recordSpeakScene({
      sceneId: 'luca-a-roma-speak-15',
      skipped: false,
      completedAt: '2026-08-18T00:01:00.000Z',
      lines: [
        line('got_it', '2026-08-18T00:00:00.000Z'),
        { ...line('almost', '2026-08-18T00:01:00.000Z'), lineId: 'luca-a-roma-speak-15-l02' },
      ],
    });
    await service.recordSpeakScene({
      sceneId: 'luca-a-roma-speak-15',
      skipped: false,
      completedAt: '2026-08-18T01:00:00.000Z',
      lines: [line('almost', '2026-08-18T01:00:00.000Z')],
    });

    const history = (await service.getOrCreate()).speakScenes?.['luca-a-roma-speak-15'] ?? [];
    expect(history).toHaveLength(2);
    expect(history[0]?.lines.map((entry) => entry.lineId)).toEqual([
      'luca-a-roma-speak-15-l01',
      'luca-a-roma-speak-15-l02',
    ]);
    expect(history[0]?.lines[0]?.vote).toBe('got_it');
    expect(history[0]?.lines[0]?.timestamp).toBe('2026-08-18T00:00:00.000Z');
    expect(history[1]?.lines[0]?.vote).toBe('almost');
  });
});
