import type { UserVocabularyState } from '@/src/vocabulary/types';
import { createEmptyVocabularyState } from '@/src/vocabulary/types';
import { cloneVocabularyState, normalizeVocabularyState } from '@/src/vocabulary/normalize';

export {
  createLemmaEncounter,
  createPhraseEncounter,
} from '@/src/vocabulary/normalize';

export interface UserVocabularyRepository {
  get(): Promise<UserVocabularyState>;
  save(state: UserVocabularyState): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryUserVocabularyRepository implements UserVocabularyRepository {
  private state: UserVocabularyState = createEmptyVocabularyState();

  async get(): Promise<UserVocabularyState> {
    return cloneVocabularyState(normalizeVocabularyState(this.state));
  }

  async save(state: UserVocabularyState): Promise<void> {
    this.state = cloneVocabularyState(normalizeVocabularyState(state));
  }

  async clear(): Promise<void> {
    this.state = createEmptyVocabularyState();
  }
}
