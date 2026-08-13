/**
 * Validate Luca "Say it in Italian" production exercises.
 * Read-only: does not modify chapter JSON, translations, adaptive overlay, or audio.
 *
 * Run from mobile/: npx tsx scripts/validate-production-exercises.ts
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { validateProductionExercises } from '../src/content/validateProductionExercises';

const root = join(__dirname, '..', 'content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

const manifest = JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')) as {
  id: string;
  chapters: { id: string; number: number; file: string }[];
};

const chapterIds = new Set(manifest.chapters.map((c) => c.id));
const sentencesByChapter = new Map<string, Map<string, string>>();

for (const file of readdirSync(chaptersDir).filter((f) => f.endsWith('.json'))) {
  const chapter = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8')) as {
    id: string;
    paragraphs: { sentences: { id: string; text: string }[] }[];
  };
  const sentences = new Map<string, string>();
  for (const paragraph of chapter.paragraphs) {
    for (const sentence of paragraph.sentences) {
      sentences.set(sentence.id, sentence.text);
    }
  }
  sentencesByChapter.set(chapter.id, sentences);
}

const raw = JSON.parse(readFileSync(join(storyPath, 'production-exercises.json'), 'utf8'));
const result = validateProductionExercises(raw, {
  storyId: 'luca-a-roma',
  chapterIds,
  sentencesByChapter,
  minChapter: 1,
  maxChapter: 40,
});

console.log('LUCA PRODUCTION EXERCISES');
console.log(`exercises: ${result.exerciseCount}`);
console.log(`source sentences: ${result.sourceSentenceCount}`);
console.log(`A1: ${result.levelCounts.A1}  A1+: ${result.levelCounts['A1+']}  A2: ${result.levelCounts.A2}`);
console.log(
  `match: exact ${result.matchCounts.exact}  flexible ${result.matchCounts.flexible}  semantic ${result.matchCounts.semantic}`,
);
console.log(`acceptable alternatives listed: ${result.alternativeCount}`);
if (result.warnings.length) {
  console.log(`warnings: ${result.warnings.length}`);
  for (const warning of result.warnings) {
    console.log(`  ${warning.path}: ${warning.message}`);
  }
}

const missingChapters = manifest.chapters
  .filter((c) => c.number >= 1 && c.number <= 40)
  .filter((c) => !(result.chapterCounts[c.id] > 0))
  .map((c) => c.id);
if (missingChapters.length) {
  console.log(`chapters without exercises: ${missingChapters.join(', ')}`);
}

if (!result.ok) {
  console.error(`\nFAILED: ${result.issues.length} issue(s)`);
  for (const issue of result.issues) {
    console.error(`  ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
}

console.log('OK');
