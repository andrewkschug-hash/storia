/**
 * Validate bundled story content + print vocabulary audit.
 * Run: npx tsx scripts/validate-content.ts
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { auditStoryCefr } from '../src/cefr/chapter';
import { loadContentBundle } from '../src/content/loadContentBundle';
import { auditStoryVocabulary, formatChapterAudit } from '../src/content/vocabAudit';

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
