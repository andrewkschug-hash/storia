import type { ContentBundle } from '@/src/content/schemas';
import { loadContentBundle } from '@/src/content/loadContentBundle';

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
};

let cached: ContentBundle | null = null;

export function getContentBundle(): ContentBundle {
  if (!cached) {
    cached = loadContentBundle({
      charactersJson,
      locationsJson,
      lexiconJson,
      manifestJson,
      chapterJsonByFile,
      adaptiveJson,
      translationsJson,
      arcsJson,
      storyPath: 'stories/luca-a-roma',
    });
  }
  return cached;
}

export function getStory() {
  return getContentBundle().story;
}

export function getChapter(chapterId: string) {
  return getContentBundle().chapters.get(chapterId);
}

export function getChapterByNumber(number: number) {
  for (const chapter of getContentBundle().chapters.values()) {
    if (chapter.number === number) return chapter;
  }
  return undefined;
}

/** Reset cache — tests only */
export function __resetContentCache() {
  cached = null;
}
