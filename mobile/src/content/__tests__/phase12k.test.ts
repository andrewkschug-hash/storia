import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from 'vitest';

import { tokenizeItalian } from '@/src/content/tokenize';

import {
  ELENA_STORY_ID,
  LUCA_STORY_ID,
  PRE_ROME_ARC_ID,
  getCatalogStory,
  getContentBundle,
  getStoriesInArc,
} from '@/src/content';
import { loadContentBundle } from '@/src/content/loadContentBundle';
import { validateStoryCatalog } from '@/src/content/validateCatalog';

const root = join(__dirname, '../../../content');

const APPROVED_DOMAINS = new Set([
  'introductions',
  'age',
  'numbers',
  'family',
  'descriptions',
  'social',
  'clock',
  'daily_routine',
  'days',
  'dates',
  'schedules',
  'food',
  'ordering',
  'prices',
  'quantities',
  'shopping',
  'likes',
  'places',
  'directions',
  'weather',
  'seasons',
  'transportation',
  'birthdays',
  'invitations',
]);

const PRE_ROME = [
  { id: 'luca-prima-di-roma-01', chapters: 6 },
  { id: 'luca-prima-di-roma-02', chapters: 7 },
  { id: 'luca-prima-di-roma-03', chapters: 6 },
  { id: 'luca-prima-di-roma-04', chapters: 7 },
  { id: 'luca-prima-di-roma-05', chapters: 6 },
] as const;

function loadPlanned(storyId: string) {
  const story = getCatalogStory(storyId)!;
  const storyDir = join(root, story.contentPath!);
  const chaptersDir = join(storyDir, 'chapters');
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  }
  return loadContentBundle({
    charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
    locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
    lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
    manifestJson: JSON.parse(readFileSync(join(storyDir, 'manifest.json'), 'utf8')),
    chapterJsonByFile,
    storyPath: story.contentPath!,
    narrativeArc: story.narrativeArc,
  });
}

describe('Phase 12K pre-Rome authoring', () => {
  it('keeps all five stories available with authored files', () => {
    const catalog = validateStoryCatalog();
    expect(catalog.ok).toBe(true);
    expect(catalog.available).toEqual(expect.arrayContaining(PRE_ROME.map((row) => row.id)));
    for (const row of PRE_ROME) {
      const story = getCatalogStory(row.id)!;
      expect(story.status).toBe('available');
      expect(story.chapterCount).toBe(row.chapters);
      expect(story.chapterCountTarget).toBe(row.chapters);
      expect(story.contentPath).toBe(`stories/${row.id}`);
      expect(getContentBundle(row.id).chapters.size).toBe(row.chapters);
    }
    expect(getStoriesInArc(PRE_ROME_ARC_ID)).toHaveLength(5);
  });

  it('authors 32 valid chapters with questions and approved domains', () => {
    const ids = new Set<string>();
    let totalChapters = 0;
    for (const row of PRE_ROME) {
      const bundle = loadPlanned(row.id);
      expect(bundle.story.id).toBe(row.id);
      expect(bundle.chapters.size).toBe(row.chapters);
      totalChapters += bundle.chapters.size;
      for (const chapter of bundle.chapters.values()) {
        expect(ids.has(chapter.id)).toBe(false);
        ids.add(chapter.id);
        expect(chapter.id).toMatch(new RegExp(`^${row.id}-\\d{2}$`));
        expect(chapter.storyId).toBe(row.id);
        expect(chapter.questions.length).toBeGreaterThanOrEqual(2);
        expect(chapter.questions.length).toBeLessThanOrEqual(4);
        expect(chapter.primaryDomain).toBeTruthy();
        expect(APPROVED_DOMAINS.has(chapter.primaryDomain!)).toBe(true);
        for (const domain of chapter.secondaryDomains ?? []) {
          expect(APPROVED_DOMAINS.has(domain)).toBe(true);
        }
        for (const q of chapter.questions) {
          expect(q.id.startsWith('lpr')).toBe(true);
          expect(q.chapterId).toBe(chapter.id);
        }
        const words = chapter.paragraphs
          .flatMap((p) => p.sentences.flatMap((s) => tokenizeItalian(s.text)))
          .length;
        expect(words).toBeGreaterThanOrEqual(120);
        expect(words).toBeLessThanOrEqual(300);
      }
    }
    expect(totalChapters).toBe(32);
    expect(ids.has('luca-a-roma-01')).toBe(false);
  });

  it('keeps home rooms under descriptions and town geography under places', () => {
    const s1 = loadPlanned('luca-prima-di-roma-01');
    const s4 = loadPlanned('luca-prima-di-roma-04');
    expect(s1.chapters.get('luca-prima-di-roma-01-04')?.primaryDomain).toBe('descriptions');
    expect(s4.chapters.get('luca-prima-di-roma-04-01')?.primaryDomain).toBe('places');
    const homeText = [...s1.chapters.get('luca-prima-di-roma-01-04')!.paragraphs]
      .flatMap((p) => p.sentences.map((s) => s.text))
      .join(' ');
    expect(homeText).toMatch(/cucina|camera|soggiorno/i);
    expect(homeText).not.toMatch(/farmacia|piazza|parco/i);
    const townText = [...s4.chapters.get('luca-prima-di-roma-04-01')!.paragraphs]
      .flatMap((p) => p.sentences.map((s) => s.text))
      .join(' ');
    expect(townText).toMatch(/piazza|farmacia|parco/i);
    expect(townText).not.toMatch(/\bcucina\b|\bcamera\b|\bsoggiorno\b/i);
  });

  it('ends S5 on the Pietralba train without arriving in Rome', () => {
    const s5 = loadPlanned('luca-prima-di-roma-05');
    const last = s5.chapters.get('luca-prima-di-roma-05-06')!;
    expect(last.locationIds).toContain('stazione-pietralba');
    expect(last.locationIds).not.toContain('stazione');
    const text = last.paragraphs.flatMap((p) => p.sentences.map((s) => s.text)).join(' ');
    expect(text).toMatch(/treno/i);
    expect(text).toMatch(/Roma/);
    expect(text).not.toMatch(/Luca arriva a Roma/);
    expect(text).not.toMatch(/Sofia|Marco|Giulia|Nonna Rosa|Bar Centrale|Termini/i);
    expect(last.characterIds).toContain('luca');
    expect(last.characterIds).not.toContain('sofia');
    expect(last.characterIds).not.toContain('elisa');
  });

  it('gives Luca hometown background without treating Pietralba as a first arrival', () => {
    const s1 = loadPlanned('luca-prima-di-roma-01');
    const s4 = loadPlanned('luca-prima-di-roma-04');
    const s5 = loadPlanned('luca-prima-di-roma-05');
    const intro = [...s1.chapters.values()]
      .flatMap((chapter) => chapter.paragraphs.flatMap((p) => p.sentences.map((s) => s.text)))
      .join(' ');
    expect(intro).toMatch(/mi chiamo Luca|sono Luca/i);
    expect(intro).toMatch(/Pietralba/);
    expect(intro).toMatch(/Marta|Paolo|Chiara|Lidia/);
    expect(intro).toMatch(/ventiquattro/);
    expect(s4.chapters.get('luca-prima-di-roma-04-01')?.events[0]?.summary).not.toMatch(/arrives in Pietralba/i);
    expect(s4.chapters.get('luca-prima-di-roma-04-01')?.events[0]?.summary).toMatch(/from Pietralba/i);
    const leaving = s5.chapters.get('luca-prima-di-roma-05-06')!;
    expect(leaving.events[0]?.summary).toMatch(/Rome/);
  });
});
