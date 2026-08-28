const fs = require('fs');
const path = require('path');

// Load production exercises
const lucaStoryDir = path.join(__dirname, '../content/stories/luca-a-roma');
const exercisesPath = path.join(lucaStoryDir, 'production-exercises.json');
const lucaExercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

// Load chapters
const chaptersDir = path.join(lucaStoryDir, 'chapters');
const chaptersMap = new Map();
const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
for (const file of chapterFiles) {
  const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
  chaptersMap.set(content.id, content);
}

// Load lexicon
const lexiconPath = path.join(__dirname, '../content/lexicon/italian-core.json');
const lexiconData = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));
const lexiconById = new Map();
for (const entry of (lexiconData.lexicon || lexiconData)) {
  lexiconById.set(entry.lemmaId, entry);
}

console.log(`Loaded ${lucaExercises.exercises.length} exercises, ${chaptersMap.size} chapters, ${lexiconById.size} lexicon entries.`);

// Let's implement the EXACT logic of productionCardView and a1WordProductionDisplay from mobile/src/production/flow.ts
function countProductionWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const BARE_COPULA_OR_AUXILIARY = new Set([
  'è', 'sono', 'siamo', 'sei', 'siete', 'era', 'erano', 'stato', 'stata', 'stati', 'state', 'sarà', 'saranno',
  'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'aveva', 'avevano',
]);

function isBareCopulaOrAuxiliary(text) {
  const clean = text.trim().replace(/[.,;:!?…]+$/g, '').toLowerCase();
  return BARE_COPULA_OR_AUXILIARY.has(clean);
}

function isBareBePrompt(promptEn) {
  const clean = promptEn.trim().toLowerCase();
  return clean === 'be' || clean === 'to be';
}

function glossEnglish(entry) {
  let gloss = entry.english.split(/[,;/]/)[0]?.trim() || entry.english;
  if (entry.partOfSpeech === 'verb') {
    gloss = gloss.replace(/^to\s+/i, '').trim();
  }
  return gloss;
}

function isA1WordModeChunk(text) {
  const n = countProductionWords(text);
  return n > 0 && n <= 2;
}

function filterA1WordModeAlternatives(expectedIt, candidates) {
  const expectedKey = expectedIt.trim().toLowerCase();
  const seen = new Set(expectedKey ? [expectedKey] : []);
  const out = [];
  for (const raw of candidates) {
    const line = raw?.trim();
    if (!line) continue;
    if (!isA1WordModeChunk(line)) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function cleanProductionPromptEn(promptEn) {
  return promptEn.replace(/\s*say it in italian\.?\s*$/i, '').trim();
}

function resolveProductionFocusLemmas(exercise, sentence, lexicon, max) {
  if (exercise.focus && exercise.focus.length > 0) {
    return exercise.focus;
  }
  const result = [];
  for (const t of sentence.tokens || []) {
    if (t.lemmaId && lexicon.has(t.lemmaId) && !result.includes(t.lemmaId)) {
      result.push(t.lemmaId);
      if (result.length >= max) break;
    }
  }
  return result;
}

function a1WordProductionDisplay(exercise, context) {
  const overlayExpected = exercise.expectedIt.trim();
  const overlayPrompt = cleanProductionPromptEn(exercise.promptEn);
  const overlayWordCount = countProductionWords(overlayExpected);
  const extras = exercise.acceptableAnswers ?? [];

  if (overlayWordCount > 0 && overlayWordCount <= 2) {
    const isSingleBareCopula =
      overlayWordCount === 1 &&
      (isBareCopulaOrAuxiliary(overlayExpected) || isBareBePrompt(overlayPrompt));
    if (!isSingleBareCopula && !isBareBePrompt(overlayPrompt)) {
      return {
        promptEn: overlayPrompt,
        expectedIt: overlayExpected,
        acceptableAnswers: filterA1WordModeAlternatives(overlayExpected, extras),
      };
    }
  }

  const source = context.storySentence;
  const lexicon = context.lexiconById;
  if (source?.tokens?.length && lexicon?.size) {
    const focusIds = resolveProductionFocusLemmas(exercise, source, lexicon, 6);
    for (const primaryId of focusIds) {
      const entry = lexicon.get(primaryId);
      if (!entry) continue;
      const gloss = glossEnglish(entry);
      if (isBareBePrompt(gloss)) continue;

      const surfaceRaw =
        source.tokens.find((token) => token.lemmaId === entry.lemmaId)?.surface ?? entry.italian;
      const surface = surfaceRaw.replace(/[.,;:!?…]+$/g, '').trim() || entry.italian;

      if (isBareCopulaOrAuxiliary(surface) && countProductionWords(surface) === 1) {
        continue;
      }

      const primary = isA1WordModeChunk(surface) ? surface : entry.italian;
      return {
        promptEn: gloss,
        expectedIt: primary,
        acceptableAnswers: filterA1WordModeAlternatives(primary, [
          surface,
          entry.italian,
          ...extras,
        ]),
      };
    }
  }

  return {
    promptEn: overlayPrompt,
    expectedIt: overlayExpected,
    acceptableAnswers: filterA1WordModeAlternatives(overlayExpected, extras),
  };
}

function productionDisplayFromStory(exercise, storySentence, context) {
  if (exercise.level === 'A1') {
    return a1WordProductionDisplay(exercise, {
      storySentence: context.storySentence ?? storySentence,
      lexiconById: context.lexiconById,
    });
  }

  if (!storySentence?.text.trim()) {
    return {
      promptEn: cleanProductionPromptEn(exercise.promptEn),
      expectedIt: exercise.expectedIt,
      acceptableAnswers: [...(exercise.acceptableAnswers ?? [])],
    };
  }

  const sourceWordCount = countProductionWords(storySentence.text);
  const overlayWordCount = countProductionWords(exercise.expectedIt);

  if (sourceWordCount > 16 && overlayWordCount <= 10 && !storySentence.english?.trim()) {
    return {
      promptEn: cleanProductionPromptEn(exercise.promptEn),
      expectedIt: exercise.expectedIt,
      acceptableAnswers: [...(exercise.acceptableAnswers ?? [])],
    };
  }

  const expectedIt = storySentence.text.trim();
  const promptEn = cleanProductionPromptEn(storySentence.english?.trim() || exercise.promptEn);
  const extras = [exercise.expectedIt, ...(exercise.acceptableAnswers ?? [])]
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.toLowerCase() !== expectedIt.toLowerCase());

  return {
    promptEn,
    expectedIt,
    acceptableAnswers: [...new Set(extras)],
  };
}

// RUN AUDIT
const report = [];

for (const ex of lucaExercises.exercises) {
  const ch = chaptersMap.get(ex.chapterId);
  const sentences = ch ? ch.paragraphs.flatMap(p => p.sentences) : [];
  const sourceSentence = ex.sourceSentenceId ? sentences.find(s => s.id === ex.sourceSentenceId) : null;

  const runtime = productionDisplayFromStory(ex, sourceSentence, {
    storySentence: sourceSentence,
    lexiconById,
  });

  report.push({
    chapterId: ex.chapterId,
    chapterNumber: ch ? ch.number : null,
    level: ex.level,
    authored: {
      promptEn: ex.promptEn,
      expectedIt: ex.expectedIt,
      acceptable: ex.acceptableAnswers || [],
    },
    runtime: {
      promptEn: runtime.promptEn,
      expectedIt: runtime.expectedIt,
      acceptable: runtime.acceptableAnswers || [],
    },
    sourceSentence: sourceSentence ? { text: sourceSentence.text, english: sourceSentence.english } : null,
  });
}

fs.writeFileSync(path.join(__dirname, 'full-audit-report.json'), JSON.stringify(report, null, 2));
console.log(`Saved audit report with ${report.length} items.`);
