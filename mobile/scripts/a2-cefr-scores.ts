import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { auditStoryCefr } from '../src/cefr';
import { getContentBundle } from '../src/content';

const bundle = getContentBundle('luca-a-roma');
const audit = auditStoryCefr(bundle);
const rows = audit
  .filter((c) => c.chapterNumber >= 20)
  .map((c) => ({
    n: c.chapterNumber,
    title: c.titleIt,
    target: c.target,
    estimated: c.estimated,
    status: c.status,
    words: c.wordCount,
    overall: c.overallScore,
    vocab: c.vocabularyScore,
    sentence: c.sentenceScore,
    novelty: c.noveltyScore,
    grammar: c.grammarScore,
    avgSent: Number(c.averageSentenceLength.toFixed(1)),
    longest: c.longestSentence,
    newPct: Number((c.newPercent * 100).toFixed(1)),
    dialoguePct: Number((c.dialoguePercent * 100).toFixed(0)),
    narrative: c.narrativeComplexity,
  }));

console.log('n\ttarget\test\tstatus\twords\toverall\tvocab\tsent\tnov\tgram\tavg\tmax\tnew%\tdial%\tnarrative');
for (const r of rows) {
  console.log(
    [
      r.n,
      r.target,
      r.estimated,
      r.status,
      r.words,
      r.overall,
      r.vocab.toFixed(1),
      r.sentence.toFixed(1),
      r.novelty.toFixed(1),
      r.grammar.toFixed(1),
      r.avgSent,
      r.longest,
      r.newPct,
      r.dialoguePct,
      r.narrative,
    ].join('\t'),
  );
}

writeFileSync(
  join(__dirname, '../content/stories/luca-a-roma/A2-CEFR-AUDIT-20-40.json'),
  `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), rows }, null, 2)}\n`,
);
