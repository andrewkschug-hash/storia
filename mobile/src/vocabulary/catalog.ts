import type { ContentBundle } from '@/src/content/schemas';
import { phraseIdFromSurface } from '@/src/vocabulary/dictionaryIndex';
import type {
  LemmaEncounter,
  PhraseEncounter,
  UserVocabularyState,
  VocabularyStatus,
} from '@/src/vocabulary/types';

export type VocabBrowseItem = {
  kind: 'lemma' | 'phrase';
  id: string;
  italian: string;
  english: string;
  status: VocabularyStatus;
  saved: boolean;
  encounterCount: number;
  chaptersEncountered: string[];
};

export function browseVocabulary(
  bundle: ContentBundle,
  state: UserVocabularyState,
): {
  learning: VocabBrowseItem[];
  familiar: VocabBrowseItem[];
  mastered: VocabBrowseItem[];
  saved: VocabBrowseItem[];
} {
  const items: VocabBrowseItem[] = [];

  for (const row of Object.values(state.lemmas)) {
    if (row.encounterCount <= 0 && !row.saved) continue;
    const entry = bundle.lexicon.find((l) => l.lemmaId === row.lemmaId);
    items.push(toItem('lemma', row, entry?.italian ?? row.lemmaId, entry?.english ?? ''));
  }
  for (const row of Object.values(state.phrases)) {
    if (row.encounterCount <= 0 && !row.saved) continue;
    items.push(toItem('phrase', row, row.surface, phraseEnglish(bundle, row.phraseId)));
  }

  const byItalian = (a: VocabBrowseItem, b: VocabBrowseItem) =>
    a.italian.localeCompare(b.italian, 'it');

  return {
    learning: items.filter((i) => i.status === 'learning').sort(byItalian),
    familiar: items.filter((i) => i.status === 'familiar').sort(byItalian),
    mastered: items.filter((i) => i.status === 'mastered').sort(byItalian),
    saved: items.filter((i) => i.saved).sort(byItalian),
  };
}

function toItem(
  kind: 'lemma' | 'phrase',
  row: LemmaEncounter | PhraseEncounter,
  italian: string,
  english: string,
): VocabBrowseItem {
  return {
    kind,
    id: kind === 'lemma' ? (row as LemmaEncounter).lemmaId : (row as PhraseEncounter).phraseId,
    italian,
    english,
    status: row.status,
    saved: row.saved,
    encounterCount: row.encounterCount,
    chaptersEncountered: [...row.chaptersEncountered],
  };
}

function phraseEnglish(bundle: ContentBundle, phraseId: string): string {
  for (const chapter of bundle.chapters.values()) {
    for (const p of chapter.paragraphs) {
      for (const s of p.sentences) {
        for (const phrase of s.phrases ?? []) {
          if (phraseIdFromSurface(phrase.surface) === phraseId) return phrase.naturalEn;
        }
      }
    }
  }
  return '';
}
