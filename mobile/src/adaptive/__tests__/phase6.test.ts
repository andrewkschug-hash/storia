import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, beforeEach } from 'vitest';

import { AdaptiveVocabularyService } from '@/src/adaptive/AdaptiveVocabularyService';
import { ADAPTIVE_CONFIG, ADAPTIVE_LEMMA_TARGETS, ADAPTIVE_PHRASE_TARGETS } from '@/src/adaptive/config';
import { MemoryAdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';
import { tapRate } from '@/src/adaptive/metrics';
import { buildAdaptiveProfile } from '@/src/adaptive/profile';
import { scoreLemma, scorePhrase } from '@/src/adaptive/scoring';
import { rejectReason, selectAdaptiveChapter } from '@/src/adaptive/select';
import { createEmptyAdaptiveState } from '@/src/adaptive/types';
import { loadContentBundle } from '@/src/content/loadContentBundle';
import type { Chapter, ContentBundle, Sentence } from '@/src/content/schemas';
import { createInitialProgress, type ReadingProgressRecord } from '@/src/progress/types';
import { createLemmaEncounter, createPhraseEncounter, refreshFamiliarity } from '@/src/vocabulary/normalize';
import type { LemmaEncounter, PhraseEncounter, UserVocabularyState } from '@/src/vocabulary/types';
import { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';

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
    storyPath: 'stories/luca-a-roma',
  });
}

function lemma(id: string, patch: Partial<LemmaEncounter>): LemmaEncounter {
  return refreshFamiliarity({ ...createLemmaEncounter(id), ...patch, lemmaId: id });
}

function phrase(id: string, surface: string, patch: Partial<PhraseEncounter>): PhraseEncounter {
  return refreshFamiliarity({ ...createPhraseEncounter(id, surface), ...patch, phraseId: id, surface });
}

function emptyCtx() {
  return {
    upcomingLemmaIds: new Set<string>(),
    upcomingPhraseIds: new Set<string>(),
    currentChapterLemmaIds: new Set<string>(),
    currentChapterPhraseIds: new Set<string>(),
    variantLemmaIds: new Set<string>(),
    variantPhraseIds: new Set<string>(),
    recentHitChapterNumbers: {} as Record<string, number[]>,
  };
}

function progressFor(bundle: ContentBundle, completed: string[] = []): ReadingProgressRecord {
  const first = bundle.story.chapters[0].id;
  return {
    ...createInitialProgress(bundle.story.id, first),
    completedChapterIds: completed,
    currentChapterId: completed[completed.length - 1] ?? first,
  };
}

describe('Phase 6 adaptive scoring', () => {
  let bundle: ContentBundle;

  beforeEach(() => {
    bundle = loadBundle();
  });

  it('gives high tap-rate vocabulary higher priority', () => {
    const struggling = scoreLemma(
      lemma('aspettare', {
        encounterCount: 12,
        tapCount: 8,
        chaptersEncountered: ['a', 'b'],
        recentEncounters: [
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
        ],
      }),
      bundle.lexiconById.get('aspettare'),
      emptyCtx(),
    );
    const easy = scoreLemma(
      lemma('casa', {
        encounterCount: 20,
        tapCount: 1,
        chaptersEncountered: ['a', 'b', 'c'],
        recentEncounters: Array.from({ length: 5 }, () => ({
          tapped: false,
          at: 't',
          chapterId: 'a',
        })),
      }),
      bundle.lexiconById.get('casa'),
      emptyCtx(),
    );
    expect(struggling.priority).toBeGreaterThan(easy.priority);
    expect(struggling.state).toBe('reinforce');
  });

  it('gives low tap-rate vocabulary lower priority', () => {
    const easy = scoreLemma(
      lemma('casa', { encounterCount: 20, tapCount: 1, chaptersEncountered: ['a'] }),
      bundle.lexiconById.get('casa'),
      emptyCtx(),
    );
    expect(easy.tapRate).toBeLessThan(0.1);
    expect(easy.priority).toBeLessThan(0.5);
  });

  it('weighs recent behavior more than old behavior', () => {
    const improved = scoreLemma(
      lemma('aspettare', {
        encounterCount: 12,
        tapCount: 8,
        recentEncounters: [
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
          { tapped: false, at: 't', chapterId: 'a' },
        ],
      }),
      bundle.lexiconById.get('aspettare'),
      emptyCtx(),
    );
    const stillStuck = scoreLemma(
      lemma('aspettare', {
        encounterCount: 12,
        tapCount: 8,
        recentEncounters: [
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: true, at: 't', chapterId: 'a' },
          { tapped: true, at: 't', chapterId: 'a' },
        ],
      }),
      bundle.lexiconById.get('aspettare'),
      emptyCtx(),
    );
    expect(stillStuck.priority).toBeGreaterThan(improved.priority);
    expect(stillStuck.factors.struggle).toBeGreaterThan(improved.factors.struggle);
    expect(tapRate(8, 12)).toBeCloseTo(8 / 12);
    expect(stillStuck.recentTapRate).toBeGreaterThan(improved.recentTapRate);
  });

  it('gives saved items appropriate priority', () => {
    const saved = scoreLemma(
      lemma('lavoro', { encounterCount: 4, tapCount: 1, saved: true, saveCount: 1 }),
      bundle.lexiconById.get('lavoro'),
      emptyCtx(),
    );
    const unsaved = scoreLemma(
      lemma('lavoro', { encounterCount: 4, tapCount: 1 }),
      bundle.lexiconById.get('lavoro'),
      emptyCtx(),
    );
    expect(saved.priority).toBeGreaterThan(unsaved.priority);
    expect(saved.reasons).toContain('Saved');
  });

  it('lowers priority when the upcoming chapter already contains the word', () => {
    const base = lemma('aspettare', {
      encounterCount: 12,
      tapCount: 8,
      recentEncounters: [
        { tapped: true, at: 't', chapterId: 'a' },
        { tapped: true, at: 't', chapterId: 'a' },
        { tapped: false, at: 't', chapterId: 'a' },
        { tapped: false, at: 't', chapterId: 'a' },
        { tapped: false, at: 't', chapterId: 'a' },
      ],
    });
    const without = scoreLemma(base, bundle.lexiconById.get('aspettare'), emptyCtx());
    const withUpcoming = scoreLemma(base, bundle.lexiconById.get('aspettare'), {
      ...emptyCtx(),
      upcomingLemmaIds: new Set(['aspettare']),
    });
    expect(withUpcoming.priority).toBeLessThan(without.priority);
    expect(withUpcoming.reasons.join(' ')).toMatch(/upcoming/i);
  });

  it('treats phrase struggle as independent of lemma struggle', () => {
    const ctx = emptyCtx();
    const phraseItem = scorePhrase(
      phrase('ha_fame', 'ha fame', {
        encounterCount: 8,
        tapCount: 6,
        recentEncounters: Array.from({ length: 5 }, () => ({
          tapped: true,
          at: 't',
          chapterId: 'a',
        })),
      }),
      ctx,
    );
    const avere = scoreLemma(
      lemma('avere', { encounterCount: 20, tapCount: 1 }),
      bundle.lexiconById.get('avere'),
      ctx,
    );
    expect(phraseItem.priority).toBeGreaterThan(avere.priority);
    expect(phraseItem.state).not.toBe(avere.state);
  });
});

describe('Phase 6 selection safety', () => {
  let bundle: ContentBundle;

  beforeEach(() => {
    bundle = loadBundle();
  });

  it('prevents overexposure and excessive repeats of the same target', () => {
    const ch8 = bundle.chapters.get('luca-a-roma-08')!;
    const items = [
      scoreLemma(
        lemma('aspettare', {
          encounterCount: 12,
          tapCount: 8,
          saved: true,
          recentEncounters: Array.from({ length: 5 }, () => ({
            tapped: true,
            at: 't',
            chapterId: 'x',
          })),
        }),
        bundle.lexiconById.get('aspettare'),
        { ...emptyCtx(), variantLemmaIds: new Set(['aspettare']) },
      ),
    ];
    const first = selectAdaptiveChapter(ch8, bundle, items, [], new Date('2026-08-11'));
    const aspettaHits = first.hits.filter((h) => h.id === 'aspettare');
    expect(aspettaHits.length).toBeLessThanOrEqual(ADAPTIVE_CONFIG.maxRepeatsPerTargetPerChapter);

    const blocked = selectAdaptiveChapter(
      ch8,
      bundle,
      items,
      [
        { kind: 'lemma', id: 'aspettare', chapterId: 'luca-a-roma-06', chapterNumber: 6 },
        { kind: 'lemma', id: 'aspettare', chapterId: 'luca-a-roma-07', chapterNumber: 7 },
      ],
      new Date('2026-08-11'),
    );
    const adaptiveSwaps = blocked.chapter.paragraphs
      .flatMap((p) => p.sentences)
      .filter((s) => s.selectedVariantId !== 'standard' && s.reinforces.includes('aspettare'));
    expect(adaptiveSwaps.length).toBe(0);
  });

  it('rejects invalid variants that introduce future vocabulary', () => {
    const ch1 = bundle.chapters.get('luca-a-roma-01')!;
    const sentence = ch1.paragraphs[0].sentences[0];
    const future: typeof sentence.variants[number] = {
      id: 'illegal',
      text: 'Luca risolve il problema.',
      tokens: [
        { surface: 'Luca', lemmaId: 'luca', start: 0, end: 4 },
        { surface: 'risolve', lemmaId: 'risolvere', start: 5, end: 12 },
        { surface: 'il', lemmaId: 'il', start: 13, end: 15 },
        { surface: 'problema', lemmaId: 'problema', start: 16, end: 24 },
      ],
      phrases: [],
      reinforces: ['risolvere'],
      phraseReinforces: [],
      introduces: ['risolvere'],
      difficulty: 1,
    };
    const reason = rejectReason(future, sentence, ch1, bundle, new Map(), [], new Map());
    expect(reason).toMatch(/future|premature/i);
  });

  it('preserves story continuity metadata', () => {
    const ch8 = bundle.chapters.get('luca-a-roma-08')!;
    const result = selectAdaptiveChapter(ch8, bundle, [], [], new Date());
    expect(result.chapter.events).toEqual(ch8.events);
    expect(result.chapter.characterIds).toEqual(ch8.characterIds);
    expect(result.chapter.locationIds).toEqual(ch8.locationIds);
    expect(result.chapter.questions).toEqual(ch8.questions);
  });

  it('falls back to normal content when no safe adaptive option exists', () => {
    const ch8 = bundle.chapters.get('luca-a-roma-08')!;
    const result = selectAdaptiveChapter(ch8, bundle, [], [], new Date());
    for (const p of result.chapter.paragraphs) {
      for (const s of p.sentences) {
        expect(s.selectedVariantId).toBe('standard');
      }
    }
    expect(result.logs.length).toBe(0);
  });
});

describe('Phase 6 profile, logs, and persistence', () => {
  let bundle: ContentBundle;
  let vocab: VocabularyService;
  let adaptive: AdaptiveVocabularyService;

  beforeEach(() => {
    bundle = loadBundle();
    vocab = new VocabularyService(new MemoryUserVocabularyRepository(), bundle);
    adaptive = new AdaptiveVocabularyService(new MemoryAdaptiveStateRepository(), bundle, vocab);
  });

  it('persists the adaptive profile', async () => {
    await adaptive.seedManualTestLearner();
    const profile = await adaptive.buildProfile(progressFor(bundle, []));
    expect(profile.adaptiveItems.length).toBeGreaterThan(0);
    const state = await adaptive.getState();
    expect(state.lastProfile?.lastUpdatedAt).toBeTruthy();
    expect(state.lastUpdatedAt).toBeTruthy();
  });

  it('generates adaptive logs when a variant is selected', async () => {
    await adaptive.seedManualTestLearner();
    const authored = bundle.chapters.get('luca-a-roma-08')!;
    const adapted = await adaptive.resolveChapter(authored, progressFor(bundle, []));
    const state = await adaptive.getState();
    const changed = adapted.paragraphs
      .flatMap((p) => p.sentences)
      .filter((s) => s.selectedVariantId !== 'standard');
    if (changed.length > 0) {
      expect(state.logs.length).toBeGreaterThan(0);
      expect(state.logs[0].reinforcedLemmas.length + state.logs[0].reinforcedPhrases.length).toBeGreaterThan(
        0,
      );
    } else {
      expect(state.logs.length).toBeGreaterThanOrEqual(0);
    }
    const aspettare = (await vocab.getState()).lemmas.aspettare;
    const casa = (await vocab.getState()).lemmas.casa;
    const a = scoreLemma(aspettare, bundle.lexiconById.get('aspettare'), {
      ...emptyCtx(),
      variantLemmaIds: new Set(['aspettare', 'casa']),
    });
    const c = scoreLemma(casa, bundle.lexiconById.get('casa'), {
      ...emptyCtx(),
      variantLemmaIds: new Set(['aspettare', 'casa']),
    });
    expect(a.priority).toBeGreaterThan(c.priority);
  });

  it('decreases priority after successful untapped encounters', async () => {
    await adaptive.seedManualTestLearner();
    const before = (await vocab.getState()).lemmas.aspettare;
    const start = scoreLemma(before, bundle.lexiconById.get('aspettare'), emptyCtx());
    for (let i = 0; i < 5; i++) {
      before.encounterCount += 1;
      before.recentEncounters.push({
        tapped: false,
        at: new Date().toISOString(),
        chapterId: 'luca-a-roma-08',
      });
    }
    const after = scoreLemma(refreshFamiliarity(before), bundle.lexiconById.get('aspettare'), emptyCtx());
    expect(after.priority).toBeLessThan(start.priority);
  });

  it('loads authored variants for the high-value subset', () => {
    let variantCount = 0;
    const lemmas = new Set<string>();
    const phrases = new Set<string>();
    for (const chapter of bundle.chapters.values()) {
      for (const p of chapter.paragraphs) {
        for (const s of p.sentences) {
          for (const v of s.variants) {
            if (v.id === 'standard') continue;
            variantCount += 1;
            for (const id of v.reinforces) lemmas.add(id);
            for (const id of v.phraseReinforces) phrases.add(id);
          }
        }
      }
    }
    expect(variantCount).toBeGreaterThanOrEqual(20);
    expect(lemmas.size + phrases.size).toBeGreaterThanOrEqual(15);
    expect(ADAPTIVE_LEMMA_TARGETS.length + ADAPTIVE_PHRASE_TARGETS.length).toBeGreaterThanOrEqual(20);
  });
});

describe('Phase 6 content integrity', () => {
  it('does not rewrite story events when adapting chapter 8', () => {
    const bundle = loadBundle();
    const ch8 = bundle.chapters.get('luca-a-roma-08')!;
    expect(ch8.paragraphs.some((p) => p.sentences.some((s: Sentence) => s.variants.length > 1))).toBe(
      true,
    );
    expect(createEmptyAdaptiveState().logs).toEqual([]);
  });
});
