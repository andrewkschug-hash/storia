/**
 * Metro-static sources for available pre-Rome A1 stories.
 * Register additional available non-Luca stories here as they ship.
 * Do not treat this list as a permanent cap on A1 content.
 */
import type { ContentBundle } from '@/src/content/schemas';
import { loadContentBundle } from '@/src/content/loadContentBundle';

import charactersJson from '../../content/characters.json';
import locationsJson from '../../content/locations.json';
import lexiconJson from '../../content/lexicon/italian-core.json';

import s01Manifest from '../../content/stories/luca-prima-di-roma-01/manifest.json';
import s01English from '../../content/stories/luca-prima-di-roma-01/sentence-english.json';
import s01c01 from '../../content/stories/luca-prima-di-roma-01/chapters/chapter-01.json';
import s01c02 from '../../content/stories/luca-prima-di-roma-01/chapters/chapter-02.json';
import s01c03 from '../../content/stories/luca-prima-di-roma-01/chapters/chapter-03.json';
import s01c04 from '../../content/stories/luca-prima-di-roma-01/chapters/chapter-04.json';
import s01c05 from '../../content/stories/luca-prima-di-roma-01/chapters/chapter-05.json';
import s01c06 from '../../content/stories/luca-prima-di-roma-01/chapters/chapter-06.json';

import s02Manifest from '../../content/stories/luca-prima-di-roma-02/manifest.json';
import s02English from '../../content/stories/luca-prima-di-roma-02/sentence-english.json';
import s02c01 from '../../content/stories/luca-prima-di-roma-02/chapters/chapter-01.json';
import s02c02 from '../../content/stories/luca-prima-di-roma-02/chapters/chapter-02.json';
import s02c03 from '../../content/stories/luca-prima-di-roma-02/chapters/chapter-03.json';
import s02c04 from '../../content/stories/luca-prima-di-roma-02/chapters/chapter-04.json';
import s02c05 from '../../content/stories/luca-prima-di-roma-02/chapters/chapter-05.json';
import s02c06 from '../../content/stories/luca-prima-di-roma-02/chapters/chapter-06.json';
import s02c07 from '../../content/stories/luca-prima-di-roma-02/chapters/chapter-07.json';

import s03Manifest from '../../content/stories/luca-prima-di-roma-03/manifest.json';
import s03English from '../../content/stories/luca-prima-di-roma-03/sentence-english.json';
import s03c01 from '../../content/stories/luca-prima-di-roma-03/chapters/chapter-01.json';
import s03c02 from '../../content/stories/luca-prima-di-roma-03/chapters/chapter-02.json';
import s03c03 from '../../content/stories/luca-prima-di-roma-03/chapters/chapter-03.json';
import s03c04 from '../../content/stories/luca-prima-di-roma-03/chapters/chapter-04.json';
import s03c05 from '../../content/stories/luca-prima-di-roma-03/chapters/chapter-05.json';
import s03c06 from '../../content/stories/luca-prima-di-roma-03/chapters/chapter-06.json';

import s04Manifest from '../../content/stories/luca-prima-di-roma-04/manifest.json';
import s04English from '../../content/stories/luca-prima-di-roma-04/sentence-english.json';
import s04c01 from '../../content/stories/luca-prima-di-roma-04/chapters/chapter-01.json';
import s04c02 from '../../content/stories/luca-prima-di-roma-04/chapters/chapter-02.json';
import s04c03 from '../../content/stories/luca-prima-di-roma-04/chapters/chapter-03.json';
import s04c04 from '../../content/stories/luca-prima-di-roma-04/chapters/chapter-04.json';
import s04c05 from '../../content/stories/luca-prima-di-roma-04/chapters/chapter-05.json';
import s04c06 from '../../content/stories/luca-prima-di-roma-04/chapters/chapter-06.json';
import s04c07 from '../../content/stories/luca-prima-di-roma-04/chapters/chapter-07.json';

import s05Manifest from '../../content/stories/luca-prima-di-roma-05/manifest.json';
import s05English from '../../content/stories/luca-prima-di-roma-05/sentence-english.json';
import s05c01 from '../../content/stories/luca-prima-di-roma-05/chapters/chapter-01.json';
import s05c02 from '../../content/stories/luca-prima-di-roma-05/chapters/chapter-02.json';
import s05c03 from '../../content/stories/luca-prima-di-roma-05/chapters/chapter-03.json';
import s05c04 from '../../content/stories/luca-prima-di-roma-05/chapters/chapter-04.json';
import s05c05 from '../../content/stories/luca-prima-di-roma-05/chapters/chapter-05.json';
import s05c06 from '../../content/stories/luca-prima-di-roma-05/chapters/chapter-06.json';

import { CASA_DELLE_FINESTRE_SOURCE } from '@/src/content/casaFinestreSources';

export type RegisteredStorySource = {
  storyPath: string;
  manifestJson: unknown;
  chapterJsonByFile: Record<string, unknown>;
  translationsJson?: unknown;
  arcsJson?: unknown;
  storyLocalCharactersJson?: unknown;
  storyLocalLocationsJson?: unknown;
  lexiconAdditionsJson?: unknown;
};

const PRE_ROME_SOURCES: Record<string, RegisteredStorySource> = {
  'luca-prima-di-roma-01': {
    storyPath: 'stories/luca-prima-di-roma-01',
    manifestJson: s01Manifest,
    translationsJson: s01English,
    chapterJsonByFile: {
      'chapter-01.json': s01c01,
      'chapter-02.json': s01c02,
      'chapter-03.json': s01c03,
      'chapter-04.json': s01c04,
      'chapter-05.json': s01c05,
      'chapter-06.json': s01c06,
    },
  },
  'luca-prima-di-roma-02': {
    storyPath: 'stories/luca-prima-di-roma-02',
    manifestJson: s02Manifest,
    translationsJson: s02English,
    chapterJsonByFile: {
      'chapter-01.json': s02c01,
      'chapter-02.json': s02c02,
      'chapter-03.json': s02c03,
      'chapter-04.json': s02c04,
      'chapter-05.json': s02c05,
      'chapter-06.json': s02c06,
      'chapter-07.json': s02c07,
    },
  },
  'luca-prima-di-roma-03': {
    storyPath: 'stories/luca-prima-di-roma-03',
    manifestJson: s03Manifest,
    translationsJson: s03English,
    chapterJsonByFile: {
      'chapter-01.json': s03c01,
      'chapter-02.json': s03c02,
      'chapter-03.json': s03c03,
      'chapter-04.json': s03c04,
      'chapter-05.json': s03c05,
      'chapter-06.json': s03c06,
    },
  },
  'luca-prima-di-roma-04': {
    storyPath: 'stories/luca-prima-di-roma-04',
    manifestJson: s04Manifest,
    translationsJson: s04English,
    chapterJsonByFile: {
      'chapter-01.json': s04c01,
      'chapter-02.json': s04c02,
      'chapter-03.json': s04c03,
      'chapter-04.json': s04c04,
      'chapter-05.json': s04c05,
      'chapter-06.json': s04c06,
      'chapter-07.json': s04c07,
    },
  },
  'luca-prima-di-roma-05': {
    storyPath: 'stories/luca-prima-di-roma-05',
    manifestJson: s05Manifest,
    translationsJson: s05English,
    chapterJsonByFile: {
      'chapter-01.json': s05c01,
      'chapter-02.json': s05c02,
      'chapter-03.json': s05c03,
      'chapter-04.json': s05c04,
      'chapter-05.json': s05c05,
      'chapter-06.json': s05c06,
    },
  },
};

/** Available non-Luca story sources. Grow this map; do not assume a fixed A1 count. */
export const REGISTERED_AVAILABLE_STORY_SOURCES: Record<string, RegisteredStorySource> = {
  ...PRE_ROME_SOURCES,
  'la-casa-delle-finestre': CASA_DELLE_FINESTRE_SOURCE,
};

export function loadRegisteredStoryBundle(
  storyId: string,
  narrativeArc?: string,
): ContentBundle | null {
  const source = REGISTERED_AVAILABLE_STORY_SOURCES[storyId];
  if (!source) return null;
  return loadContentBundle({
    charactersJson,
    locationsJson,
    lexiconJson,
    manifestJson: source.manifestJson,
    chapterJsonByFile: source.chapterJsonByFile,
    translationsJson: source.translationsJson,
    arcsJson: source.arcsJson,
    storyPath: source.storyPath,
    narrativeArc,
    storyLocalCharactersJson: source.storyLocalCharactersJson,
    storyLocalLocationsJson: source.storyLocalLocationsJson,
    lexiconAdditionsJson: source.lexiconAdditionsJson,
  });
}
