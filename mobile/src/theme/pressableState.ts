import type { PressableStateCallbackType } from 'react-native';

/** Web exposes `focused` on Pressable state; native builds do not. */
export function isPressableFocused(state: PressableStateCallbackType): boolean {
  return 'focused' in state && state.focused === true;
}
