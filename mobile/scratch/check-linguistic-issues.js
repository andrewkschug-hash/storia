const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'full-audit-data.json'), 'utf8'));

console.log(`================================================================`);
console.log(`DETAILED LINGUISTIC AUDIT OF ALL 262 PRODUCTION EXERCISES`);
console.log(`================================================================\n`);

let issues = [];

for (const item of data) {
  const flags = [];
  const p = item.promptEn;
  const e = item.expectedIt;
  const alts = item.acceptableAnswers;
  const s = item.sourceSentenceText;

  // 1. Check spelling / typo patterns
  if (/cassa\b/i.test(e) || alts.some(a => /cassa\b/i.test(a))) {
    flags.push('TYPO: cassa instead of casa');
  }
  if (/\bposo\b/i.test(e) || alts.some(a => /\bposo\b/i.test(a))) {
    flags.push('TYPO: poso instead of posso');
  }
  if (/\bperche\b/i.test(e)) {
    flags.push('ACCENT: perche instead of perché');
  }
  if (/\b(e'|c'e'|dov'e')\b/i.test(e)) {
    flags.push('APOSTROPHE ACCENT: straight quote used instead of accent in expected answer');
  }

  // 2. Check prompt ending with "Say it in Italian"
  if (/say it in italian/i.test(p)) {
    flags.push('STYLE: Prompt contains "Say it in Italian"');
  }

  // 3. Check for duplicates in alts
  const normE = e.toLowerCase().replace(/['’.,;:!?…\s]+/g, '');
  for (const alt of alts) {
    const normAlt = alt.toLowerCase().replace(/['’.,;:!?…\s]+/g, '');
    if (normAlt === normE) {
      flags.push(`DUPLICATE ALT: "${alt}" matches expected "${e}"`);
    }
  }

  // 4. Check for length / complexity mismatches
  // (e.g. prompt is short but expected is very long or vice versa)
  const pWords = p.trim().split(/\s+/).length;
  const eWords = e.trim().split(/\s+/).length;
  if (Math.abs(pWords - eWords) > 8) {
    flags.push(`LENGTH MISMATCH: Prompt has ${pWords} words, expected has ${eWords} words`);
  }

  if (flags.length > 0) {
    issues.push({ item, flags });
  }
}

console.log(`Found ${issues.length} potential issues across 262 exercises:\n`);
for (const iss of issues) {
  console.log(`[${iss.item.storyId}][${iss.item.chapterId}][${iss.item.exerciseId}]`);
  console.log(`  Prompt (EN):   "${iss.item.promptEn}"`);
  console.log(`  Expected (IT): "${iss.item.expectedIt}"`);
  console.log(`  Source Story:  "${iss.item.sourceSentenceText}"`);
  console.log(`  Alts:          [${iss.item.acceptableAnswers.join(' | ')}]`);
  console.log(`  Flags:         ${iss.flags.join('; ')}\n`);
}
