import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AudioService, createCatalog } from '@/src/audio/AudioService';
import { AudioCatalog, shouldReuseGeneratedAsset } from '@/src/audio/catalog';
import { audioCacheKey, textHash } from '@/src/audio/cacheKey';
import { FakeTTSProvider, selectTTSProvider } from '@/src/audio/FakeTTSProvider';
import { hasCachedAudioUrl, __resetLocalAudioCache } from '@/src/audio/localCache';
import { SilentAudioPlayer } from '@/src/audio/playback';
import type { AudioAsset, TTSProvider, VoiceRoster } from '@/src/audio/types';
import { NARRATOR_ID, resolveCharacterVoice, resolveSpeakerId, selectProvider } from '@/src/audio/voices';
import { loadContentBundle } from '@/src/content/loadContentBundle';
import type { Character, ContentBundle, Sentence } from '@/src/content/schemas';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: async (key: string) => {
        store.delete(key);
      },
    },
  };
});

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadBundle(): ContentBundle {
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  }
  return loadContentBundle({
    charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
    locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
    lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
    manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
    chapterJsonByFile,
    adaptiveJson: JSON.parse(readFileSync(join(storyPath, 'adaptive-variants.json'), 'utf8')),
    storyPath: 'stories/luca-a-roma',
  });
}

const roster: VoiceRoster = {
  activeProvider: 'elevenlabs',
  generationVersion: 1,
  characters: {
    luca: {
      provider: 'elevenlabs',
      voiceId: 'voice-luca',
      language: 'it-IT',
      speakingStyle: 'young Italian male, natural conversational',
    },
    sofia: {
      provider: 'elevenlabs',
      voiceId: 'voice-sofia',
      language: 'it-IT',
      speakingStyle: 'young Italian female, warm and clear',
    },
    narrator: {
      provider: 'elevenlabs',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speakingStyle: 'clear Italian narrative, emotionally neutral',
    },
  },
};

function sentence(partial: Partial<Sentence> & Pick<Sentence, 'id' | 'text'>): Sentence {
  return {
    speakerId: null,
    english: null,
    kind: 'narration',
    tokens: [],
    phrases: [],
    reinforces: [],
    phraseReinforces: [],
    introduces: [],
    difficulty: 1,
    variants: [],
    selectedVariantId: 'standard',
    ...partial,
  };
}

function approvedAsset(input: {
  text: string;
  speakerId: string;
  speed?: 'normal' | 'slow';
  status?: AudioAsset['status'];
  contentId?: string;
  generationVersion?: number;
  audioUrl?: string;
}): AudioAsset {
  const voice = roster.characters[input.speakerId] ?? roster.characters.narrator;
  const speed = input.speed ?? 'normal';
  const generationVersion = input.generationVersion ?? 1;
  const cacheKey = audioCacheKey({
    provider: voice.provider,
    voiceId: voice.voiceId,
    language: voice.language,
    speed,
    text: input.text,
    generationVersion,
  });
  return {
    id: cacheKey,
    contentId: input.contentId ?? `sentence:${textHash(input.text)}`,
    speakerId: input.speakerId,
    provider: voice.provider,
    voiceId: voice.voiceId,
    language: 'it-IT',
    speed,
    text: input.text,
    textHash: textHash(input.text),
    audioUrl: input.audioUrl ?? `https://cdn.test/${cacheKey}.mp3`,
    duration: 1.2,
    generationVersion,
    status: input.status ?? 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedAt: input.status === 'approved' || input.status == null ? '2026-01-01T00:00:00.000Z' : null,
    cacheKey,
  };
}

describe('Phase 7 TTSProvider interface', () => {
  it('FakeTTSProvider implements generateSpeech and listVoices', async () => {
    const provider: TTSProvider = new FakeTTSProvider('elevenlabs');
    const voices = await provider.listVoices('it-IT');
    const result = await provider.generateSpeech({
      text: 'Luca aspetta Sofia davanti al bar.',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speed: 'normal',
    });
    expect(provider.id).toBe('elevenlabs');
    expect(voices.every((v) => v.language === 'it-IT')).toBe(true);
    expect(result.format).toBe('mp3');
    expect(result.cacheKey.startsWith('tts_')).toBe(true);
  });
});

describe('Phase 7 provider selection', () => {
  it('selects elevenlabs, azure, and google without Reader knowing the vendor', () => {
    const providers = {
      elevenlabs: new FakeTTSProvider('elevenlabs'),
      azure: new FakeTTSProvider('azure'),
      google: new FakeTTSProvider('google'),
    };
    expect(selectTTSProvider('elevenlabs', providers).id).toBe('elevenlabs');
    expect(selectTTSProvider('azure', providers).id).toBe('azure');
    expect(selectTTSProvider('google', providers).id).toBe('google');
    expect(selectProvider('azure')).toBe('azure');
    expect(() => selectProvider('browser')).toThrow(/Unsupported TTS provider/);
  });

  it('gateway factory returns the named provider classes', async () => {
    const {
      AzureTTSProvider,
      ElevenLabsTTSProvider,
      GoogleTTSProvider,
      createTTSProvider,
    } = await import('../../../../services/tts-gateway/src/providers');
    expect(createTTSProvider('elevenlabs', {})).toBeInstanceOf(ElevenLabsTTSProvider);
    expect(createTTSProvider('azure', {})).toBeInstanceOf(AzureTTSProvider);
    expect(createTTSProvider('google', {})).toBeInstanceOf(GoogleTTSProvider);
  });

  it('gateway providers refuse to run without server-side credentials', async () => {
    const { createTTSProvider } = await import('../../../../services/tts-gateway/src/providers');
    await expect(
      createTTSProvider('elevenlabs', {}).generateSpeech({
        text: 'Ciao.',
        voiceId: 'x',
        language: 'it-IT',
        speed: 'normal',
      }),
    ).rejects.toThrow(/ELEVENLABS_API_KEY is not configured/);
    await expect(
      createTTSProvider('azure', {}).generateSpeech({
        text: 'Ciao.',
        voiceId: 'x',
        language: 'it-IT',
        speed: 'normal',
      }),
    ).rejects.toThrow(/AZURE_SPEECH_KEY is not configured/);
    await expect(
      createTTSProvider('google', {}).generateSpeech({
        text: 'Ciao.',
        voiceId: 'x',
        language: 'it-IT',
        speed: 'normal',
      }),
    ).rejects.toThrow(/Google TTS is not configured/);
  });
});

describe('Phase 7 character and narrator voice resolution', () => {
  let characters: Character[];

  beforeEach(() => {
    characters = loadBundle().characters;
  });

  it('keeps Luca on the same assigned voice across chapters', () => {
    const first = resolveCharacterVoice(roster, characters, 'luca');
    const later = resolveCharacterVoice(roster, characters, 'luca');
    expect(first?.voiceId).toBe('voice-luca');
    expect(later?.voiceId).toBe(first?.voiceId);
    expect(first?.provider).toBe('elevenlabs');
  });

  it('ignores placeholder lab-* voice ids when resolving for generation', () => {
    const placeholderRoster: VoiceRoster = {
      activeProvider: 'elevenlabs',
      generationVersion: 1,
      characters: {
        giulia: {
          provider: 'elevenlabs',
          voiceId: 'lab-giulia',
          language: 'it-IT',
          speakingStyle: '',
        },
      },
    };
    expect(resolveCharacterVoice(placeholderRoster, characters, 'giulia')).toBeNull();
  });

  it('resolves a missing speaker as the narrator, never as a character', () => {
    expect(resolveSpeakerId(null)).toBe(NARRATOR_ID);
    expect(resolveSpeakerId(undefined)).toBe(NARRATOR_ID);
    const voice = resolveCharacterVoice(roster, characters, null);
    expect(voice?.voiceId).toBe('voice-narrator');
    expect(voice?.voiceId).not.toBe(resolveCharacterVoice(roster, characters, 'luca')?.voiceId);
  });
});

describe('Phase 7 audio lookup', () => {
  let catalog: AudioCatalog;

  beforeEach(() => {
    const characters = loadBundle().characters;
    catalog = createCatalog(
      [
        approvedAsset({
          text: 'Luca aspetta Sofia davanti al bar.',
          speakerId: 'narrator',
          contentId: 'sentence:ch1:s1:standard',
        }),
        approvedAsset({
          text: 'Buongiorno.',
          speakerId: 'luca',
          contentId: 'sentence:ch1:s2:standard',
        }),
        approvedAsset({
          text: 'Ha fame.',
          speakerId: 'narrator',
          contentId: `phrase:${textHash('Ha fame.')}`,
        }),
        approvedAsset({
          text: 'aspetta',
          speakerId: 'narrator',
          contentId: `word:${textHash('aspetta')}`,
        }),
        approvedAsset({
          text: 'Luca aspetta.',
          speakerId: 'narrator',
          contentId: 'sentence:luca-a-roma-08:s10:standard',
        }),
        approvedAsset({
          text: 'Luca aspetta qui.',
          speakerId: 'narrator',
          contentId: 'sentence:luca-a-roma-08:s10:extended',
        }),
      ],
      roster,
      characters,
    );
  });

  it('looks up sentence audio by displayed text and speaker', () => {
    const found = catalog.lookupSentence(
      sentence({
        id: 's2',
        text: 'Buongiorno.',
        speakerId: 'luca',
        kind: 'dialogue',
        selectedVariantId: 'standard',
      }),
      'normal',
    );
    expect(found?.audioUrl).toContain('cdn.test');
    expect(found?.speakerId).toBe('luca');
  });

  it('looks up phrase audio as a natural phrase, not per word', () => {
    expect(catalog.lookupPhrase('Ha fame.', 'normal')?.text).toBe('Ha fame.');
    expect(catalog.lookupPhrase('Ha', 'normal')).toBeNull();
  });

  it('looks up word pronunciation independently of sentence audio', () => {
    expect(catalog.lookupWord('aspetta', 'normal')?.text).toBe('aspetta');
    expect(catalog.lookupWord('aspetta', 'normal')?.contentId.startsWith('word:')).toBe(true);
  });

  it('uses the adaptive variant audio that matches displayed text', () => {
    const standard = sentence({
      id: 's10',
      text: 'Luca aspetta.',
      selectedVariantId: 'standard',
    });
    const variant = sentence({
      id: 's10',
      text: 'Luca aspetta qui.',
      selectedVariantId: 'extended',
    });
    expect(catalog.lookupSentence(standard, 'normal')?.text).toBe('Luca aspetta.');
    expect(catalog.lookupSentence(variant, 'normal')?.text).toBe('Luca aspetta qui.');
    expect(catalog.lookupSentence(variant, 'normal')?.cacheKey).not.toBe(
      catalog.lookupSentence(standard, 'normal')?.cacheKey,
    );
  });

  it('ignores a pinned audioAssetId when the text no longer matches', () => {
    const standard = catalog.lookupSentence(
      sentence({ id: 's10', text: 'Luca aspetta.', selectedVariantId: 'standard' }),
      'normal',
    );
    const mismatched = catalog.lookupSentence(
      sentence({
        id: 's10',
        text: 'Luca aspetta qui.',
        selectedVariantId: 'extended',
        audioAssetId: standard?.id,
      }),
      'normal',
    );
    expect(mismatched?.text).toBe('Luca aspetta qui.');
  });
});

describe('Phase 7 cache keys and versioning', () => {
  it('includes provider, voice, language, speed, text, and generation version', () => {
    const a = audioCacheKey({
      provider: 'elevenlabs',
      voiceId: 'voice-luca',
      language: 'it-IT',
      speed: 'normal',
      text: 'Luca aspetta Sofia.',
      generationVersion: 1,
    });
    const b = audioCacheKey({
      provider: 'elevenlabs',
      voiceId: 'voice-luca',
      language: 'it-IT',
      speed: 'slow',
      text: 'Luca aspetta Sofia.',
      generationVersion: 1,
    });
    expect(a).not.toBe(b);
  });

  it('changes the cache key when the sentence text changes', () => {
    const short = audioCacheKey({
      provider: 'elevenlabs',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speed: 'normal',
      text: 'Luca aspetta Sofia.',
      generationVersion: 1,
    });
    const longer = audioCacheKey({
      provider: 'elevenlabs',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speed: 'normal',
      text: 'Luca aspetta Sofia davanti al bar.',
      generationVersion: 1,
    });
    expect(short).not.toBe(longer);
    expect(textHash('Luca aspetta Sofia.')).not.toBe(textHash('Luca aspetta Sofia davanti al bar.'));
  });

  it('does not regenerate unchanged approved audio unless asked', () => {
    const existing = approvedAsset({ text: 'Ciao.', speakerId: 'narrator' });
    expect(shouldReuseGeneratedAsset(existing, false)).toBe(true);
    expect(shouldReuseGeneratedAsset(existing, true)).toBe(false);
    expect(shouldReuseGeneratedAsset(undefined, false)).toBe(false);
  });
});

describe('Phase 7 reader playback', () => {
  let catalog: AudioCatalog;
  let player: SilentAudioPlayer;
  let audio: AudioService;

  beforeEach(() => {
    __resetLocalAudioCache();
    catalog = createCatalog(
      [
        approvedAsset({ text: 'Luca entra nel bar.', speakerId: 'narrator' }),
        approvedAsset({ text: 'Buongiorno.', speakerId: 'luca' }),
        approvedAsset({ text: 'Ciao, Luca.', speakerId: 'sofia' }),
        approvedAsset({
          text: 'Luca aspetta.',
          speakerId: 'narrator',
          status: 'review_required',
          audioUrl: '',
        }),
      ],
      roster,
      loadBundle().characters,
    );
    player = new SilentAudioPlayer();
    audio = new AudioService(catalog, player);
  });

  it('does not break the reader when audio is missing', async () => {
    const result = await audio.playSentence(
      sentence({ id: 'missing', text: 'Questa frase non ha audio.' }),
    );
    expect(result).toEqual({ played: false, reason: 'missing' });
    expect(audio.getPlayingId()).toBeNull();
  });

  it('does not break the reader when playback fails', async () => {
    const failing = {
      play: async () => {
        throw new Error('network');
      },
      pause: () => undefined,
      stop: () => undefined,
      isPlaying: () => false,
      onEnded: () => undefined,
    };
    const service = new AudioService(catalog, failing);
    const result = await service.playSentence(
      sentence({ id: 'n1', text: 'Luca entra nel bar.' }),
    );
    expect(result.played).toBe(false);
    expect(result.reason).toBe('failed');
  });

  it('persists playback speed and replays the last sentence', async () => {
    await audio.setSpeed('slow');
    expect(audio.getSpeed()).toBe('slow');
    await audio.loadSpeed();
    expect(audio.getSpeed()).toBe('slow');

    await audio.setSpeed('normal');
    const clip = sentence({ id: 'n1', text: 'Luca entra nel bar.' });
    const first = await audio.playSentence(clip);
    expect(first.played).toBe(true);
    expect(hasCachedAudioUrl(catalog.lookupSentence(clip, 'normal')!.audioUrl)).toBe(true);

    const replay = await audio.replay();
    expect(replay.played).toBe(true);
    expect(audio.getPlayingId()).toBe('n1');
  });

  it('plays chapter sentences in story order with each speaker voice', async () => {
    const played: string[] = [];
    let ended: (() => void) | null = null;
    const recording = {
      play: async (url: string) => {
        played.push(url);
      },
      pause: () => undefined,
      resume: () => undefined,
      stop: () => undefined,
      isPlaying: () => played.length > 0,
      onEnded: (cb: (() => void) | null) => {
        ended = cb;
      },
    };
    const service = new AudioService(catalog, recording, { sentenceGapMs: 0 });
    const sentences = [
      sentence({ id: 'n1', text: 'Luca entra nel bar.' }),
      sentence({ id: 'd1', text: 'Buongiorno.', speakerId: 'luca', kind: 'dialogue' }),
      sentence({ id: 'd2', text: 'Ciao, Luca.', speakerId: 'sofia', kind: 'dialogue' }),
    ];
    await service.playChapter(sentences);
    expect(service.getPlayingId()).toBe('n1');
    await ended?.();
    expect(service.getPlayingId()).toBe('d1');
    await ended?.();
    expect(service.getPlayingId()).toBe('d2');
    expect(played).toHaveLength(3);
    expect(catalog.lookupSentence(sentences[1], 'normal')?.voiceId).toBe('voice-luca');
    expect(catalog.lookupSentence(sentences[2], 'normal')?.voiceId).toBe('voice-sofia');
    expect(catalog.lookupSentence(sentences[0], 'normal')?.voiceId).toBe('voice-narrator');
  });

  it('waits between chapter sentences before advancing', async () => {
    vi.useFakeTimers();
    try {
      const played: string[] = [];
      let ended: (() => void | Promise<void>) | null = null;
      const recording = {
        play: async (url: string) => {
          played.push(url);
        },
        pause: () => undefined,
        resume: () => undefined,
        stop: () => undefined,
        isPlaying: () => false,
        onEnded: (cb: (() => void | Promise<void>) | null) => {
          ended = cb;
        },
      };
      const service = new AudioService(catalog, recording, { sentenceGapMs: 650 });
      const sentences = [
        sentence({ id: 'n1', text: 'Luca entra nel bar.' }),
        sentence({ id: 'd1', text: 'Buongiorno.', speakerId: 'luca', kind: 'dialogue' }),
      ];
      await service.playChapter(sentences);
      expect(played).toHaveLength(1);
      const advance = Promise.resolve(ended?.());
      await vi.advanceTimersByTimeAsync(649);
      expect(played).toHaveLength(1);
      await vi.advanceTimersByTimeAsync(1);
      await advance;
      expect(played).toHaveLength(2);
      expect(service.getPlayingId()).toBe('d1');
      expect(service.playbackRate()).toBe(0.9);
    } finally {
      vi.useRealTimers();
    }
  });

  it('includes generated review_required clips in catalog lookup', () => {
    expect(
      catalog.lookupSentence(sentence({ id: 's10', text: 'Luca aspetta.' }), 'normal')?.status,
    ).toBe('review_required');
  });
});

describe('Phase 7 client never ships provider secrets', () => {
  it('does not embed provider API keys in the mobile audio module', () => {
    const src = readFileSync(join(here, '../TtsGatewayClient.ts'), 'utf8');
    expect(src).not.toMatch(/ELEVENLABS_API_KEY/);
    expect(src).not.toMatch(/AZURE_SPEECH_KEY/);
    expect(src).not.toMatch(/GOOGLE_TTS/);
  });
});
