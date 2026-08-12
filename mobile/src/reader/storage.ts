import AsyncStorage from '@react-native-async-storage/async-storage';

const TIP_KEY = 'storia.hasSeenReaderTip';

export async function hasSeenReaderTip(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(TIP_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markReaderTipSeen(): Promise<void> {
  await AsyncStorage.setItem(TIP_KEY, '1');
}

/** @internal tests and dev menu */
export async function resetReaderTip(): Promise<void> {
  await AsyncStorage.removeItem(TIP_KEY);
}
