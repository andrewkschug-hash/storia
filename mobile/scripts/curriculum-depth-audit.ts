/**
 * One-off curriculum depth audit. Prints JSON for A1/A1+/A2 coverage.
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { auditStoryCefr } from '../src/cefr/chapter';
import { deriveCefrMetadata } from '../src/cefr/lexicon';
import { profileFor } from '../src/cefr/profiles';
import { loadContentBundle } from '../src/content/loadContentBundle';
import { auditStoryVocabulary } from '../src/content/vocabAudit';
import type { Chapter } from '../src/content/schemas';

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
  adaptiveJson: JSON.parse(readFileSync(join(storyPath, 'adaptive-variants.json'), 'utf8')),
  translationsJson: JSON.parse(readFileSync(join(storyPath, 'sentence-english.json'), 'utf8')),
  arcsJson: JSON.parse(readFileSync(join(storyPath, 'arcs.json'), 'utf8')),
  storyPath: 'stories/luca-a-roma',
});

const vocab = auditStoryVocabulary(bundle);
const cefr = auditStoryCefr(bundle);
const chapters = [...bundle.chapters.values()].sort((a, b) => a.number - b.number);

type ArcId = 'A1' | 'A1+' | 'A2';
function arcOf(n: number): ArcId {
  if (n <= 20) return 'A1';
  if (n <= 24) return 'A1+';
  return 'A2';
}

const firstSeen = new Map<string, number>();
const lemmaCounts = new Map<string, number>();
const lemmaByChapter = new Map<number, Set<string>>();

for (const ch of chapters) {
  const set = new Set<string>();
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      for (const t of s.tokens) {
        set.add(t.lemmaId);
        lemmaCounts.set(t.lemmaId, (lemmaCounts.get(t.lemmaId) ?? 0) + 1);
        if (!firstSeen.has(t.lemmaId)) firstSeen.set(t.lemmaId, ch.number);
      }
    }
  }
  lemmaByChapter.set(ch.number, set);
}

const surfaceByChapter = new Map<number, string>();
for (const ch of chapters) {
  const text = ch.paragraphs
    .flatMap((p) => p.sentences.map((s) => s.text.toLowerCase()))
    .join(' ');
  surfaceByChapter.set(ch.number, text);
}

function lemmasThrough(maxChapter: number): Set<string> {
  const out = new Set<string>();
  for (const [lemma, n] of firstSeen) if (n <= maxChapter) out.add(lemma);
  return out;
}

function hapaxThrough(maxChapter: number): number {
  let n = 0;
  for (const [lemma, first] of firstSeen) {
    if (first > maxChapter) continue;
    const count = lemmaCounts.get(lemma) ?? 0;
    // count across all chapters is fine for "ever repeated"; also count only through max?
    let through = 0;
    for (const ch of chapters) {
      if (ch.number > maxChapter) break;
      if (lemmaByChapter.get(ch.number)?.has(lemma)) {
        for (const p of ch.paragraphs)
          for (const s of p.sentences)
            for (const t of s.tokens) if (t.lemmaId === lemma) through += 1;
      }
    }
    if (through <= 1) n += 1;
  }
  return n;
}

function posThrough(maxChapter: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const lemma of lemmasThrough(maxChapter)) {
    const entry = bundle.lexiconById.get(lemma);
    const pos = entry?.partOfSpeech ?? 'unknown';
    out[pos] = (out[pos] ?? 0) + 1;
  }
  return out;
}

function cefrMetaThrough(maxChapter: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const lemma of lemmasThrough(maxChapter)) {
    const entry = bundle.lexiconById.get(lemma);
    if (!entry) {
      out.unlexiconed = (out.unlexiconed ?? 0) + 1;
      continue;
    }
    const meta = deriveCefrMetadata(entry);
    out[meta.cefrLevel] = (out[meta.cefrLevel] ?? 0) + 1;
  }
  return out;
}

const TOPIC_SETS: Record<string, string[]> = {
  greetings_identity: [
    'ciao', 'buongiorno', 'buonasera', 'arrivederci', 'piacere', 'nome', 'chiamarsi',
    'italiano', 'straniero', 'anni', 'età', 'età', 'io', 'tu',
  ],
  numbers_time: [
    'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci',
    'ora', 'minuto', 'giorno', 'settimana', 'mese', 'anno', 'oggi', 'domani', 'ieri',
    'mattina', 'pomeriggio', 'sera', 'notte', 'lunedì', 'martedì', 'mercoledì',
    'giovedì', 'venerdì', 'sabato', 'domenica', 'tempo', 'presto', 'tardi',
  ],
  family: [
    'famiglia', 'madre', 'padre', 'mamma', 'papà', 'fratello', 'sorella', 'nonna',
    'nonno', 'figlio', 'figlia', 'zio', 'zia', 'cugino', 'marito', 'moglie',
  ],
  food_cafe: [
    'caffè', 'bar', 'acqua', 'pane', 'pizza', 'pasta', 'mangiare', 'bere', 'colazione',
    'pranzo', 'cena', 'vino', 'birra', 'conto', 'cameriere', 'menu', 'cucina', 'cibo',
    'affamato', 'sete', 'gusto', 'buono',
  ],
  city_directions: [
    'città', 'strada', 'piazza', 'stazione', 'destra', 'sinistra', 'dritto', 'vicino',
    'lontano', 'mappa', 'autobus', 'metro', 'treno', 'taxi', 'via', 'quartiere',
    'centro', 'roma',
  ],
  housing: [
    'casa', 'appartamento', 'stanza', 'camera', 'letto', 'cucina', 'bagno', 'affitto',
    'padrone', 'chiave', 'porta', 'finestra', 'tavolo', 'sedia',
  ],
  shopping_money: [
    'comprare', 'vendere', 'negozio', 'prezzo', 'euro', 'soldi', 'costare', 'pagare',
    'caro', 'economico', 'mercato', 'supermercato',
  ],
  work: [
    'lavoro', 'lavorare', 'capo', 'collega', 'orario', 'stipendio', 'turno', 'cliente',
    'aiutare', 'occupato', 'libero',
  ],
  daily_routine: [
    'alzarsi', 'dormire', 'svegliarsi', 'lavorare', 'camminare', 'andare', 'tornare',
    'uscire', 'entrare', 'aspettare', 'fare',
  ],
  weather: ['sole', 'pioggia', 'freddo', 'caldo', 'nuvoloso', 'vento', 'tempo'],
  travel: [
    'viaggio', 'viaggiare', 'partire', 'arrivare', 'biglietto', 'valigia', 'albergo',
    'hotel', 'prenotare', 'vacanza', 'treno', 'autobus',
  ],
  health: [
    'malato', 'dottore', 'medico', 'ospedale', 'farmacia', 'male', 'dolore', 'febbre',
    'testa', 'stomaco', 'stanco',
  ],
  feelings_opinions: [
    'pensare', 'credere', 'opinione', 'felice', 'triste', 'preoccupato', 'nervoso',
    'contento', 'paura', 'sperare', 'volere', 'piacere', 'amare', 'dubbio',
  ],
  plans_future: [
    'domani', 'dopo', 'futuro', 'piano', 'provare', 'decidere', 'intenzione',
    'settimana',
  ],
};

function topicHits(maxChapter: number): Record<string, { hits: number; lemmas: string[]; missing: string[] }> {
  const present = lemmasThrough(maxChapter);
  const out: Record<string, { hits: number; lemmas: string[]; missing: string[] }> = {};
  for (const [topic, needles] of Object.entries(TOPIC_SETS)) {
    const found: string[] = [];
    const missing: string[] = [];
    for (const n of needles) {
      if (present.has(n)) found.push(n);
      else missing.push(n);
    }
    out[topic] = { hits: found.length, lemmas: found, missing };
  }
  return out;
}

const TENSE_PATTERNS: Record<string, RegExp> = {
  present: /\b(sono|sei|è|siamo|siete|ho|hai|ha|abbiamo|hanno|vado|vai|va|andiamo|vanno|faccio|fa|facciamo|fanno|voglio|vuole|posso|può|devo|deve)\b/g,
  passato_prossimo: /\b(ho|hai|ha|abbiamo|hanno|sono|è|siamo)\s+\w+(ato|uto|ito|so|to)\b/g,
  imperfetto: /\b(ero|eri|era|eravamo|erano|avevo|aveva|avevamo|avevano|andavo|andava|facevo|faceva|volevo|voleva|potevo|poteva)\b/g,
  futuro: /\b(sarò|sarà|saranno|avrò|avrà|andrò|andrà|andremo|farò|farà|vorrò|potrò|dovrò)\b/g,
  condizionale: /\b(sarei|sarebbe|avrei|avrebbe|vorrei|vorrebbe|potrei|potrebbe|dovrei|dovrebbe)\b/g,
  congiuntivo: /\b(sia|siano|abbia|abbiano|vada|vada|faccia|voglia|possa|debba|che\s+\w+\s+(sia|abbia|vada))\b/g,
  stare_gerund: /\b(sto|sta|stiamo|stanno)\s+\w+ando\b/g,
};

function tenseHits(maxChapter: number): Record<string, number> {
  const text = chapters
    .filter((c) => c.number <= maxChapter)
    .map((c) => surfaceByChapter.get(c.number) ?? '')
    .join(' ');
  const out: Record<string, number> = {};
  for (const [name, re] of Object.entries(TENSE_PATTERNS)) {
    out[name] = [...text.matchAll(re)].length;
  }
  return out;
}

function questionTypes(chs: Chapter[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const ch of chs) {
    for (const q of ch.questions) {
      out[q.type] = (out[q.type] ?? 0) + 1;
    }
  }
  return out;
}

function arcSlice(id: ArcId) {
  const range = id === 'A1' ? [1, 20] : id === 'A1+' ? [21, 24] : [25, 40];
  const chs = chapters.filter((c) => c.number >= range[0] && c.number <= range[1]);
  const cefrRows = cefr.filter((c) => c.chapterNumber >= range[0] && c.chapterNumber <= range[1]);
  const vocabRows = vocab.chapters.filter((c) => c.chapterNumber >= range[0] && c.chapterNumber <= range[1]);
  const words = cefrRows.map((c) => c.wordCount);
  const newCounts = vocabRows.map((c) => c.newCount);
  const profile = profileFor(id === 'A1+' ? 'A1+' : id);
  const cumulative = lemmasThrough(range[1]);
  const introducedInArc = [...firstSeen.entries()].filter(([, n]) => n >= range[0] && n <= range[1]).length;
  const hapax = hapaxThrough(range[1]);
  const statusCounts: Record<string, number> = {};
  const estimatedCounts: Record<string, number> = {};
  for (const row of cefrRows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    estimatedCounts[row.estimated] = (estimatedCounts[row.estimated] ?? 0) + 1;
  }
  const wordInRange = cefrRows.filter(
    (c) => c.wordCount >= profile.wordCountRange[0] && c.wordCount <= profile.wordCountRange[1],
  ).length;
  const avgSent = cefrRows.reduce((s, c) => s + c.averageSentenceLength, 0) / (cefrRows.length || 1);
  const avgDialogue = cefrRows.reduce((s, c) => s + c.dialoguePercent, 0) / (cefrRows.length || 1);
  const avgNewPct = vocabRows.reduce((s, c) => s + c.newPercent, 0) / (vocabRows.length || 1);
  const qCount = chs.reduce((s, c) => s + c.questions.length, 0);
  const flags = cefrRows.flatMap((c) => c.incompleteFlags.map((f) => ({ ch: c.chapterNumber, f })));

  return {
    id,
    chapters: chs.length,
    range,
    profileVocabTarget: profile.targetVocabularySize,
    profileWordRange: profile.wordCountRange,
    profileAvgSentence: profile.averageSentenceLength,
    cumulativeUniqueLemmas: cumulative.size,
    introducedInArc,
    hapaxThroughEnd: hapax,
    hapaxPct: Math.round((hapax / Math.max(1, cumulative.size)) * 1000) / 10,
    totalWords: words.reduce((a, b) => a + b, 0),
    avgWords: Math.round(words.reduce((a, b) => a + b, 0) / (words.length || 1)),
    minWords: Math.min(...words),
    maxWords: Math.max(...words),
    wordCountInRange: wordInRange,
    avgSentenceLength: Math.round(avgSent * 10) / 10,
    avgDialoguePct: Math.round(avgDialogue * 10) / 10,
    avgNewPct: Math.round(avgNewPct * 10) / 10,
    avgNewLemmas: Math.round((newCounts.reduce((a, b) => a + b, 0) / (newCounts.length || 1)) * 10) / 10,
    maxNewLemmas: Math.max(...newCounts),
    questionCount: qCount,
    questionTypes: questionTypes(chs),
    cefrStatus: statusCounts,
    cefrEstimated: estimatedCounts,
    pos: posThrough(range[1]),
    lexiconCefr: cefrMetaThrough(range[1]),
    tenses: tenseHits(range[1]),
    topics: topicHits(range[1]),
    incompleteFlags: flags,
    chapterRows: cefrRows.map((c) => {
      const v = vocabRows.find((x) => x.chapterNumber === c.chapterNumber)!;
      return {
        n: c.chapterNumber,
        title: c.titleIt,
        words: c.wordCount,
        avgSent: c.averageSentenceLength,
        dialogue: c.dialoguePercent,
        newLemmas: v.newCount,
        newPct: Math.round(v.newPercent * 10) / 10,
        unique: v.uniqueLemmaCount,
        estimated: c.estimated,
        status: c.status,
        overall: c.overallScore,
        questions: chapters.find((ch) => ch.number === c.chapterNumber)?.questions.length ?? 0,
        qTypes: questionTypes(chapters.filter((ch) => ch.number === c.chapterNumber)),
        narrative: c.narrativeComplexity,
        audio: c.audioCompletion,
      };
    }),
  };
}

const a1 = arcSlice('A1');
const a1p = arcSlice('A1+');
const a2 = arcSlice('A2');

const lexiconTotal = bundle.lexicon.length;
const usedLemmas = firstSeen.size;
const unusedLexicon = lexiconTotal - [...bundle.lexicon].filter((e) => firstSeen.has(e.lemmaId)).length;

const onceOnly = [...lemmaCounts.entries()].filter(([, n]) => n === 1).length;
const twiceOnly = [...lemmaCounts.entries()].filter(([, n]) => n === 2).length;
const wellRecycled = [...lemmaCounts.entries()].filter(([, n]) => n >= 5).length;

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString().slice(0, 10),
      story: bundle.story.id,
      chapters: chapters.length,
      lexiconEntries: lexiconTotal,
      lemmasUsedInStory: usedLemmas,
      unusedLexiconEntries: unusedLexicon,
      onceOnlyLemmas: onceOnly,
      twiceOnlyLemmas: twiceOnly,
      lemmasSeen5plus: wellRecycled,
      profiles: {
        A1: profileFor('A1').targetVocabularySize,
        'A1+': profileFor('A1+').targetVocabularySize,
        A2: profileFor('A2').targetVocabularySize,
      },
      externalBenchmarks: {
        typicalA1ActiveVocab: '500–700 (coursebook / CEFR illustrative)',
        typicalA2ActiveVocab: '1000–1500',
        storiaA1Target: 280,
        storiaA2Target: 500,
        a1HoursGuided: '90–100 classroom hours (indicative)',
        a2HoursGuided: '+150–200 from A1 (indicative)',
      },
      arcs: { A1: a1, 'A1+': a1p, A2: a2 },
    },
    null,
    2,
  ),
);
