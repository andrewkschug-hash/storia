import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, afterEach } from 'vitest';

import { loadContentBundle } from '@/src/content/loadContentBundle';
import { ContentValidationError } from '@/src/content/tokenize';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { ProgressService } from '@/src/progress/ProgressService';
import { __resetUnlockAllChapters, setUnlockAllChapters } from '@/src/progress/unlockAll';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadValidBundle() {
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  }
  return loadContentBundle({
    charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
    locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
    lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
    manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
    chapterJsonByFile,
    adaptiveJson: JSON.parse(readFileSync(join(storyPath, 'adaptive-variants.json'), 'utf8')),
    translationsJson: JSON.parse(readFileSync(join(storyPath, 'sentence-english.json'), 'utf8')),
    storyPath: 'stories/luca-a-roma',
  });
}

describe('content validation', () => {
  it('loads valid content successfully', () => {
    const bundle = loadValidBundle();
    expect(bundle.chapters.size).toBeGreaterThanOrEqual(40);
    expect(bundle.lexicon.length).toBeGreaterThan(200);
    expect(bundle.story.id).toBe('luca-a-roma');
  });

  it('fails on unknown lemma IDs', () => {
    const chapterJsonByFile: Record<string, unknown> = {};
    for (const file of readdirSync(chaptersDir)) {
      if (!file.endsWith('.json')) continue;
      chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
    }
    const bad = structuredClone(chapterJsonByFile['chapter-01.json']) as {
      paragraphs: { sentences: { lemmas: string[]; id: string }[] }[];
    };
    bad.paragraphs[0].sentences[0].lemmas[0] = 'xyz_123';
    chapterJsonByFile['chapter-01.json'] = bad;

    expect(() =>
      loadContentBundle({
        charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
        locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
        lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
        manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
        chapterJsonByFile,
        storyPath: 'stories/luca-a-roma',
      }),
    ).toThrow(ContentValidationError);

    try {
      loadContentBundle({
        charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
        locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
        lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
        manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
        chapterJsonByFile,
        storyPath: 'stories/luca-a-roma',
      });
    } catch (e) {
      expect(String(e)).toContain('xyz_123');
      expect(String(e)).toContain('CONTENT VALIDATION ERROR');
    }
  });

  it('fails on unknown character IDs', () => {
    const chapterJsonByFile: Record<string, unknown> = {};
    for (const file of readdirSync(chaptersDir)) {
      if (!file.endsWith('.json')) continue;
      chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
    }
    const bad = structuredClone(chapterJsonByFile['chapter-01.json']) as {
      characterIds: string[];
    };
    bad.characterIds = ['not-a-character'];
    chapterJsonByFile['chapter-01.json'] = bad;

    expect(() =>
      loadContentBundle({
        charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
        locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
        lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
        manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
        chapterJsonByFile,
        storyPath: 'stories/luca-a-roma',
      }),
    ).toThrow(/Unknown character ID/);
  });

  it('fails on unknown location IDs', () => {
    const chapterJsonByFile: Record<string, unknown> = {};
    for (const file of readdirSync(chaptersDir)) {
      if (!file.endsWith('.json')) continue;
      chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
    }
    const bad = structuredClone(chapterJsonByFile['chapter-01.json']) as {
      locationIds: string[];
    };
    bad.locationIds = ['atlantis'];
    chapterJsonByFile['chapter-01.json'] = bad;

    expect(() =>
      loadContentBundle({
        charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
        locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
        lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
        manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
        chapterJsonByFile,
        storyPath: 'stories/luca-a-roma',
      }),
    ).toThrow(/Unknown location ID/);
  });

  it('fails when chapter ordering is invalid', () => {
    const manifest = JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')) as {
      chapters: { number: number }[];
    };
    manifest.chapters[1].number = 99;
    const chapterJsonByFile: Record<string, unknown> = {};
    for (const file of readdirSync(chaptersDir)) {
      if (!file.endsWith('.json')) continue;
      chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
    }

    expect(() =>
      loadContentBundle({
        charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
        locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
        lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
        manifestJson: manifest,
        chapterJsonByFile,
        storyPath: 'stories/luca-a-roma',
      }),
    ).toThrow(/Chapter numbers/);
  });
});

describe('reading progress', () => {
  afterEach(() => {
    __resetUnlockAllChapters();
  });

  it('persists across repository reloads', async () => {
    const repo = new MemoryReadingProgressRepository();
    const bundle = loadValidBundle();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const ch1 = bundle.story.chapters[0].id;
    await service.openChapter(ch1);
    await service.savePosition(ch1, 's03');

    const service2 = new ProgressService(repo, bundle.story, bundle.chapters);
    const progress = await service2.getOrCreate();
    expect(progress.currentChapterId).toBe(ch1);
    expect(progress.lastSentenceId).toBe('s03');
  });

  it('completing chapter 1 unlocks chapter 2; chapter 3 stays locked', async () => {
    const repo = new MemoryReadingProgressRepository();
    const bundle = loadValidBundle();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const [c1, c2, c3] = bundle.story.chapters;

    expect(await service.getChapterStatus(c2.id)).toBe('locked');
    expect(await service.getChapterStatus(c3.id)).toBe('locked');

    await finishChapter(service, bundle, c1.id);

    expect(await service.getChapterStatus(c1.id)).toBe('completed');
    expect(await service.getChapterStatus(c2.id)).toMatch(/available|in_progress/);
    expect(await service.getChapterStatus(c3.id)).toBe('locked');
  });

  it('developer unlock lets any chapter open without completing earlier ones', async () => {
    setUnlockAllChapters(true);
    const repo = new MemoryReadingProgressRepository();
    const bundle = loadValidBundle();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const last = bundle.story.chapters[bundle.story.chapters.length - 1];
    expect(await service.getChapterStatus(last.id)).toBe('available');
    await service.openChapter(last.id);
    expect(await service.getChapterStatus(last.id)).toBe('in_progress');
  });

  it('continue points at current chapter and restores sentence', async () => {
    const repo = new MemoryReadingProgressRepository();
    const bundle = loadValidBundle();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const c1 = bundle.story.chapters[0];
    await service.openChapter(c1.id);
    await service.savePosition(c1.id, 's02');
    const progress = await service.getOrCreate();
    expect(service.getContinueChapterId(progress)).toBe(c1.id);
    expect(progress.lastSentenceId).toBe('s02');
  });

  it('keeps completed chapters after further progress', async () => {
    const repo = new MemoryReadingProgressRepository();
    const bundle = loadValidBundle();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const [c1, c2] = bundle.story.chapters;
    await finishChapter(service, bundle, c1.id);
    await finishChapter(service, bundle, c2.id);
    const progress = await service.getOrCreate();
    expect(progress.completedChapterIds).toContain(c1.id);
    expect(progress.completedChapterIds).toContain(c2.id);
    expect(service.getCompletedCount(progress)).toBe(2);
    expect(service.getPercentComplete(progress)).toBe(5);
  });

  it('counts partial progress within the current chapter', async () => {
    const repo = new MemoryReadingProgressRepository();
    const bundle = loadValidBundle();
    const service = new ProgressService(repo, bundle.story, bundle.chapters);
    const c1 = bundle.story.chapters[0];
    const chapter = bundle.chapters.get(c1.id)!;
    const secondSentence = chapter.paragraphs.flatMap((p) => p.sentences)[1];
    await service.openChapter(c1.id);
    await service.savePosition(c1.id, secondSentence?.id ?? 's02');
    const progress = await service.getOrCreate();
    expect(service.getPercentComplete(progress)).toBe(0);
    expect(service.getReadingPercentComplete(progress)).toBeGreaterThan(0);
    expect(service.getChapterReadingPercent(chapter, progress.lastSentenceId)).toBeGreaterThan(0);
  });
});

async function finishChapter(
  service: ProgressService,
  bundle: ReturnType<typeof loadValidBundle>,
  chapterId: string,
) {
  const chapter = bundle.chapters.get(chapterId)!;
  const answers = chapter.questions.map((q) => ({
    questionId: q.id,
    correct: true,
    attempts: 1,
  }));
  await service.finishComprehensionAndComplete(chapterId, answers);
}
