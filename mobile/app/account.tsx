import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount, saveAccount } from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

function looksLikeEmail(value: string): boolean {
  const v = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function continueAfterAccount(): Promise<void> {
  const onboarded = await hasCompletedOnboarding();
  if (!onboarded) {
    router.replace('/onboarding' as Href);
    return;
  }
  router.replace('/(tabs)' as Href);
}

export default function AccountScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const existing = await getAccount();
      if (existing) {
        await continueAfterAccount();
        return;
      }
      setChecking(false);
    })();
  }, []);

  const onContinue = async () => {
    const name = displayName.trim();
    const mail = email.trim();
    if (!name) {
      setError('Add a display name to continue.');
      return;
    }
    if (!looksLikeEmail(mail)) {
      setError('Enter a valid email address.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveAccount({ displayName: name, email: mail });
      await continueAfterAccount();
    } catch {
      setError('Could not save your account. Please try again.');
      setSaving(false);
    }
  };

  if (checking) {
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.wrap,
            {
              paddingTop: insets.top + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}>
          <Text style={[Typography.brand, { color: colors.text }]}>Storia</Text>
          <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
            Create your account
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Saved on this device only — no password needed for now.
          </Text>

          <View style={styles.form}>
            <Text style={[Typography.label, { color: colors.text }]}>Display name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              style={[
                styles.input,
                Typography.body,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.border,
                },
              ]}
            />

            <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.lg }]}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={[
                styles.input,
                Typography.body,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.border,
                },
              ]}
            />

            {error ? (
              <Text style={[Typography.caption, { color: colors.danger, marginTop: Spacing.sm }]}>
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={() => void onContinue()}
              disabled={saving}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.tint,
                  opacity: saving ? 0.6 : pressed ? 0.88 : 1,
                  marginTop: Spacing.xl,
                },
              ]}
              accessibilityRole="button">
              <Text style={[Typography.button, { color: '#F7FAF9' }]}>
                {saving ? 'Saving…' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  form: {
    marginTop: Spacing.xl,
  },
  input: {
    marginTop: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  primaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
