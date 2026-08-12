import { z } from 'zod';

export const DifficultyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const FrequencySchema = z.enum(['high', 'medium', 'low']);

export const CefrLevelSchema = z.enum(['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1']);
export const FrequencyBandSchema = z.enum(['very_common', 'common', 'uncommon', 'rare']);
export const RegisterSchema = z.enum(['neutral', 'informal', 'formal', 'literary']);
export const AbstractnessSchema = z.enum(['concrete', 'mixed', 'abstract']);

export const CharacterVoiceSchema = z.object({
  provider: z.enum(['elevenlabs', 'azure', 'google']).nullable(),
  voiceId: z.string().nullable(),
  language: z.literal('it-IT').default('it-IT'),
  speakingStyle: z.string().optional(),
});

export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  gender: z.enum(['male', 'female', 'neutral']),
  ageDescription: z.string(),
  description: z.string(),
  storyRole: z.string(),
  relationships: z.array(z.string()).default([]),
  knownLocationIds: z.array(z.string()).default([]),
  voice: CharacterVoiceSchema,
});

export const LocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().optional(),
  description: z.string().optional(),
});

export const LexiconEntrySchema = z.object({
  lemmaId: z.string().min(1),
  italian: z.string().min(1),
  english: z.string().min(1),
  partOfSpeech: z.string().min(1),
  difficulty: DifficultyLevelSchema,
  frequency: FrequencySchema,
  introducedChapter: z.number().int().positive().optional(),
  notes: z.string().optional(),
  inflections: z.array(z.string()).optional(),
  cefrLevel: CefrLevelSchema.optional(),
  cefrConfidence: z.number().min(0).max(1).optional(),
  frequencyBand: FrequencyBandSchema.optional(),
  register: RegisterSchema.optional(),
  topic: z.string().optional(),
  abstractness: AbstractnessSchema.optional(),
});

export const PhraseSchema = z.object({
  surface: z.string().min(1),
  literalEn: z.string().min(1),
  naturalEn: z.string().min(1),
  /** Inclusive lemma indices within the sentence lemmas/tokens array */
  tokenStart: z.number().int().nonnegative(),
  tokenEnd: z.number().int().nonnegative(),
});

export const TokenSchema = z.object({
  surface: z.string().min(1),
  lemmaId: z.string().min(1),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

/**
 * Authoring format: lemmas[] aligns 1:1 with whitespace/punct-split words in text.
 * Loader expands to Token[].
 */
export const SentenceVariantSourceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  lemmas: z.array(z.string().min(1)).min(1),
  phrases: z.array(PhraseSchema).optional(),
  reinforces: z.array(z.string().min(1)).optional(),
  phraseReinforces: z.array(z.string().min(1)).optional(),
  introduces: z.array(z.string().min(1)).optional(),
  difficulty: DifficultyLevelSchema.optional(),
});

export const SentenceSourceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  speakerId: z.string().nullable(),
  kind: z.enum(['narration', 'dialogue']),
  lemmas: z.array(z.string().min(1)).min(1),
  phrases: z.array(PhraseSchema).optional(),
  reinforces: z.array(z.string().min(1)).optional(),
  phraseReinforces: z.array(z.string().min(1)).optional(),
  introduces: z.array(z.string().min(1)).optional(),
  difficulty: DifficultyLevelSchema.optional(),
  variants: z.array(SentenceVariantSourceSchema).optional(),
});

export const ParagraphSourceSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  sentences: z.array(SentenceSourceSchema).min(1),
});

export const StoryEventSchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  characterIds: z.array(z.string()).default([]),
  locationIds: z.array(z.string()).default([]),
  rememberedFacts: z.array(z.string()).default([]),
});

export const ComprehensionQuestionTypeSchema = z.enum([
  'direct',
  'event',
  'character',
  'sequence',
  'inference',
]);

export const ComprehensionQuestionSchema = z
  .object({
    id: z.string().min(1),
    chapterId: z.string().min(1),
    type: ComprehensionQuestionTypeSchema,
    question: z.string().min(1),
    questionIt: z.string().min(1).optional(),
    choices: z.array(z.string().min(1)).min(2).max(4),
    correctChoice: z.number().int().nonnegative(),
    explanation: z.string().min(1),
    difficulty: DifficultyLevelSchema.default(1),
  })
  .superRefine((q, ctx) => {
    if (q.correctChoice >= q.choices.length) {
      ctx.addIssue({
        code: 'custom',
        message: `correctChoice ${q.correctChoice} out of range for ${q.choices.length} choices`,
        path: ['correctChoice'],
      });
    }
  });

export const ChapterSourceSchema = z.object({
  id: z.string().min(1),
  storyId: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  titleIt: z.string().min(1),
  difficultyLevel: DifficultyLevelSchema,
  locationIds: z.array(z.string()).default([]),
  characterIds: z.array(z.string()).default([]),
  events: z.array(StoryEventSchema).default([]),
  paragraphs: z.array(ParagraphSourceSchema).min(1),
  questions: z.array(ComprehensionQuestionSchema).min(2).max(4),
});

export const ChapterSummarySchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  titleIt: z.string().min(1),
  difficultyLevel: DifficultyLevelSchema,
  file: z.string().min(1),
});

export const StoryArcSchema = z.object({
  id: z.string().min(1),
  storyId: z.string().min(1),
  cefrLevel: CefrLevelSchema,
  title: z.string().min(1),
  titleIt: z.string().min(1),
  description: z.string().min(1),
  narrativeStage: z.string().min(1),
  chapterStart: z.number().int().positive(),
  chapterEnd: z.number().int().nonnegative(),
  status: z.enum(['available', 'planned']).default('planned'),
});

export const StoryManifestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  titleIt: z.string().min(1),
  slug: z.string().min(1),
  level: DifficultyLevelSchema,
  cefrLevel: CefrLevelSchema.optional(),
  synopsis: z.string().min(1),
  characterIds: z.array(z.string()).min(1),
  locationIds: z.array(z.string()).default([]),
  chapters: z.array(ChapterSummarySchema).min(1),
  arcs: z.array(StoryArcSchema).optional(),
});

export const CharactersFileSchema = z.object({
  characters: z.array(CharacterSchema).min(1),
});

export const LocationsFileSchema = z.object({
  locations: z.array(LocationSchema).min(1),
});

export const LexiconFileSchema = z.object({
  lexicon: z.array(LexiconEntrySchema).min(1),
});

export const SentenceEnglishFileSchema = z.record(z.string().min(1), z.string().min(1));

export const AdaptiveOverlaySchema = z.object({
  sentences: z.record(
    z.string(),
    z.object({
      reinforces: z.array(z.string().min(1)).optional(),
      phraseReinforces: z.array(z.string().min(1)).optional(),
      introduces: z.array(z.string().min(1)).optional(),
      difficulty: DifficultyLevelSchema.optional(),
      variants: z.array(SentenceVariantSourceSchema).optional(),
    }),
  ),
});

export type Character = z.infer<typeof CharacterSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type CefrLevel = z.infer<typeof CefrLevelSchema>;
export type LexiconEntry = z.infer<typeof LexiconEntrySchema> & {
  cefrLevel: CefrLevel;
  cefrConfidence: number;
  frequencyBand: z.infer<typeof FrequencyBandSchema>;
  register: z.infer<typeof RegisterSchema>;
  topic: string;
  abstractness: z.infer<typeof AbstractnessSchema>;
};
export type SentenceSource = z.infer<typeof SentenceSourceSchema>;
export type SentenceVariantSource = z.infer<typeof SentenceVariantSourceSchema>;
export type AdaptiveOverlay = z.infer<typeof AdaptiveOverlaySchema>;
export type ChapterSource = z.infer<typeof ChapterSourceSchema>;
export type StoryManifest = z.infer<typeof StoryManifestSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type Phrase = z.infer<typeof PhraseSchema>;
export type ComprehensionQuestion = z.infer<typeof ComprehensionQuestionSchema>;
export type ComprehensionQuestionType = z.infer<typeof ComprehensionQuestionTypeSchema>;

export type SentenceVariant = {
  id: string;
  text: string;
  english: string | null;
  tokens: Token[];
  phrases: Phrase[];
  reinforces: string[];
  phraseReinforces: string[];
  introduces: string[];
  difficulty: 1 | 2 | 3 | 4;
};

export type Sentence = {
  id: string;
  text: string;
  english: string | null;
  speakerId: string | null;
  kind: 'narration' | 'dialogue';
  tokens: Token[];
  phrases: Phrase[];
  reinforces: string[];
  phraseReinforces: string[];
  introduces: string[];
  difficulty: 1 | 2 | 3 | 4;
  variants: SentenceVariant[];
  selectedVariantId: string;
  /** Optional approved-asset pointer. Lookup still requires matching text. */
  audioAssetId?: string | null;
};

export type Paragraph = {
  id: string;
  order: number;
  sentences: Sentence[];
};

export type Chapter = {
  id: string;
  storyId: string;
  number: number;
  title: string;
  titleIt: string;
  difficultyLevel: 1 | 2 | 3 | 4;
  cefrTarget: CefrLevel;
  arcId: string | null;
  locationIds: string[];
  characterIds: string[];
  events: z.infer<typeof StoryEventSchema>[];
  paragraphs: Paragraph[];
  questions: ComprehensionQuestion[];
};

export type Story = StoryManifest & {
  chapters: Array<z.infer<typeof ChapterSummarySchema> & { wordCount: number }>;
  arcs: Array<z.infer<typeof StoryArcSchema> & { major?: string }>;
};

export type ContentBundle = {
  characters: Character[];
  locations: Location[];
  lexicon: LexiconEntry[];
  lexiconById: Map<string, LexiconEntry>;
  story: Story;
  chapters: Map<string, Chapter>;
};
