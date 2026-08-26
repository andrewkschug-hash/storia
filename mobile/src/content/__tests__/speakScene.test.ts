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

describe('speak scene milestones', () => {
  it('are authored milestone scenes, not catalog stories', () => {
    expect(getSpeakSceneForBatch(LUCA_STORY_ID, 5)).toBeNull();
    expect(getSpeakSceneForBatch(LUCA_STORY_ID, 10)).toBeNull();
    expect(getSpeakSceneForBatch(LUCA_STORY_ID, 25)).toBeNull();

    const scene15 = getSpeakSceneForBatch(LUCA_STORY_ID, 15);
    expect(scene15?.id).toBe('luca-a-roma-speak-15');
    expect(scene15?.sourceRange).toEqual({ start: 11, end: 15 });
    expect(scene15?.lines).toHaveLength(5);
    expect(scene15?.lines.map((line) => line.en)).toEqual([
      'Marco comes back to the café.',
      'He has a problem.',
      'He has to go to his mother\'s house.',
      'He has to buy a ticket.',
      "He doesn't have any money.",
    ]);
    const scene24 = getSpeakSceneForBatch(LUCA_STORY_ID, 24);
    expect(scene24?.id).toBe('luca-a-roma-speak-24');
    expect(scene24?.sourceRange).toEqual({ start: 21, end: 24 });
    expect(scene24?.lines).toHaveLength(5);
    expect(scene24?.lines[2]?.en).toBe("He tells her he's doing well.");
    expect(scene24?.lines[4]?.en).toBe('Rome is home now.');
    const scene27 = getSpeakSceneForBatch(LUCA_STORY_ID, 27);
    expect(scene27?.id).toBe('luca-a-roma-speak-27');
    expect(scene27?.sourceRange).toEqual({ start: 25, end: 27 });
    expect(scene27?.lines).toHaveLength(5);
    expect(scene27?.title).toBe('Sofia’s Opinion');
    expect(scene27?.lines[3]?.en).toMatch(/[Ff]ear/);
    const scene40 = getSpeakSceneForBatch(LUCA_STORY_ID, 40);
    expect(scene40?.id).toBe('luca-a-roma-speak-40');
    expect(scene40?.sourceRange).toEqual({ start: 36, end: 40 });
    expect(scene40?.lines).toHaveLength(5);
    expect(scene40?.lines[2]?.en).toContain('Rome');
    expect(scene40?.lines[4]?.en).toBe('For now, this is home.');

    const scene45 = getSpeakSceneForBatch(LUCA_STORY_ID, 45);
    expect(scene45?.id).toBe('luca-a-roma-speak-45');
    expect(scene45?.sourceRange).toEqual({ start: 41, end: 45 });
    expect(scene45?.lines).toHaveLength(5);
    expect(scene45?.title).toBe('A Sincere Conversation');
    expect(scene45?.lines[2]?.it).toContain('sceglie consapevolmente');

    const scene50 = getSpeakSceneForBatch(LUCA_STORY_ID, 50);
    expect(scene50?.id).toBe('luca-a-roma-speak-50');
    expect(scene50?.sourceRange).toEqual({ start: 46, end: 50 });
    expect(scene50?.lines).toHaveLength(5);
    expect(scene50?.title).toBe('The Response to Giulia');
    expect(scene50?.lines[2]?.it).toContain('percorso indipendente');

    const scene55 = getSpeakSceneForBatch(LUCA_STORY_ID, 55);
    expect(scene55?.id).toBe('luca-a-roma-speak-55');
    expect(scene55?.sourceRange).toEqual({ start: 51, end: 55 });
    expect(scene55?.lines).toHaveLength(5);
    expect(scene55?.title).toBe('The First Morning Service');
    expect(scene55?.lines[1]?.it).toContain('Le preparo subito');

    const scene20 = getSpeakSceneForBatch(LUCA_STORY_ID, 20);
    expect(scene20?.id).toBe('luca-a-roma-speak-20');
    expect(scene20?.sourceRange).toEqual({ start: 16, end: 20 });
    expect(scene20?.lines).toHaveLength(5);
    expect(scene20?.lines[0]?.en).toBe('Then the group goes back to Rome.');
    const scene30 = getSpeakSceneForBatch(LUCA_STORY_ID, 30);
    expect(scene30?.id).toBe('luca-a-roma-speak-30');
    expect(scene30?.sourceRange).toEqual({ start: 25, end: 30 });
    expect(scene30?.lines).toHaveLength(5);
    const scene35 = getSpeakSceneForBatch(LUCA_STORY_ID, 35);
    expect(scene35?.id).toBe('luca-a-roma-speak-35');
    expect(scene35?.sourceRange).toEqual({ start: 31, end: 35 });
    expect(scene35?.lines).toHaveLength(5);
    expect(scene35?.lines[2]?.en).toMatch(/arrived/i);
    expect(getCatalogStories().some((story) => story.id === 'luca-a-roma-speak-15')).toBe(false);
    expect(getSpeakSceneForBatch('luca-prima-di-roma-01', 5)?.id).toBe(
      'luca-prima-di-roma-01-speak-5',
    );
    expect(getSpeakSceneForBatch('luca-prima-di-roma-03', 5)?.title).toBe('Paying at the counter');
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
