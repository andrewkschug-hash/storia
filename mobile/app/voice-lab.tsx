import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDeveloperAccess } from '@/src/account';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import {
  ASSIGNABLE_CHARACTERS,
  DEFAULT_SAMPLE,
  PROVIDER_LABEL,
  TtsGatewayClient,
  assignmentCaption,
  coreVoicesLocked,
  displayVoiceName,
  friendlyGatewayError,
  gatewayBaseUrl,
  gatewayDownMessage,
  getVoiceRoster,
  hydrateVoiceRoster,
  persistVoiceRoster,
  applyVoiceRoster,
  voiceSubtitle,
} from '@/src/audio';
import type { GatewayStatus, GatewayTestResult } from '@/src/audio/TtsGatewayClient';
import type { TTSProviderId, VoiceInfo, VoiceRoster } from '@/src/audio/types';
import { getContentBundle } from '@/src/content';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

const PROVIDERS: TTSProviderId[] = ['elevenlabs', 'azure', 'google'];

function playUrl(url: string): string | null {
  const AudioCtor = (globalThis as { Audio?: typeof Audio }).Audio;
  if (!AudioCtor) return 'Playback is not available in this preview.';
  void new AudioCtor(url).play();
  return null;
}

export default function VoiceLabScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { loading: accessLoading, allowed } = useDeveloperAccess();
  const base = gatewayBaseUrl();
  const client = useMemo(() => (base ? new TtsGatewayClient(base) : null), [base]);

  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [status, setStatus] = useState('Check the gateway, then load Italian voices.');
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [voicesByProvider, setVoicesByProvider] = useState<Partial<Record<TTSProviderId, VoiceInfo[]>>>({});
  const [roster, setRoster] = useState<VoiceRoster>(getVoiceRoster());
  const [elevenKey, setElevenKey] = useState('');
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshGateway = useCallback(async () => {
    if (!client) {
      setGateway(null);
      setGatewayError(gatewayDownMessage());
      return;
    }
    try {
      const next = await client.status();
      setGateway(next);
      setGatewayError(null);
    } catch {
      setGateway(null);
      setGatewayError(gatewayDownMessage());
    }
  }, [client]);

  useEffect(() => {
    if (!allowed) return;
    void (async () => {
      const stored = await hydrateVoiceRoster(getVoiceRoster());
      applyVoiceRoster(stored);
      setRoster(stored);
      await refreshGateway();
    })();
  }, [allowed, refreshGateway]);

  const setLocalRoster = async (next: VoiceRoster) => {
    applyVoiceRoster(next);
    setRoster(next);
    await persistVoiceRoster(next);
  };

  if (accessLoading) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Voice Lab' }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </AtmosphereBackground>
    );
  }

  if (!allowed) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Voice Lab' }} />
        <Text style={[Typography.body, { color: colors.textSecondary, padding: Spacing.lg }]}>
          Voice Lab is development-only.
        </Text>
      </AtmosphereBackground>
    );
  }

  const connected = Boolean(gateway?.connected);
  const eleven = gateway?.providers.elevenlabs.configured ?? false;
  const azure = gateway?.providers.azure.configured ?? false;
  const google = gateway?.providers.google.configured ?? false;

  const previewVoice = async (provider: TTSProviderId, voice: VoiceInfo) => {
    if (!client) return setStatus(gatewayDownMessage());
    setBusy(true);
    try {
      const asset = await client.generate({
        text,
        voiceId: voice.id,
        speakerId: 'narrator',
        contentId: `voicelab:${provider}:${voice.id}`,
        provider,
        speed: 'normal',
        regenerate: true,
      });
      const playError = asset.audioUrl ? playUrl(asset.audioUrl) : 'No audio came back.';
      setStatus(
        playError ??
          `Playing ${displayVoiceName(voice)} (${PROVIDER_LABEL[provider]}). This is a preview — the story library is not being generated.`,
      );
    } catch (e) {
      setStatus(friendlyGatewayError(e));
    } finally {
      setBusy(false);
    }
  };

  const assignVoice = async (characterId: string, provider: TTSProviderId, voice: VoiceInfo) => {
    if (!client) return setStatus(gatewayDownMessage());
    const label = ASSIGNABLE_CHARACTERS.find((c) => c.id === characterId)?.label ?? characterId;
    const character = getContentBundle().characters.find((c) => c.id === characterId);
    const next: VoiceRoster = {
      ...roster,
      activeProvider: provider,
      characters: {
        ...roster.characters,
        [characterId]: {
          provider,
          voiceId: voice.id,
          language: 'it-IT',
          speakingStyle: character?.voice.speakingStyle ?? '',
          voiceName: displayVoiceName(voice),
          gender: voice.gender,
        },
      },
    };
    setBusy(true);
    try {
      await client.saveAssignment({
        characterId,
        provider,
        voiceId: voice.id,
        voiceName: displayVoiceName(voice),
        gender: voice.gender,
        speakingStyle: character?.voice.speakingStyle ?? '',
      });
      await setLocalRoster(next);
      setAssignFor(null);
      setStatus(`Saved ${displayVoiceName(voice)} as ${label}. You never need the provider’s internal ID.`);
    } catch (e) {
      await setLocalRoster(next);
      setAssignFor(null);
      setStatus(
        `${displayVoiceName(voice)} is assigned to ${label} in this app. ${friendlyGatewayError(e)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const testProvider = async (provider: TTSProviderId) => {
    if (!client) return setStatus(gatewayDownMessage());
    setBusy(true);
    try {
      const result: GatewayTestResult = await client.testProvider(provider);
      setStatus(
        result.ok
          ? `${result.label} is working. Found ${result.voiceCount ?? 0} Italian-capable voices.`
          : `${result.label}: ${result.error ?? 'Could not connect.'}`,
      );
    } catch (e) {
      setStatus(friendlyGatewayError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Voice Lab' }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Text style={[Typography.heroTitle, { color: colors.text }]}>Voice Lab</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Pick Italian speakers by name. Start with ElevenLabs: find Luca, Sofia, and a narrator.
          Preview a sentence, assign the voice, and save. Do not generate the story yet.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Setup</Text>
          <StatusLine label="TTS Gateway" on={connected} onText="Connected" offText="Not running" colors={colors} />
          <StatusLine label="ElevenLabs" on={eleven} onText="API configured" offText="Not configured" colors={colors} />
          <StatusLine label="Azure" on={azure} onText="API configured" offText="Not configured" colors={colors} />
          <StatusLine label="Google" on={google} onText="Cloud TTS ready" offText="Not configured" colors={colors} />

          <View style={styles.row}>
            <LabButton label="Check connection" onPress={() => void refreshGateway()} />
            {eleven ? <LabButton label="Test ElevenLabs" onPress={() => void testProvider('elevenlabs')} /> : null}
            {azure ? <LabButton label="Test Azure" onPress={() => void testProvider('azure')} /> : null}
            {google ? <LabButton label="Test Google" onPress={() => void testProvider('google')} /> : null}
          </View>

          {!connected && gatewayError ? (
            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {gatewayError}
            </Text>
          ) : null}

          {connected && !eleven ? (
            <View style={{ marginTop: Spacing.md }}>
              <Text style={[Typography.label, { color: colors.text }]}>Paste your ElevenLabs API key</Text>
              <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                It is saved only on this computer in services/tts-gateway/.env. The reader app never
                stores it.
              </Text>
              <TextInput
                value={elevenKey}
                onChangeText={setElevenKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="sk-…"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
              />
              <View style={styles.row}>
                <LabButton
                  label="Save key"
                  onPress={async () => {
                    if (!client) return;
                    if (!elevenKey.trim()) return setStatus('Paste the ElevenLabs key first.');
                    setBusy(true);
                    try {
                      const next = await client.saveSetup({ elevenlabsApiKey: elevenKey.trim() });
                      setGateway(next);
                      setElevenKey('');
                      setStatus('ElevenLabs key saved on the gateway. Next: Load Italian Voices.');
                    } catch (e) {
                      setStatus(friendlyGatewayError(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </View>
            </View>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Assigned voices</Text>
          {ASSIGNABLE_CHARACTERS.map((character) => (
            <View key={character.id} style={styles.assignRow}>
              <Text style={[Typography.label, { color: colors.text }]}>{character.label}</Text>
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                {assignmentCaption(roster, character.id)}
              </Text>
            </View>
          ))}
          {coreVoicesLocked(roster) ? (
            <Text style={[Typography.caption, { color: colors.tint, marginTop: Spacing.sm }]}>
              Luca, Sofia, and Narrator are locked in. Next step is Audio studio for a handful of
              sentences — not the full story.
            </Text>
          ) : (
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
              Assign Luca, Sofia, and Narrator before generating any chapters.
            </Text>
          )}
        </View>

        <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.lg }]}>Sample sentence</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundElevated },
          ]}
        />
        <Text style={[Typography.caption, { color: colors.tint, marginTop: Spacing.sm }]}>
          {busy ? 'Working…' : status}
        </Text>

        <View style={styles.row}>
          <LabButton
            label="Load Italian Voices"
            onPress={async () => {
              if (!client) return setStatus(gatewayDownMessage());
              if (!connected) {
                await refreshGateway();
                if (!gateway) return setStatus(gatewayDownMessage());
              }
              setBusy(true);
              try {
                const grouped = (await client.listVoicesGrouped()) as Partial<Record<TTSProviderId, VoiceInfo[]>>;
                setVoicesByProvider(grouped);
                const total = Object.values(grouped).reduce((n, list) => n + (list?.length ?? 0), 0);
                setStatus(
                  total
                    ? `Loaded ${total} voices. Preview one, then tap Use for… to assign it.`
                    : 'No voices yet. Configure ElevenLabs and test the connection.',
                );
              } catch (e) {
                setStatus(friendlyGatewayError(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>

        <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.xl, fontSize: 26 }]}>
          Italian Voices
        </Text>

        {PROVIDERS.map((provider) => {
          const list = voicesByProvider[provider] ?? [];
          const configured = gateway?.providers[provider].configured ?? false;
          if (!configured && list.length === 0) {
            return (
              <View
                key={provider}
                style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                <Text style={[Typography.label, { color: colors.text }]}>{PROVIDER_LABEL[provider]}</Text>
                <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                  {provider === 'elevenlabs'
                    ? 'Start here. Add an API key above, then load voices.'
                    : 'Optional. You can ignore this until ElevenLabs voices are locked.'}
                </Text>
              </View>
            );
          }
          return (
            <View
              key={provider}
              style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
              <Text style={[Typography.label, { color: colors.text }]}>{PROVIDER_LABEL[provider]}</Text>
              {list.length === 0 ? (
                <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                  Tap Load Italian Voices to see speakers from this provider.
                </Text>
              ) : null}
              {list.map((voice) => {
                const name = displayVoiceName(voice);
                const key = `${provider}:${voice.id}`;
                const usedBy = ASSIGNABLE_CHARACTERS.filter(
                  (c) => roster.characters[c.id]?.voiceId === voice.id,
                );
                return (
                  <View key={key} style={styles.voiceBlock}>
                    <Text style={[Typography.body, { color: colors.text }]}>{name}</Text>
                    <Text style={[Typography.caption, { color: colors.textMuted }]}>{voiceSubtitle(voice)}</Text>
                    {usedBy.length > 0 ? (
                      <Text style={[Typography.caption, { color: colors.tint, marginTop: 2 }]}>
                        Assigned to {usedBy.map((c) => c.label).join(', ')}
                      </Text>
                    ) : null}
                    <View style={styles.row}>
                      <LabButton label="Preview" onPress={() => void previewVoice(provider, voice)} />
                      <LabButton
                        label="Use for…"
                        onPress={() => setAssignFor(assignFor === key ? null : key)}
                      />
                    </View>
                    {assignFor === key ? (
                      <View style={styles.row}>
                        {ASSIGNABLE_CHARACTERS.map((character) => (
                          <LabButton
                            key={character.id}
                            label={character.label}
                            onPress={() => void assignVoice(character.id, provider, voice)}
                          />
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </AtmosphereBackground>
  );
}

function StatusLine({
  label,
  on,
  onText,
  offText,
  colors,
}: {
  label: string;
  on: boolean;
  onText: string;
  offText: string;
  colors: { text: string; textMuted: string; tint: string; danger: string };
}) {
  return (
    <View style={styles.statusLine}>
      <Text style={{ color: on ? colors.tint : colors.danger, fontSize: 14 }}>{on ? '●' : '○'}</Text>
      <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.sm }]}>
        {label}: {on ? onText : offText}
      </Text>
    </View>
  );
}

function LabButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
      ]}>
      <Text style={[Typography.button, { color: '#F7FAF9', fontSize: 14 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  input: {
    marginTop: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
    minHeight: 48,
    fontFamily: 'Literata_400Regular',
  },
  card: {
    marginTop: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  row: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, flexWrap: 'wrap' },
  btn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 10 },
  statusLine: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  assignRow: { marginTop: Spacing.sm },
  voiceBlock: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(26, 36, 33, 0.08)',
  },
});
