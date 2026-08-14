import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDeveloperAccess } from '@/src/account';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import {
  ASSIGNABLE_CHARACTERS,
  DEFAULT_SAMPLE,
  LOCK_SAMPLE_CHAPTERS,
  PROVIDER_LABEL,
  TtsGatewayClient,
  assignmentCaption,
  assignProviderVoice,
  displayVoiceName,
  friendlyGatewayError,
  gatewayBaseUrl,
  gatewayDownMessage,
  getVoiceRoster,
  hydrateVoiceRoster,
  persistVoiceRoster,
  applyVoiceRoster,
  sevenVoicesLocked,
  voiceSubtitle,
} from '@/src/audio';
import { CHAPTER_SENTENCE_GAP_MS, PLAYBACK_RATE } from '@/src/audio/AudioService';
import { playLabPreview, stopLabPreview, waitSentenceGap } from '@/src/audio/labPlayback';
import { allLockSamples, type LockSample } from '@/src/audio/lockSamples';
import { logicalVoiceIdForSpeaker, providerBinding } from '@/src/audio/logicalVoices';
import type { GatewayStatus, GatewayTestResult } from '@/src/audio/TtsGatewayClient';
import type { TTSProviderId, TTSSpeed, VoiceInfo, VoiceRoster } from '@/src/audio/types';
import { getContentBundle } from '@/src/content';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

const PROVIDERS: TTSProviderId[] = ['google', 'elevenlabs', 'azure'];

export default function VoiceLabScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { loading: accessLoading, allowed } = useDeveloperAccess();
  const base = gatewayBaseUrl();
  const client = useMemo(() => (base ? new TtsGatewayClient(base) : null), [base]);

  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [status, setStatus] = useState('Check the gateway, then load Italian Google voices.');
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [voicesByProvider, setVoicesByProvider] = useState<Partial<Record<TTSProviderId, VoiceInfo[]>>>({});
  const [roster, setRoster] = useState<VoiceRoster>(getVoiceRoster());
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [listenSpeed, setListenSpeed] = useState<TTSSpeed>('normal');
  const [compareA, setCompareA] = useState<VoiceInfo | null>(null);
  const [compareB, setCompareB] = useState<VoiceInfo | null>(null);
  const [compareProvider, setCompareProvider] = useState<TTSProviderId>('google');
  const [catalogProvider, setCatalogProvider] = useState<TTSProviderId>('google');

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
  const google = gateway?.providers.google.configured ?? false;
  const eleven = gateway?.providers.elevenlabs.configured ?? false;
  const azure = gateway?.providers.azure.configured ?? false;
  const rate = PLAYBACK_RATE[listenSpeed];

  const generatePreview = async (provider: TTSProviderId, voice: VoiceInfo, sample = text) => {
    if (!client) throw new Error(gatewayDownMessage());
    return client.generate({
      text: sample,
      voiceId: voice.id,
      speakerId: 'narrator',
      contentId: `voicelab:${provider}:${voice.id}:${sample.slice(0, 24)}`,
      provider,
      speed: 'normal',
      regenerate: true,
    });
  };

  const previewVoice = async (provider: TTSProviderId, voice: VoiceInfo, sample = text) => {
    setBusy(true);
    stopLabPreview();
    try {
      const asset = await generatePreview(provider, voice, sample);
      if (!asset.audioUrl) {
        setStatus('No audio came back.');
        return;
      }
      await playLabPreview(asset.audioUrl, listenSpeed);
      setStatus(
        `Generated at 1.0× · playing at ${rate}× (${listenSpeed === 'normal' ? 'Natural' : 'Slow'}). Not the story library.`,
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
    const next = assignProviderVoice(roster, characterId, provider, {
      voiceId: voice.id,
      voiceName: displayVoiceName({ ...voice, provider }),
      gender: voice.gender,
      speakingStyle: character?.voice.speakingStyle ?? '',
    });
    setBusy(true);
    try {
      await client.saveAssignment({
        characterId,
        provider,
        voiceId: voice.id,
        voiceName: displayVoiceName({ ...voice, provider }),
        gender: voice.gender,
        speakingStyle: character?.voice.speakingStyle ?? '',
      });
      await setLocalRoster(next);
      setAssignFor(null);
      setStatus(`Logical voice “${label}” now maps to ${displayVoiceName({ ...voice, provider })} on ${PROVIDER_LABEL[provider]}.`);
    } catch (e) {
      await setLocalRoster(next);
      setAssignFor(null);
      setStatus(`Assigned locally. ${friendlyGatewayError(e)}`);
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
          ? `${result.label} is working. Found ${result.voiceCount ?? 0} Italian voices.`
          : `${result.label}: ${result.error ?? 'Could not connect.'}`,
      );
    } catch (e) {
      setStatus(friendlyGatewayError(e));
    } finally {
      setBusy(false);
    }
  };

  const playCompare = async () => {
    if (!compareA || !compareB) {
      setStatus('Pick voice A and voice B, then compare.');
      return;
    }
    setBusy(true);
    stopLabPreview();
    try {
      const a = await generatePreview(compareProvider, compareA);
      const b = await generatePreview(compareProvider, compareB);
      if (a.audioUrl) {
        setStatus(`A at ${rate}× — ${displayVoiceName({ ...compareA, provider: compareProvider })}`);
        await playLabPreview(a.audioUrl, listenSpeed);
        await waitSentenceGap();
      }
      if (b.audioUrl) {
        setStatus(`B at ${rate}× — ${displayVoiceName({ ...compareB, provider: compareProvider })}`);
        await playLabPreview(b.audioUrl, listenSpeed);
      }
      setStatus(`Compared A vs B at Reader ${rate}× (generated 1.0×, ${CHAPTER_SENTENCE_GAP_MS} ms gap).`);
    } catch (e) {
      setStatus(friendlyGatewayError(e));
    } finally {
      setBusy(false);
    }
  };

  const playLockSamples = async () => {
    if (!client) return setStatus(gatewayDownMessage());
    const samples = allLockSamples();
    setBusy(true);
    stopLabPreview();
    try {
      for (const sample of samples) {
        const logicalId = logicalVoiceIdForSpeaker(roster, sample.speakerId);
        const binding = providerBinding(roster, logicalId, roster.activeProvider);
        if (!binding) {
          setStatus(`No ${roster.activeProvider} map for logical voice ${logicalId} (needed for ${sample.speakerId}).`);
          return;
        }
        const asset = await client.generate({
          text: sample.sentence.text,
          voiceId: binding.voiceId,
          speakerId: sample.speakerId,
          contentId: `voicelab-lock:${sample.chapterNumber}:${sample.sentence.id}`,
          provider: roster.activeProvider,
          speed: 'normal',
          regenerate: true,
        });
        if (!asset.audioUrl) continue;
        setStatus(
          `Ch ${sample.chapterNumber} · ${logicalId} · generated 1.0× · playing ${rate}× — ${sample.sentence.text}`,
        );
        await playLabPreview(asset.audioUrl, listenSpeed);
        await waitSentenceGap();
      }
      setStatus(
        `Lock samples from chapters ${LOCK_SAMPLE_CHAPTERS.join(', ')} finished. This is not the A1 library.`,
      );
    } catch (e) {
      setStatus(friendlyGatewayError(e));
    } finally {
      setBusy(false);
    }
  };

  const lockSamples: LockSample[] = allLockSamples();

  const loadProviderVoices = async (provider: TTSProviderId) => {
    if (!client) return setStatus(gatewayDownMessage());
    setBusy(true);
    try {
      const list = await client.listVoices(provider);
      setVoicesByProvider((prev) => ({ ...prev, [provider]: list }));
      setStatus(
        list.length
          ? `Loaded ${list.length} ${PROVIDER_LABEL[provider]} voices. Preview at ${rate}×, then Use for a logical voice.`
          : `No ${PROVIDER_LABEL[provider]} voices yet.`,
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
          Character → logical voice → Google voice. Generate at 1.0×. Listen at the Reader rates:
          Natural {PLAYBACK_RATE.normal}×, Slow {PLAYBACK_RATE.slow}×, {CHAPTER_SENTENCE_GAP_MS} ms between
          sentences. Do not generate the story library here.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Setup</Text>
          <StatusLine label="TTS Gateway" on={connected} onText="Connected" offText="Not running" colors={colors} />
          <StatusLine label="Google" on={google} onText="Cloud TTS ready" offText="Not configured" colors={colors} />
          <StatusLine label="ElevenLabs" on={eleven} onText="API configured" offText="Not configured" colors={colors} />
          <StatusLine label="Azure" on={azure} onText="API configured" offText="Not configured" colors={colors} />
          <View style={styles.row}>
            <LabButton label="Check connection" onPress={() => void refreshGateway()} />
            {google ? <LabButton label="Test Google" onPress={() => void testProvider('google')} /> : null}
            {eleven ? <LabButton label="Test ElevenLabs" onPress={() => void testProvider('elevenlabs')} /> : null}
            {azure ? <LabButton label="Test Azure" onPress={() => void testProvider('azure')} /> : null}
          </View>
          {!connected && gatewayError ? (
            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {gatewayError}
            </Text>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Reader playback preview</Text>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
            Google always generates at 1.0×. These buttons only change how the Lab plays the clip.
          </Text>
          <View style={styles.row}>
            <LabButton
              label={`Natural ${PLAYBACK_RATE.normal}×`}
              active={listenSpeed === 'normal'}
              onPress={() => setListenSpeed('normal')}
            />
            <LabButton
              label={`Slow ${PLAYBACK_RATE.slow}×`}
              active={listenSpeed === 'slow'}
              onPress={() => setListenSpeed('slow')}
            />
            <LabButton label="Stop" onPress={() => stopLabPreview()} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Seven logical voices</Text>
          {ASSIGNABLE_CHARACTERS.map((character) => (
            <View key={character.id} style={styles.assignRow}>
              <Text style={[Typography.label, { color: colors.text }]}>{character.label}</Text>
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                {assignmentCaption(roster, character.id)}
              </Text>
            </View>
          ))}
          {sevenVoicesLocked(roster) ? (
            <Text style={[Typography.caption, { color: colors.tint, marginTop: Spacing.sm }]}>
              All seven logical voices have a {PROVIDER_LABEL[roster.activeProvider]} map. Freeze this
              roster before any A1 batch.
            </Text>
          ) : (
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
              Assign all seven, including Padrone, before generating chapters.
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
          {PROVIDERS.map((provider) => (
            <LabButton
              key={provider}
              label={`Load ${PROVIDER_LABEL[provider]}`}
              active={catalogProvider === provider}
              onPress={() => {
                setCatalogProvider(provider);
                void loadProviderVoices(provider);
              }}
            />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Compare two Google voices</Text>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
            Same sentence, generated 1.0×, played at {rate}× with a {CHAPTER_SENTENCE_GAP_MS} ms gap.
          </Text>
          <Text style={[Typography.caption, { color: colors.text, marginTop: Spacing.sm }]}>
            A: {compareA ? `${displayVoiceName({ ...compareA, provider: compareProvider })} (${compareA.id})` : 'not set'}
          </Text>
          <Text style={[Typography.caption, { color: colors.text }]}>
            B: {compareB ? `${displayVoiceName({ ...compareB, provider: compareProvider })} (${compareB.id})` : 'not set'}
          </Text>
          <View style={styles.row}>
            <LabButton label="Play A then B" onPress={() => void playCompare()} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Lock samples (not the library)</Text>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
            A few sentences from Luca chapters {LOCK_SAMPLE_CHAPTERS.join(', ')} — narration and dialogue.
            Uses assigned logical voices. Does not package A1.
          </Text>
          {lockSamples.map((sample) => (
            <Text
              key={`${sample.chapterNumber}:${sample.sentence.id}`}
              style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
              Ch {sample.chapterNumber} · {sample.speakerId} · {sample.sentence.text}
            </Text>
          ))}
          <View style={styles.row}>
            <LabButton label="Preview lock samples" onPress={() => void playLockSamples()} />
          </View>
        </View>

        <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.xl, fontSize: 26 }]}>
          Voice catalogs
        </Text>
        <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
          Google and ElevenLabs are separate lists. Tap a provider above to load only that catalog.
        </Text>
        <View style={styles.row}>
          {PROVIDERS.map((provider) => (
            <LabButton
              key={`tab-${provider}`}
              label={PROVIDER_LABEL[provider]}
              active={catalogProvider === provider}
              onPress={() => setCatalogProvider(provider)}
            />
          ))}
        </View>

        {(() => {
          const provider = catalogProvider;
          const list = voicesByProvider[provider] ?? [];
          const configured = gateway?.providers[provider].configured ?? false;
          return (
            <View
              style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                {PROVIDER_LABEL[provider]} voices
              </Text>
              <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                {provider === 'google'
                  ? 'Canonical lock catalog. Assign these to the seven logical voices.'
                  : 'Separate fallback catalog. Assignments here do not mix with Google.'}
              </Text>
              {!configured && list.length === 0 ? (
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  {PROVIDER_LABEL[provider]} is not configured. Use Setup above, then load this catalog.
                </Text>
              ) : null}
              {configured && list.length === 0 ? (
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  Tap Load {PROVIDER_LABEL[provider]} to fetch this list.
                </Text>
              ) : null}
              {list.map((voice) => {
                const named = { ...voice, provider };
                const name = displayVoiceName(named);
                const key = `${provider}:${voice.id}`;
                const usedBy = ASSIGNABLE_CHARACTERS.filter((c) => {
                  const binding = providerBinding(roster, c.id, provider);
                  return binding?.voiceId === voice.id;
                });
                return (
                  <View key={key} style={styles.voiceBlock}>
                    <Text style={[Typography.body, { color: colors.text }]}>{name}</Text>
                    <Text style={[Typography.caption, { color: colors.textMuted }]}>{voiceSubtitle(named)}</Text>
                    {provider === 'google' ? (
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>ID {voice.id}</Text>
                    ) : null}
                    {usedBy.length > 0 ? (
                      <Text style={[Typography.caption, { color: colors.tint, marginTop: 2 }]}>
                        Logical voices: {usedBy.map((c) => c.label).join(', ')}
                      </Text>
                    ) : null}
                    <View style={styles.row}>
                      <LabButton label="Preview" onPress={() => void previewVoice(provider, voice)} />
                      <LabButton
                        label="Use for…"
                        onPress={() => setAssignFor(assignFor === key ? null : key)}
                      />
                      {provider === 'google' ? (
                        <>
                          <LabButton
                            label="Set as A"
                            onPress={() => {
                              setCompareProvider('google');
                              setCompareA(voice);
                            }}
                          />
                          <LabButton
                            label="Set as B"
                            onPress={() => {
                              setCompareProvider('google');
                              setCompareB(voice);
                            }}
                          />
                        </>
                      ) : null}
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
        })()}
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

function LabButton({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: active ? colors.tint : colors.background,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.tint,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      <Text style={[Typography.button, { color: active ? colors.onTint ?? '#F7FAF9' : colors.tint, fontSize: 14 }]}>
        {label}
      </Text>
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
