import { LUCA_STORY_ID } from '@/src/content/catalog';
import { LUCA_A2_FINAL_CHAPTER_ID } from '@/src/pathway/paths';
import { loadPathwayPrefs, type PathwayPrefs } from '@/src/pathway/storage';
import { peekProgress } from '@/src/progress';
import { unlockAllChapters } from '@/src/progress/unlockAll';
import { isDevBuild } from '@/src/security/buildMode';

/** Learners need Luca A2 complete; dev / unlock-all bypass. */
export async function canAccessA2Plus(): Promise<boolean> {
  if (isDevBuild() || unlockAllChapters()) return true;
  const progress = await peekProgress(LUCA_STORY_ID);
  return Boolean(progress?.completedChapterIds.includes(LUCA_A2_FINAL_CHAPTER_ID));
}

export async function shouldShowPathwayGate(
  prefs?: PathwayPrefs,
): Promise<boolean> {
  const access = await canAccessA2Plus();
  if (!access) return false;
  const resolved = prefs ?? (await loadPathwayPrefs());
  return !resolved.pathwayGateSeen;
}

export function a2PlusLockedHint(): string {
  return 'Finish Luca a Roma Chapter 40 to unlock A2+ pathways';
}
