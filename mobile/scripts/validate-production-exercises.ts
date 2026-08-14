/**
 * Validate Luca + pre-Rome "Say it in Italian" production exercises.
 * Read-only: does not modify chapter JSON, translations, adaptive overlay, or audio.
 *
 * Run from mobile/: npx tsx scripts/validate-production-exercises.ts
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { validateProductionExercises } from '../src/content/validateProductionExercises';

const root = join(__dirname, '..', 'content', 'stories');

const STORIES: Array<{
  storyId: string;
  minChapter?: number;
  maxChapter?: number;
  expectedLevel?: 'A1' | 'A1+' | 'A2';
}> = [
  { storyId: 'luca-a-roma', minChapter: 1, maxChapter: 40 },
  { storyId: 'luca-prima-di-roma-01', expectedLevel: 'A1' },
  { storyId: 'luca-prima-di-roma-02', expectedLevel: 'A1' },
  { storyId: 'luca-prima-di-roma-03', expectedLevel: 'A1' },
  { storyId: 'luca-prima-di-roma-04', expectedLevel: 'A1' },
  { storyId: 'luca-prima-di-roma-05', expectedLevel: 'A1' },
];

let failed = false;
let totalExercises = 0;
let totalAlts = 0;
const matchTotals = { exact: 0, flexible: 0, semantic: 0 };

for (const story of STORIES) {
  const storyPath = join(root, story.storyId);
  const chaptersDir = join(storyPath, 'chapters');
  const manifest = JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')) as {
    id: string;
    chapters: { id: string; number: number }[];
  };

  const chapterIds = new Set(manifest.chapters.map((chapter) => chapter.id));
  const sentencesByChapter = new Map<string, Map<string, string>>();
  for (const file of readdirSync(chaptersDir).filter((name) => name.endsWith('.json'))) {
    const chapter = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8')) as {
      id: string;
      paragraphs: { sentences: { id: string; text: string }[] }[];
    };
    const sentences = new Map<string, string>();
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) sentences.set(sentence.id, sentence.text);
    }
    sentencesByChapter.set(chapter.id, sentences);
  }

  const raw = JSON.parse(readFileSync(join(storyPath, 'production-exercises.json'), 'utf8'));
  const result = validateProductionExercises(raw, {
    storyId: story.storyId,
    chapterIds,
    sentencesByChapter,
    minChapter: story.minChapter,
    maxChapter: story.maxChapter,
    expectedLevel: story.expectedLevel,
  });

  totalExercises += result.exerciseCount;
  totalAlts += result.alternativeCount;
  matchTotals.exact += result.matchCounts.exact;
  matchTotals.flexible += result.matchCounts.flexible;
  matchTotals.semantic += result.matchCounts.semantic;

  console.log(`\n${story.storyId.toUpperCase()}`);
  console.log(`exercises: ${result.exerciseCount}`);
  console.log(`source sentences: ${result.sourceSentenceCount}`);
  console.log(
    `A1: ${result.levelCounts.A1}  A1+: ${result.levelCounts['A1+']}  A2: ${result.levelCounts.A2}`,
  );
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
    .filter((chapter) => !(result.chapterCounts[chapter.id] > 0))
    .map((chapter) => chapter.id);
  if (missingChapters.length) {
    console.log(`chapters without exercises: ${missingChapters.join(', ')}`);
  }

  if (!result.ok) {
    failed = true;
    console.error(`FAILED: ${result.issues.length} issue(s)`);
    for (const issue of result.issues) {
      console.error(`  ${issue.path}: ${issue.message}`);
    }
  } else {
    console.log('OK');
  }
}

console.log('\nALL PRODUCTION EXERCISES');
console.log(`exercises: ${totalExercises}`);
console.log(
  `match: exact ${matchTotals.exact}  flexible ${matchTotals.flexible}  semantic ${matchTotals.semantic}`,
);
console.log(`acceptable alternatives listed: ${totalAlts}`);

if (failed) process.exit(1);
console.log('OK');
