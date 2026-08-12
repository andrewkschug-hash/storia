/**
 * Sync lexicon introducedChapter to actual first appearance in the story.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { loadContentBundle } from '../src/content/loadContentBundle';

const root = join(__dirname, '..', 'content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');
const lexiconPath = join(root, 'lexicon', 'italian-core.json');

const chapterJsonByFile: Record<string, unknown> = {};
for (const file of readdirSync(chaptersDir)) {
  if (!file.endsWith('.json')) continue;
  chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
}

const lexiconJson = JSON.parse(readFileSync(lexiconPath, 'utf8'));
const bundle = loadContentBundle({
  charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
  locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
  lexiconJson,
  manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
  chapterJsonByFile,
  storyPath: 'stories/luca-a-roma',
});

const firstSeen = new Map<string, number>();
const ordered = [...bundle.chapters.values()].sort((a, b) => a.number - b.number);
for (const chapter of ordered) {
  for (const paragraph of chapter.paragraphs) {
    for (const sentence of paragraph.sentences) {
      for (const token of sentence.tokens) {
        if (!firstSeen.has(token.lemmaId)) {
          firstSeen.set(token.lemmaId, chapter.number);
        }
      }
    }
  }
}

let updated = 0;
for (const entry of lexiconJson.lexicon) {
  const seen = firstSeen.get(entry.lemmaId);
  if (seen !== undefined && entry.introducedChapter !== seen) {
    entry.introducedChapter = seen;
    updated += 1;
  }
}

writeFileSync(lexiconPath, JSON.stringify(lexiconJson, null, 2) + '\n');
console.log(`Updated introducedChapter on ${updated} lexicon entries`);
