import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount, getRememberedEmail, isRememberMeEnabled, saveRememberedEmail, signInWithPassword, signUpWithPassword } from '@/src/account/storage';
import { StoribaseLogo } from '@/src/components/StoribaseLogo';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { useLayout } from '@/src/theme/useLayout';
import { palette, Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

const mediterranean = {
  light: {
    top: '#F7F5F0',
    mid: '#F0EBE1',
    bottom: '#E8E0D2',
    panel: '#EADFCF',
    panelDeep: '#DFCDB8',
    ink: '#26201C',
    inkSoft: '#5C5044',
    caption: '#7A6A58',
    paper: '#FFFFFF',
    border: 'rgba(38, 32, 28, 0.12)',
    borderFocus: '#C97858',
    accent: '#C97858',
    terracotta: '#C97858',
    button: '#26201C',
    buttonLabel: '#FAF6EE',
  },
  dark: {
    top: '#211C19',
    mid: '#1D1815',
    bottom: '#161311',
    panel: '#302A25',
    panelDeep: '#26201C',
    ink: '#F4EBDD',
    inkSoft: '#B9AA9A',
    caption: '#8C7F72',
    paper: '#302A25',
    border: 'rgba(244, 235, 221, 0.12)',
    borderFocus: '#C97858',
    accent: '#C97858',
    terracotta: '#C97858',
    button: '#C97858',
    buttonLabel: '#FAF6EE',
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
  router.replace('/(tabs)/home' as Href);
}

export default function AccountScreen() {
  const { scheme } = useTheme();
  const tone = mediterranean[scheme];
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const wide = layout.isDesktop;
  const [checking, setChecking] = useState(true);
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const requestedMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const [mode, setMode] = useState<'signup' | 'signin'>(
    requestedMode === 'signin' ? 'signin' : 'signup',
  );
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirm' | null>(
    null,
  );
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (requestedMode === 'signin') setMode('signin');
    if (requestedMode === 'signup') setMode('signup');
  }, [requestedMode]);

  useEffect(() => {
    void (async () => {
      const existing = await getAccount();
      if (existing) {
        await continueAfterAccount();
        return;
      }
      const [savedEmail, rememberPref] = await Promise.all([
        getRememberedEmail(),
        isRememberMeEnabled(),
      ]);
      if (savedEmail) {
        setEmail(savedEmail);
      }
      setRememberMe(rememberPref);
      setChecking(false);
    })();
  }, []);

  const switchMode = (next: 'signup' | 'signin') => {
    setMode(next);
    setError(null);
  };

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
      await saveRememberedEmail(mail, rememberMe);
      await continueAfterAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your account. Please try again.');
      setSaving(false);
    }
  };

  const brandFontSize = layout.isPhone ? (layout.width < 360 ? 34 : 38) : 42;
  const panelMinHeight = layout.isCompactHeight
    ? layout.isPhone
      ? 112
      : 160
    : layout.isPhone
      ? 132
      : wide
        ? 420
        : 180;

  return (
    <LinearGradient colors={[tone.top, tone.mid, tone.bottom]} locations={[0, 0.45, 1]} style={styles.flex}>
      {checking ? (
        <View style={styles.center}>
          <ActivityIndicator color={tone.button} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              wide && styles.scrollContentWide,
              {
                paddingTop: insets.top + (layout.isPhone ? Spacing.md : Spacing.lg),
                paddingBottom: insets.bottom + Spacing.lg,
                paddingHorizontal: layout.paddingHorizontal,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Back to homepage"
              onPress={() => router.replace('/' as Href)}
              style={({ pressed }) => [
                styles.backHome,
                { opacity: pressed ? 0.7 : 1, maxWidth: wide ? 980 : layout.contentMaxWidth },
              ]}>
              <Text style={[Typography.label, { color: tone.inkSoft }]}>← Back to homepage</Text>
            </Pressable>
            <View style={[styles.wrap, wide && styles.wrapWide, { maxWidth: wide ? 980 : layout.contentMaxWidth }]}>
              <View
                style={[
                  styles.storyPanel,
                  wide ? styles.storyPanelWide : styles.storyPanelStacked,
                  {
                    backgroundColor: tone.panel,
                    minHeight: panelMinHeight,
                  },
                ]}>
                <LinearGradient
                  colors={[tone.panel, tone.panelDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <StoribaseLogo
                  size={layout.isPhone ? 38 : 46}
                  variant="circle"
                  style={{ marginBottom: Spacing.sm }}
                />
                <Text style={[Typography.brand, { color: tone.ink, fontSize: brandFontSize, lineHeight: brandFontSize + 6 }]}>
                  Storibase
                </Text>
                <View style={[styles.brandRule, { backgroundColor: tone.terracotta }]} />
                <Text
                  style={[
                    Typography.body,
                    {
                      color: tone.inkSoft,
                      fontFamily: 'Literata_400Regular_Italic',
                      marginTop: Spacing.md,
                      fontSize: layout.isPhone ? 15 : 16,
                    },
                  ]}>
                  La tua storia comincia qui
                </Text>
                {!(layout.isPhone && layout.isCompactHeight) ? (
                  <Text
                    style={[
                      Typography.caption,
                      {
                        color: tone.caption,
                        marginTop: Spacing.md,
                        maxWidth: wide ? 280 : undefined,
                      },
                    ]}>
                    Read Italian through stories — one page at a time.
                  </Text>
                ) : null}

                {mode === 'signup' ? (
                  <Pressable
                    onPress={() => switchMode('signin')}
                    style={({ pressed }) => [
                      styles.signInNowBtn,
                      {
                        borderColor: tone.ink,
                        opacity: pressed ? 0.75 : 1,
                        marginTop: layout.isPhone ? Spacing.lg : Spacing.xl,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in now">
                    <Text style={[Typography.button, { color: tone.ink, fontSize: 15 }]}>Sign in now</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={[styles.formColumn, wide && styles.formColumnWide]}>
                <Text
                  style={[
                    Typography.heroTitle,
                    {
                      color: tone.ink,
                      fontSize: layout.isPhone ? 26 : 32,
                      lineHeight: layout.isPhone ? 32 : 40,
                    },
                  ]}>
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

                  <Text
                    style={[
                      Typography.label,
                      { color: tone.ink, marginTop: mode === 'signup' ? Spacing.lg : 0 },
                    ]}>
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
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
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

                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberMe }}
                    accessibilityLabel="Remember me"
                    onPress={() => setRememberMe((prev) => !prev)}
                    style={styles.rememberMeRow}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: rememberMe ? tone.accent : tone.border,
                          backgroundColor: rememberMe ? tone.accent : tone.paper,
                        },
                      ]}>
                      {rememberMe ? (
                        <Text style={[styles.checkmark, { color: tone.paper }]}>✓</Text>
                      ) : null}
                    </View>
                    <Text style={[Typography.body, styles.rememberMeText, { color: tone.ink }]}>
                      Remember me
                    </Text>
                  </Pressable>

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

                  {mode === 'signin' ? (
                    <Pressable
                      onPress={() => switchMode('signup')}
                      style={styles.switchMode}
                      accessibilityRole="button">
                      <Text style={[Typography.caption, { color: tone.inkSoft, textAlign: 'center' }]}>
                        New here? Create an account
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => switchMode('signin')}
                      style={styles.switchMode}
                      accessibilityRole="button"
                      accessibilityLabel="Sign in now">
                      <Text style={[Typography.caption, { color: tone.inkSoft, textAlign: 'center' }]}>
                        Already have an account? Sign in now
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentWide: {
    alignItems: 'center',
  },
  wrap: {
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.lg,
  },
  backHome: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    width: '100%',
    marginBottom: Spacing.sm,
  },
  wrapWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  storyPanel: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  storyPanelStacked: {
    justifyContent: 'flex-end',
  },
  storyPanelWide: {
    flex: 1,
    maxWidth: 420,
    justifyContent: 'center',
  },
  brandRule: {
    width: 56,
    height: 2,
    marginTop: Spacing.md,
    borderRadius: 1,
  },
  signInNowBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: 'center',
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
    minHeight: 48,
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
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    minHeight: 48,
  },
  switchMode: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  rememberMeText: {
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
