import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'storia.hasCompletedOnboarding';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}

/** @internal tests and dev menu */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
