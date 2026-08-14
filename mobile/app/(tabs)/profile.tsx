import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { AccessibilitySettings } from '@/src/accessibility/AccessibilitySettings';
import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import { Radii, Spacing } from '@/src/theme/tokens';

export default function ProfileScreen() {
  const { colors, type } = useAccessibility();
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
      void load();
    }, [load]),
  );

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
      if (typeof window !== 'undefined' && window.confirm('Sign out of Storia?')) void run();
      return;
    }
    Alert.alert('Sign out', 'Sign out of Storia?', [
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={[type.chapterEyebrow, { color: colors.textMuted }]}>Profile</Text>
        <View style={styles.hero}>
          <AvatarBadge avatarId={account.avatarId} size="lg" />
          <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md, textAlign: 'center' }]}>
            {account.displayName}
          </Text>
          <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
            {account.email}
          </Text>
          {account.role === 'developer' ? (
            <Text style={[type.caption, { color: colors.accent, marginTop: Spacing.xs }]}>Developer</Text>
          ) : null}
        </View>

        <Text style={[type.label, { color: colors.text, marginTop: Spacing.xl }]}>Display name</Text>
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
            },
          ]}
        />

        <Text style={[type.label, { color: colors.text, marginTop: Spacing.xl }]}>Picture</Text>
        <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
          Pick a Storia portrait — no photo upload yet.
        </Text>
        <View style={styles.grid}>
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
                    borderColor: selected ? colors.tint : colors.border,
                    backgroundColor: colors.backgroundElevated,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                <AvatarBadge avatarId={preset.id} size="md" />
                <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text style={[type.caption, { color: colors.danger, marginTop: Spacing.md }]}>{error}</Text>
        ) : null}

        <AccessibilitySettings />

        <Pressable
          onPress={onSignOut}
          disabled={signingOut}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.signOut,
            {
              borderColor: colors.danger,
              opacity: signingOut ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}>
          <Text style={[type.button, { color: colors.danger }]}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </Pressable>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  input: {
    marginTop: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  grid: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  avatarChoice: {
    width: '23%',
    minWidth: 72,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 2,
  },
  signOut: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
