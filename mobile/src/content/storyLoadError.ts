import type { StoryAvailability } from '@/src/content/schemas';

export class StoryLoadError extends Error {
  readonly storyId: string;
  readonly status: StoryAvailability | 'unknown';

  constructor(storyId: string, status: StoryAvailability | 'unknown', message: string) {
    super(message);
    this.name = 'StoryLoadError';
    this.storyId = storyId;
    this.status = status;
  }
}
