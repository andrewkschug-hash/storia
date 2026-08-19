/**
 * Generate docs/CONTENT-AUDIT.md from current content bundle.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { loadContentBundle } from '../src/content/loadContentBundle';
import { auditStoryVocabulary } from '../src/content/vocabAudit';

const root = join(__dirname, '..', 'content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

const chapterJsonByFile: Record<string, unknown> = {};
for (const file of readdirSync(chaptersDir)) {
  if (!file.endsWith('.json')) continue;
  chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
}

const bundle = loadContentBundle({
  charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
  locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
  lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
  manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
  chapterJsonByFile,
  storyPath: 'stories/luca-a-roma',
});

const audit = auditStoryVocabulary(bundle);

const phraseHints: Record<number, string[]> = {
  1: ['ha fame', 'C’è…', 'Buongiorno'],
  2: ['sta bene', 'ha ancora fame'],
  3: ['cerca…', 'Domani…'],
  4: ['sta bene', 'C’è una…'],
  5: ['Come stai?', 'Bene, grazie', 'Ci vediamo', 'Ciao, sono…'],
  6: ['Come stai oggi?', 'Ci vediamo domani', 'Bene, grazie'],
  7: ['Posso aiutare', 'Cerchi un lavoro?', 'Chiedi al caffè', 'Grazie'],
  8: ['Scusa…', 'Non so', 'Aspetta un momento', 'Va bene'],
  9: ['Vuoi lavorare qui?', 'posso…?', 'va bene'],
  10: ['Come stai?', 'Va bene', 'Lavoriamo insieme'],
  11: ['Come stai?', 'Sì, va bene', 'Prendiamo un caffè'],
  12: ['Cosa c\'è?', 'Devo partire', 'Non ho soldi'],
  13: ['Possiamo aiutare', 'Grazie'],
  14: ['Non posso…', 'Cosa facciamo adesso?', 'Dove sei…?', 'Non lo so'],
  15: ['Perché no?', 'Dobbiamo fare un piano', 'L’aiuto è importante'],
  16: ['Prendiamo il treno', 'Sì, andiamo', 'Il biglietto è nella valigia'],
  17: ['Come stai, Marco?', 'Devo vedere mamma', 'Il viaggio va bene'],
  18: ['Il treno arriva', 'Dov’è…?', 'Scusa', 'Cosa facciamo adesso?'],
  19: ['Aspetta…', 'Ecco il biglietto', 'Grazie, amici', 'La mamma sta bene'],
  20: ['Come stai ora?', 'Ci vediamo', 'Siamo a casa'],
};

const lines: string[] = [];
lines.push('# Content Audit — Luca a Roma');
lines.push('');
lines.push('Phase 2.1 content-quality pass.');
lines.push('');
lines.push(`**Total chapters:** ${bundle.chapters.size}`);
lines.push(`**Total lexicon entries:** ${bundle.lexicon.length}`);
lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push('## Per-chapter vocabulary');
lines.push('');

for (const ch of audit.chapters) {
  lines.push(`### Chapter ${String(ch.chapterNumber).padStart(2, '0')} — ${ch.titleIt}`);
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Word/token count | ${ch.tokenCount} |`);
  lines.push(`| Unique lemmas | ${ch.uniqueLemmaCount} |`);
  lines.push(`| Familiar % | ${ch.familiarPercent.toFixed(1)}% (${ch.familiarCount}) |`);
  lines.push(`| Learning % | ${ch.learningPercent.toFixed(1)}% (${ch.learningCount}) |`);
  lines.push(`| New % | ${ch.newPercent.toFixed(1)}% (${ch.newCount}) |`);
  lines.push('');
  lines.push('**New lemmas:** ' + ch.newLemmas.join(', '));
  lines.push('');
  lines.push(
    '**Major recurring phrases:** ' + (phraseHints[ch.chapterNumber] ?? []).join(' · '),
  );
  lines.push('');
  if (ch.warnings.length) {
    lines.push('**Notes / warnings:**');
    for (const w of ch.warnings) lines.push(`- ${w}`);
    lines.push('');
  } else {
    lines.push('**Notes:** Within target profile (or expected foundation chapter).');
    lines.push('');
  }
}

lines.push('## Curriculum issues fixed');
lines.push('');
lines.push('- **Chapter 2 spike:** Cut from ~75% new to ~39% by reusing bar/fame/mangiare/andare and seeding `stare`/`bene`/`vedere` for later dialogue.');
lines.push('- **Chapter 5 spike:** Cut from ~46% new to ~36% by removing unnecessary adjectives (`gentile`/`simpatico`/`ragazza`/`chiamare`) and pre-seeding `stare`/`bene`/`vedere`; added natural chunks `Come stai?`, `Bene, grazie`, `Ci vediamo`.');
lines.push('- **Chapter 9 spike:** Cut from ~39% new to ~23%; removed redundant `capo`/`opportunità`; café owner (`padrone`) now speaks; dialogue uses `Va bene` / `posso…?`.');
lines.push('- **Chapter 14 spike:** Cut from ~31% new to ~19%; deferred `risolvere` to ch19; reused aiutare/fare/piano; added `Non posso`, `Dove sei?`, `Non lo so`.');
lines.push('- **Phrase repetition:** Wove Come stai?, Va bene, Non so / Non lo so, Scusa, Ci vediamo, Posso/Non posso, Perché no?, Aspetta un momento, Dov’è across the arc.');
lines.push('- **High-frequency verbs:** Increased exposure of stare, vedere, sapere, fare, potere, parlare, mangiare, dare, prendere, aspettare.');
lines.push('- **Grammar / naturalness:** `un’idea`, `L’aiuto è importante`, `fuori da Roma`, `Dov’è`, `Il treno parte` / `Il viaggio inizia`, rent line `L’affitto costa molto`, fixed padrone dialogue attribution.');
lines.push('- **Character voices:** Luca straightforward; Sofia warm (`Come stai?`, `Ci vediamo`); Marco casual (`Non lo so`, `Non ho soldi`); Nonna Rosa warm (`Entrate, siete a casa`, `Perché no?`).');
lines.push('- **Lexicon:** Added `momento`, `dove_e`, `iniziare`, `passare`; clarified English for fame/sete/bene/stare/sapere/conoscere/si vs sì; synced `introducedChapter` to first story use; added `padrone` character.');
lines.push('- **Continuity:** Stronger callbacks (apartment → rent → job → friends → Marco’s ticket → Nonna’s plan → trip → return).');
lines.push('');
lines.push('## Remaining exceptions');
lines.push('');
lines.push('| Chapter | Why it exceeds / differs |');
lines.push('|---------|---------------------------|');
lines.push('| 1 | 100% new by definition — foundation chapter. |');
lines.push('| 2 | ~39% new (guideline ≤35%). Still teaching first walk/city layer (`camminare`, `strada`, articles). Mostly learning from ch1 (~61%). Acceptable. |');
lines.push('| 3 | ~39% new — housing cluster (`casa`, `appartamento`, `soldi`, `posto`) introduced together because the plot beat requires it. |');
lines.push('| 5 | ~36% new — first real dialogue chapter; names + greeting chunks (`ciao`, `Come stai?`, `Ci vediamo`) arrive together intentionally. |');
lines.push('| 12 | ~30% new — problem vocabulary (`problema`, `biglietto`, `dovere`, `tempo`) arrives with Marco’s crisis; flagged but story-motivated. |');
lines.push('');
lines.push('## Before → after (spike chapters)');
lines.push('');
lines.push('| Chapter | New % before | New % after |');
lines.push('|---------|--------------|-------------|');
lines.push('| 2 | 75.0% | ~38.7% |');
lines.push('| 5 | 45.5% | ~36.4% |');
lines.push('| 9 | 38.5% | ~23.1% |');
lines.push('| 14 | 30.6% | ~19.4% |');
lines.push('');
lines.push('## Architecture unchanged');
lines.push('');
lines.push('No changes to progress, reader, storage, navigation, dictionary, quizzes, adaptive engine, or TTS.');
lines.push('');

const out = join(__dirname, '..', '..', 'docs', 'CONTENT-AUDIT.md');
writeFileSync(out, lines.join('\n'), 'utf8');
console.log('Wrote', out);
