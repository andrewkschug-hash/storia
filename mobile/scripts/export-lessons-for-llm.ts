/**
 * Export Luca a Roma grammar notes, batch word-recap prompts, and Speak scenes
 * as a single LLM-readable text file.
 *
 * Run: npx tsx scripts/export-lessons-for-llm.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getContentBundle } from '../src/content';
import {
  grammarNoteForBatch,
  LESSON_BATCH_SIZE,
} from '../src/content/lessonBatches';
import { getSpeakScenes } from '../src/content/speakScenes';
import { createEmptyVocabularyState } from '../src/vocabulary/types';
import { ReviewService } from '../src/review/ReviewService';

const STORY_ID = 'luca-a-roma';
const outPath = join(
  __dirname,
  '../content/stories/luca-a-roma/LLM-LESSONS-GRAMMAR-RECAP-SPEAK.txt',
);

function hr(title: string): string {
  return `\n${'='.repeat(72)}\n${title}\n${'='.repeat(72)}\n\n`;
}

function section(title: string): string {
  return `\n${'-'.repeat(72)}\n${title}\n${'-'.repeat(72)}\n\n`;
}

const bundle = getContentBundle(STORY_ID);
const review = new ReviewService(bundle);
const emptyState = createEmptyVocabularyState();

let out = '';
out += 'LUCA A ROMA — LESSONS EXPORT FOR LLM REVIEW\n';
out += `Generated: ${new Date().toISOString().slice(0, 10)}\n`;
out += 'Status: LESSON LAYER FROZEN (2026-08-21) — see docs/PHASE-10.md\n';
out += 'Story: luca-a-roma (chapters 1–40)\n';
out += 'Includes: Grammar notes, Word recaps (batch review prompts), Say it in Italian (Speak scenes)\n';
out += 'Note: Word recaps are generated like an empty-vocab first-pass session (story backfill),\n';
out += '      so they show the default chapter-batch word set, not a specific learner’s struggle list.\n';

// --- Grammar ---
out += hr('PART 1 — GRAMMAR NOTES (after every 5th chapter)');
for (let end = LESSON_BATCH_SIZE; end <= 40; end += LESSON_BATCH_SIZE) {
  const start = end - LESSON_BATCH_SIZE + 1;
  const note = grammarNoteForBatch(start, end, STORY_ID);
  out += section(`GRAMMAR BATCH ${start}–${end}${note ? `: ${note.title}` : ' — (none authored)'}`);
  if (!note) {
    out += '(No grammar note for this batch.)\n';
    continue;
  }
  out += `Batch key: ${note.batchKey}\n`;
  out += `Title: ${note.title}\n\n`;
  out += `Intro:\n${note.intro}\n\n`;
  note.steps.forEach((step, i) => {
    out += `### Step ${i + 1}: ${step.title}\n\n`;
    out += `Explanation:\n${step.explanation}\n\n`;
    out += `Rule: ${step.rule}\n\n`;
    out += 'Examples:\n';
    for (const ex of step.examples) {
      out += `  IT: ${ex.italian}\n`;
      out += `  EN: ${ex.english}\n`;
    }
    out += '\n';
  });
  out += '### Practice\n\n';
  note.practice.forEach((q, i) => {
    out += `Q${i + 1}. ${q.prompt}\n`;
    q.choices.forEach((c, ci) => {
      out += `   ${ci === q.correctIndex ? '→' : ' '} [${ci}] ${c}\n`;
    });
    out += `   Explanation: ${q.explanation}\n\n`;
  });
}

// --- Word recaps ---
out += hr('PART 2 — WORD RECAPS (batch review prompts)');
for (let end = LESSON_BATCH_SIZE; end <= 40; end += LESSON_BATCH_SIZE) {
  const start = end - LESSON_BATCH_SIZE + 1;
  const session = review.createBatchSession(emptyState, bundle, start, end);
  const copy = review.batchRecapCopy(start, end, session);
  out += section(`WORD RECAP Chapters ${start}–${end}`);
  out += `Headline: ${copy.headline}\n`;
  out += `Detail: ${copy.detail}\n`;
  out += `Items in session: ${session.items.length} (dueCount pool: ${session.dueCount})\n\n`;
  session.items.forEach((item, i) => {
    out += `${i + 1}. [${item.kind}] ${item.id}\n`;
    out += `   Prompt EN: ${item.english}\n`;
    out += `   Choices:\n`;
    item.choices.forEach((c, ci) => {
      out += `     ${ci === item.correctIndex ? '→' : ' '} [${ci}] ${c}\n`;
    });
    out += '\n';
  });
}

// --- Speak ---
out += hr('PART 3 — SAY IT IN ITALIAN (Speak scenes)');
const scenes = getSpeakScenes(STORY_ID);
for (const scene of scenes) {
  out += section(
    `SPEAK: ${scene.id} — ${scene.title} (batchEnd ${scene.batchEnd}; source ch ${scene.sourceRange.start}–${scene.sourceRange.end})`,
  );
  out += `Summary EN: ${scene.summaryEn}\n\n`;
  scene.lines.forEach((line, i) => {
    out += `Line ${i + 1} (${line.id})\n`;
    out += `  EN prompt: ${line.en}\n`;
    out += `  Target IT: ${line.it}\n`;
    if (line.sourceChapterId) {
      out += `  Source: ${line.sourceChapterId}:${line.sourceSentenceId ?? '?'}\n`;
    }
    if (line.acceptableAnswers?.length) {
      out += '  Acceptable answers:\n';
      for (const a of line.acceptableAnswers) out += `    - ${a}\n`;
    }
    out += '\n';
  });
}

out += hr('END OF EXPORT');
writeFileSync(outPath, out, 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`Bytes: ${Buffer.byteLength(out, 'utf8')}, lines: ${out.split('\n').length}`);
console.log(`Grammar batches: ${40 / LESSON_BATCH_SIZE}`);
console.log(`Speak scenes: ${scenes.length}`);
