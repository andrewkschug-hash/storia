import {
  AdaptiveOverlaySchema,
  CharactersFileSchema,
  SentenceEnglishFileSchema,
  ChapterSourceSchema,
  LocationsFileSchema,
  LexiconFileSchema,
  StoryManifestSchema,
  type AdaptiveOverlay,
  type Chapter,
  type ContentBundle,
  type LexiconEntry,
  type Sentence,
  type SentenceSource,
  type SentenceVariant,
  type Story,
} from '@/src/content/schemas';
import { assignChapterArc, parseArcs } from '@/src/cefr/arcs';
import { enrichLexiconEntry } from '@/src/cefr/lexicon';
import { ContentValidationError, expandSentenceTokens } from '@/src/content/tokenize';

type RawInputs = {
  charactersJson: unknown;
  locationsJson: unknown;
  lexiconJson: unknown;
  manifestJson: unknown;
  chapterJsonByFile: Record<string, unknown>;
  adaptiveJson?: unknown;
  translationsJson?: unknown;
  arcsJson?: unknown;
  storyPath?: string;
};

export function loadContentBundle(inputs: RawInputs): ContentBundle {
  const storyPath = inputs.storyPath ?? 'stories/luca-a-roma';

  const charactersFile = parseFile(
    'characters.json',
    CharactersFileSchema,
    inputs.charactersJson,
  );
  const locationsFile = parseFile('locations.json', LocationsFileSchema, inputs.locationsJson);
  const lexiconFile = parseFile(
    'lexicon/italian-core.json',
    LexiconFileSchema,
    inputs.lexiconJson,
  );
  const manifest = parseFile(
    `${storyPath}/manifest.json`,
    StoryManifestSchema,
    inputs.manifestJson,
  );

  const characterIds = new Set(charactersFile.characters.map((c) => c.id));
  const locationIds = new Set(locationsFile.locations.map((l) => l.id));
  const lexiconById = new Map<string, LexiconEntry>();
  for (const entry of lexiconFile.lexicon) {
    if (lexiconById.has(entry.lemmaId)) {
      throw new ContentValidationError(
        'lexicon/italian-core.json',
        null,
        'lemmaId',
        `Duplicate lemma ID "${entry.lemmaId}"`,
      );
    }
    lexiconById.set(entry.lemmaId, enrichLexiconEntry(entry));
  }
  const lexicon = [...lexiconById.values()];

  assertUniqueIds(
    'characters.json',
    charactersFile.characters.map((c) => c.id),
  );
  assertUniqueIds(
    'locations.json',
    locationsFile.locations.map((l) => l.id),
  );

  for (const character of charactersFile.characters) {
    for (const locId of character.knownLocationIds) {
      if (!locationIds.has(locId)) {
        throw new ContentValidationError(
          'characters.json',
          null,
          'knownLocationIds',
          `Unknown location ID "${locId}" on character "${character.id}"`,
        );
      }
    }
  }

  for (const id of manifest.characterIds) {
    if (!characterIds.has(id)) {
      throw new ContentValidationError(
        `${storyPath}/manifest.json`,
        null,
        'characterIds',
        `Unknown character ID "${id}"`,
      );
    }
  }
  for (const id of manifest.locationIds) {
    if (!locationIds.has(id)) {
      throw new ContentValidationError(
        `${storyPath}/manifest.json`,
        null,
        'locationIds',
        `Unknown location ID "${id}"`,
      );
    }
  }

  validateChapterOrdering(manifest.chapters.map((c) => c.number), `${storyPath}/manifest.json`);

  const overlay: AdaptiveOverlay =
    inputs.adaptiveJson === undefined
      ? { sentences: {} }
      : parseFile(`${storyPath}/adaptive-variants.json`, AdaptiveOverlaySchema, inputs.adaptiveJson);

  const translations = parseTranslations(inputs.translationsJson, `${storyPath}/sentence-english.json`);
  const arcs = parseArcs(inputs.arcsJson ?? manifest.arcs, manifest.id);

  const chapters = new Map<string, Chapter>();
  const storyChapters: Story['chapters'] = [];
  const usedOverlayKeys = new Set<string>();

  for (const summary of manifest.chapters) {
    const raw = inputs.chapterJsonByFile[summary.file];
    if (raw === undefined) {
      throw new ContentValidationError(
        `${storyPath}/manifest.json`,
        null,
        'chapters.file',
        `Missing chapter file "${summary.file}"`,
      );
    }

    const fileLabel = `${storyPath}/chapters/${summary.file}`;
    const source = parseFile(fileLabel, ChapterSourceSchema, raw);

    if (source.id !== summary.id) {
      throw new ContentValidationError(
        fileLabel,
        null,
        'id',
        `Chapter id "${source.id}" does not match manifest id "${summary.id}"`,
      );
    }
    if (source.number !== summary.number) {
      throw new ContentValidationError(
        fileLabel,
        null,
        'number',
        `Chapter number ${source.number} does not match manifest number ${summary.number}`,
      );
    }
    if (source.storyId !== manifest.id) {
      throw new ContentValidationError(
        fileLabel,
        null,
        'storyId',
        `Expected storyId "${manifest.id}", got "${source.storyId}"`,
      );
    }

    for (const id of source.characterIds) {
      if (!characterIds.has(id)) {
        throw new ContentValidationError(
          fileLabel,
          null,
          'characterIds',
          `Unknown character ID "${id}"`,
        );
      }
    }
    for (const id of source.locationIds) {
      if (!locationIds.has(id)) {
        throw new ContentValidationError(
          fileLabel,
          null,
          'locationIds',
          `Unknown location ID "${id}"`,
        );
      }
    }

    for (const event of source.events) {
      for (const id of event.characterIds) {
        if (!characterIds.has(id)) {
          throw new ContentValidationError(
            fileLabel,
            null,
            'events.characterIds',
            `Unknown character ID "${id}" in event "${event.id}"`,
          );
        }
      }
      for (const id of event.locationIds) {
        if (!locationIds.has(id)) {
          throw new ContentValidationError(
            fileLabel,
            null,
            'events.locationIds',
            `Unknown location ID "${id}" in event "${event.id}"`,
          );
        }
      }
    }

    for (const question of source.questions) {
      if (question.chapterId !== source.id) {
        throw new ContentValidationError(
          fileLabel,
          null,
          'questions.chapterId',
          `Question "${question.id}" chapterId "${question.chapterId}" does not match chapter "${source.id}"`,
        );
      }
    }

    const questionIds = source.questions.map((q) => q.id);
    assertUniqueIds(fileLabel, questionIds);

    const paragraphs = source.paragraphs.map((paragraph) => ({
      id: paragraph.id,
      order: paragraph.order,
      sentences: paragraph.sentences.map((sentence) => {
        const key = `${source.id}:${sentence.id}`;
        const extra = overlay.sentences[key];
        if (extra) usedOverlayKeys.add(key);
        return buildSentence(
          mergeOverlay(sentence, extra),
          lexiconById,
          fileLabel,
          characterIds,
          source.difficultyLevel,
          source.id,
          translations,
        );
      }),
    }));

    const arcInfo = assignChapterArc(source.number, arcs);
    const chapter: Chapter = {
      id: source.id,
      storyId: source.storyId,
      number: source.number,
      title: source.title,
      titleIt: source.titleIt,
      difficultyLevel: source.difficultyLevel,
      cefrTarget: arcInfo.cefrTarget,
      arcId: arcInfo.arcId,
      locationIds: source.locationIds,
      characterIds: source.characterIds,
      events: source.events,
      paragraphs,
      questions: source.questions,
    };

    chapters.set(chapter.id, chapter);
    storyChapters.push({
      ...summary,
      wordCount: countTokens(chapter),
    });
  }

  for (const key of Object.keys(overlay.sentences)) {
    if (!usedOverlayKeys.has(key)) {
      throw new ContentValidationError(
        `${storyPath}/adaptive-variants.json`,
        key,
        'sentences',
        `Overlay key "${key}" does not match any sentence`,
      );
    }
  }

  if (translations) {
    validateTranslationCoverage(chapters, translations, `${storyPath}/sentence-english.json`);
  }

  return {
    characters: charactersFile.characters,
    locations: locationsFile.locations,
    lexicon,
    lexiconById,
    story: { ...manifest, chapters: storyChapters, arcs },
    chapters,
  };
}

function mergeOverlay(
  sentence: SentenceSource,
  extra: AdaptiveOverlay['sentences'][string] | undefined,
): SentenceSource {
  if (!extra) return sentence;
  return {
    ...sentence,
    reinforces: extra.reinforces ?? sentence.reinforces,
    phraseReinforces: extra.phraseReinforces ?? sentence.phraseReinforces,
    introduces: extra.introduces ?? sentence.introduces,
    difficulty: extra.difficulty ?? sentence.difficulty,
    variants: [...(sentence.variants ?? []), ...(extra.variants ?? [])],
  };
}

function englishFor(
  translations: Map<string, string> | null,
  chapterId: string,
  sentenceId: string,
  variantId?: string,
): string | null {
  if (!translations) return null;
  const key =
    variantId && variantId !== 'standard'
      ? `${chapterId}:${sentenceId}:${variantId}`
      : `${chapterId}:${sentenceId}`;
  return translations.get(key) ?? null;
}

function buildSentence(
  sentence: SentenceSource,
  lexiconById: Map<string, LexiconEntry>,
  fileLabel: string,
  characterIds: Set<string>,
  chapterDifficulty: 1 | 2 | 3 | 4,
  chapterId: string,
  translations: Map<string, string> | null,
): Sentence {
  if (sentence.speakerId && !characterIds.has(sentence.speakerId)) {
    throw new ContentValidationError(
      fileLabel,
      sentence.id,
      'speakerId',
      `Unknown character ID "${sentence.speakerId}"`,
    );
  }

  const tokens = expandSentenceTokens(sentence.text, sentence.lemmas, sentence.id, fileLabel);
  validateTokens(tokens, lexiconById, fileLabel, sentence.id);
  const phrases = sentence.phrases ?? [];
  validatePhrases(phrases, tokens.length, fileLabel, sentence.id);

  const difficulty = sentence.difficulty ?? chapterDifficulty;
  const standard: SentenceVariant = {
    id: 'standard',
    text: sentence.text,
    english: englishFor(translations, chapterId, sentence.id),
    tokens,
    phrases,
    reinforces: sentence.reinforces ?? [],
    phraseReinforces: sentence.phraseReinforces ?? [],
    introduces: sentence.introduces ?? [],
    difficulty,
  };

  const variants: SentenceVariant[] = [standard];
  for (const raw of sentence.variants ?? []) {
    if (raw.id === 'standard') {
      throw new ContentValidationError(
        fileLabel,
        sentence.id,
        'variants',
        'Variant id "standard" is reserved',
      );
    }
    const variantTokens = expandSentenceTokens(
      raw.text,
      raw.lemmas,
      `${sentence.id}:${raw.id}`,
      fileLabel,
    );
    validateTokens(variantTokens, lexiconById, fileLabel, `${sentence.id}:${raw.id}`);
    const variantPhrases = raw.phrases ?? [];
    validatePhrases(variantPhrases, variantTokens.length, fileLabel, `${sentence.id}:${raw.id}`);
    variants.push({
      id: raw.id,
      text: raw.text,
      english: englishFor(translations, chapterId, sentence.id, raw.id),
      tokens: variantTokens,
      phrases: variantPhrases,
      reinforces: raw.reinforces ?? sentence.reinforces ?? [],
      phraseReinforces: raw.phraseReinforces ?? sentence.phraseReinforces ?? [],
      introduces: raw.introduces ?? sentence.introduces ?? [],
      difficulty: raw.difficulty ?? difficulty,
    });
  }

  return {
    id: sentence.id,
    text: sentence.text,
    english: standard.english,
    speakerId: sentence.speakerId,
    kind: sentence.kind,
    tokens,
    phrases,
    reinforces: sentence.reinforces ?? [],
    phraseReinforces: sentence.phraseReinforces ?? [],
    introduces: sentence.introduces ?? [],
    difficulty,
    variants,
    selectedVariantId: 'standard',
  };
}

function validateTokens(
  tokens: { lemmaId: string }[],
  lexiconById: Map<string, LexiconEntry>,
  fileLabel: string,
  sentenceId: string,
) {
  for (const token of tokens) {
    if (!lexiconById.has(token.lemmaId)) {
      throw new ContentValidationError(
        fileLabel,
        sentenceId,
        'lemmaId',
        `Unknown lemma ID:\n"${token.lemmaId}"`,
      );
    }
  }
}

function validatePhrases(
  phrases: { surface: string; tokenStart: number; tokenEnd: number }[],
  tokenCount: number,
  fileLabel: string,
  sentenceId: string,
) {
  for (const phrase of phrases) {
    if (phrase.tokenStart > phrase.tokenEnd || phrase.tokenEnd >= tokenCount) {
      throw new ContentValidationError(
        fileLabel,
        sentenceId,
        'phrases',
        `Invalid phrase token range [${phrase.tokenStart}, ${phrase.tokenEnd}] for "${phrase.surface}"`,
      );
    }
  }
}

function parseTranslations(
  raw: unknown,
  file: string,
): Map<string, string> | null {
  if (raw === undefined) return null;
  const parsed = parseFile(file, SentenceEnglishFileSchema, raw);
  return new Map(Object.entries(parsed));
}

function validateTranslationCoverage(
  chapters: Map<string, Chapter>,
  translations: Map<string, string>,
  file: string,
) {
  const needed = new Set<string>();
  for (const chapter of chapters.values()) {
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        for (const variant of sentence.variants) {
          const key =
            variant.id === 'standard'
              ? `${chapter.id}:${sentence.id}`
              : `${chapter.id}:${sentence.id}:${variant.id}`;
          needed.add(key);
        }
      }
    }
  }
  for (const key of needed) {
    if (!translations.has(key)) {
      throw new ContentValidationError(file, key, 'english', `Missing English for "${key}"`);
    }
  }
  for (const key of translations.keys()) {
    if (!needed.has(key)) {
      throw new ContentValidationError(file, key, 'english', `Unused English key "${key}"`);
    }
  }
}

function parseFile<T>(file: string, schema: { parse: (data: unknown) => T }, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ContentValidationError(file, null, 'schema', message);
  }
}

function assertUniqueIds(file: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new ContentValidationError(file, null, 'id', `Duplicate ID "${id}"`);
    }
    seen.add(id);
  }
}

function validateChapterOrdering(numbers: number[], file: string) {
  const sorted = [...numbers].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) {
      throw new ContentValidationError(
        file,
        null,
        'chapters.number',
        `Chapter numbers must be contiguous starting at 1. Got: ${numbers.join(', ')}`,
      );
    }
  }
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] !== i + 1) {
      throw new ContentValidationError(
        file,
        null,
        'chapters.number',
        `Chapters must be listed in ascending order. Got: ${numbers.join(', ')}`,
      );
    }
  }
}

function countTokens(chapter: Chapter): number {
  return chapter.paragraphs.reduce(
    (sum, p) => sum + p.sentences.reduce((s, sent) => s + sent.tokens.length, 0),
    0,
  );
}
