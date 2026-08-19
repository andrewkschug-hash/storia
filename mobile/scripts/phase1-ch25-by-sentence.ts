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
const seen = new Set<string>();
for (const ch of chapters.filter((c) => c.number <= 24)) {
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      for (const t of s.tokens) seen.add(t.lemmaId);
    }
  }
}

const ch25 = chapters.find((c) => c.number === 25)!;
for (const p of ch25.paragraphs) {
  for (const s of p.sentences) {
    const newL = s.tokens.filter((t) => !seen.has(t.lemmaId)).map((t) => t.lemmaId);
    if (newL.length) {
      console.log(`${s.id}\t${s.text}\t${[...new Set(newL)].join(',')}`);
    }
  }
}
