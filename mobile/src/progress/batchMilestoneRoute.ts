import type { Href } from 'expo-router';

import { LUCA_STORY_ID, getChapterByNumber } from '@/src/content';
import { getSpeakSceneForBatch } from '@/src/content/speakScenes';
import { readerHref, speakSceneHref } from '@/src/content/storyHrefs';

/** Ch 24 ends A1+ with level gate before speak — not a grammar batch end. */
export function routeAfterChapterComplete(storyId: string, chapterNumber: number): Href | null {
  if (storyId === LUCA_STORY_ID && chapterNumber === 24) {
    return `/level-readiness?fromChapter=24` as Href;
  }
  return null;
}

/** After level-readiness — speak scene at 24, otherwise caller opens next chapter. */
export function routeAfterLevelReadiness(storyId: string, fromChapter: number): Href | null {
  if (storyId === LUCA_STORY_ID && fromChapter === 24) {
    const scene = getSpeakSceneForBatch(storyId, 24);
    if (scene) {
      return speakSceneHref(storyId, scene.id);
    }
  }
  return null;
}

/** After batch word recap — speak scene if this milestone has one. */
export function routeAfterRecap(storyId: string, batchEnd: number, returnTo?: string): Href {
  const scene = getSpeakSceneForBatch(storyId, batchEnd);
  if (scene) {
    return speakSceneHref(storyId, scene.id, returnTo);
  }
  return routeAfterSpeakScene(storyId, batchEnd, returnTo);
}

/** After speak scene (or recap when no scene) — level gate, next chapter, or home. */
export function routeAfterSpeakScene(storyId: string, batchEnd: number, returnTo?: string): Href {
  if (returnTo === 'stories') {
    return '/(tabs)/stories' as Href;
  }
  if (storyId === LUCA_STORY_ID && batchEnd === 20) {
    return `/level-readiness?fromChapter=20` as Href;
  }
  const next = getChapterByNumber(batchEnd + 1, storyId);
  if (next) {
    return readerHref(storyId, next.id);
  }
  return '/(tabs)/home' as Href;
}
