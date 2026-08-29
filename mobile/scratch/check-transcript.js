const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'transcript-1-40.md'), 'utf8');
const chapters = content.split('## Chapter ').slice(1);
console.log(`Total chapters parsed in transcript: ${chapters.length}`);

for (let i = 1; i <= 40; i++) {
  const chHeader = `${i}:`;
  const found = chapters.some(c => c.startsWith(chHeader));
  if (!found) {
    console.error(`Missing chapter ${i} in transcript!`);
  }
}
console.log('All 40 chapters verified!');
