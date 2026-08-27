import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { productionCardView } from '../src/production/flow';
import type { LexiconEntry, ProductionExercise, Sentence } from '../src/content/schemas';

const root = join(__dirname, '..', 'content');
const lexiconRaw = JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8'));
const lexiconById = new Map<string, LexiconEntry>(lexiconRaw.lexicon.map((l: LexiconEntry) => [l.lemmaId, l]));

const stories = [
  'luca-prima-di-roma-01',
  'luca-prima-di-roma-02',
  'luca-prima-di-roma-03',
  'luca-prima-di-roma-04',
  'luca-prima-di-roma-05',
  'luca-a-roma',
];

console.log('Starting full production exercise audit...\n');

let totalExercises = 0;
let beCount = 0;
let singleCopulaCount = 0;
const beList: Array<{ story: string; ch: string; exId: string; prompt: string; expected: string; source: string }> = [];

for (const storyId of stories) {
  const storyDir = join(root, 'stories', storyId);
  const prodFile = join(storyDir, 'production-exercises.json');
  if (!existsSync(prodFile)) continue;
  
  const prodJson = JSON.parse(readFileSync(prodFile, 'utf8'));
  const exercises: ProductionExercise[] = prodJson.exercises || [];
  
  console.log(`\n=================== STORY: ${storyId} (${exercises.length} exercises) ===================`);

  // Load chapters
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
                sentencesById.set(s.id, s);
                // Also key by chapterId-sentenceId if needed
                if (ch.id) sentencesById.set(`${ch.id}:${s.id}`, s);
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Group exercises by chapter
  const byChapter = new Map<string, ProductionExercise[]>();
  for (const ex of exercises) {
    const list = byChapter.get(ex.chapterId) || [];
    list.push(ex);
    byChapter.set(ex.chapterId, list);
  }

  for (const [chId, chExercises] of byChapter.entries()) {
    for (let i = 0; i < chExercises.length; i++) {
      const ex = chExercises[i];
      totalExercises++;
      const source = ex.sourceSentenceId ? (sentencesById.get(ex.sourceSentenceId) || sentencesById.get(`${ex.chapterId}:${ex.sourceSentenceId}`)) : null;

      const view = productionCardView(ex, i, chExercises.length, true, source, {
        storySentence: source,
        lexiconById,
      });

      const isBe = view.promptEn?.toLowerCase() === 'be' || view.promptEn?.toLowerCase() === 'to be';
      const isCopula = ['è', 'sono', 'siamo', 'sei', 'siete', 'era', 'erano', 'stato', 'stata'].includes(view.expectedIt?.toLowerCase() ?? '');
      
      if (isBe) {
        beCount++;
        beList.push({
          story: storyId,
          ch: chId,
          exId: ex.exerciseId,
          prompt: view.promptEn,
          expected: view.expectedIt ?? '',
          source: source?.text ?? '',
        });
      }
      if (isCopula) singleCopulaCount++;

      const flags: string[] = [];
      if (isBe) flags.push('PROMPT_IS_BE');
      if (isCopula) flags.push(`COPULA_${view.expectedIt}`);
      if (view.promptEn?.toLowerCase().includes('happy') || ex.promptEn?.toLowerCase().includes('happy')) flags.push('HAPPY');

      console.log(`[${chId}] #${i+1} (${ex.level})
  PromptEn: "${view.promptEn}" (orig: "${ex.promptEn}")
  ExpectedIt: "${view.expectedIt}" (orig: "${ex.expectedIt}")
  Source text: "${source?.text ?? 'NO_SOURCE'}"
  Flags: ${flags.join(', ') || 'NONE'}`);
    }
  }
}

console.log(`\n=================== AUDIT SUMMARY ===================`);
console.log(`Total exercises audited: ${totalExercises}`);
console.log(`Prompt is "be": ${beCount}`);
console.log(`Expected answer is a single copula form: ${singleCopulaCount}`);
console.log('\nAll occurrences of "be" prompts:');
for (const item of beList) {
  console.log(`  - [${item.story} / ${item.ch} / ${item.exId}] prompt: "${item.prompt}" -> expected: "${item.expected}" (story sentence: "${item.source}")`);
}

