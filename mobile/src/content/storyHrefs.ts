import type { Href } from 'expo-router';

/** Always include storyId so routing never depends on chapter number alone. */
export function readerHref(
  storyId: string,
  chapterId: string,
  listen = false,
  replay = false,
): Href {
  const query = new URLSearchParams({ story: storyId });
  if (listen) query.set('listen', '1');
  if (replay) query.set('replay', '1');
  return `/reader/${chapterId}?${query.toString()}` as Href;
}

export function recapHref(storyId: string, chapterId: string): Href {
  return `/recap/${chapterId}?story=${encodeURIComponent(storyId)}` as Href;
}

export function comprehensionHref(storyId: string, chapterId: string): Href {
  return `/comprehension/${chapterId}?story=${encodeURIComponent(storyId)}` as Href;
}

export function speakSceneHref(storyId: string, sceneId: string, returnTo?: string): Href {
  const query = new URLSearchParams({ story: storyId, scene: sceneId });
  if (returnTo) query.set('returnTo', returnTo);
  return `/speak-scene?${query.toString()}` as Href;
}
