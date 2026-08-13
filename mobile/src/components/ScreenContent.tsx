import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useLayout } from '@/src/theme/useLayout';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Override the default max width for denser or wider screens. */
  maxWidth?: number;
};

/**
 * Centers and constrains page content so tablet/desktop web
 * does not stretch edge-to-edge while phones stay full-bleed.
 */
export function ScreenContent({ children, style, maxWidth }: Props) {
  const layout = useLayout();
  return (
    <View
      style={[
        styles.shell,
        {
          maxWidth: maxWidth ?? layout.contentMaxWidth,
          paddingHorizontal: layout.paddingHorizontal,
          width: '100%',
          alignSelf: 'center',
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexGrow: 1,
  },
});
