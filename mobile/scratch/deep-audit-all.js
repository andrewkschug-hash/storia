const fs = require('fs');
const path = require('path');

const storiesBase = path.join(__dirname, '../content/stories');
const storyDirs = fs.readdirSync(storiesBase).filter(d => fs.statSync(path.join(storiesBase, d)).isDirectory());

const results = [];

for (const storyId of storyDirs) {
  const prodPath = path.join(storiesBase, storyId, 'production-exercises.json');
  if (!fs.existsSync(prodPath)) continue;

  const prodData = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
  const chaptersDir = path.join(storiesBase, storyId, 'chapters');
  
  const chaptersMap = new Map();
  if (fs.existsSync(chaptersDir)) {
    const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
    for (const file of chapterFiles) {
      const c = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
      chaptersMap.set(c.id, c);
    }
  }

  for (const ex of prodData.exercises) {
    const chapter = chaptersMap.get(ex.chapterId);
    let sourceSentence = null;
    if (chapter) {
      const allSentences = chapter.paragraphs ? chapter.paragraphs.flatMap(p => p.sentences) : [];
      sourceSentence = allSentences.find(s => s.id === ex.sourceSentenceId);
    }

    results.push({
      storyId,
      chapterId: ex.chapterId,
      chapterNumber: chapter ? chapter.number : null,
      chapterTitle: chapter ? chapter.title : null,
      chapterTitleIt: chapter ? chapter.titleIt : null,
      exerciseId: ex.exerciseId || ex.id,
      promptEn: ex.promptEn,
      expectedIt: ex.expectedIt,
      acceptableAnswers: ex.acceptableAnswers || [],
      sourceSentenceId: ex.sourceSentenceId,
      sourceSentenceText: sourceSentence ? sourceSentence.text : null,
      sourceFound: !!sourceSentence,
      chapterFound: !!chapter
    });
  }
}

fs.writeFileSync(path.join(__dirname, 'full-audit-data.json'), JSON.stringify(results, null, 2));
console.log(`Audited ${results.length} production exercises across all stories.`);

// Check for missing source sentences
const missingSource = results.filter(r => !r.sourceFound);
console.log(`Exercises with missing source sentence: ${missingSource.length}`);
for (const m of missingSource) {
  console.log(`  [${m.storyId}][${m.chapterId}][${m.exerciseId}] sourceSentenceId '${m.sourceSentenceId}' not found!`);
}
