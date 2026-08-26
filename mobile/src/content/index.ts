import { getAvailableStories, getCatalogStory, LUCA_STORY_ID } from '@/src/content/catalog';
import { loadContentBundle } from '@/src/content/loadContentBundle';
import { loadRegisteredStoryBundle } from '@/src/content/preRomeSources';
import type { Chapter, ContentBundle } from '@/src/content/schemas';
import { StoryLoadError } from '@/src/content/storyLoadError';

import charactersJson from '../../content/characters.json';
import locationsJson from '../../content/locations.json';
import lexiconJson from '../../content/lexicon/italian-core.json';
import manifestJson from '../../content/stories/luca-a-roma/manifest.json';
import adaptiveJson from '../../content/stories/luca-a-roma/adaptive-variants.json';
import translationsJson from '../../content/stories/luca-a-roma/sentence-english.json';
import arcsJson from '../../content/stories/luca-a-roma/arcs.json';

import chapter01 from '../../content/stories/luca-a-roma/chapters/chapter-01.json';
import chapter02 from '../../content/stories/luca-a-roma/chapters/chapter-02.json';
import chapter03 from '../../content/stories/luca-a-roma/chapters/chapter-03.json';
import chapter04 from '../../content/stories/luca-a-roma/chapters/chapter-04.json';
import chapter05 from '../../content/stories/luca-a-roma/chapters/chapter-05.json';
import chapter06 from '../../content/stories/luca-a-roma/chapters/chapter-06.json';
import chapter07 from '../../content/stories/luca-a-roma/chapters/chapter-07.json';
import chapter08 from '../../content/stories/luca-a-roma/chapters/chapter-08.json';
import chapter09 from '../../content/stories/luca-a-roma/chapters/chapter-09.json';
import chapter10 from '../../content/stories/luca-a-roma/chapters/chapter-10.json';
import chapter11 from '../../content/stories/luca-a-roma/chapters/chapter-11.json';
import chapter12 from '../../content/stories/luca-a-roma/chapters/chapter-12.json';
import chapter13 from '../../content/stories/luca-a-roma/chapters/chapter-13.json';
import chapter14 from '../../content/stories/luca-a-roma/chapters/chapter-14.json';
import chapter15 from '../../content/stories/luca-a-roma/chapters/chapter-15.json';
import chapter16 from '../../content/stories/luca-a-roma/chapters/chapter-16.json';
import chapter17 from '../../content/stories/luca-a-roma/chapters/chapter-17.json';
import chapter18 from '../../content/stories/luca-a-roma/chapters/chapter-18.json';
import chapter19 from '../../content/stories/luca-a-roma/chapters/chapter-19.json';
import chapter20 from '../../content/stories/luca-a-roma/chapters/chapter-20.json';
import chapter21 from '../../content/stories/luca-a-roma/chapters/chapter-21.json';
import chapter22 from '../../content/stories/luca-a-roma/chapters/chapter-22.json';
import chapter23 from '../../content/stories/luca-a-roma/chapters/chapter-23.json';
import chapter24 from '../../content/stories/luca-a-roma/chapters/chapter-24.json';
import chapter25 from '../../content/stories/luca-a-roma/chapters/chapter-25.json';
import chapter26 from '../../content/stories/luca-a-roma/chapters/chapter-26.json';
import chapter27 from '../../content/stories/luca-a-roma/chapters/chapter-27.json';
import chapter28 from '../../content/stories/luca-a-roma/chapters/chapter-28.json';
import chapter29 from '../../content/stories/luca-a-roma/chapters/chapter-29.json';
import chapter30 from '../../content/stories/luca-a-roma/chapters/chapter-30.json';
import chapter31 from '../../content/stories/luca-a-roma/chapters/chapter-31.json';
import chapter32 from '../../content/stories/luca-a-roma/chapters/chapter-32.json';
import chapter33 from '../../content/stories/luca-a-roma/chapters/chapter-33.json';
import chapter34 from '../../content/stories/luca-a-roma/chapters/chapter-34.json';
import chapter35 from '../../content/stories/luca-a-roma/chapters/chapter-35.json';
import chapter36 from '../../content/stories/luca-a-roma/chapters/chapter-36.json';
import chapter37 from '../../content/stories/luca-a-roma/chapters/chapter-37.json';
import chapter38 from '../../content/stories/luca-a-roma/chapters/chapter-38.json';
import chapter39 from '../../content/stories/luca-a-roma/chapters/chapter-39.json';
import chapter40 from '../../content/stories/luca-a-roma/chapters/chapter-40.json';
import chapter41 from '../../content/stories/luca-a-roma/chapters/chapter-41.json';
import chapter42 from '../../content/stories/luca-a-roma/chapters/chapter-42.json';
import chapter43 from '../../content/stories/luca-a-roma/chapters/chapter-43.json';
import chapter44 from '../../content/stories/luca-a-roma/chapters/chapter-44.json';
import chapter45 from '../../content/stories/luca-a-roma/chapters/chapter-45.json';
import chapter46 from '../../content/stories/luca-a-roma/chapters/chapter-46.json';
import chapter47 from '../../content/stories/luca-a-roma/chapters/chapter-47.json';
import chapter48 from '../../content/stories/luca-a-roma/chapters/chapter-48.json';
import chapter49 from '../../content/stories/luca-a-roma/chapters/chapter-49.json';
import chapter50 from '../../content/stories/luca-a-roma/chapters/chapter-50.json';
import chapter51 from '../../content/stories/luca-a-roma/chapters/chapter-51.json';
import chapter52 from '../../content/stories/luca-a-roma/chapters/chapter-52.json';
import chapter53 from '../../content/stories/luca-a-roma/chapters/chapter-53.json';
import chapter54 from '../../content/stories/luca-a-roma/chapters/chapter-54.json';
import chapter55 from '../../content/stories/luca-a-roma/chapters/chapter-55.json';

const chapterJsonByFile: Record<string, unknown> = {
  'chapter-01.json': chapter01,
  'chapter-02.json': chapter02,
  'chapter-03.json': chapter03,
  'chapter-04.json': chapter04,
  'chapter-05.json': chapter05,
  'chapter-06.json': chapter06,
  'chapter-07.json': chapter07,
  'chapter-08.json': chapter08,
  'chapter-09.json': chapter09,
  'chapter-10.json': chapter10,
  'chapter-11.json': chapter11,
  'chapter-12.json': chapter12,
  'chapter-13.json': chapter13,
  'chapter-14.json': chapter14,
  'chapter-15.json': chapter15,
  'chapter-16.json': chapter16,
  'chapter-17.json': chapter17,
  'chapter-18.json': chapter18,
  'chapter-19.json': chapter19,
  'chapter-20.json': chapter20,
  'chapter-21.json': chapter21,
  'chapter-22.json': chapter22,
  'chapter-23.json': chapter23,
  'chapter-24.json': chapter24,
  'chapter-25.json': chapter25,
  'chapter-26.json': chapter26,
  'chapter-27.json': chapter27,
  'chapter-28.json': chapter28,
  'chapter-29.json': chapter29,
  'chapter-30.json': chapter30,
  'chapter-31.json': chapter31,
  'chapter-32.json': chapter32,
  'chapter-33.json': chapter33,
  'chapter-34.json': chapter34,
  'chapter-35.json': chapter35,
  'chapter-36.json': chapter36,
  'chapter-37.json': chapter37,
  'chapter-38.json': chapter38,
  'chapter-39.json': chapter39,
  'chapter-40.json': chapter40,
  'chapter-41.json': chapter41,
  'chapter-42.json': chapter42,
  'chapter-43.json': chapter43,
  'chapter-44.json': chapter44,
  'chapter-45.json': chapter45,
  'chapter-46.json': chapter46,
  'chapter-47.json': chapter47,
  'chapter-48.json': chapter48,
  'chapter-49.json': chapter49,
  'chapter-50.json': chapter50,
  'chapter-51.json': chapter51,
  'chapter-52.json': chapter52,
  'chapter-53.json': chapter53,
  'chapter-54.json': chapter54,
  'chapter-55.json': chapter55,
};

const bundleCache = new Map<string, ContentBundle>();
const chapterOwnerCache = new Map<string, string>();

function rememberChapterOwners(storyId: string, bundle: ContentBundle) {
  for (const chapterId of bundle.chapters.keys()) {
    chapterOwnerCache.set(chapterId, storyId);
  }
}

/**
 * Story-scoped content loader. Defaults to Luca a Roma for existing callers.
 * Planned / draft / unknown IDs fail cleanly — they are not silently loaded as Luca.
 */
export function getContentBundle(storyId: string = LUCA_STORY_ID): ContentBundle {
  const cached = bundleCache.get(storyId);
  if (cached) return cached;

  const entry = getCatalogStory(storyId);
  if (!entry) {
    throw new StoryLoadError(storyId, 'unknown', `Unknown story "${storyId}"`);
  }
  if (entry.status === 'planned') {
    throw new StoryLoadError(
      storyId,
      'planned',
      `Story "${storyId}" is planned and has no chapter content yet`,
    );
  }
  if (entry.status === 'draft') {
    throw new StoryLoadError(
      storyId,
      'draft',
      `Story "${storyId}" is draft; inspect with inspectDraftStory instead of getContentBundle`,
    );
  }

  let bundle: ContentBundle;
  if (storyId === LUCA_STORY_ID) {
    bundle = loadContentBundle({
      charactersJson,
      locationsJson,
      lexiconJson,
      manifestJson,
      chapterJsonByFile,
      adaptiveJson,
      translationsJson,
      arcsJson,
      storyPath: 'stories/luca-a-roma',
      narrativeArc: entry.narrativeArc,
    });
  } else {
    const registered = loadRegisteredStoryBundle(storyId, entry.narrativeArc);
    if (!registered) {
      throw new StoryLoadError(
        storyId,
        entry.status,
        `No available content loader registered for "${storyId}"`,
      );
    }
    bundle = registered;
  }

  rememberChapterOwners(storyId, bundle);
  bundleCache.set(storyId, bundle);
  return bundle;
}

export function tryGetContentBundle(storyId: string): ContentBundle | null {
  try {
    return getContentBundle(storyId);
  } catch {
    return null;
  }
}

export function getStory(storyId: string = LUCA_STORY_ID) {
  return getContentBundle(storyId).story;
}

/** Resolve owning storyId from a globally unique chapterId. */
export function findStoryIdForChapter(chapterId: string): string | undefined {
  const cached = chapterOwnerCache.get(chapterId);
  if (cached) return cached;
  for (const story of getAvailableStories()) {
    const bundle = tryGetContentBundle(story.id);
    if (!bundle) continue;
    rememberChapterOwners(story.id, bundle);
    if (bundle.chapters.has(chapterId)) return story.id;
  }
  return undefined;
}

/**
 * Chapter identity is (storyId, chapterId). If storyId is omitted, look up the
 * available story that owns this chapterId — never use chapter number alone.
 */
export function getChapter(chapterId: string, storyId?: string): Chapter | undefined {
  const resolvedStoryId = storyId ?? findStoryIdForChapter(chapterId);
  if (!resolvedStoryId) return undefined;
  return tryGetContentBundle(resolvedStoryId)?.chapters.get(chapterId);
}

export function getChapterByNumber(number: number, storyId: string = LUCA_STORY_ID) {
  for (const chapter of getContentBundle(storyId).chapters.values()) {
    if (chapter.number === number) return chapter;
  }
  return undefined;
}

/** Reset cache — tests only */
export function __resetContentCache() {
  bundleCache.clear();
  chapterOwnerCache.clear();
}

export {
  ELENA_STORY_ID,
  LUCA_STORY_ID,
  PRE_ROME_ARC_ID,
  CASA_STORY_ID,
  LETTERA_STORY_ID,
  VILLAGGIO_STORY_ID,
  A2_PLUS_GENRE_ARC_ID,
  getAvailableStories,
  getCatalogStories,
  getCatalogStory,
  getNarrativeArc,
  getNarrativeArcs,
  getStoriesInArc,
  getStoryCatalog,
  journeyOrder,
  storyStatus,
} from '@/src/content/catalog';
export { chapterKey, parseChapterKey, type ChapterRef } from '@/src/content/chapterRef';
export { buildLearnerJourney, independentDraftStories, a2PlusGenrePathStories } from '@/src/content/journey';
export { StoryLoadError } from '@/src/content/storyLoadError';
export {
  getSpeakSceneById,
  getSpeakSceneForBatch,
  getSpeakScenes,
} from '@/src/content/speakScenes';
