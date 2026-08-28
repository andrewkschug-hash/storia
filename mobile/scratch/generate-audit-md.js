const fs = require('fs');
const path = require('path');

const lucaStoryDir = path.join(__dirname, '../content/stories/luca-a-roma');
const exercisesPath = path.join(lucaStoryDir, 'production-exercises.json');
const lucaExercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

const chaptersDir = path.join(lucaStoryDir, 'chapters');
const chaptersMap = new Map();
const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
for (const file of chapterFiles) {
  const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
  chaptersMap.set(content.number, content);
}

// Generate complete markdown audit table
let md = `# Comprehensive Audit: "Say it in Italian" (Production Exercises) Across All Chapters\n\n`;

for (let chNum = 1; chNum <= 70; chNum++) {
  const ch = chaptersMap.get(chNum);
  const chId = `luca-a-roma-${String(chNum).padStart(2, '0')}`;
  const exercises = lucaExercises.exercises.filter(e => e.chapterId === chId);

  md += `## Chapter ${chNum}: ${ch ? ch.title : 'Chapter ' + chNum} (*${ch ? ch.titleIt : ''}*)\n\n`;
  if (exercises.length === 0) {
    md += `*No production exercises authored for Chapter ${chNum}.*\n\n`;
    continue;
  }

  md += `| # | Prompt (English) | Expected Answer (Italian) | Also Acceptable |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  exercises.forEach((ex, idx) => {
    const p = ex.promptEn.replace(/\s*say it in italian\.?\s*$/i, '').trim();
    const e = ex.expectedIt.trim();
    const normalizedE = e.toLowerCase().replace(/['’.,!?]/g, '').trim();

    const alts = (ex.acceptableAnswers || [])
      .map(a => a.trim())
      .filter(a => {
        const norm = a.toLowerCase().replace(/['’.,!?]/g, '').trim();
        return norm !== normalizedE && norm.length > 0;
      });

    const altsStr = alts.length > 0 ? alts.map(a => `\`${a}\``).join('<br>') : '—';
    md += `| ${idx + 1} | "${p}" | **${e}** | ${altsStr} |\n`;
  });

  md += `\n`;
}

fs.writeFileSync(path.join(__dirname, 'complete-production-audit.md'), md);
console.log('Complete production audit markdown written successfully.');
