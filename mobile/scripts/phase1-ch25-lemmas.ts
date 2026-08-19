import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { loadContentBundle } from '../src/content/loadContentBundle';

const root = join(__dirname, '..', 'content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

const chapterJsonByFile: Record<string, unknown> = {};
for (const file of readdirSync(chaptersDir)) {
  if (!file.endsWith('.json')) continue;
  chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
}

const bundle = loadContentBundle({
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

const chapters = [...bundle.chapters.values()].sort((a, b) => a.number - b.number);
const firstSeen = new Map<string, number>();

for (const ch of chapters) {
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      for (const t of s.tokens) {
        if (!firstSeen.has(t.lemmaId)) firstSeen.set(t.lemmaId, ch.number);
      }
    }
  }
}

const ch25 = chapters.find((c) => c.number === 25)!;
const ids = [
  ...new Set(ch25.paragraphs.flatMap((p) => p.sentences.flatMap((s) => s.tokens.map((t) => t.lemmaId)))),
].filter((id) => firstSeen.get(id) === 25);

console.log('count', ids.length);
for (const id of ids.sort()) {
  const e = bundle.lexiconById.get(id);
  console.log(`${id}\t${e?.italian ?? '?'}\t${e?.english ?? '?'}`);
}
