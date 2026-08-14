import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { buildAdaptiveProfile } from '@/src/adaptive/profile';
import { scoreLemma } from '@/src/adaptive/scoring';
import { MemoryAdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';
import { AdaptiveVocabularyService } from '@/src/adaptive/AdaptiveVocabularyService';
import { audioCacheKey } from '@/src/audio/cacheKey';
import { createCatalog } from '@/src/audio/AudioService';
import { normalizeRoster } from '@/src/audio/logicalVoices';
import {
  canTransition,
  cefrRank,
  createArcAuthoringTemplate,
  evaluateLevelReadiness,
  familiaritySurvivesTransition,
  measureSentence,
  parseCEFRLevel,
  questionTypeCEFR,
  auditStoryCefr,
  chooseLevel,
  enrichLexiconEntry,
} from '@/src/cefr';
import { loadContentBundle } from '@/src/content/loadContentBundle';
import type { ContentBundle, Sentence } from '@/src/content/schemas';
import { CefrLevelSchema } from '@/src/content/schemas';
import { createInitialProgress } from '@/src/progress/types';
import { createLemmaEncounter, refreshFamiliarity } from '@/src/vocabulary/normalize';
import { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';
import { createEmptyVocabularyState } from '@/src/vocabulary/types';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadBundle(): ContentBundle {
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  }
  return loadContentBundle({
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
}

function lemma(id: string, patch: Partial<ReturnType<typeof createLemmaEncounter>>) {
  return refreshFamiliarity({ ...createLemmaEncounter(id), ...patch, lemmaId: id });
}

describe('Phase 8 CEFR schema and progression', () => {
  it('validates CEFR levels', () => {
    expect(CefrLevelSchema.parse('A1')).toBe('A1');
    expect(CefrLevelSchema.parse('A1+')).toBe('A1+');
    expect(CefrLevelSchema.parse('C1')).toBe('C1');
    expect(parseCEFRLevel('A1_PLUS')).toBe('A1+');
    expect(parseCEFRLevel('b1')).toBe('B1');
  });

  it('accepts gradual level progression', () => {
    expect(canTransition('A1', 'A1+')).toBe(true);
    expect(canTransition('A1+', 'A2')).toBe(true);
    expect(canTransition('A2', 'A2')).toBe(true);
    expect(chooseLevel('A1', 'A1+')).toBe('A1+');
  });

  it('rejects skipped levels', () => {
    expect(canTransition('A1', 'B1')).toBe(false);
    expect(canTransition('A1', 'A2')).toBe(false);
    expect(() => parseCEFRLevel('D1')).toThrow(/Invalid CEFR level/);
    expect(() => chooseLevel('A1', 'B1')).toThrow(/not a gradual step/);
    expect(() => CefrLevelSchema.parse('D1')).toThrow();
  });
});

describe('Phase 8 vocabulary and sentence metadata', () => {
  const bundle = loadBundle();

  it('attaches CEFR metadata to lexicon entries', () => {
    const aspettare = bundle.lexiconById.get('aspettare');
    expect(aspettare?.cefrLevel).toBeTruthy();
    expect(aspettare?.frequencyBand).toBeTruthy();
    expect(aspettare?.register).toBe('neutral');
    const derived = enrichLexiconEntry({
      lemmaId: 'casa',
      italian: 'casa',
      english: 'house',
      partOfSpeech: 'noun',
      difficulty: 1,
      frequency: 'high',
    });
    expect(derived.cefrLevel).toBe('A1');
    expect(derived.frequencyBand).toBe('very_common');
  });

  it('measures sentence complexity automatically', () => {
    const short: Sentence = {
      id: 's',
      text: 'Luca è a Roma.',
      english: 'Luca is in Rome.',
      speakerId: null,
      kind: 'narration',
      tokens: [
        { surface: 'Luca', lemmaId: 'luca', start: 0, end: 4 },
        { surface: 'è', lemmaId: 'essere', start: 5, end: 6 },
        { surface: 'a', lemmaId: 'a', start: 7, end: 8 },
        { surface: 'Roma', lemmaId: 'roma', start: 9, end: 13 },
      ],
      phrases: [],
      reinforces: [],
      phraseReinforces: [],
      introduces: [],
      difficulty: 1,
      variants: [],
      selectedVariantId: 'standard',
    };
    const simple = measureSentence(short, bundle.lexiconById);
    expect(simple.wordCount).toBe(4);
    expect(simple.clauseCount).toBe(1);
    expect(simple.cefrLevel).toMatch(/^A1/);
    expect(simple.dialogueOrNarration).toBe('narration');

    const complex = measureSentence(
      {
        ...short,
        text: 'Luca non era sicuro di voler accettare il lavoro, ma alla fine ha deciso di provarci perché gli sembrava una buona occasione.',
        tokens: [],
        kind: 'narration',
      },
      bundle.lexiconById,
    );
    expect(complex.wordCount).toBeGreaterThan(simple.wordCount);
    expect(complex.subordinateClauseCount).toBeGreaterThan(0);
    expect(complex.difficultyScore).toBeGreaterThan(simple.difficultyScore);
    expect(cefrRank(complex.cefrLevel)).toBeGreaterThan(cefrRank(simple.cefrLevel));
  });
});

describe('Phase 8 chapter difficulty and audit', () => {
  const bundle = loadBundle();
  const audit = auditStoryCefr(bundle);

  it('calculates chapter difficulty without rewriting content', () => {
    expect(audit).toHaveLength(40);
    const ch1 = audit.find((c) => c.chapterNumber === 1)!;
    expect(ch1.target).toBe('A1');
    expect(ch1.estimated).toMatch(/^A1/);
    expect(ch1.status).toBe('ON TARGET');
    expect(ch1.overallScore).toBeGreaterThan(0);
    expect(ch1.averageSentenceLength).toBeLessThan(12);
  });

  it('treats later A1 chapters as on-target even if they estimate A1+', () => {
    const ch8 = audit.find((c) => c.chapterNumber === 8)!;
    expect(ch8.target).toBe('A1');
    expect(['A1', 'A1+']).toContain(ch8.estimated);
    expect(ch8.status).toBe('ON TARGET');
  });

  it('maps comprehension types onto CEFR bands', () => {
    expect(questionTypeCEFR('direct')).toBe('A1');
    expect(questionTypeCEFR('event')).toBe('A2');
    expect(questionTypeCEFR('sequence')).toBe('A2');
    expect(questionTypeCEFR('inference')).toBe('B1');
    const ch1 = bundle.chapters.get('luca-a-roma-01')!;
    expect(ch1.questions.every((q) => cefrRank(questionTypeCEFR(q.type)) <= cefrRank('A2'))).toBe(true);
  });
});

describe('Phase 8 learner readiness', () => {
  it('does not promote from one isolated strong result', () => {
    const isolated = evaluateLevelReadiness({
      currentLevel: 'A1',
      completedChapterNumbers: [1],
      levelChapterStart: 1,
      levelChapterEnd: 20,
      vocabularyStrength: 0.9,
      phraseStrength: 0.9,
      comprehensionStrength: 1,
      recentTapRate: 0.05,
      recentComprehensionScores: [1],
      averageSentenceDifficulty: 12,
    });
    expect(isolated.status).toBe('NOT_READY');
    expect(isolated.canChooseNext).toBe(false);
    expect(isolated.message).not.toMatch(/failed|locked|Complete A1/i);
  });

  it('recommends READY only after steady performance', () => {
    const ready = evaluateLevelReadiness({
      currentLevel: 'A1',
      completedChapterNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      levelChapterStart: 1,
      levelChapterEnd: 20,
      vocabularyStrength: 0.5,
      phraseStrength: 0.4,
      comprehensionStrength: 0.82,
      recentTapRate: 0.12,
      recentComprehensionScores: [0.75, 0.8, 1, 0.75, 1],
      averageSentenceDifficulty: 18,
    });
    expect(ready.status).toBe('READY');
    expect(ready.nextLevel).toBe('A1+');
    expect(ready.message).toMatch(/slightly more challenging/);
  });

  it('keeps vocabulary familiarity when the CEFR level changes', () => {
    const state = createEmptyVocabularyState();
    state.lemmas.aspettare = lemma('aspettare', { encounterCount: 9, tapCount: 3 });
    expect(familiaritySurvivesTransition(state, structuredClone(state))).toBe(true);
  });
});

describe('Phase 8 adaptive and audio across levels', () => {
  const bundle = loadBundle();

  it('still reinforces struggling vocabulary in a later CEFR band', () => {
    const item = scoreLemma(
      lemma('aspettare', {
        encounterCount: 12,
        tapCount: 8,
        chaptersEncountered: ['luca-a-roma-01', 'luca-a-roma-08'],
        recentEncounters: [
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
        ],
      }),
      bundle.lexiconById.get('aspettare'),
      {
        upcomingLemmaIds: new Set(['aspettare']),
        upcomingPhraseIds: new Set(),
        currentChapterLemmaIds: new Set(['aspettare']),
        currentChapterPhraseIds: new Set(),
        variantLemmaIds: new Set(['aspettare']),
        variantPhraseIds: new Set(),
        recentHitChapterNumbers: {},
      },
    );
    expect(item.state).toBe('reinforce');
    expect(item.priority).toBeGreaterThan(0);
  });

  it('builds a learner profile that includes CEFR fields without dropping familiarity', async () => {
    const vocabRepo = new MemoryUserVocabularyRepository();
    const vocab = new VocabularyService(vocabRepo, bundle);
    const adaptive = new AdaptiveVocabularyService(new MemoryAdaptiveStateRepository(), bundle, vocab);
    const progress = {
      ...createInitialProgress(bundle.story.id, 'luca-a-roma-01'),
      completedChapterIds: ['luca-a-roma-01', 'luca-a-roma-02'],
      currentCEFRLevel: 'A1',
    };
    const profile = await adaptive.buildProfile(progress);
    expect(profile.currentCEFRLevel).toBe('A1');
    expect(profile.readingCompletionRate).toBeGreaterThan(0);
    const rebuilt = buildAdaptiveProfile(bundle, await vocab.getState(), progress, {
      currentChapterId: 'luca-a-roma-03',
      completedChapterIds: progress.completedChapterIds,
      recentHits: [],
    });
    expect(rebuilt.currentCEFRLevel).toBe('A1');
  });

  it('keeps audio cache keys bound to displayed text after CEFR metadata', () => {
    const chapter = bundle.chapters.get('luca-a-roma-08')!;
    const sentence = chapter.paragraphs.flatMap((p) => p.sentences).find((s) => s.id === 's10')!;
    const keyA = audioCacheKey({
      provider: 'elevenlabs',
      voiceId: 'lab-narrator',
      language: 'it-IT',
      speed: 'normal',
      text: sentence.text,
      generationVersion: 1,
    });
    const variant = sentence.variants.find((v) => v.id === 'extended');
    expect(variant).toBeTruthy();
    const keyB = audioCacheKey({
      provider: 'elevenlabs',
      voiceId: 'lab-narrator',
      language: 'it-IT',
      speed: 'normal',
      text: variant!.text,
      generationVersion: 1,
    });
    expect(keyA).not.toBe(keyB);
    const catalog = createCatalog([], normalizeRoster({ activeProvider: 'elevenlabs', generationVersion: 1 }), bundle.characters);
    expect(catalog.lookupSentence(sentence, 'normal')).toBeNull();
  });
});

describe('Phase 8 authoring template and story arcs', () => {
  const bundle = loadBundle();

  it('exposes planned later arcs and available A1–A1+–A2 chapters', () => {
    expect(bundle.story.arcs.length).toBeGreaterThanOrEqual(5);
    expect(bundle.chapters.size).toBe(40);
    const a1Plus = bundle.story.arcs.find((a) => a.cefrLevel === 'A1+');
    const a2 = bundle.story.arcs.find((a) => a.cefrLevel === 'A2');
    expect(a1Plus?.status).toBe('available');
    expect(a1Plus?.chapterStart).toBe(21);
    expect(a1Plus?.chapterEnd).toBe(24);
    expect(a2?.status).toBe('available');
    expect(a2?.chapterStart).toBe(25);
    const a1Chapters = [...bundle.chapters.values()].filter((c) => c.number <= 20);
    const a1PlusChapters = [...bundle.chapters.values()].filter(
      (c) => c.number >= 21 && c.number <= 24,
    );
    const a2Chapters = [...bundle.chapters.values()].filter((c) => c.number >= 25);
    expect(a1Chapters.every((c) => c.cefrTarget === 'A1')).toBe(true);
    expect(a1PlusChapters.every((c) => c.cefrTarget === 'A1+')).toBe(true);
    expect(a2Chapters.every((c) => c.cefrTarget === 'A2')).toBe(true);
    expect(a2Chapters).toHaveLength(16);
  });

  it('creates an A2 authoring template without filling chapters', () => {
    const template = createArcAuthoringTemplate({
      targetCEFR: 'A2',
      title: "Luca's new life",
      storyObjective: 'Luca settles into life in Rome.',
      characters: ['luca', 'sofia'],
      locations: ['roma'],
      adaptiveOpportunities: ['aspettare'],
    });
    expect(template.targetCEFR).toBe('A2');
    expect(template.chapters).toEqual([]);
    expect(template.audioStatus).toBe('not_generated');
    expect(template.comprehensionTypes).toContain('event');
  });
});
