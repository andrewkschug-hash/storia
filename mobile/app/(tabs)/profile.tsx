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
import { GlobalLanguageHeader } from '@/src/components/GlobalLanguageHeader';
import { ScreenContent } from '@/src/components/ScreenContent';
import { AccessibilitySettings } from '@/src/accessibility/AccessibilitySettings';
import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import { navLog } from '@/src/navigation/diagnostics';
import { isDevBuild } from '@/src/security/buildMode';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';

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
      setError('Inserisci un nome visibile.');
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
      setError(err instanceof Error ? err.message : 'Impossibile aggiornare il nome.');
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
      setError(err instanceof Error ? err.message : 'Impossibile aggiornare il ritratto.');
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
        setError('Impossibile disconnettersi. Riprova.');
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Vuoi uscire da Storibase?')) void run();
      return;
    }
    Alert.alert('Esci', 'Vuoi uscire da Storibase?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: () => void run() },
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
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          <GlobalLanguageHeader breadcrumb="Profilo" />

          <View style={styles.hero}>
            <AvatarBadge avatarId={account.avatarId} size="lg" />
            <Text style={[styles.heroName, { color: colors.text }]}>
              {account.displayName}
            </Text>
            <Text style={[type.caption, { color: colors.textSecondary, marginTop: 2, textAlign: 'center' }]}>
              {account.email}
            </Text>
            {isDevBuild() ? (
              <Text style={[type.caption, { color: colors.accent, marginTop: Spacing.xs }]}>
                Developer build
              </Text>
            ) : null}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.4 }]}>
            Il tuo account
          </Text>

          <Text style={[styles.fieldLabel, type.caption, { color: colors.textSecondary }]}>
            Nome visibile
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            onBlur={() => void saveName()}
            placeholder="Il tuo nome"
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
                minHeight: minTouchTarget,
              },
            ]}
          />

          <Text style={[styles.fieldLabel, type.caption, { color: colors.textSecondary }]}>
            Ritratto
          </Text>
          <Text style={[type.caption, { color: colors.textMuted }]}>
            Scegli il tuo ritratto Storibase.
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

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

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
              {signingOut ? 'Disconnessione in corso…' : 'Esci dall’account'}
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
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    lineHeight: 32,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.lg,
  },
  fieldLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  avatarRow: {
    marginTop: Spacing.sm,
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
    marginTop: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
