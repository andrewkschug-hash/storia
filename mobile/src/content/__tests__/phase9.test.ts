import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { auditStoryCefr } from '@/src/cefr';
import { loadContentBundle } from '@/src/content/loadContentBundle';
import type { ContentBundle } from '@/src/content/schemas';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadBundle(): ContentBundle {
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
    arcsJson: JSON.parse(readFileSync(join(storyPath, 'arcs.json'), 'utf8')),
    storyPath: 'stories/luca-a-roma',
  });
}

describe('Phase 9 A1+ bridge and A2 arc', () => {
  const bundle = loadBundle();
  const a1 = [...bundle.chapters.values()].filter((c) => c.number <= 20);
  const a1plus = [...bundle.chapters.values()].filter((c) => c.number >= 21 && c.number <= 24);
  const a2 = [...bundle.chapters.values()].filter((c) => c.number >= 25 && c.number <= 40);

  it('loads 40 chapters with A1+ bridge at 21–24 and A2 at 25–40', () => {
    expect(bundle.chapters.size).toBe(40);
    expect(a1).toHaveLength(20);
    expect(a1plus.map((c) => c.number)).toEqual([21, 22, 23, 24]);
    expect(a2.map((c) => c.number)).toEqual(Array.from({ length: 16 }, (_, i) => i + 25));
  });

  it('keeps existing A1 chapters 1–20 unchanged in identity', () => {
    expect(bundle.chapters.get('luca-a-roma-01')?.titleIt).toBe('Arrivo');
    expect(bundle.chapters.get('luca-a-roma-20')?.titleIt).toBe('Tornare a casa');
    expect(a1.every((c) => c.cefrTarget === 'A1')).toBe(true);
  });

  it('marks A1+ chapters 21–24 and A2 chapters 25–40', () => {
    expect(a1plus.every((c) => c.cefrTarget === 'A1+')).toBe(true);
    expect(a2.every((c) => c.cefrTarget === 'A2')).toBe(true);
    const a1PlusArc = bundle.story.arcs.find((item) => item.cefrLevel === 'A1+');
    const a2Arc = bundle.story.arcs.find((item) => item.cefrLevel === 'A2');
    expect(a1PlusArc?.status).toBe('available');
    expect(a1PlusArc?.chapterStart).toBe(21);
    expect(a1PlusArc?.chapterEnd).toBe(24);
    expect(a2Arc?.status).toBe('available');
    expect(a2Arc?.chapterStart).toBe(25);
    expect(a2Arc?.chapterEnd).toBe(40);
  });

  it('gives each A1+ and A2 chapter three valid comprehension questions', () => {
    for (const chapter of [...a1plus, ...a2]) {
      expect(chapter.questions).toHaveLength(3);
      for (const q of chapter.questions) {
        expect(q.chapterId).toBe(chapter.id);
        expect(q.correctChoice).toBeGreaterThanOrEqual(0);
        expect(q.correctChoice).toBeLessThan(q.choices.length);
      }
    }
  });

  it('A1+ bridge increases length gradually without A2 past-tense cliff', () => {
    for (const chapter of a1plus) {
      const text = chapter.paragraphs.flatMap((p) => p.sentences.map((s) => s.text)).join(' ');
      const words = text.split(/\s+/).filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(200);
      expect(words).toBeLessThanOrEqual(550);
      expect(text).not.toMatch(/Ieri Luca si è svegliato/i);
    }
    const ch24 = bundle.chapters.get('luca-a-roma-24')!;
    const ch24text = ch24.paragraphs.flatMap((p) => p.sentences.map((s) => s.text)).join(' ');
    expect(ch24text).toMatch(/Ieri Luca/i);
  });

  it('extends the CEFR audit for A1, A1+, and A2', () => {
    const rows = auditStoryCefr(bundle);
    expect(rows).toHaveLength(40);
    const bands = rows.filter((r) => r.chapterNumber >= 21);
    expect(bands.some((r) => r.target === 'A1+')).toBe(true);
    expect(bands.some((r) => r.target === 'A2')).toBe(true);
    for (const row of bands) {
      expect(row.wordCount).toBeGreaterThan(100);
      expect(['none', 'partial', 'complete']).toContain(row.audioCompletion);
    }
  });

  it('continues Luca’s story through the bridge into A2', () => {
    const ch21 = bundle.chapters.get('luca-a-roma-21')!;
    const ch25 = bundle.chapters.get('luca-a-roma-25')!;
    const text21 = ch21.paragraphs.flatMap((p) => p.sentences.map((s) => s.text)).join(' ');
    expect(text21).toMatch(/Luca/i);
    expect(text21).toMatch(/lavoro|caffè|caffe|Roma/i);
    const text25 = ch25.paragraphs.flatMap((p) => p.sentences.map((s) => s.text)).join(' ');
    expect(text25).toMatch(/caffè|caffe|Luca/i);
  });
});
