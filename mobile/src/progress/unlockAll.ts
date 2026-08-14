/**
 * Developer-account review unlock. Not __DEV__, not every local tester —
 * only the Storia developer account.
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
