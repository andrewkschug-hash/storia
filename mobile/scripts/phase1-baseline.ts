import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { auditStoryCefr } from '../src/cefr/chapter';
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

function chapterMetrics(n: number) {
  const ch = chapters.find((c) => c.number === n)!;
  const ids = new Set<string>();
  let words = 0;
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      words += s.text.split(/\s+/).filter(Boolean).length;
      for (const t of s.tokens) ids.add(t.lemmaId);
    }
  }
  const newIds = [...ids].filter((id) => firstSeen.get(id) === n);
  const cefr = auditStoryCefr(bundle).chapters.find((c) => c.chapterNumber === n);
  const qIt = ch.questions.filter((q) => q.questionIt).length;
  return {
    n,
    words,
    newLemmas: newIds.length,
    newLemmaList: newIds.map((id) => {
      const e = bundle.lexiconById.get(id);
      return { id, italian: e?.italian ?? '?', english: e?.english ?? '?' };
    }),
    avgSent: +(words / ch.paragraphs.flatMap((p) => p.sentences).length).toFixed(1),
    estimated: cefr?.estimatedLevel,
    overall: cefr?.overallScore,
    questionIt: qIt,
  };
}

console.log(JSON.stringify(chapters.filter((c) => c.number >= 25 && c.number <= 40).map((c) => chapterMetrics(c.number)), null, 2));
