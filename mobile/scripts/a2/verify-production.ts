/**
 * Phase 11A — read-only A2 production verification.
 *
 * Treats authored JSON under content/stories/luca-a-roma as the source of truth.
 * NEVER writes to chapter JSON, manifest, sentence-english, adaptive, arcs, or lexicon.
 * NEVER uses scripts/a2/story.js as production SOT (draft compare is report-only).
 *
 * Run from mobile/: npx tsx scripts/a2/verify-production.ts
 */
import { createRequire } from 'module';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { loadContentBundle } from '../../src/content/loadContentBundle';
import { ContentValidationError } from '../../src/content/tokenize';
import type { Chapter, ContentBundle } from '../../src/content/schemas';

const BANNER = `
╔══════════════════════════════════════════════════════════════════╗
║  THIS SCRIPT NEVER WRITES TO AUTHORED STORY CONTENT              ║
║  Authored chapter JSON / manifest / EN / adaptive / arcs /       ║
║  italian-core are READ-ONLY. story.js is NOT production SOT.     ║
╚══════════════════════════════════════════════════════════════════╝
`.trim();

const EXPECTED_CHAPTERS = 40;
const QUESTIONS_PER_CHAPTER = 3;
const CH40_TITLE_IT = 'Per adesso';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mobileRoot = join(__dirname, '..', '..');
const contentRoot = join(mobileRoot, 'content');
const storyPath = join(contentRoot, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

type Severity = 'error' | 'advisory';

type Finding = {
  severity: Severity;
  code: string;
  message: string;
};

const findings: Finding[] = [];

function error(code: string, message: string) {
  findings.push({ severity: 'error', code, message });
}

function advisory(code: string, message: string) {
  findings.push({ severity: 'advisory', code, message });
}

function loadJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function loadAuthoredBundle(): ContentBundle {
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = loadJson(join(chaptersDir, file));
  }
  return loadContentBundle({
    charactersJson: loadJson(join(contentRoot, 'characters.json')),
    locationsJson: loadJson(join(contentRoot, 'locations.json')),
    lexiconJson: loadJson(join(contentRoot, 'lexicon', 'italian-core.json')),
    manifestJson: loadJson(join(storyPath, 'manifest.json')),
    chapterJsonByFile,
    adaptiveJson: loadJson(join(storyPath, 'adaptive-variants.json')),
    translationsJson: loadJson(join(storyPath, 'sentence-english.json')),
    arcsJson: loadJson(join(storyPath, 'arcs.json')),
    storyPath: 'stories/luca-a-roma',
  });
}

function sentenceIds(chapter: Chapter): string[] {
  return chapter.paragraphs.flatMap((p) => p.sentences.map((s) => s.id));
}

function parseSentenceNum(id: string): number | null {
  const m = /^s(\d+)$/.exec(id);
  return m ? Number(m[1]) : null;
}

function verifyChapterOrder(bundle: ContentBundle) {
  const numbers = [...bundle.chapters.values()]
    .map((c) => c.number)
    .sort((a, b) => a - b);
  if (numbers.length !== EXPECTED_CHAPTERS) {
    error(
      'chapter-count',
      `Expected ${EXPECTED_CHAPTERS} chapters, got ${numbers.length}`,
    );
  }
  for (let i = 0; i < EXPECTED_CHAPTERS; i++) {
    if (numbers[i] !== i + 1) {
      error(
        'chapter-order',
        `Chapters must be contiguous 1–${EXPECTED_CHAPTERS}. Got: ${numbers.join(', ')}`,
      );
      break;
    }
  }
  const manifestNums = bundle.story.chapters.map((c) => c.number);
  for (let i = 0; i < manifestNums.length; i++) {
    if (manifestNums[i] !== i + 1) {
      error(
        'manifest-order',
        `Manifest chapters must be listed 1…N ascending. Got: ${manifestNums.join(', ')}`,
      );
      break;
    }
  }
}

function verifyManifestTitles(bundle: ContentBundle) {
  for (const summary of bundle.story.chapters) {
    const chapter = bundle.chapters.get(summary.id);
    if (!chapter) {
      error('manifest-missing-chapter', `Manifest lists ${summary.id} but chapter not loaded`);
      continue;
    }
    if (summary.title !== chapter.title || summary.titleIt !== chapter.titleIt) {
      error(
        'manifest-title-mismatch',
        `Ch${chapter.number}: manifest title/titleIt (${summary.title} / ${summary.titleIt}) ` +
          `≠ chapter JSON (${chapter.title} / ${chapter.titleIt})`,
      );
    }
  }
}

function verifySentenceIds(bundle: ContentBundle) {
  for (const chapter of bundle.chapters.values()) {
    const ids = sentenceIds(chapter);
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        error('sentence-id-duplicate', `Ch${chapter.number}: duplicate sentence id ${id}`);
      }
      seen.add(id);
      if (!/^s\d+$/.test(id)) {
        error('sentence-id-format', `Ch${chapter.number}: unexpected sentence id "${id}"`);
      }
    }

    const nums = ids.map(parseSentenceNum);
    if (nums.some((n) => n === null)) continue;

    const asNums = nums as number[];
    const missing: number[] = [];
    const min = Math.min(...asNums);
    const max = Math.max(...asNums);
    for (let n = min; n <= max; n++) {
      if (!asNums.includes(n)) missing.push(n);
    }
    const startsAtOne = min === 1;
    const contiguousOrder = asNums.every((v, i) => i === 0 || v === asNums[i - 1] + 1);
    if (!startsAtOne || missing.length > 0 || !contiguousOrder) {
      advisory(
        'sentence-id-gaps',
        `Ch${chapter.number}: non-contiguous sentence IDs ` +
          `(count=${ids.length}, range=s${String(min).padStart(2, '0')}–s${String(max).padStart(2, '0')}` +
          `${missing.length ? `, missing=${missing.map((n) => `s${String(n).padStart(2, '0')}`).join(',')}` : ''})`,
      );
    }
  }
}

function verifyEnglishCoverage(bundle: ContentBundle) {
  // loadContentBundle already enforces 1:1 EN coverage; restate packaging counts.
  let standard = 0;
  let extended = 0;
  for (const chapter of bundle.chapters.values()) {
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        for (const variant of sentence.variants) {
          if (!variant.english) {
            error(
              'english-missing',
              `Missing English for ${chapter.id}:${sentence.id}` +
                (variant.id === 'standard' ? '' : `:${variant.id}`),
            );
          } else if (variant.id === 'standard') {
            standard += 1;
          } else {
            extended += 1;
          }
        }
      }
    }
  }
  console.log(`English 1:1 — standard keys: ${standard}, extended/adaptive keys: ${extended}`);
}

function verifyAdaptive(bundle: ContentBundle) {
  const adaptiveRaw = loadJson(join(storyPath, 'adaptive-variants.json')) as {
    sentences: Record<string, { variants?: { id: string }[] }>;
  };
  const keys = Object.keys(adaptiveRaw.sentences);
  let matched = 0;
  for (const key of keys) {
    const m = /^([^:]+):([^:]+)$/.exec(key);
    if (!m) {
      error('adaptive-key-format', `Bad adaptive key "${key}"`);
      continue;
    }
    const [, chapterId, sentenceId] = m;
    const chapter = bundle.chapters.get(chapterId);
    if (!chapter) {
      error('adaptive-orphan-chapter', `Adaptive key "${key}" — unknown chapter`);
      continue;
    }
    const sentence = chapter.paragraphs
      .flatMap((p) => p.sentences)
      .find((s) => s.id === sentenceId);
    if (!sentence) {
      error('adaptive-orphan-sentence', `Adaptive key "${key}" — unknown sentence`);
      continue;
    }
    matched += 1;
    const overlay = adaptiveRaw.sentences[key];
    const variantIds = new Set(
      sentence.variants.filter((v) => v.id !== 'standard').map((v) => v.id),
    );
    for (const v of overlay.variants ?? []) {
      if (!variantIds.has(v.id)) {
        error(
          'adaptive-variant-id',
          `${key}: overlay variant "${v.id}" not present after merge`,
        );
      }
      const enKey = `${key}:${v.id}`;
      const hasEn = sentence.variants.some((sv) => sv.id === v.id && !!sv.english);
      if (!hasEn) {
        error('adaptive-english', `Missing extended English for ${enKey}`);
      }
    }
  }
  console.log(`Adaptive overlays — ${matched}/${keys.length} keys resolve to runtime sentences`);
}

function verifyQuestions(bundle: ContentBundle) {
  let total = 0;
  for (const chapter of bundle.chapters.values()) {
    if (chapter.questions.length !== QUESTIONS_PER_CHAPTER) {
      error(
        'questions-count',
        `Ch${chapter.number}: expected ${QUESTIONS_PER_CHAPTER} questions, got ${chapter.questions.length}`,
      );
    }
    const seen = new Set<string>();
    for (const q of chapter.questions) {
      total += 1;
      if (seen.has(q.id)) {
        error('question-id-duplicate', `Ch${chapter.number}: duplicate question id ${q.id}`);
      }
      seen.add(q.id);
      if (q.chapterId !== chapter.id) {
        error(
          'question-chapter-ref',
          `Question ${q.id}: chapterId "${q.chapterId}" ≠ chapter "${chapter.id}"`,
        );
      }
      if (q.correctChoice < 0 || q.correctChoice >= q.choices.length) {
        error(
          'question-choice-index',
          `Question ${q.id}: correctChoice ${q.correctChoice} out of range (0..${q.choices.length - 1})`,
        );
      }
    }
  }
  console.log(`Questions — ${total} total (expect ${EXPECTED_CHAPTERS * QUESTIONS_PER_CHAPTER})`);
}

function verifyLemmas(bundle: ContentBundle) {
  const unknown = new Map<string, string[]>();
  let tokenCount = 0;
  for (const chapter of bundle.chapters.values()) {
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        for (const variant of sentence.variants) {
          for (const token of variant.tokens) {
            tokenCount += 1;
            if (!bundle.lexiconById.has(token.lemmaId)) {
              const where = `${chapter.id}:${sentence.id}:${variant.id}`;
              const list = unknown.get(token.lemmaId) ?? [];
              list.push(where);
              unknown.set(token.lemmaId, list);
            }
          }
        }
      }
    }
  }
  if (unknown.size === 0) {
    console.log(`Lemmas — ${tokenCount} runtime tokens; UNKNOWN: 0`);
  } else {
    console.log(`Lemmas — ${tokenCount} runtime tokens; UNKNOWN: ${unknown.size}`);
    for (const [lemmaId, where] of [...unknown.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      error(
        'UNKNOWN',
        `UNKNOWN lemma "${lemmaId}" at ${where.slice(0, 3).join(', ')}${where.length > 3 ? ` (+${where.length - 3} more)` : ''}`,
      );
    }
  }
}

function verifyArcs(bundle: ContentBundle) {
  const arcs = bundle.story.arcs ?? [];
  if (arcs.length === 0) {
    error('arcs-missing', 'No arcs loaded for runtime story');
    return;
  }
  for (const chapter of bundle.chapters.values()) {
    if (!chapter.arcId) {
      error('arc-unassigned', `Ch${chapter.number}: no arc assigned`);
    }
  }
  const covering = arcs.filter(
    (a) => a.status === 'available' && a.chapterEnd >= a.chapterStart,
  );
  for (let n = 1; n <= EXPECTED_CHAPTERS; n++) {
    const hit = covering.filter((a) => n >= a.chapterStart && n <= a.chapterEnd);
    if (hit.length === 0) {
      error('arc-coverage', `Chapter ${n} not covered by any available arc`);
    } else if (hit.length > 1) {
      advisory(
        'arc-overlap',
        `Chapter ${n} covered by multiple available arcs: ${hit.map((a) => a.id).join(', ')}`,
      );
    }
  }
  console.log(
    `Arcs — ${arcs.length} defined; available covering 1–${EXPECTED_CHAPTERS}: ` +
      covering.map((a) => `${a.id}[${a.chapterStart}–${a.chapterEnd}]`).join(', '),
  );
}

function verifyChapter40Title(bundle: ContentBundle) {
  const ch40 = bundle.chapters.get('luca-a-roma-40');
  if (!ch40) {
    error('ch40-missing', 'Chapter 40 not loaded');
    return;
  }
  if (ch40.titleIt !== CH40_TITLE_IT) {
    error(
      'ch40-title',
      `Ch40 titleIt must be "${CH40_TITLE_IT}", got "${ch40.titleIt}"`,
    );
  } else {
    console.log(`Ch40 titleIt OK — "${ch40.titleIt}"`);
  }
}

type PackagingRow = {
  number: number;
  id: string;
  titleIt: string;
  titleEn: string;
  sentences: number;
  questions: number;
  adaptive: number;
  words: number;
  arcId: string | null;
};

function reportPackaging(bundle: ContentBundle): PackagingRow[] {
  const adaptiveRaw = loadJson(join(storyPath, 'adaptive-variants.json')) as {
    sentences: Record<string, unknown>;
  };
  const rows: PackagingRow[] = [];
  for (const chapter of [...bundle.chapters.values()].sort((a, b) => a.number - b.number)) {
    const sentences = sentenceIds(chapter).length;
    const adaptive = Object.keys(adaptiveRaw.sentences).filter((k) =>
      k.startsWith(`${chapter.id}:`),
    ).length;
    const words = chapter.paragraphs.reduce(
      (sum, p) => sum + p.sentences.reduce((s, sent) => s + sent.tokens.length, 0),
      0,
    );
    rows.push({
      number: chapter.number,
      id: chapter.id,
      titleIt: chapter.titleIt,
      titleEn: chapter.title,
      sentences,
      questions: chapter.questions.length,
      adaptive,
      words,
      arcId: chapter.arcId ?? null,
    });
  }
  console.log('\n— What would be packaged (authored SOT; no regeneration) —');
  console.log(
    'ch'.padStart(3),
    'titleIt'.padEnd(28),
    'sents'.padStart(5),
    'qs'.padStart(3),
    'adap'.padStart(4),
    'words'.padStart(5),
    'arc',
  );
  for (const row of rows) {
    console.log(
      String(row.number).padStart(3),
      row.titleIt.slice(0, 28).padEnd(28),
      String(row.sentences).padStart(5),
      String(row.questions).padStart(3),
      String(row.adaptive).padStart(4),
      String(row.words).padStart(5),
      row.arcId ?? '—',
    );
  }
  return rows;
}

/**
 * Optional draft drift report. READ-ONLY — never copy/merge/auto-fix.
 * Exit code ignores draft staleness when authored content is valid.
 */
function reportDraftDrift() {
  const storyJs = join(__dirname, 'story.js');
  if (!existsSync(storyJs)) {
    advisory('draft-missing', 'scripts/a2/story.js not found — skipped draft compare');
    return;
  }
  try {
    const require = createRequire(import.meta.url);
    const mod = require(storyJs) as {
      chapters?: Array<{
        number: number;
        title: string;
        titleIt: string;
        paragraphs?: unknown[][];
        questions?: unknown[];
      }>;
    };
    const drafts = (mod.chapters ?? []).filter((c) => c.number >= 25 && c.number <= 40);
    const authoredByNum = new Map<number, { title: string; titleIt: string; sentences: number; questions: number }>();
    for (const file of readdirSync(chaptersDir)) {
      if (!/^chapter-\d+\.json$/.test(file)) continue;
      const raw = loadJson(join(chaptersDir, file)) as {
        number: number;
        title: string;
        titleIt: string;
        paragraphs: { sentences: unknown[] }[];
        questions: unknown[];
      };
      if (raw.number < 25 || raw.number > 40) continue;
      authoredByNum.set(raw.number, {
        title: raw.title,
        titleIt: raw.titleIt,
        sentences: raw.paragraphs.reduce((n, p) => n + p.sentences.length, 0),
        questions: raw.questions.length,
      });
    }

    const drifts: string[] = [];
    for (const d of drafts) {
      const a = authoredByNum.get(d.number);
      if (!a) {
        drifts.push(`Ch${d.number}: draft exists but authored chapter missing`);
        continue;
      }
      const draftSentences = (d.paragraphs ?? []).reduce((n, p) => n + p.length, 0);
      const draftQuestions = d.questions?.length ?? 0;
      if (a.title !== d.title || a.titleIt !== d.titleIt) {
        drifts.push(
          `Ch${d.number}: title drift — authored "${a.titleIt}" / "${a.title}" vs draft "${d.titleIt}" / "${d.title}"`,
        );
      }
      if (a.sentences !== draftSentences) {
        drifts.push(
          `Ch${d.number}: sentence-count drift — authored ${a.sentences} vs draft ${draftSentences}`,
        );
      }
      if (a.questions !== draftQuestions) {
        drifts.push(
          `Ch${d.number}: question-count drift — authored ${a.questions} vs draft ${draftQuestions}`,
        );
      }
    }

    console.log('\n— A2 draft (story.js) vs authored (REPORT ONLY; never auto-fix) —');
    if (drifts.length === 0) {
      console.log('No title/count drift detected between story.js drafts and authored Ch25–40.');
    } else {
      console.log(
        `${drifts.length} drift note(s). Authored JSON remains SOT; build.js must stay quarantined.`,
      );
      for (const line of drifts) {
        advisory('draft-drift', line);
        console.log(`  ADVISORY  ${line}`);
      }
    }
  } catch (e) {
    advisory(
      'draft-compare-failed',
      `Could not compare story.js drafts (report-only): ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

function main() {
  console.log(BANNER);
  console.log('');
  console.log('Phase 11A production verification — authored JSON is SOT');
  console.log(`Story path: ${storyPath}`);
  console.log('');

  let bundle: ContentBundle;
  try {
    bundle = loadAuthoredBundle();
    console.log('loadContentBundle — OK (schema, lemmas, EN 1:1, adaptive keys, arcs)');
  } catch (e) {
    if (e instanceof ContentValidationError) {
      const msg = String(e);
      if (/Unknown lemma ID/i.test(msg)) {
        error('UNKNOWN', msg);
      } else {
        error('bundle-load', msg);
      }
    } else {
      error('bundle-load', e instanceof Error ? e.message : String(e));
    }
    printFindingsAndExit();
    return;
  }

  console.log(`Chapters loaded: ${bundle.chapters.size}`);
  console.log(`Lexicon entries: ${bundle.lexicon.length}`);
  console.log('');

  verifyChapterOrder(bundle);
  verifyManifestTitles(bundle);
  verifySentenceIds(bundle);
  verifyEnglishCoverage(bundle);
  verifyAdaptive(bundle);
  verifyQuestions(bundle);
  verifyLemmas(bundle);
  verifyArcs(bundle);
  verifyChapter40Title(bundle);
  reportPackaging(bundle);
  reportDraftDrift();

  printFindingsAndExit();
}

function printFindingsAndExit() {
  const errors = findings.filter((f) => f.severity === 'error');
  const advisories = findings.filter((f) => f.severity === 'advisory');

  console.log('\n— Findings —');
  if (errors.length === 0 && advisories.length === 0) {
    console.log('None');
  }
  for (const f of errors) {
    console.log(`ERROR [${f.code}] ${f.message}`);
  }
  for (const f of advisories) {
    console.log(`ADVISORY [${f.code}] ${f.message}`);
  }

  console.log('');
  if (errors.length > 0) {
    console.log(`PRODUCTION INVALID — ${errors.length} error(s), ${advisories.length} advisory(ies)`);
    console.log('Exit 1 (authored content failed verification)');
    process.exit(1);
  }

  console.log(
    `PRODUCTION READY (authored SOT) — 0 errors, ${advisories.length} advisory(ies)`,
  );
  console.log(
    'Stale A2 drafts (if any) do not block; do NOT run scripts/a2/build.js against production.',
  );
  console.log('Exit 0');
  process.exit(0);
}

main();
