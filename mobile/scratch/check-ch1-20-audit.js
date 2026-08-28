const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'full-audit-report.json'), 'utf8'));

for (const item of report) {
  if (item.chapterNumber && item.chapterNumber <= 20) {
    console.log(`\n========================================`);
    console.log(`CHAPTER ${item.chapterNumber}`);
    console.log(`AUTHORED PROMPT: "${item.authored.promptEn}"`);
    console.log(`AUTHORED EXPECT: "${item.authored.expectedIt}"`);
    console.log(`AUTHORED ALTS:   ${JSON.stringify(item.authored.acceptable)}`);
    console.log(`---`);
    console.log(`RUNTIME PROMPT:  "${item.runtime.promptEn}"`);
    console.log(`RUNTIME EXPECT:  "${item.runtime.expectedIt}"`);
    console.log(`RUNTIME ALTS:    ${JSON.stringify(item.runtime.acceptable)}`);
    console.log(`---`);
    console.log(`SOURCE SENTENCE: "${item.sourceSentence ? item.sourceSentence.text : 'none'}"`);
    console.log(`SOURCE ENGLISH:  "${item.sourceSentence ? item.sourceSentence.english : 'none'}"`);
  }
}
