import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isAvatarId, type AvatarId } from '@/src/account/avatars';
import { AvatarBadge } from '@/src/components/AvatarBadge';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  breadcrumb?: string;
  avatarId?: string | AvatarId | null;
};

export function GlobalLanguageHeader({ breadcrumb, avatarId }: Props) {
  const { colors, type } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.languagePill}>
        <View style={[styles.spineDot, { backgroundColor: colors.tint }]} />
        <Text style={[type.chapterEyebrow, { color: colors.textSecondary, letterSpacing: 1.2 }]}>
          Italiano 🇮🇹
        </Text>
        {breadcrumb ? (
          <>
            <Text style={[type.caption, { color: colors.textMuted }]}>/</Text>
            <Text style={[type.caption, { color: colors.textSecondary }]}>{breadcrumb}</Text>
          </>
        ) : null}
      </View>

      {isAvatarId(avatarId) ? (
        <Pressable
          onPress={() => router.push('/(tabs)/profile' as Href)}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
          <AvatarBadge avatarId={avatarId} size="sm" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingVertical: 4,
  },
  spineDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.pill,
  },
});
