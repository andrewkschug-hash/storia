import type { Chapter } from '@/src/content/schemas';
import { countChapterTokens } from '@/src/telemetry/chapterTokens';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';

export function trackChapterWordsRead(chapter: Chapter, storyId?: string): void {
  trackReadingEvent({
    type: 'words_read',
    storyId: storyId ?? chapter.storyId,
    chapterId: chapter.id,
    tokensRead: countChapterTokens(chapter),
    cefrLevel: chapter.cefrTarget,
  });
}
