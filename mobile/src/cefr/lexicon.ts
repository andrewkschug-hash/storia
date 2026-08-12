import type { CEFRLevel } from '@/src/cefr/levels';
import type { LexiconEntry } from '@/src/content/schemas';

export type FrequencyBand = 'very_common' | 'common' | 'uncommon' | 'rare';
export type Register = 'neutral' | 'informal' | 'formal' | 'literary';
export type Abstractness = 'concrete' | 'mixed' | 'abstract';

const ABSTRACT = new Set([
  'problema',
  'idea',
  'opportunita',
  'piano',
  'aiuto',
  'lavoro',
  'tempo',
  'viaggio',
  'sorpresa',
  'importante',
  'difficile',
  'facile',
  'insieme',
]);

const NAMES = new Set(['luca', 'sofia', 'marco', 'giulia', 'rosa', 'roma']);

type LexiconSeed = Pick<LexiconEntry, 'lemmaId' | 'italian' | 'english' | 'partOfSpeech' | 'difficulty' | 'frequency'> &
  Partial<Pick<LexiconEntry, 'cefrLevel' | 'cefrConfidence' | 'frequencyBand' | 'register' | 'topic' | 'abstractness'>>;

export function deriveCefrMetadata(entry: LexiconSeed): {
  cefrLevel: CEFRLevel;
  cefrConfidence: number;
  frequencyBand: FrequencyBand;
  register: Register;
  topic: string;
  abstractness: Abstractness;
} {
  if (entry.cefrLevel && entry.frequencyBand && entry.register && entry.topic && entry.abstractness) {
    return {
      cefrLevel: entry.cefrLevel,
      cefrConfidence: entry.cefrConfidence ?? 0.9,
      frequencyBand: entry.frequencyBand,
      register: entry.register,
      topic: entry.topic,
      abstractness: entry.abstractness,
    };
  }

  const frequencyBand: FrequencyBand =
    entry.frequency === 'high' ? 'very_common' : entry.frequency === 'medium' ? 'common' : 'uncommon';

  let cefrLevel: CEFRLevel = 'A1';
  if (entry.difficulty === 1) cefrLevel = frequencyBand === 'uncommon' ? 'A1+' : 'A1';
  else if (entry.difficulty === 2) cefrLevel = frequencyBand === 'very_common' ? 'A2' : 'A2+';
  else if (entry.difficulty === 3) cefrLevel = 'B1';
  else cefrLevel = 'B2';

  if (NAMES.has(entry.lemmaId)) cefrLevel = 'A1';

  const abstractness: Abstractness = ABSTRACT.has(entry.lemmaId)
    ? 'abstract'
    : NAMES.has(entry.lemmaId) || entry.partOfSpeech === 'proper'
      ? 'concrete'
      : entry.partOfSpeech === 'noun' || entry.partOfSpeech === 'adjective'
        ? 'concrete'
        : 'mixed';

  const topic =
    NAMES.has(entry.lemmaId)
      ? 'people-places'
      : entry.partOfSpeech === 'verb'
        ? 'everyday-actions'
        : 'everyday';

  return {
    cefrLevel: entry.cefrLevel ?? cefrLevel,
    cefrConfidence: entry.cefrConfidence ?? 0.6,
    frequencyBand: entry.frequencyBand ?? frequencyBand,
    register: entry.register ?? 'neutral',
    topic: entry.topic ?? topic,
    abstractness: entry.abstractness ?? abstractness,
  };
}

export function enrichLexiconEntry(entry: LexiconSeed): LexiconEntry {
  return { ...entry, ...deriveCefrMetadata(entry) } as LexiconEntry;
}
