import { LinearGradient } from 'expo-linear-gradient';
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
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount, signInWithPassword, signUpWithPassword } from '@/src/account/storage';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { palette, Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

const WIDE_BREAKPOINT = 800;

const mediterranean = {
  light: {
    top: '#F4E6D4',
    mid: '#F8F1E6',
    bottom: '#EDE4D4',
    panel: '#E8D5C0',
    panelDeep: '#D9C4A8',
    ink: '#2C241C',
    inkSoft: '#5C5044',
    caption: '#7A6A58',
    paper: '#FBF6EE',
    border: 'rgba(139, 90, 60, 0.28)',
    borderFocus: palette.coralMute,
    accent: palette.amber,
    terracotta: palette.coralMute,
    button: palette.olive,
    buttonLabel: '#F7FAF9',
  },
  dark: {
    top: '#2A221C',
    mid: '#1C1713',
    bottom: '#14110E',
    panel: '#2E261F',
    panelDeep: '#241E18',
    ink: '#F3EBE0',
    inkSoft: '#C9BBA8',
    caption: '#A0907C',
    paper: '#2A231C',
    border: 'rgba(212, 188, 148, 0.28)',
    borderFocus: palette.amberSoft,
    accent: palette.amberSoft,
    terracotta: palette.coralMute,
    button: palette.oliveBright,
    buttonLabel: '#F7FAF9',
  },
} as const;

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
  const { scheme } = useTheme();
  const tone = mediterranean[scheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirm' | null>(
    null,
  );
  const supabaseReady = isSupabaseConfigured();

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
    if (mode === 'signup' && !name) {
      setError('Add a display name to continue.');
      return;
    }
    if (!looksLikeEmail(mail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUpWithPassword({ displayName: name, email: mail, password });
      } else {
        await signInWithPassword({ email: mail, password });
      }
      await continueAfterAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your account. Please try again.');
      setSaving(false);
    }
  };

  const shell = (
    <LinearGradient colors={[tone.top, tone.mid, tone.bottom]} locations={[0, 0.45, 1]} style={styles.flex}>
      {checking ? (
        <View style={styles.center}>
          <ActivityIndicator color={tone.button} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={[
              styles.wrap,
              wide && styles.wrapWide,
              {
                paddingTop: insets.top + Spacing.lg,
                paddingBottom: insets.bottom + Spacing.lg,
              },
            ]}>
            <View
              style={[
                styles.storyPanel,
                wide ? styles.storyPanelWide : styles.storyPanelNarrow,
                { backgroundColor: tone.panel },
              ]}>
              <LinearGradient
                colors={[tone.panel, tone.panelDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={[Typography.brand, { color: tone.ink }]}>Storia</Text>
              <View style={[styles.brandRule, { backgroundColor: tone.terracotta }]} />
              <Text
                style={[
                  Typography.body,
                  {
                    color: tone.inkSoft,
                    fontFamily: 'Literata_400Regular_Italic',
                    marginTop: Spacing.md,
                  },
                ]}>
                La tua storia comincia qui
              </Text>
              {wide ? (
                <Text style={[Typography.caption, { color: tone.caption, marginTop: Spacing.lg, maxWidth: 280 }]}>
                  Read Italian through stories — one page at a time.
                </Text>
              ) : null}
            </View>

            <View style={[styles.formColumn, wide && styles.formColumnWide]}>
              <Text style={[Typography.heroTitle, { color: tone.ink }]}>
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </Text>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: tone.caption,
                    marginTop: Spacing.sm,
                    fontFamily: 'Literata_400Regular_Italic',
                  },
                ]}>
                {supabaseReady
                  ? 'Your email and password are saved securely with Supabase.'
                  : 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable cloud accounts.'}
              </Text>

              <View style={styles.form}>
                {mode === 'signup' ? (
                  <>
                    <Text style={[Typography.label, { color: tone.ink }]}>Display name</Text>
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Your name"
                      placeholderTextColor={tone.caption}
                      autoCapitalize="words"
                      autoCorrect={false}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField((f) => (f === 'name' ? null : f))}
                      style={[
                        styles.input,
                        Typography.body,
                        {
                          color: tone.ink,
                          backgroundColor: tone.paper,
                          borderColor: focusedField === 'name' ? tone.borderFocus : tone.border,
                          borderWidth: focusedField === 'name' ? 1.5 : StyleSheet.hairlineWidth * 2,
                        },
                      ]}
                    />
                  </>
                ) : null}

                <Text style={[Typography.label, { color: tone.ink, marginTop: mode === 'signup' ? Spacing.lg : 0 }]}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={tone.caption}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField((f) => (f === 'email' ? null : f))}
                  style={[
                    styles.input,
                    Typography.body,
                    {
                      color: tone.ink,
                      backgroundColor: tone.paper,
                      borderColor: focusedField === 'email' ? tone.borderFocus : tone.border,
                      borderWidth: focusedField === 'email' ? 1.5 : StyleSheet.hairlineWidth * 2,
                    },
                  ]}
                />

                <Text style={[Typography.label, { color: tone.ink, marginTop: Spacing.lg }]}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={tone.caption}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={mode === 'signup' ? 'password-new' : 'password'}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField((f) => (f === 'password' ? null : f))}
                  style={[
                    styles.input,
                    Typography.body,
                    {
                      color: tone.ink,
                      backgroundColor: tone.paper,
                      borderColor: focusedField === 'password' ? tone.borderFocus : tone.border,
                      borderWidth: focusedField === 'password' ? 1.5 : StyleSheet.hairlineWidth * 2,
                    },
                  ]}
                />

                {mode === 'signup' ? (
                  <>
                    <Text style={[Typography.label, { color: tone.ink, marginTop: Spacing.lg }]}>
                      Confirm password
                    </Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Repeat password"
                      placeholderTextColor={tone.caption}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField((f) => (f === 'confirm' ? null : f))}
                      style={[
                        styles.input,
                        Typography.body,
                        {
                          color: tone.ink,
                          backgroundColor: tone.paper,
                          borderColor: focusedField === 'confirm' ? tone.borderFocus : tone.border,
                          borderWidth: focusedField === 'confirm' ? 1.5 : StyleSheet.hairlineWidth * 2,
                        },
                      ]}
                    />
                  </>
                ) : null}

                {error ? (
                  <Text style={[Typography.caption, { color: tone.terracotta, marginTop: Spacing.sm }]}>
                    {error}
                  </Text>
                ) : null}

                <View style={[styles.accentRule, { backgroundColor: tone.accent }]} />

                <Pressable
                  onPress={() => void onContinue()}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: tone.button,
                      opacity: saving ? 0.6 : pressed ? 0.88 : 1,
                    },
                  ]}
                  accessibilityRole="button">
                  <Text style={[Typography.button, { color: tone.buttonLabel }]}>
                    {saving ? 'Saving…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
                    setError(null);
                  }}
                  style={styles.switchMode}
                  accessibilityRole="button">
                  <Text style={[Typography.caption, { color: tone.inkSoft, textAlign: 'center' }]}>
                    {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </LinearGradient>
  );

  return shell;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  wrapWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.xl,
  },
  storyPanel: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  storyPanelNarrow: {
    minHeight: 148,
    justifyContent: 'flex-end',
  },
  storyPanelWide: {
    flex: 1,
    maxWidth: 420,
    justifyContent: 'center',
    minHeight: 420,
  },
  brandRule: {
    width: 56,
    height: 2,
    marginTop: Spacing.md,
    borderRadius: 1,
  },
  formColumn: {
    width: '100%',
  },
  formColumnWide: {
    flex: 1,
    maxWidth: 420,
    justifyContent: 'center',
  },
  form: {
    marginTop: Spacing.xl,
  },
  input: {
    marginTop: Spacing.sm,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  accentRule: {
    height: StyleSheet.hairlineWidth * 2,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: 1,
    opacity: 0.85,
  },
  primaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  switchMode: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
