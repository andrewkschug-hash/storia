/**
 * Safe Phase 12B structural validation for Elena torna a casa.
 * Does not load Luca chapters, does not generate audio, does not mutate content.
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import {
  CharactersFileSchema,
  LocationsFileSchema,
  LexiconFileSchema,
  StoryManifestSchema,
  StoryArcSchema,
  LexiconEntrySchema,
} from '../src/content/schemas';

const root = join(__dirname, '..', 'content');
const elenaDir = join(root, 'stories', 'elena-torna-a-casa');
const lucaDir = join(root, 'stories', 'luca-a-roma');
const errors: string[] = [];
const ok: string[] = [];

function fail(msg: string) {
  errors.push(msg);
}
function pass(msg: string) {
  ok.push(msg);
}

if (!existsSync(elenaDir)) fail(`Missing story dir ${elenaDir}`);

const manifest = JSON.parse(readFileSync(join(elenaDir, 'manifest.json'), 'utf8'));
const parsedManifest = StoryManifestSchema.safeParse(manifest);
if (!parsedManifest.success) {
  fail(`manifest.json schema: ${parsedManifest.error.message}`);
} else {
  pass('manifest.json matches StoryManifestSchema');
}

if (manifest.id !== 'elena-torna-a-casa') fail(`story id is "${manifest.id}"`);
else pass('story id is elena-torna-a-casa');

if (manifest.id === 'luca-a-roma') fail('story id collides with luca-a-roma');

const lucaManifest = JSON.parse(readFileSync(join(lucaDir, 'manifest.json'), 'utf8'));
if (lucaManifest.id === manifest.id) fail('Elena id equals Luca id');
else pass('story id unique vs luca-a-roma');

const chapters = manifest.chapters as { number: number; title: string; titleIt: string; id: string; file: string }[];
if (chapters.length !== 20) fail(`expected 20 chapters, got ${chapters.length}`);
else pass('20 chapter shell entries');

const numbers = chapters.map((c) => c.number);
if (numbers.join(',') !== Array.from({ length: 20 }, (_, i) => i + 1).join(',')) {
  fail(`chapter order is ${numbers.join(',')}`);
} else pass('chapter order 1–20');

for (const ch of chapters) {
  if (!ch.title) fail(`ch${ch.number} missing English title`);
  if (!ch.titleIt) fail(`ch${ch.number} missing Italian title`);
  if (!ch.id.startsWith('elena-torna-a-casa-')) fail(`ch${ch.number} id ${ch.id}`);
}
if (chapters.every((c) => c.title && c.titleIt)) pass('all English and Italian titles present');

const chaptersDir = join(elenaDir, 'chapters');
if (existsSync(chaptersDir)) {
  const prose = readdirSync(chaptersDir).filter((f) => f.endsWith('.json'));
  if (prose.length) fail(`chapter prose files exist: ${prose.join(', ')}`);
} else {
  pass('no chapters/ directory — no sentence content');
}

for (const forbidden of ['sentence-english.json', 'adaptive-variants.json']) {
  if (existsSync(join(elenaDir, forbidden))) fail(`${forbidden} should not exist yet`);
}
pass('no sentence-english or adaptive overlay');

const shell = JSON.parse(readFileSync(join(elenaDir, 'chapter-shell.json'), 'utf8'));
if (shell.chapters.length !== 20) fail(`chapter-shell has ${shell.chapters.length} rows`);
for (const ch of shell.chapters) {
  if ('paragraphs' in ch || 'sentences' in ch || 'questions' in ch) {
    fail(`ch${ch.number} shell contains prose/questions`);
  }
  if (!ch.narrativePurpose || !ch.primaryDomain || !ch.secondaryDomain) {
    fail(`ch${ch.number} missing purpose/domains`);
  }
  if (!ch.wordTarget || ch.wordTarget.length !== 2) fail(`ch${ch.number} missing wordTarget`);
}
pass('chapter-shell metadata only (no sentences/questions)');

const elenaChars = CharactersFileSchema.parse(
  JSON.parse(readFileSync(join(elenaDir, 'characters.json'), 'utf8')),
);
const globalChars = CharactersFileSchema.parse(
  JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
);
const globalCharIds = new Set(globalChars.characters.map((c) => c.id));
const elenaCharIds = elenaChars.characters.map((c) => c.id);
const charDup = elenaCharIds.filter((id) => globalCharIds.has(id));
if (charDup.length) fail(`character id collision with global: ${charDup.join(', ')}`);
else pass(`Elena character ids unique vs global: ${elenaCharIds.join(', ')}`);
if (new Set(elenaCharIds).size !== elenaCharIds.length) fail('duplicate Elena character ids');
for (const name of ['Luca', 'Sofia', 'Marco', 'Giulia', 'Nonna Rosa']) {
  if (elenaChars.characters.some((c) => c.name === name)) fail(`character name collision: ${name}`);
}
pass('no Luca/Sofia/Marco/Giulia/Nonna Rosa name collisions');

const elenaLocs = LocationsFileSchema.parse(
  JSON.parse(readFileSync(join(elenaDir, 'locations.json'), 'utf8')),
);
const globalLocs = LocationsFileSchema.parse(
  JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
);
const globalLocIds = new Set(globalLocs.locations.map((l) => l.id));
const elenaLocIds = elenaLocs.locations.map((l) => l.id);
const locDup = elenaLocIds.filter((id) => globalLocIds.has(id));
if (locDup.length) fail(`location id collision with global: ${locDup.join(', ')}`);
else pass(`Elena location ids unique vs global (${elenaLocIds.length})`);

for (const id of manifest.characterIds) {
  if (!elenaCharIds.includes(id)) fail(`manifest character ${id} not in Elena characters.json`);
}
for (const id of manifest.locationIds) {
  if (!elenaLocIds.includes(id)) fail(`manifest location ${id} not in Elena locations.json`);
}
pass('manifest character/location ids resolve in Elena local files');

const arcsFile = JSON.parse(readFileSync(join(elenaDir, 'arcs.json'), 'utf8'));
const arcs = Array.isArray(arcsFile.arcs) ? arcsFile.arcs : [];
if (arcs.length !== 1) fail(`expected 1 arc, got ${arcs.length}`);
const arc = StoryArcSchema.parse(arcs[0]);
if (arc.storyId !== 'elena-torna-a-casa') fail('arc storyId mismatch');
if (arc.chapterStart !== 1 || arc.chapterEnd !== 20) fail('arc range not 1–20');
if (arc.status !== 'planned') fail('arc should stay planned until prose exists');
pass('arcs.json A1 planned 1–20');

const core = LexiconFileSchema.parse(
  JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
);
const coreIds = new Set(core.lexicon.map((e) => e.lemmaId));
const additions = JSON.parse(readFileSync(join(elenaDir, 'lexicon-additions.json'), 'utf8'));
const newEntries = additions.lexicon as unknown[];
const parsedNew = newEntries.map((row, i) => {
  const r = LexiconEntrySchema.safeParse(row);
  if (!r.success) fail(`lexicon-additions[${i}] schema: ${r.error.message}`);
  return r.success ? r.data : null;
}).filter(Boolean) as { lemmaId: string }[];

const newIds = parsedNew.map((e) => e.lemmaId);
if (new Set(newIds).size !== newIds.length) fail('duplicate lemma ids inside lexicon-additions.json');
const lemmaClash = newIds.filter((id) => coreIds.has(id));
if (lemmaClash.length) fail(`new lemma ids already in italian-core: ${lemmaClash.join(', ')}`);
else pass(`${newIds.length} proposed new lemmas; none collide with italian-core`);

const vocabPlan = JSON.parse(readFileSync(join(elenaDir, 'vocab-plan.json'), 'utf8'));
for (const id of vocabPlan.reuseExistingUnusedInItalianCore as string[]) {
  if (!coreIds.has(id)) fail(`vocab-plan reuse id missing from italian-core: ${id}`);
}
pass('vocab-plan reuse ids all exist in italian-core');

for (const id of vocabPlan.recycleFromLucaA1Examples as string[]) {
  if (!coreIds.has(id)) fail(`recycle example missing from italian-core: ${id}`);
}
pass('Luca recycle examples exist in italian-core (not duplicated)');

if (existsSync(join(root, 'audio', 'catalog.json'))) {
  const catalog = readFileSync(join(root, 'audio', 'catalog.json'), 'utf8');
  if (catalog.includes('elena-torna-a-casa')) fail('audio catalog already mentions Elena');
  else pass('audio catalog does not mention Elena');
}

console.log('ELENA SHELL VALIDATION\n');
for (const line of ok) console.log(`OK  ${line}`);
if (errors.length) {
  console.log('');
  for (const line of errors) console.log(`ERR ${line}`);
  console.log(`\nFAILED: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`\nPASSED: ${ok.length} checks`);
