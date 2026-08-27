const fs = require('fs');
const path = require('path');
const { validateProductionExercises } = require('../src/content/validateProductionExercises');

const root = path.join(__dirname, '..', 'content');
const storyPath = path.join(root, 'stories', 'luca-a-roma');
const chaptersDir = path.join(storyPath, 'chapters');
const manifest = JSON.parse(fs.readFileSync(path.join(storyPath, 'manifest.json'), 'utf8'));

const sentencesByChapter = new Map();
for (const file of fs.readdirSync(chaptersDir).filter((f) => f.endsWith('.json'))) {
  const chapter = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
  const sentences = new Map();
  for (const paragraph of chapter.paragraphs) {
    for (const sentence of paragraph.sentences) sentences.set(sentence.id, sentence.text);
  }
  sentencesByChapter.set(chapter.id, sentences);
}

const context = {
  storyId: 'luca-a-roma',
  chapterIds: new Set(manifest.chapters.map((c) => c.id)),
  sentencesByChapter,
  minChapter: 1,
  maxChapter: 40,
};

const dataset = JSON.parse(fs.readFileSync(path.join(storyPath, 'production-exercises.json'), 'utf8'));
const result = validateProductionExercises(dataset, context);
console.log('Result ok:', result.ok);
console.log('Issues:', JSON.stringify(result.issues, null, 2));
