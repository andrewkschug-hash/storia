import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import {
  collectA1ReadinessSignals,
  evaluateCrossStoryA1Readiness,
  evaluateLevelReadiness,
} from '@/src/cefr';
import {
  ELENA_STORY_ID,
  LUCA_STORY_ID,
  PRE_ROME_ARC_ID,
  __resetContentCache,
  buildLearnerJourney,
  chapterKey,
  getCatalogStories,
  getCatalogStory,
  getContentBundle,
  getNarrativeArcs,
  getStoriesInArc,
  journeyOrder,
  parseChapterKey,
  tryGetContentBundle,
} from '@/src/content';
import { inspectDraftStoryData } from '@/src/content/inspectDraft';
import { loadContentBundle } from '@/src/content/loadContentBundle';
import { mergeStoryEntities } from '@/src/content/entities';
import { StoryLoadError } from '@/src/content/storyLoadError';
import { ChapterSourceSchema, type Chapter, type Story } from '@/src/content/schemas';
import { validateStoryCatalog } from '@/src/content/validateCatalog';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { ProgressService } from '@/src/progress/ProgressService';
import { createInitialProgress } from '@/src/progress/types';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const lucaDir = join(root, 'stories', 'luca-a-roma');

afterEach(() => {
  __resetContentCache();
});

function lucaChapter01Source() {
  return JSON.parse(readFileSync(join(lucaDir, 'chapters', 'chapter-01.json'), 'utf8')) as Record<
    string,
    unknown
  > & {
    id: string;
    storyId: string;
    questions: { chapterId: string }[];
  };
}

function loadSyntheticStory(storyId: string, chapterId: string, withDomains = false) {
  const lucaManifest = JSON.parse(readFileSync(join(lucaDir, 'manifest.json'), 'utf8')) as {
    title: string;
    titleIt: string;
    synopsis: string;
    characterIds: string[];
    locationIds: string[];
    level: number;
  };
  const chapter = lucaChapter01Source();
  chapter.id = chapterId;
  chapter.storyId = storyId;
  for (const question of chapter.questions) question.chapterId = chapterId;
  if (withDomains) {
    chapter.primaryDomain = 'clock';
    chapter.secondaryDomains = ['daily_routine', 'numbers'];
  }

  return loadContentBundle({
    charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
    locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
    lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
    manifestJson: {
      id: storyId,
      title: lucaManifest.title,
      titleIt: lucaManifest.titleIt,
      slug: storyId,
      level: lucaManifest.level,
      synopsis: lucaManifest.synopsis,
      characterIds: lucaManifest.characterIds,
      locationIds: lucaManifest.locationIds,
      chapters: [
        {
          id: chapterId,
          number: 1,
          title: chapter.title,
          titleIt: chapter.titleIt,
          difficultyLevel: chapter.difficultyLevel,
          file: 'chapter-01.json',
        },
      ],
    },
    chapterJsonByFile: { 'chapter-01.json': chapter },
    storyPath: `stories/${storyId}`,
    narrativeArc: PRE_ROME_ARC_ID,
  });
}

function miniProgressStory(storyId: string): { story: Story; chapters: Map<string, Chapter> } {
  const chapterId = 'chapter-01';
  const story: Story = {
    id: storyId,
    title: storyId,
    titleIt: storyId,
    slug: storyId,
    level: 1,
    synopsis: 'test',
    characterIds: ['luca'],
    locationIds: [],
    chapters: [
      {
        id: chapterId,
        number: 1,
        title: 'One',
        titleIt: 'Uno',
        difficultyLevel: 1,
        file: 'chapter-01.json',
        wordCount: 10,
      },
    ],
    arcs: [],
  };
  const chapters = new Map<string, Chapter>([
    [
      chapterId,
      {
        id: chapterId,
        storyId,
        number: 1,
        title: 'One',
        titleIt: 'Uno',
        difficultyLevel: 1,
        cefrTarget: 'A1',
        arcId: null,
        locationIds: [],
        characterIds: ['luca'],
        events: [],
        paragraphs: [],
        questions: [
          {
            id: 'q1',
            chapterId,
            type: 'direct',
            question: '?',
            choices: ['a', 'b'],
            correctChoice: 0,
            explanation: 'x',
            difficulty: 1,
          },
          {
            id: 'q2',
            chapterId,
            type: 'direct',
            question: '?',
            choices: ['a', 'b'],
            correctChoice: 0,
            explanation: 'x',
            difficulty: 1,
          },
        ],
      },
    ],
  ]);
  return { story, chapters };
}

describe('Phase 12I story catalog', () => {
  it('lists multiple story IDs with narrative arc, order, and status', () => {
    const stories = getCatalogStories();
    const ids = stories.map((story) => story.id);
    expect(ids).toEqual(expect.arrayContaining([
      'luca-prima-di-roma-01',
      'luca-prima-di-roma-02',
      'luca-prima-di-roma-03',
      'luca-prima-di-roma-04',
      'luca-prima-di-roma-05',
      LUCA_STORY_ID,
      ELENA_STORY_ID,
    ]));

    const pre = getCatalogStory('luca-prima-di-roma-01')!;
    expect(pre.narrativeArc).toBe(PRE_ROME_ARC_ID);
    expect(pre.narrativeOrder).toBe(1);
    expect(pre.status).toBe('available');
    expect(pre.cefrLevel).toBe('A1');
    expect(pre.protagonistId).toBe('luca');

    const luca = getCatalogStory(LUCA_STORY_ID)!;
    expect(luca.status).toBe('available');
    expect(luca.narrativeArc).toBe(LUCA_STORY_ID);
    expect(luca.chapterCount).toBeGreaterThanOrEqual(40);

    const elena = getCatalogStory(ELENA_STORY_ID)!;
    expect(elena.status).toBe('draft');
    expect(elena.narrativeArc).toBe(ELENA_STORY_ID);
  });

  it('orders pre-Rome stories before Luca a Roma without using chapter numbers', () => {
    const journey = journeyOrder();
    expect(journey.map((story) => story.id)).toEqual([
      'luca-prima-di-roma-01',
      'luca-prima-di-roma-02',
      'luca-prima-di-roma-03',
      'luca-prima-di-roma-04',
      'luca-prima-di-roma-05',
      LUCA_STORY_ID,
      'la-casa-delle-finestre',
      'lettera-per-elena',
      'il-villaggio-che-non-esiste',
    ]);
    for (let i = 1; i < journey.length; i += 1) {
      expect(journey[i].narrativeOrder).toBeGreaterThan(journey[i - 1].narrativeOrder);
    }
    expect(getCatalogStory(LUCA_STORY_ID)!.narrativeOrder).toBe(6);
    expect(getStoriesInArc(PRE_ROME_ARC_ID).map((story) => story.chapterCount)).toEqual([6, 7, 6, 7, 6]);
  });

  it('exposes narrative arcs independently of CEFR bands', () => {
    const arcs = getNarrativeArcs();
    expect(arcs.map((arc) => arc.id)).toEqual([
      PRE_ROME_ARC_ID,
      LUCA_STORY_ID,
      'a2-plus-genre-paths',
      ELENA_STORY_ID,
    ]);
    expect(arcs[0].narrativeOrder).toBeLessThan(arcs[1].narrativeOrder);
  });
});

describe('Phase 12I content loading', () => {
  it('loads Luca a Roma as the default available story', () => {
    const bundle = getContentBundle();
    expect(bundle.story.id).toBe(LUCA_STORY_ID);
    expect(bundle.chapters.size).toBeGreaterThanOrEqual(40);
    expect(bundle.narrativeArc).toBe(LUCA_STORY_ID);
    expect(getContentBundle(LUCA_STORY_ID).story.id).toBe(LUCA_STORY_ID);
  });

  it('resolves a future story ID when chapter content exists', () => {
    const bundle = loadSyntheticStory('luca-prima-di-roma-01', 'luca-prima-di-roma-01-01');
    expect(bundle.story.id).toBe('luca-prima-di-roma-01');
    expect(bundle.narrativeArc).toBe(PRE_ROME_ARC_ID);
    expect(bundle.chapters.get('luca-prima-di-roma-01-01')?.storyId).toBe('luca-prima-di-roma-01');
    expect(bundle.chapters.has('luca-a-roma-01')).toBe(false);
  });

  it('fails cleanly for nonexistent and draft story IDs', () => {
    expect(() => getContentBundle('does-not-exist')).toThrow(StoryLoadError);
    expect(tryGetContentBundle('nope')).toBeNull();
    expect(getContentBundle('luca-prima-di-roma-01').chapters.size).toBe(6);
    expect(tryGetContentBundle('luca-prima-di-roma-03')?.chapters.size).toBe(6);
  });

  it('keeps Elena distinguishable as an incomplete draft', () => {
    expect(() => getContentBundle(ELENA_STORY_ID)).toThrow(/draft/);
    const elenaDir = join(root, 'stories', 'elena-torna-a-casa');
    const inspection = inspectDraftStoryData({
      storyId: ELENA_STORY_ID,
      sharedCharactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
      sharedLocationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
      storyLocalCharactersJson: JSON.parse(readFileSync(join(elenaDir, 'characters.json'), 'utf8')),
      storyLocalLocationsJson: JSON.parse(readFileSync(join(elenaDir, 'locations.json'), 'utf8')),
      manifestJson: JSON.parse(readFileSync(join(elenaDir, 'manifest.json'), 'utf8')),
      proseChapterFiles: ['chapter-01.json', 'chapter-02.json', 'chapter-03.json', 'chapter-04.json', 'chapter-05.json'],
    });
    expect(inspection.complete).toBe(false);
    expect(inspection.story.status).toBe('draft');
    expect(inspection.proseChapterFiles.length).toBeGreaterThan(0);
    expect(inspection.manifest?.chapters).toHaveLength(20);
    expect(inspection.missingChapterFiles.length).toBeGreaterThan(0);
    expect(inspection.storyLocalCharacterIds).toContain('elena');
    expect(inspection.sharedCharacterIds).toContain('luca');
    expect(inspection.characters.filter((row) => row.id === 'luca')).toHaveLength(1);
    expect(inspection.characters.some((row) => row.id === 'elena')).toBe(true);
  });
});

describe('Phase 12I story identity', () => {
  it('identifies content by storyId + chapterId, not chapter number', () => {
    const pre = { storyId: 'luca-prima-di-roma-01', chapterId: 'chapter-01' };
    const rome = { storyId: LUCA_STORY_ID, chapterId: 'chapter-01' };
    expect(chapterKey(pre)).not.toBe(chapterKey(rome));
    expect(parseChapterKey(chapterKey(pre))).toEqual(pre);
    expect(getContentBundle().chapters.get('luca-a-roma-01')?.number).toBe(1);
  });
});

describe('Phase 12I progress isolation', () => {
  it('keeps pre-Rome progress independent from Luca a Roma', async () => {
    const repo = new MemoryReadingProgressRepository();
    const pre = miniProgressStory('luca-prima-di-roma-01');
    const rome = miniProgressStory(LUCA_STORY_ID);
    const preSvc = new ProgressService(repo, pre.story, pre.chapters, PRE_ROME_ARC_ID);
    const romeSvc = new ProgressService(repo, rome.story, rome.chapters, LUCA_STORY_ID);

    const answers = [
      { questionId: 'q1', correct: true, attempts: 1 },
      { questionId: 'q2', correct: true, attempts: 1 },
    ];
    await preSvc.finishComprehensionAndComplete('chapter-01', answers);

    const preProgress = await preSvc.getOrCreate();
    const romeProgress = await romeSvc.getOrCreate();

    expect(preProgress.storyId).toBe('luca-prima-di-roma-01');
    expect(preProgress.narrativeArc).toBe(PRE_ROME_ARC_ID);
    expect(preProgress.completedChapterIds).toEqual(['chapter-01']);
    expect(romeProgress.storyId).toBe(LUCA_STORY_ID);
    expect(romeProgress.completedChapterIds).toEqual([]);
    expect(await romeSvc.getChapterStatus('chapter-01')).not.toBe('completed');

    await romeSvc.finishComprehensionAndComplete('chapter-01', answers);
    expect((await preSvc.getOrCreate()).completedChapterIds).toEqual(['chapter-01']);
    expect((await romeSvc.getOrCreate()).completedChapterIds).toEqual(['chapter-01']);
    expect((await romeSvc.getOrCreate()).narrativeArc).toBe(LUCA_STORY_ID);
  });
});

describe('Phase 12I domain metadata', () => {
  it('supports optional primaryDomain and secondaryDomains on chapters', () => {
    const parsed = ChapterSourceSchema.parse({
      ...lucaChapter01Source(),
      primaryDomain: 'clock',
      secondaryDomains: ['daily_routine', 'numbers'],
    });
    expect(parsed.primaryDomain).toBe('clock');
    expect(parsed.secondaryDomains).toEqual(['daily_routine', 'numbers']);

    const luca = getContentBundle().chapters.get('luca-a-roma-01')!;
    expect(luca.primaryDomain).toBeUndefined();
    expect(luca.secondaryDomains).toBeUndefined();

    const synthetic = loadSyntheticStory('luca-prima-di-roma-02', 'pre-rome-02-01', true);
    expect(synthetic.chapters.get('pre-rome-02-01')?.primaryDomain).toBe('clock');
    expect(synthetic.chapters.get('pre-rome-02-01')?.secondaryDomains).toEqual([
      'daily_routine',
      'numbers',
    ]);
  });
});

describe('Phase 12I validation statuses', () => {
  it('keeps Luca valid, draft incomplete, pre-Rome available', () => {
    const result = validateStoryCatalog();
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.available).toEqual(expect.arrayContaining([
      LUCA_STORY_ID,
      'luca-prima-di-roma-01',
      'luca-prima-di-roma-02',
      'luca-prima-di-roma-03',
      'luca-prima-di-roma-04',
      'luca-prima-di-roma-05',
    ]));
    expect(result.draft).toContain(ELENA_STORY_ID);
    expect(result.planned).toEqual([]);
    expect(getContentBundle().chapters.size).toBeGreaterThanOrEqual(40);
  });
});

describe('Phase 12I CEFR readiness split', () => {
  it('does not regress Luca A1 readiness and exposes cross-story A1 evaluation', () => {
    const isolated = evaluateLevelReadiness({
      currentLevel: 'A1',
      completedChapterNumbers: [1],
      levelChapterStart: 1,
      levelChapterEnd: 20,
      vocabularyStrength: 0.9,
      phraseStrength: 0.9,
      comprehensionStrength: 1,
      recentTapRate: 0.05,
      recentComprehensionScores: [1],
      averageSentenceDifficulty: 12,
    });
    expect(isolated.status).toBe('NOT_READY');

    const ready = evaluateLevelReadiness({
      currentLevel: 'A1',
      completedChapterNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      levelChapterStart: 1,
      levelChapterEnd: 20,
      vocabularyStrength: 0.5,
      phraseStrength: 0.4,
      comprehensionStrength: 0.82,
      recentTapRate: 0.12,
      recentComprehensionScores: [0.75, 0.8, 1, 0.75, 1],
      averageSentenceDifficulty: 18,
    });
    expect(ready.status).toBe('READY');
    expect(ready.nextLevel).toBe('A1+');

    const signals = collectA1ReadinessSignals({
      stories: getCatalogStories(),
      progressByStoryId: {
        [LUCA_STORY_ID]: {
          ...createInitialProgress(LUCA_STORY_ID, 'luca-a-roma-01', LUCA_STORY_ID),
          completedChapterIds: ['luca-a-roma-01', 'luca-a-roma-20'],
        },
      },
      domainsByStoryAndChapter: {
        'luca-prima-di-roma-01': {
          'chapter-01': { primaryDomain: 'family', secondaryDomains: ['home'] },
        },
      },
    });
    const cross = evaluateCrossStoryA1Readiness(signals);
    expect(cross.implemented).toBe(true);
    expect(cross.status).toBeTruthy();
    expect(signals.some((row) => row.storyId === LUCA_STORY_ID)).toBe(true);
    expect(
      signals.some((row) => row.storyId === 'luca-prima-di-roma-01' && row.status === 'available'),
    ).toBe(true);
  });
});

describe('Phase 12I Stories UI data model', () => {
  it('groups A1 / A1+ / A2 without requiring a UI redesign', () => {
    const journey = buildLearnerJourney();
    expect(journey.map((band) => band.cefrLevel)).toEqual(['A1', 'A1+', 'A2', 'A2+']);
    expect(journey[0].groups[0].chapterRange).toEqual({
      storyId: LUCA_STORY_ID,
      chapterStart: 1,
      chapterEnd: 20,
      cefrLevel: 'A1',
    });
    expect(journey[0].groups[1].stories).toHaveLength(5);
    expect(journey[1].groups[0].chapterRange?.chapterStart).toBe(21);
    expect(journey[1].groups[0].chapterRange?.chapterEnd).toBe(24);
    expect(journey[2].groups[0].chapterRange?.chapterStart).toBe(25);
    expect(journey[2].groups[0].chapterRange?.chapterEnd).toBe(40);
  });
});

describe('Phase 12I shared Luca entities', () => {
  it('does not duplicate Luca when merging story-local characters', () => {
    const sharedCharacters = JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8'));
    const sharedLocations = JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8'));
    const localCharacters = JSON.parse(
      readFileSync(join(root, 'stories', 'elena-torna-a-casa', 'characters.json'), 'utf8'),
    );
    const localLocations = JSON.parse(
      readFileSync(join(root, 'stories', 'elena-torna-a-casa', 'locations.json'), 'utf8'),
    );
    const merged = mergeStoryEntities({
      sharedCharactersJson: sharedCharacters,
      sharedLocationsJson: sharedLocations,
      storyLocalCharactersJson: {
        characters: [
          ...localCharacters.characters,
          { ...sharedCharacters.characters.find((row: { id: string }) => row.id === 'luca'), description: 'duplicate luca' },
        ],
      },
      storyLocalLocationsJson: localLocations,
    });
    expect(merged.characters.filter((row) => row.id === 'luca')).toHaveLength(1);
    expect(merged.characters.find((row) => row.id === 'luca')?.description).not.toMatch(/duplicate luca/);
    expect(merged.storyLocalCharacterIds).toContain('elena');
    expect(merged.sharedCharacterIds).toContain('luca');
  });
});
