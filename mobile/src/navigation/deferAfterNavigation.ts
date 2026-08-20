import { InteractionManager, Platform } from 'react-native';

/** Run heavy work only after the tab transition / press handler has finished. */
export function deferAfterNavigation(task: () => void): () => void {
  if (Platform.OS === 'web') {
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(task, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(task, 120);
    return () => clearTimeout(id);
  }
  const handle = InteractionManager.runAfterInteractions(task);
  return () => handle.cancel();
}
