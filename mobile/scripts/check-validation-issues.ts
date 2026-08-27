import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { validateProductionExercises } from '../src/content/validateProductionExercises';

const root = join(__dirname, '..', 'content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');
const manifest = JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8'));

const sentencesByChapter = new Map();
for (const file of readdirSync(chaptersDir).filter((f) => f.endsWith('.json'))) {
  const chapter = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  const sentences = new Map();
  for (const paragraph of chapter.paragraphs) {
    for (const sentence of paragraph.sentences) sentences.set(sentence.id, sentence.text);
  }
  sentencesByChapter.set(chapter.id, sentences);
}

const context = {
  storyId: 'luca-a-roma',
  chapterIds: new Set(manifest.chapters.map((c: any) => c.id)),
  sentencesByChapter,
  minChapter: 1,
  maxChapter: 40,
};

const dataset = JSON.parse(readFileSync(join(storyPath, 'production-exercises.json'), 'utf8'));
const result = validateProductionExercises(dataset, context as any);
console.log('Result ok:', result.ok);
console.log('Issues:', JSON.stringify(result.issues, null, 2));
