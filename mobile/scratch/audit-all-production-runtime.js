const fs = require('fs');
const path = require('path');

// Let's load stories and production exercises and lexicon
const storyDir = path.join(__dirname, '../content/stories/luca-a-roma');
const chaptersDir = path.join(storyDir, 'chapters');
const exercisesPath = path.join(storyDir, 'production-exercises.json');
const exercisesJson = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
const lexiconPath = path.join(__dirname, '../content/lexicon/italian-core.json');
const lexiconArray = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));

const lexiconById = new Map();
for (const entry of lexiconArray) {
  lexiconById.set(entry.lemmaId, entry);
}

// Import compiled or transpile productionCardView
// Let's inspect how the app calls productionCardView in comprehension/[chapterId].tsx
// In comprehension/[chapterId].tsx:
// const chapter = getChapter(chapterId, storyId);
// const currentExercise = productionExercises[productionIndex];
// const sourceSentence = currentExercise.sentenceId ? chapter.sentences.find(s => s.id === currentExercise.sentenceId) : null;
// productionCardView(currentExercise, index, total, revealed, sourceSentence, { storySentence: sourceSentence, lexiconById })

console.log('Total exercises:', exercisesJson.exercises.length);

const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
const chaptersMap = new Map();
for (const file of chapterFiles) {
  const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
  chaptersMap.set(content.id, content);
}

console.log('Total chapters loaded:', chaptersMap.size);
