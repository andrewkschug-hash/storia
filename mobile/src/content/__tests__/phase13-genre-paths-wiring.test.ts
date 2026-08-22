import { describe, expect, it, afterEach } from 'vitest';

import {
  CASA_STORY_ID,
  LETTERA_STORY_ID,
  LUCA_STORY_ID,
  VILLAGGIO_STORY_ID,
  __resetContentCache,
  a2PlusGenrePathStories,
  getCatalogStory,
  getChapter,
  getContentBundle,
} from '@/src/content';
import { REGISTERED_AVAILABLE_STORY_SOURCES } from '@/src/content/preRomeSources';
import { LETTERA_PER_ELENA_SOURCE } from '@/src/content/letteraElenaSources';
import { VILLAGGIO_SOURCE } from '@/src/content/villaggioSources';
import { validateStoryCatalog } from '@/src/content/validateCatalog';
import { A2_PLUS_PATHWAYS } from '@/src/pathway/paths';

afterEach(() => {
  __resetContentCache();
});

describe('Phase 13 A2+ romance + fantasy wiring', () => {
  it('registers both stories as available without altering Luca or Casa', () => {
    const catalog = validateStoryCatalog();
    expect(catalog.ok).toBe(true);
    expect(catalog.available).toEqual(
      expect.arrayContaining([CASA_STORY_ID, LETTERA_STORY_ID, VILLAGGIO_STORY_ID]),
    );

    const lettera = getCatalogStory(LETTERA_STORY_ID)!;
    expect(lettera.status).toBe('available');
    expect(lettera.chapterCount).toBe(22);
    expect(lettera.cefrLevel).toBe('A2+');
    expect(lettera.protagonistId).toBe('elena-marini');
    expect(lettera.narrativeArc).toBe('a2-plus-genre-paths');

    const villaggio = getCatalogStory(VILLAGGIO_STORY_ID)!;
    expect(villaggio.status).toBe('available');
    expect(villaggio.chapterCount).toBe(24);
    expect(villaggio.cefrLevel).toBe('A2+');
    expect(villaggio.protagonistId).toBe('giada-rinaldi');

    expect(getContentBundle(LETTERA_STORY_ID).chapters.size).toBe(22);
    expect(getContentBundle(VILLAGGIO_STORY_ID).chapters.size).toBe(24);
    expect(getContentBundle(CASA_STORY_ID).chapters.size).toBe(24);
    expect(getContentBundle(LUCA_STORY_ID).chapters.size).toBe(40);

    expect(getChapter('lettera-per-elena-01', LETTERA_STORY_ID)?.paragraphs[0].sentences[0].english).toBeTruthy();
    expect(getChapter('il-villaggio-che-non-esiste-01', VILLAGGIO_STORY_ID)?.titleIt).toBe(
      'Il treno sbagliato',
    );
    expect(getChapter('lettera-per-elena-11', LETTERA_STORY_ID)?.titleIt).toBe('Una frase in voce');
    expect(getChapter('lettera-per-elena-22', LETTERA_STORY_ID)?.titleIt).toBe('Aperto');
    expect(getChapter('il-villaggio-che-non-esiste-24', VILLAGGIO_STORY_ID)?.titleIt).toBe('La foto');
  });

  it('wires Metro sources and pathway Begin targets', () => {
    expect(LETTERA_PER_ELENA_SOURCE.storyPath).toBe('stories/lettera-per-elena');
    expect(VILLAGGIO_SOURCE.storyPath).toBe('stories/il-villaggio-che-non-esiste');
    expect(REGISTERED_AVAILABLE_STORY_SOURCES[LETTERA_STORY_ID]).toBe(LETTERA_PER_ELENA_SOURCE);
    expect(REGISTERED_AVAILABLE_STORY_SOURCES[VILLAGGIO_STORY_ID]).toBe(VILLAGGIO_SOURCE);

    const selector = a2PlusGenrePathStories().map((row) => row.id);
    expect(selector).toEqual(
      expect.arrayContaining([CASA_STORY_ID, LETTERA_STORY_ID, VILLAGGIO_STORY_ID]),
    );

    for (const pathway of A2_PLUS_PATHWAYS) {
      expect(pathway.status).toBe('available');
      expect(pathway.storyId).toBeTruthy();
    }
  });

  it('keeps story-local casts separate', () => {
    const lettera = getContentBundle(LETTERA_STORY_ID);
    const villaggio = getContentBundle(VILLAGGIO_STORY_ID);
    expect(lettera.entitySource?.storyLocalCharacterIds).toContain('elena-marini');
    expect(lettera.entitySource?.storyLocalCharacterIds).toContain('pietro-baldo');
    expect(villaggio.entitySource?.storyLocalCharacterIds).toContain('giada-rinaldi');
    expect(villaggio.entitySource?.storyLocalCharacterIds).toContain('neri');
    expect(lettera.entitySource?.storyLocalCharacterIds).not.toContain('giada-rinaldi');
  });
});
