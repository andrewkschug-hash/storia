import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDeveloperAccess } from '@/src/account';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import {
  friendlyGatewayError,
  gatewayBaseUrl,
  getAudioCatalog,
  getVoiceRoster,
  hydrateVoiceRoster,
  refreshCatalogFromGateway,
  TtsGatewayClient,
  unassignedSpeakersMessage,
} from '@/src/audio';
import { resolveCharacterVoice, resolveSpeakerId } from '@/src/audio/voices';
import { getContentBundle, getChapter } from '@/src/content';
import type { AudioAsset } from '@/src/audio/types';
import type { Sentence } from '@/src/content/schemas';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

const SAMPLE_CHAPTERS = ['luca-a-roma-01', 'luca-a-roma-05', 'luca-a-roma-10', 'luca-a-roma-20'];

function playAudioUrl(url: string): string | null {
  const AudioCtor = (globalThis as { Audio?: typeof Audio }).Audio;
  if (!AudioCtor) return 'Playback is not available in this preview.';
  void new AudioCtor(url).play();
  return null;
}

export default function AudioStudioScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { loading: accessLoading, allowed } = useDeveloperAccess();
  const bundle = getContentBundle();
  const [roster, setRoster] = useState(getVoiceRoster());
  const [chapterId, setChapterId] = useState(SAMPLE_CHAPTERS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState('Generate chapter audio — clips are ready to play immediately.');
  const [busy, setBusy] = useState(false);
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const chapter = getChapter(chapterId);
  const sentences = useMemo(
    () => chapter?.paragraphs.flatMap((p) => p.sentences) ?? [],
    [chapter],
  );
  const selected = sentences.find((s) => s.id === selectedId) ?? sentences[0];

  useEffect(() => {
    if (!allowed) return;
    void hydrateVoiceRoster(getVoiceRoster()).then(setRoster);
  }, [allowed]);

  const base = gatewayBaseUrl();
  const client = useMemo(() => (base ? new TtsGatewayClient(base) : null), [base]);

  const missingSpeakers = useMemo(() => {
    const speakers = new Set<string>();
    for (const s of sentences) {
      if (!resolveCharacterVoice(roster, bundle.characters, s.speakerId)) {
        speakers.add(resolveSpeakerId(s.speakerId));
      }
    }
    return [...speakers];
  }, [sentences, roster, bundle.characters]);

  const payloadFor = useCallback(
    (s: Sentence, regenerate = false) => {
      const voice = resolveCharacterVoice(roster, bundle.characters, s.speakerId);
      if (!voice) throw new Error(unassignedSpeakersMessage([resolveSpeakerId(s.speakerId)]));
      return {
        text: s.text,
        voiceId: voice.voiceId,
        speakerId: resolveSpeakerId(s.speakerId),
        contentId: `sentence:${chapter?.id}:${s.id}:${s.selectedVariantId}`,
        speed: 'normal' as const,
        provider: voice.provider,
        regenerate,
      };
    },
    [roster, bundle.characters, chapter?.id],
  );

  if (accessLoading) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Audio studio' }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </AtmosphereBackground>
    );
  }

  if (!allowed) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Audio studio' }} />
        <Text style={[Typography.body, { color: colors.textSecondary, padding: Spacing.lg }]}>
          Audio studio is development-only.
        </Text>
      </AtmosphereBackground>
    );
  }

  const upsert = (asset: AudioAsset) => {
    setAssets((prev) => {
      const next = prev.filter((a) => a.id !== asset.id);
      next.push(asset);
      return next;
    });
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Audio studio' }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Text style={[Typography.heroTitle, { color: colors.text }]}>Audio studio</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Generate audio for sample chapters. Clips are approved automatically and appear in the reader
          after you reload a chapter.
        </Text>
        <Text style={[Typography.caption, { color: colors.tint, marginTop: Spacing.sm }]}>
          {busy ? 'Generating…' : status}
        </Text>
        {!client ? (
          <Text style={[Typography.caption, { color: colors.danger, marginTop: Spacing.sm }]}>
            {friendlyGatewayError(new Error('Failed to fetch'))}
          </Text>
        ) : null}
        {missingSpeakers.length > 0 ? (
          <Text style={[Typography.caption, { color: colors.danger, marginTop: Spacing.sm }]}>
            {unassignedSpeakersMessage(missingSpeakers)}
          </Text>
        ) : null}

        <View style={styles.row}>
          {SAMPLE_CHAPTERS.map((id) => (
            <Pressable
              key={id}
              onPress={() => {
                setChapterId(id);
                setSelectedId(null);
                setAssets([]);
              }}>
              <Text style={[Typography.label, { color: id === chapterId ? colors.tint : colors.textMuted }]}>
                Ch {bundle.chapters.get(id)?.number}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <StudioButton
            label="Generate chapter"
            disabled={busy || !client || missingSpeakers.length > 0}
            onPress={async () => {
              if (!client || !chapter) return setStatus('Gateway or chapter missing.');
              setBusy(true);
              try {
                const result = await client.batchChapter(
                  chapter.id,
                  sentences.map((s) => payloadFor(s)),
                );
                setAssets(result.assets);
                await refreshCatalogFromGateway(getAudioCatalog());
                if (result.errors.length > 0) {
                  const first = friendlyGatewayError(new Error(result.errors[0].error));
                  setStatus(
                    `Generated ${result.assets.length} clips (${result.errors.length} failed). ${first}`,
                  );
                } else {
                  setStatus(`Generated ${result.assets.length} clips — ready in the reader.`);
                }
              } catch (e) {
                setStatus(friendlyGatewayError(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>

        {selected ? (
          <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              Selected · {resolveSpeakerId(selected.speakerId)} · {selected.id}
            </Text>
            <Text style={[Typography.body, { color: colors.text, marginTop: 4 }]}>{selected.text}</Text>
            <View style={styles.row}>
              <StudioButton
                label="Generate"
                disabled={busy || !client}
                onPress={async () => {
                  if (!client) return setStatus('Gateway not configured.');
                  setBusy(true);
                  try {
                    upsert(await client.generate(payloadFor(selected)));
                    await refreshCatalogFromGateway(getAudioCatalog());
                    setStatus('Generated — ready in the reader.');
                  } catch (e) {
                    setStatus(friendlyGatewayError(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              <StudioButton
                label="Regenerate"
                disabled={busy || !client}
                onPress={async () => {
                  if (!client) return setStatus('Gateway not configured.');
                  setBusy(true);
                  try {
                    upsert(await client.generate(payloadFor(selected, true)));
                    await refreshCatalogFromGateway(getAudioCatalog());
                    setStatus('Regenerated — previous clip replaced.');
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

        {sentences.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setSelectedId(s.id)}
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: selected?.id === s.id ? colors.tint : colors.border,
              },
            ]}>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              {resolveSpeakerId(s.speakerId)} · {s.id}
            </Text>
            <Text style={[Typography.body, { color: colors.text, marginTop: 4 }]}>{s.text}</Text>
          </Pressable>
        ))}

        {assets.map((asset) => (
          <View
            key={asset.id}
            style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              {asset.status} · {asset.speakerId} · {asset.speed} · {asset.provider}
            </Text>
            <Text style={[Typography.body, { color: colors.text, marginTop: 4 }]}>{asset.text}</Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => {
                  if (!asset.audioUrl) return;
                  const playbackError = playAudioUrl(asset.audioUrl);
                  if (playbackError) setStatus(playbackError);
                }}>
                <Text style={[Typography.label, { color: colors.tint }]}>Play</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!client) return;
                  upsert(await client.reject(asset.id));
                }}>
                <Text style={[Typography.label, { color: colors.danger }]}>Reject</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </AtmosphereBackground>
  );
}

function StudioButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: colors.buttonPrimary,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
      ]}>
      <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg, flexWrap: 'wrap' },
  btn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  card: {
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
});
