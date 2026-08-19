import type { Chapter, ContentBundle, Sentence } from '@/src/content/schemas';
import { ensureLearnerMigrations } from '@/src/migration/learnerMigrations';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import {
  buildLexiconIndexFromBundle,
  phraseIdFromSurface,
  type LexiconIndex,
} from '@/src/vocabulary/dictionaryIndex';
import { refreshFamiliarity } from '@/src/vocabulary/normalize';
import { resolveSentenceLookup, resolveTap } from '@/src/vocabulary/resolveTap';
import {
  applySelfAssessment,
  type SelfAssessment,
  type SelfAssessmentContext,
} from '@/src/vocabulary/selfAssessment';
import type {
  DictionaryLookup,
  LemmaEncounter,
  PhraseEncounter,
  PhraseLookup,
  SentenceLookup,
  TapContext,
  UserVocabularyState,
  VocabularyStatus,
  WordLookup,
} from '@/src/vocabulary/types';
import {
  createLemmaEncounter,
  createPhraseEncounter,
  type UserVocabularyRepository,
} from '@/src/vocabulary/UserVocabularyRepository';

export class VocabularyService {
  private index: LexiconIndex;
  private cachedState: UserVocabularyState | null = null;
  private bundle: ContentBundle;

  constructor(
    private readonly repo: UserVocabularyRepository,
    bundle: ContentBundle,
  ) {
    this.bundle = bundle;
    this.index = buildLexiconIndexFromBundle(bundle);
  }

  getIndex(): LexiconIndex {
    return this.index;
  }

  getBundle(): ContentBundle {
    return this.bundle;
  }

  private migrationsChecked = false;

  async getState(): Promise<UserVocabularyState> {
    if (!this.cachedState) {
      this.cachedState = await this.repo.get();
    }
    if (!this.migrationsChecked) {
      await ensureLearnerMigrations(
        async () => this.cachedState ?? (await this.repo.get()),
        async (state) => {
          this.cachedState = state;
          await this.repo.save(state);
        },
      );
      this.migrationsChecked = true;
      if (!this.cachedState) {
        this.cachedState = await this.repo.get();
      }
    }
    return this.cachedState;
  }

  async lookup(ctx: TapContext): Promise<DictionaryLookup> {
    const state = await this.getState();
    return resolveTap(this.index, ctx, state);
  }

  lookupSentence(sentence: Sentence, chapterId: string, chapterNumber: number): SentenceLookup {
    return resolveSentenceLookup(sentence, chapterId, chapterNumber);
  }

  async openTap(ctx: TapContext): Promise<DictionaryLookup> {
    const state = await this.getState();
    const lookup = resolveTap(this.index, ctx, state);
    const now = new Date().toISOString();

    if (lookup.kind === 'phrase') {
      this.touchPhrase(state, lookup, ctx.chapterId, ctx.sentence.id, now, {
        encounter: true,
        tap: true,
      });
      for (const lemmaId of lookup.lemmaIds) {
        this.touchLemma(
          state,
          lemmaId,
          ctx.sentence.tokens[ctx.tokenIndex]?.surface ?? lookup.surface,
          ctx.chapterId,
          ctx.sentence.id,
          now,
          { encounter: true, tap: false },
        );
      }
    } else if (lookup.kind === 'word') {
      this.touchLemma(
        state,
        lookup.lemmaId,
        lookup.surface,
        ctx.chapterId,
        ctx.sentence.id,
        now,
        { encounter: true, tap: true },
      );
    }

    await this.persist(state);
    if (lookup.kind === 'phrase') {
      lookup.encounterCount = state.phrases[lookup.phraseId]?.encounterCount ?? 1;
    } else if (lookup.kind === 'word') {
      lookup.encounterCount = state.lemmas[lookup.lemmaId]?.encounterCount ?? 1;
    }
    return lookup;
  }

  /**
   * Story exposure without a tap — once per unique lemma/phrase per chapter.
   */
  async recordChapterExposure(chapter: Chapter): Promise<UserVocabularyState> {
    const state = await this.getState();
    const now = new Date().toISOString();
    const seenLemmas = new Set<string>();
    const seenPhrases = new Set<string>();

    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        for (const token of sentence.tokens) {
          if (seenLemmas.has(token.lemmaId)) continue;
          seenLemmas.add(token.lemmaId);
          const existing = state.lemmas[token.lemmaId];
          if (existing?.chaptersEncountered.includes(chapter.id)) continue;
          this.touchLemma(
            state,
            token.lemmaId,
            token.surface,
            chapter.id,
            sentence.id,
            now,
            { encounter: true, tap: false },
          );
        }
        for (const phrase of sentence.phrases ?? []) {
          const phraseId = phraseIdFromSurface(phrase.surface);
          if (seenPhrases.has(phraseId)) continue;
          seenPhrases.add(phraseId);
          const existing = state.phrases[phraseId];
          if (existing?.chaptersEncountered.includes(chapter.id)) continue;
          const lookup: PhraseLookup = {
            kind: 'phrase',
            phraseId,
            surface: phrase.surface,
            naturalEnglish: phrase.naturalEn,
            literalEnglish: phrase.literalEn,
            sentenceText: sentence.text,
            sentenceId: sentence.id,
            chapterId: chapter.id,
            chapterNumber: chapter.number,
            tokenStart: phrase.tokenStart,
            tokenEnd: phrase.tokenEnd,
            lemmaIds: sentence.tokens
              .slice(phrase.tokenStart, phrase.tokenEnd + 1)
              .map((t) => t.lemmaId),
            encounterCount: 0,
          };
          this.touchPhrase(state, lookup, chapter.id, sentence.id, now, {
            encounter: true,
            tap: false,
          });
        }
      }
    }

    await this.persist(state);
    return state;
  }

  async saveLookup(lookup: DictionaryLookup): Promise<UserVocabularyState> {
    const state = await this.getState();
    if (lookup.kind === 'sentence') return state;
    const now = new Date().toISOString();

    if (lookup.kind === 'phrase') {
      const row =
        state.phrases[lookup.phraseId] ??
        createPhraseEncounter(lookup.phraseId, lookup.surface);
      row.saved = true;
      row.saveCount += 1;
      row.savedAt = now;
      row.lastChapterId = lookup.chapterId;
      row.lastSentenceId = lookup.sentenceId;
      if (!row.firstChapterId) row.firstChapterId = lookup.chapterId;
      refreshFamiliarity(row);
      state.phrases[lookup.phraseId] = row;
    } else {
      const row = state.lemmas[lookup.lemmaId] ?? createLemmaEncounter(lookup.lemmaId);
      row.saved = true;
      row.saveCount += 1;
      row.savedAt = now;
      row.lastChapterId = lookup.chapterId;
      row.lastSentenceId = lookup.sentenceId;
      if (!row.firstChapterId) row.firstChapterId = lookup.chapterId;
      if (!row.savedForms.includes(lookup.surface)) {
        row.savedForms.push(lookup.surface);
      }
      refreshFamiliarity(row);
      state.lemmas[lookup.lemmaId] = row;
    }

    await this.persist(state);
    return state;
  }

  async isSaved(lookup: DictionaryLookup): Promise<boolean> {
    if (lookup.kind === 'sentence') return false;
    const state = await this.getState();
    if (lookup.kind === 'phrase') {
      return state.phrases[lookup.phraseId]?.saved ?? false;
    }
    return state.lemmas[lookup.lemmaId]?.saved ?? false;
  }

  /**
   * @deprecated Prefer recordSelfAssessment. Maps boolean review outcomes.
   */
  async recordReview(
    kind: 'lemma' | 'phrase',
    id: string,
    correct: boolean,
    now: Date = new Date(),
  ): Promise<UserVocabularyState> {
    return this.recordSelfAssessment(kind, id, correct ? 'got_it' : 'not_yet', {
      source: 'review_mcq',
    }, now);
  }

  async recordSelfAssessment(
    kind: 'lemma' | 'phrase',
    id: string,
    assessment: SelfAssessment,
    ctx?: SelfAssessmentContext,
    now: Date = new Date(),
  ): Promise<UserVocabularyState> {
    const state = await this.getState();
    if (kind === 'lemma') {
      const row = state.lemmas[id] ?? createLemmaEncounter(id);
      applySelfAssessment(row, assessment, now);
      state.lemmas[id] = row;
    } else {
      const row = state.phrases[id] ?? createPhraseEncounter(id, id);
      applySelfAssessment(row, assessment, now);
      state.phrases[id] = row;
    }
    await this.persist(state);
    trackReadingEvent({
      type: 'self_assessment',
      storyId: ctx?.storyId,
      chapterId: ctx?.chapterId,
      sentenceId: ctx?.sentenceId,
      lemmaId: kind === 'lemma' ? id : undefined,
      phraseId: kind === 'phrase' ? id : undefined,
      meta: {
        assessment,
        source: ctx?.source ?? 'practice_hub',
        exerciseId: ctx?.exerciseId ?? null,
        sceneId: ctx?.sceneId ?? null,
        lineId: ctx?.lineId ?? null,
      },
    });
    return state;
  }

  async recordSelfAssessmentForLemmaIds(
    lemmaIds: string[],
    assessment: SelfAssessment,
    ctx: SelfAssessmentContext,
    options?: { sourceSentence?: Sentence; bumpEncounterOnGotIt?: boolean },
    now: Date = new Date(),
  ): Promise<UserVocabularyState> {
    const state = await this.getState();
    const iso = now.toISOString();
    const unique = [...new Set(lemmaIds.filter(Boolean))];
    for (const lemmaId of unique) {
      const row = state.lemmas[lemmaId] ?? createLemmaEncounter(lemmaId);
      applySelfAssessment(row, assessment, now);
      if (
        assessment === 'got_it' &&
        options?.bumpEncounterOnGotIt &&
        options.sourceSentence &&
        ctx.chapterId
      ) {
        row.encounterCount += 1;
        if (!row.chaptersEncountered.includes(ctx.chapterId)) {
          row.chaptersEncountered.push(ctx.chapterId);
        }
        pushEncounter(row, false, iso, ctx.chapterId);
        if (!row.firstChapterId) row.firstChapterId = ctx.chapterId;
        if (!row.firstEncounteredAt) row.firstEncounteredAt = iso;
        row.lastChapterId = ctx.chapterId;
        row.lastEncounteredAt = iso;
        row.lastSentenceId = ctx.sentenceId ?? options.sourceSentence.id;
        refreshFamiliarity(row, now);
      }
      state.lemmas[lemmaId] = row;
    }
    await this.persist(state);
    for (const lemmaId of unique) {
      trackReadingEvent({
        type: 'self_assessment',
        storyId: ctx.storyId,
        chapterId: ctx.chapterId,
        sentenceId: ctx.sentenceId,
        lemmaId,
        meta: {
          assessment,
          source: ctx.source,
          exerciseId: ctx.exerciseId ?? null,
          sceneId: ctx.sceneId ?? null,
          lineId: ctx.lineId ?? null,
        },
      });
    }
    return state;
  }

  /**
   * @deprecated Use recordSelfAssessmentForLemmaIds with got_it instead.
   */
  async recordProductionSuccess(input: {
    lemmaIds: string[];
    chapterId: string;
    sentenceId: string;
  }): Promise<UserVocabularyState> {
    return this.recordSelfAssessmentForLemmaIds(
      input.lemmaIds,
      'got_it',
      {
        source: 'production',
        chapterId: input.chapterId,
        sentenceId: input.sentenceId,
      },
      { bumpEncounterOnGotIt: true },
    );
  }

  summarize(state: UserVocabularyState): {
    encountered: number;
    new: number;
    learning: number;
    familiar: number;
    mastered: number;
    saved: number;
  } {
    const rows = [...Object.values(state.lemmas), ...Object.values(state.phrases)];
    const count = (status: VocabularyStatus) => rows.filter((r) => r.status === status).length;
    return {
      encountered: rows.filter((r) => r.encounterCount > 0).length,
      new: count('new'),
      learning: count('learning'),
      familiar: count('familiar'),
      mastered: count('mastered'),
      saved: rows.filter((r) => r.saved).length,
    };
  }

  async __replaceState(state: UserVocabularyState) {
    this.cachedState = state;
    await this.repo.save(state);
  }

  private touchLemma(
    state: UserVocabularyState,
    lemmaId: string,
    surface: string,
    chapterId: string,
    sentenceId: string,
    now: string,
    flags: { encounter: boolean; tap: boolean },
  ) {
    const row = state.lemmas[lemmaId] ?? createLemmaEncounter(lemmaId);
    if (flags.encounter) {
      row.encounterCount += 1;
      if (!row.chaptersEncountered.includes(chapterId)) {
        row.chaptersEncountered.push(chapterId);
      }
      pushEncounter(row, flags.tap, now, chapterId);
    }
    if (flags.tap) row.tapCount += 1;
    if (!row.firstChapterId) row.firstChapterId = chapterId;
    if (!row.firstEncounteredAt) row.firstEncounteredAt = now;
    row.lastChapterId = chapterId;
    row.lastEncounteredAt = now;
    row.lastSentenceId = sentenceId;
    if (surface && !row.savedForms.includes(surface) && row.saved) {
      row.savedForms.push(surface);
    }
    refreshFamiliarity(row);
    state.lemmas[lemmaId] = row;
  }

  private touchPhrase(
    state: UserVocabularyState,
    lookup: PhraseLookup,
    chapterId: string,
    sentenceId: string,
    now: string,
    flags: { encounter: boolean; tap: boolean },
  ) {
    const row =
      state.phrases[lookup.phraseId] ??
      createPhraseEncounter(lookup.phraseId, lookup.surface);
    if (flags.encounter) {
      row.encounterCount += 1;
      if (!row.chaptersEncountered.includes(chapterId)) {
        row.chaptersEncountered.push(chapterId);
      }
      pushEncounter(row, flags.tap, now, chapterId);
    }
    if (flags.tap) row.tapCount += 1;
    row.surface = lookup.surface;
    if (!row.firstChapterId) row.firstChapterId = chapterId;
    if (!row.firstEncounteredAt) row.firstEncounteredAt = now;
    row.lastChapterId = chapterId;
    row.lastEncounteredAt = now;
    row.lastSentenceId = sentenceId;
    refreshFamiliarity(row);
    state.phrases[lookup.phraseId] = row;
  }

  private async persist(state: UserVocabularyState) {
    this.cachedState = state;
    await this.repo.save(state);
  }
}

function pushEncounter(
  row: LemmaEncounter | PhraseEncounter,
  tapped: boolean,
  at: string,
  chapterId: string,
) {
  row.recentEncounters.push({ tapped, at, chapterId });
  if (row.recentEncounters.length > 16) {
    row.recentEncounters = row.recentEncounters.slice(-16);
  }
}

export type { WordLookup, PhraseLookup, DictionaryLookup };
