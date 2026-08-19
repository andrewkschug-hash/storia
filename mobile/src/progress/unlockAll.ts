/**
 * Developer review unlock — enabled only in development builds.
 */
let unlockAll = false;

export function setUnlockAllChapters(enabled: boolean): void {
  unlockAll = enabled;
}

export function unlockAllChapters(): boolean {
  return unlockAll;
}

/** @internal tests */
export function __resetUnlockAllChapters(): void {
  unlockAll = false;
}
