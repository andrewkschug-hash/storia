import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AVATAR_PRESETS, type AvatarId } from '@/src/account/avatars';
import {
  getAccount,
  signOutAccount,
  updateAccountProfile,
  type LocalAccount,
} from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { AvatarBadge } from '@/src/components/AvatarBadge';
import { ScreenContent } from '@/src/components/ScreenContent';
import { AccessibilitySettings } from '@/src/accessibility/AccessibilitySettings';
import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import { navLog } from '@/src/navigation/diagnostics';
import { isDevBuild } from '@/src/security/buildMode';
import { Radii, Spacing } from '@/src/theme/tokens';

export default function ProfileScreen() {
  const { colors, type, minTouchTarget } = useAccessibility();
  const insets = useSafeAreaInsets();
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const next = await getAccount();
    if (!next) {
      router.replace('/account' as Href);
      return;
    }
    setAccount(next);
    setDisplayName(next.displayName);
  }, []);

  useFocusEffect(
    useCallback(() => {
      navLog('profile focus');
      void load();
    }, [load]),
  );

  useEffect(() => {
    navLog('profile mount');
    return () => navLog('profile unmount');
  }, []);

  const saveName = async () => {
    const name = displayName.trim();
    if (!account || name === account.displayName) return;
    if (!name) {
      setError('Add a display name.');
      setDisplayName(account.displayName);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAccountProfile({ displayName: name });
      setAccount(updated);
      setDisplayName(updated.displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your name.');
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async (avatarId: AvatarId) => {
    if (!account || avatarId === account.avatarId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAccountProfile({ avatarId });
      setAccount(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your picture.');
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = () => {
    const run = async () => {
      setSigningOut(true);
      try {
        await signOutAccount();
        router.replace('/account' as Href);
      } catch {
        setSigningOut(false);
        setError('Could not sign out. Try again.');
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Sign out of Storibase?')) void run();
      return;
    }
    Alert.alert('Sign out', 'Sign out of Storibase?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void run() },
    ]);
  };

  if (!account) {
    return (
      <AtmosphereBackground>
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </AtmosphereBackground>
    );
  }

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <Text style={[type.chapterEyebrow, { color: colors.textMuted }]}>Profile</Text>

          <View style={styles.hero}>
            <AvatarBadge avatarId={account.avatarId} size="lg" />
            <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md, textAlign: 'center' }]}>
              {account.displayName}
            </Text>
            <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs, textAlign: 'center' }]}>
              {account.email}
            </Text>
            {isDevBuild() ? (
              <Text style={[type.caption, { color: colors.accent, marginTop: Spacing.xs }]}>
                Developer build
              </Text>
            ) : null}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[type.label, { color: colors.text }]}>Account</Text>

          <Text style={[styles.fieldLabel, type.caption, { color: colors.textSecondary }]}>
            Display name
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            onBlur={() => void saveName()}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!saving && !signingOut}
            style={[
              styles.input,
              type.body,
              {
                color: colors.text,
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
                minHeight: minTouchTarget,
              },
            ]}
          />

          <Text style={[styles.fieldLabel, type.caption, { color: colors.textSecondary }]}>
            Portrait
          </Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>
            Choose a Storibase portrait.
          </Text>
          <View style={styles.avatarRow}>
            {AVATAR_PRESETS.map((preset) => {
              const selected = preset.id === account.avatarId;
              return (
                <Pressable
                  key={preset.id}
                  onPress={() => void pickAvatar(preset.id)}
                  disabled={saving || signingOut}
                  accessibilityRole="button"
                  accessibilityLabel={preset.label}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.avatarChoice,
                    {
                      borderColor: selected ? colors.tint : 'transparent',
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <AvatarBadge avatarId={preset.id} size="md" />
                </Pressable>
              );
            })}
          </View>

          {error ? (
            <Text style={[type.caption, { color: colors.danger, marginTop: Spacing.md }]}>{error}</Text>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <AccessibilitySettings />

          <Pressable
            onPress={onSignOut}
            disabled={signingOut}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.signOut,
              {
                minHeight: minTouchTarget,
                opacity: signingOut ? 0.6 : pressed ? 0.7 : 1,
              },
            ]}>
            <Text style={[type.label, { color: colors.danger }]}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </Pressable>
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.xl,
  },
  fieldLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  input: {
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  avatarRow: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  avatarChoice: {
    borderRadius: 999,
    borderWidth: 2,
    padding: 3,
  },
  signOut: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
