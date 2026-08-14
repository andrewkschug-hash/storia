/**
 * Validate bundled story content + print vocabulary audit.
 * Run: npx tsx scripts/validate-content.ts
 */
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { auditStoryCefr } from '../src/cefr/chapter';
import { getContentBundle } from '../src/content';
import { getCatalogStories } from '../src/content/catalog';
import { inspectDraftStoryData } from '../src/content/inspectDraft';
import { loadContentBundle } from '../src/content/loadContentBundle';
import { validateStoryCatalog } from '../src/content/validateCatalog';
import { auditStoryVocabulary, formatChapterAudit } from '../src/content/vocabAudit';

const root = join(__dirname, '..', 'content');

const catalogResult = validateStoryCatalog();
if (!catalogResult.ok) {
  console.error('CATALOG INVALID');
  for (const error of catalogResult.errors) console.error(' ', error);
  process.exit(1);
}
console.log('CATALOG OK');
console.log('Available:', catalogResult.available.join(', ') || '(none)');
console.log('Draft:', catalogResult.draft.join(', ') || '(none)');
console.log('Planned:', catalogResult.planned.join(', ') || '(none)');
console.log('');

function loadStoryBundle(contentPath: string, narrativeArc?: string) {
  const storyDir = join(root, contentPath);
  const chaptersDir = join(storyDir, 'chapters');
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  }
  const translationsPath = join(storyDir, 'sentence-english.json');
  return loadContentBundle({
    charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
    locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
    lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
    manifestJson: JSON.parse(readFileSync(join(storyDir, 'manifest.json'), 'utf8')),
    chapterJsonByFile,
    translationsJson: existsSync(translationsPath)
      ? JSON.parse(readFileSync(translationsPath, 'utf8'))
      : undefined,
    storyPath: contentPath,
    narrativeArc,
  });
}

for (const story of getCatalogStories()) {
  if (story.status === 'available') {
    const bundle = getContentBundle(story.id);
    if (bundle.chapters.size !== story.chapterCount) {
      console.error(
        `AVAILABLE ${story.id}: expected ${story.chapterCount} chapters, got ${bundle.chapters.size}`,
      );
      process.exit(1);
    }
    console.log(`AVAILABLE ${story.id}: ${bundle.chapters.size} chapter(s) via getContentBundle`);
  }
  if (story.status === 'planned') {
    if (!story.contentPath) {
      console.log(`PLANNED ${story.id}: no prose required`);
      continue;
    }
    const bundle = loadStoryBundle(story.contentPath, story.narrativeArc);
    console.log(`PLANNED ${story.id}: ${bundle.chapters.size} chapter(s) authored, still planned`);
  }
  if (story.status === 'draft') {
    if (!story.contentPath) {
      console.log(`DRAFT ${story.id}: missing contentPath`);
      continue;
    }
    const storyDir = join(root, story.contentPath);
    const chaptersDir = join(storyDir, 'chapters');
    const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
    const optionalJson = (path: string) => (existsSync(path) ? readJson(path) : undefined);
    const inspection = inspectDraftStoryData({
      storyId: story.id,
      sharedCharactersJson: readJson(join(root, 'characters.json')),
      sharedLocationsJson: readJson(join(root, 'locations.json')),
      storyLocalCharactersJson: optionalJson(join(storyDir, 'characters.json')),
      storyLocalLocationsJson: optionalJson(join(storyDir, 'locations.json')),
      manifestJson: optionalJson(join(storyDir, 'manifest.json')),
      proseChapterFiles: existsSync(chaptersDir)
        ? readdirSync(chaptersDir).filter((file) => file.endsWith('.json'))
        : [],
    });
    console.log(
      `DRAFT ${story.id}: ${inspection.proseChapterFiles.length} chapter file(s), incomplete (expected)`,
    );
  }
}
console.log('');

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
  adaptiveJson: JSON.parse(
    readFileSync(join(storyPath, 'adaptive-variants.json'), 'utf8'),
  ),
  translationsJson: JSON.parse(readFileSync(join(storyPath, 'sentence-english.json'), 'utf8')),
  arcsJson: JSON.parse(readFileSync(join(storyPath, 'arcs.json'), 'utf8')),
  storyPath: 'stories/luca-a-roma',
});

console.log('CONTENT OK');
console.log('Chapters:', bundle.chapters.size);
console.log('Lexicon entries:', bundle.lexicon.length);
console.log('');

const audit = auditStoryVocabulary(bundle);
for (const chapter of audit.chapters) {
  console.log(formatChapterAudit(chapter));
  console.log('\n---\n');
}

console.log('CEFR AUDIT (no rewrites)\n');
for (const row of auditStoryCefr(bundle)) {
  console.log(
    `Chapter ${row.chapterNumber}  Target: ${row.target}  Estimated: ${row.estimated}  Status: ${row.status}`,
  );
  console.log(
    `  vocab ${row.vocabularyScore}  sentence ${row.sentenceScore}  novelty ${row.noveltyScore}  comprehension ${row.comprehensionScore}  overall ${row.overallScore}`,
  );
  console.log(
    `  ${row.wordCount} words  ${row.paragraphCount} paragraphs  ${row.sceneCount} scenes  avg para ${row.averageParagraphLength}  longest ${row.longestSentence}  ${row.narrativeComplexity}`,
  );
  console.log(
    `  adaptive ${row.adaptiveOpportunities}  audio ${row.audioCompletion}${row.incompleteFlags.length ? `  flags: ${row.incompleteFlags.join('; ')}` : ''}`,
  );
}
