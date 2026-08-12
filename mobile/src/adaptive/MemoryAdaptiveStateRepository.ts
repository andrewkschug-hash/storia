import type { AdaptivePersistedState } from '@/src/adaptive/types';
import { createEmptyAdaptiveState } from '@/src/adaptive/types';

export interface AdaptiveStateRepository {
  get(): Promise<AdaptivePersistedState>;
  save(state: AdaptivePersistedState): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryAdaptiveStateRepository implements AdaptiveStateRepository {
  private state: AdaptivePersistedState = createEmptyAdaptiveState();

  async get(): Promise<AdaptivePersistedState> {
    return structuredClone(this.state);
  }

  async save(state: AdaptivePersistedState): Promise<void> {
    this.state = structuredClone(state);
  }

  async clear(): Promise<void> {
    this.state = createEmptyAdaptiveState();
  }
}
