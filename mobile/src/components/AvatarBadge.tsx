import { StyleSheet, Text, View } from 'react-native';

import { getAvatarPreset, type AvatarId } from '@/src/account/avatars';

const SIZES = {
  sm: { box: 36, emoji: 18 },
  md: { box: 56, emoji: 26 },
  lg: { box: 96, emoji: 44 },
} as const;

export function AvatarBadge({
  avatarId,
  size = 'md',
}: {
  avatarId: AvatarId;
  size?: keyof typeof SIZES;
}) {
  const preset = getAvatarPreset(avatarId);
  const dim = SIZES[size];
  return (
    <View
      accessibilityLabel={preset.label}
      style={[
        styles.circle,
        {
          width: dim.box,
          height: dim.box,
          borderRadius: dim.box / 2,
          backgroundColor: preset.background,
        },
      ]}>
      <Text style={{ fontSize: dim.emoji, lineHeight: dim.emoji + 6 }}>{preset.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
