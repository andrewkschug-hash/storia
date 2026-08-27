import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { productionCardView } from '../src/production/flow';
import type { LexiconEntry, ProductionExercise, Sentence } from '../src/content/schemas';

const root = join(__dirname, '..', 'content');
const lexiconRaw = JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8'));
const lexiconById = new Map<string, LexiconEntry>(lexiconRaw.lexicon.map((l: LexiconEntry) => [l.lemmaId, l]));

// Audit stories
const stories = [
  'luca-prima-di-roma-01',
  'luca-prima-di-roma-02',
  'luca-prima-di-roma-03',
  'luca-prima-di-roma-04',
  'luca-prima-di-roma-05',
  'luca-a-roma',
];

const results: any[] = [];

for (const storyId of stories) {
  const storyDir = join(root, 'stories', storyId);
  const prodFile = join(storyDir, 'production-exercises.json');
  if (!existsSync(prodFile)) continue;
  const prodJson = JSON.parse(readFileSync(prodFile, 'utf8'));
  const exercises: ProductionExercise[] = prodJson.exercises || [];

  // Load chapters & sentences
  const chaptersDir = join(storyDir, 'chapters');
  const sentencesById = new Map<string, Sentence>();
  if (existsSync(chaptersDir)) {
    for (const f of readdirSync(chaptersDir)) {
      if (!f.endsWith('.json')) continue;
      try {
        const ch = JSON.parse(readFileSync(join(chaptersDir, f), 'utf8'));
        if (ch.paragraphs) {
          for (const p of ch.paragraphs) {
            if (p.sentences) {
              for (const s of p.sentences) {
                // expand tokens if needed
                let tokens = s.tokens;
                if (!tokens && s.lemmas) {
                  const words = s.text.replace(/[.,;:!?…"'«»]+/g, ' ').trim().split(/\s+/);
                  tokens = s.lemmas.map((l: string, idx: number) => ({ lemmaId: l, surface: words[idx] || l }));
                }
                const sentObj = { ...s, tokens };
                if (ch.id) sentencesById.set(`${ch.id}:${s.id}`, sentObj);
              }
            }
          }
        }
      } catch (e) {}
    }
  }

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const source = ex.sourceSentenceId
      ? sentencesById.get(`${ex.chapterId}:${ex.sourceSentenceId}`)
      : null;
    const view = productionCardView(ex, i, exercises.length, true, source, {
      storySentence: source,
      lexiconById,
    });

    const issues: string[] = [];
    
    // Check 1: "be" prompt
    if (view.promptEn?.toLowerCase() === 'be' || view.promptEn?.toLowerCase() === 'to be') {
      issues.push('PROMPT_IS_BE');
    }
    
    // Check 2: Single bare copula target
    const copulas = new Set(['è', 'sono', 'siamo', 'sei', 'siete', 'era', 'erano', 'stato', 'stata', 'sarà', 'ho', 'ha', 'abbiamo', 'avete']);
    if (copulas.has(view.expectedIt?.trim().toLowerCase() ?? '')) {
      issues.push(`BARE_COPULA_${view.expectedIt}`);
    }

    // Check 3: "happy" / "contento" confusion or 1st person vs 3rd person mismatch
    if (view.promptEn?.toLowerCase().includes('happy') || ex.promptEn?.toLowerCase().includes('happy')) {
      // If prompt asks 1st person "I'm happy" while story is 3rd person "Luca is happy"
      if (/\b(i'm|i am)\b/i.test(view.promptEn || '') && source && !source.speakerId && source.kind === 'narration') {
        issues.push('HAPPY_PERSON_MISMATCH');
      }
    }

    // Check 4: 1st person prompt ("I ...", "My ...") vs 3rd person story ("Luca ...", "Chiara ...")
    const isFirstPersonPrompt = /\b(i|i'm|my|me)\b/i.test(view.promptEn || '') || /\b(i|i'm|my|me)\b/i.test(ex.promptEn || '');
    const isThirdPersonSource = source && !source.speakerId && source.kind === 'narration' && /\b(luca|chiara|marta|paolo|sofia|marco|davide|elisa|lui|lei)\b/i.test(source.text);
    if (isFirstPersonPrompt && isThirdPersonSource && ex.level === 'A1') {
      issues.push('PERSON_MISMATCH_1SG_VS_3SG');
    }

    // Check 5: A2 source sentence mismatch (length discrepancy or prompt/source mismatch)
    if (ex.level !== 'A1' && source) {
      const origWordCount = ex.expectedIt.split(/\s+/).length;
      const sourceWordCount = source.text.split(/\s+/).length;
      if (sourceWordCount > 16 && origWordCount <= 10) {
        issues.push('A2_RUNAWAY_SENTENCE_EXPANSION');
      }
    }

    results.push({
      storyId,
      chapterId: ex.chapterId,
      exerciseId: ex.exerciseId,
      level: ex.level,
      sourceSentenceId: ex.sourceSentenceId,
      viewPromptEn: view.promptEn,
      viewExpectedIt: view.expectedIt,
      origPromptEn: ex.promptEn,
      origExpectedIt: ex.expectedIt,
      sourceText: source?.text || null,
      issues,
    });
  }
}

console.log(`TOTAL EXERCISES AUDITED: ${results.length}\n`);

const flagged = results.filter((r) => r.issues.length > 0);
console.log(`FLAGGED EXERCISES: ${flagged.length}\n`);

console.log('--- ISSUES SUMMARY BY CATEGORY ---');
const categories: Record<string, number> = {};
for (const r of flagged) {
  for (const issue of r.issues) {
    categories[issue] = (categories[issue] || 0) + 1;
  }
}
console.log(categories);

console.log('\n--- DETAILED FLAGGED LIST ---');
for (const r of flagged) {
  console.log(`[${r.chapterId}] ${r.exerciseId} (${r.level}) [${r.issues.join(', ')}]`);
  console.log(`  UI Shown -> Prompt: "${r.viewPromptEn}" | Expected: "${r.viewExpectedIt}"`);
  console.log(`  Authored -> Prompt: "${r.origPromptEn}" | Expected: "${r.origExpectedIt}"`);
  console.log(`  Story Sentence: "${r.sourceText}"`);
  console.log('');
}

