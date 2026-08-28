const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'full-audit-report.json'), 'utf8'));

console.log('=== AUDITING RUNTIME PRODUCTION EXERCISES ===\n');

for (const item of report) {
  const isDiff = item.authored.promptEn !== item.runtime.promptEn ||
                 item.authored.expectedIt !== item.runtime.expectedIt ||
                 JSON.stringify(item.authored.acceptable) !== JSON.stringify(item.runtime.acceptable);

  console.log(`[Ch ${item.chapterNumber || item.chapterId}][Level: ${item.level}]`);
  console.log(`  AUTHORED: Prompt: "${item.authored.promptEn}" -> Expected: "${item.authored.expectedIt}" | Alts: [${item.authored.acceptable.join(', ')}]`);
  console.log(`  RUNTIME:  Prompt: "${item.runtime.promptEn}" -> Expected: "${item.runtime.expectedIt}" | Alts: [${item.runtime.acceptable.join(', ')}]`);
  if (isDiff) {
    console.log(`  >>> MUTATED AT RUNTIME <<<`);
  }
  console.log('');
}
