import manifest from '../../content/stories/lettera-per-elena/manifest.json';
import english from '../../content/stories/lettera-per-elena/sentence-english.json';
import characters from '../../content/stories/lettera-per-elena/characters.json';
import locations from '../../content/stories/lettera-per-elena/locations.json';
import lexiconAdditions from '../../content/stories/lettera-per-elena/lexicon-additions.json';
import arcs from '../../content/stories/lettera-per-elena/arcs.json';
import c01 from '../../content/stories/lettera-per-elena/chapters/chapter-01.json';
import c02 from '../../content/stories/lettera-per-elena/chapters/chapter-02.json';
import c03 from '../../content/stories/lettera-per-elena/chapters/chapter-03.json';
import c04 from '../../content/stories/lettera-per-elena/chapters/chapter-04.json';
import c05 from '../../content/stories/lettera-per-elena/chapters/chapter-05.json';
import c06 from '../../content/stories/lettera-per-elena/chapters/chapter-06.json';
import c07 from '../../content/stories/lettera-per-elena/chapters/chapter-07.json';
import c08 from '../../content/stories/lettera-per-elena/chapters/chapter-08.json';
import c09 from '../../content/stories/lettera-per-elena/chapters/chapter-09.json';
import c10 from '../../content/stories/lettera-per-elena/chapters/chapter-10.json';
import c11 from '../../content/stories/lettera-per-elena/chapters/chapter-11.json';
import c12 from '../../content/stories/lettera-per-elena/chapters/chapter-12.json';
import c13 from '../../content/stories/lettera-per-elena/chapters/chapter-13.json';
import c14 from '../../content/stories/lettera-per-elena/chapters/chapter-14.json';
import c15 from '../../content/stories/lettera-per-elena/chapters/chapter-15.json';
import c16 from '../../content/stories/lettera-per-elena/chapters/chapter-16.json';
import c17 from '../../content/stories/lettera-per-elena/chapters/chapter-17.json';
import c18 from '../../content/stories/lettera-per-elena/chapters/chapter-18.json';
import c19 from '../../content/stories/lettera-per-elena/chapters/chapter-19.json';
import c20 from '../../content/stories/lettera-per-elena/chapters/chapter-20.json';
import c21 from '../../content/stories/lettera-per-elena/chapters/chapter-21.json';
import c22 from '../../content/stories/lettera-per-elena/chapters/chapter-22.json';

const chapterJsonByFile: Record<string, unknown> = {
  'chapter-01.json': c01,
  'chapter-02.json': c02,
  'chapter-03.json': c03,
  'chapter-04.json': c04,
  'chapter-05.json': c05,
  'chapter-06.json': c06,
  'chapter-07.json': c07,
  'chapter-08.json': c08,
  'chapter-09.json': c09,
  'chapter-10.json': c10,
  'chapter-11.json': c11,
  'chapter-12.json': c12,
  'chapter-13.json': c13,
  'chapter-14.json': c14,
  'chapter-15.json': c15,
  'chapter-16.json': c16,
  'chapter-17.json': c17,
  'chapter-18.json': c18,
  'chapter-19.json': c19,
  'chapter-20.json': c20,
  'chapter-21.json': c21,
  'chapter-22.json': c22,
};

export const LETTERA_PER_ELENA_SOURCE = {
  storyPath: 'stories/lettera-per-elena',
  manifestJson: manifest,
  translationsJson: english,
  chapterJsonByFile,
  storyLocalCharactersJson: characters,
  storyLocalLocationsJson: locations,
  lexiconAdditionsJson: lexiconAdditions,
  arcsJson: arcs,
};
