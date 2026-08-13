import AsyncStorage from '@react-native-async-storage/async-storage';

const LEGACY_KEY = 'storia.hasCompletedOnboarding';
const KEY_PREFIX = 'storia.hasCompletedOnboarding:';

function keyForEmail(email: string): string {
  return `${KEY_PREFIX}${email.trim().toLowerCase()}`;
}

/**
 * Whether this account has finished first-run onboarding.
 * Completion is stored per email so signing in as a returning user does not re-trigger it.
 */
export async function hasCompletedOnboarding(email: string): Promise<boolean> {
  const resolved = email.trim();
  if (!resolved) return false;
  try {
    if ((await AsyncStorage.getItem(keyForEmail(resolved))) === '1') {
      return true;
    }
    // Migrate one-time device-wide flag onto this account when present.
    if ((await AsyncStorage.getItem(LEGACY_KEY)) === '1') {
      await AsyncStorage.setItem(keyForEmail(resolved), '1');
      await AsyncStorage.removeItem(LEGACY_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function markOnboardingComplete(email: string): Promise<void> {
  const resolved = email.trim();
  if (!resolved) return;
  await AsyncStorage.setItem(keyForEmail(resolved), '1');
  try {
    await AsyncStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

/** @internal tests and dev menu */
export async function resetOnboarding(email?: string): Promise<void> {
  const resolved = email?.trim();
  if (resolved) {
    await AsyncStorage.removeItem(keyForEmail(resolved));
    return;
  }
  await AsyncStorage.removeItem(LEGACY_KEY);
}
