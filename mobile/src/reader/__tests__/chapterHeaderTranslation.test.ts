import { describe, expect, it, vi } from 'vitest';
import { AudioService, createCatalog } from '@/src/audio/AudioService';
import { SilentAudioPlayer } from '@/src/audio/playback';
import type { AudioAsset, VoiceRoster } from '@/src/audio/types';
import type { Character, Sentence } from '@/src/content/schemas';

vi.mock('@/src/walkthrough/speakItalian', () => ({
  speakItalian: vi.fn(async () => {}),
  stopSpeakingItalian: vi.fn(),
}));

const roster: VoiceRoster = {
  activeProvider: 'elevenlabs',
  generationVersion: 1,
  logicalVoices: {
    narrator: {
      speakingStyle: 'clear Italian narrative',
      language: 'it-IT',
      providers: { elevenlabs: { voiceId: 'voice-narrator' } },
    },
  },
  characters: {
    narrator: { logicalVoiceId: 'narrator' },
  },
};

const characters: Character[] = [
  {
    id: 'narrator',
    name: 'Narrator',
    role: 'narrator',
    relationships: [],
    personalityTraits: [],
    introducedInChapter: 1,
  },
];

describe('Chapter Header Continuous Audio and Title Translation', () => {
  it('continuous chapter playback starts with header and seamlessly advances into story sentences', async () => {
    let endedHandler: (() => void | Promise<void>) | null = null;
    const playedUrls: string[] = [];

    const recordingPlayer = {
      play: vi.fn(async (url: string) => {
        playedUrls.push(url);
      }),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      isPlaying: vi.fn(() => true),
      onEnded: vi.fn((cb) => {
        endedHandler = cb;
      }),
    };

    const headerAsset: AudioAsset = {
      id: 'header-asset',
      contentId: 'header:luca-a-roma-16',
      speakerId: 'narrator',
      provider: 'elevenlabs',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speed: 'normal',
      status: 'approved',
      text: 'Capitolo 16. Partire.',
      audioUrl: '/audio/a1/header-ch16.mp3',
    };

    const s1Asset: AudioAsset = {
      id: 's1-asset',
      contentId: 'sentence:luca-a-roma-16:s01:standard',
      speakerId: 'narrator',
      provider: 'elevenlabs',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speed: 'normal',
      status: 'approved',
      text: 'È mattina.',
      audioUrl: '/audio/a1/s1.mp3',
    };

    const s2Asset: AudioAsset = {
      id: 's2-asset',
      contentId: 'sentence:luca-a-roma-16:s02:standard',
      speakerId: 'narrator',
      provider: 'elevenlabs',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speed: 'normal',
      status: 'approved',
      text: 'Il gruppo va alla stazione.',
      audioUrl: '/audio/a1/s2.mp3',
    };

    const catalog = createCatalog([headerAsset, s1Asset, s2Asset], roster, characters);
    const service = new AudioService(catalog, recordingPlayer as unknown as SilentAudioPlayer, {
      sentenceGapMs: 0,
    });

    const sentences: Sentence[] = [
      {
        id: 's01',
        text: 'È mattina.',
        english: 'It is morning.',
        speakerId: 'narrator',
        kind: 'narration',
        tokens: [],
        phrases: [],
        reinforces: [],
        phraseReinforces: [],
        introduces: [],
        difficulty: 1,
        variants: [],
        selectedVariantId: 'standard',
      },
      {
        id: 's02',
        text: 'Il gruppo va alla stazione.',
        english: 'The group goes to the station.',
        speakerId: 'narrator',
        kind: 'narration',
        tokens: [],
        phrases: [],
        reinforces: [],
        phraseReinforces: [],
        introduces: [],
        difficulty: 1,
        variants: [],
        selectedVariantId: 'standard',
      },
    ];

    // Play chapter with chapter header included
    await service.playChapter(sentences, 'luca-a-roma-16', {
      chapter: { id: 'luca-a-roma-16', number: 16, titleIt: 'Partire' },
    });

    // 1. Header starts playing
    expect(service.getPlayingId()).toBe('header:luca-a-roma-16');
    expect(service.isPlaying()).toBe(true);
    expect(playedUrls).toEqual(['/audio/a1/header-ch16.mp3']);

    // 2. Header finishes -> seamlessly advances to sentence 1 without stopping
    await endedHandler?.();
    expect(service.getPlayingId()).toBe('s01');
    expect(service.isPlaying()).toBe(true);
    expect(playedUrls).toEqual(['/audio/a1/header-ch16.mp3', '/audio/a1/s1.mp3']);

    // 3. Sentence 1 finishes -> seamlessly advances to sentence 2
    await endedHandler?.();
    expect(service.getPlayingId()).toBe('s02');
    expect(service.isPlaying()).toBe(true);
    expect(playedUrls).toEqual(['/audio/a1/header-ch16.mp3', '/audio/a1/s1.mp3', '/audio/a1/s2.mp3']);
  });

  it('continuous playback works when header uses speech synthesis fallback', async () => {
    let endedHandler: (() => void | Promise<void>) | null = null;
    const playedUrls: string[] = [];

    const recordingPlayer = {
      play: vi.fn(async (url: string) => {
        playedUrls.push(url);
      }),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      isPlaying: vi.fn(() => true),
      onEnded: vi.fn((cb) => {
        endedHandler = cb;
      }),
    };

    const s1Asset: AudioAsset = {
      id: 's1-asset',
      contentId: 'sentence:luca-a-roma-01:s01:standard',
      speakerId: 'narrator',
      provider: 'elevenlabs',
      voiceId: 'voice-narrator',
      language: 'it-IT',
      speed: 'normal',
      status: 'approved',
      text: 'Luca arriva a Roma.',
      audioUrl: '/audio/a1/s1.mp3',
    };

    // Catalog has no header asset -> falls back to speakItalian for header
    const catalog = createCatalog([s1Asset], roster, characters);
    const service = new AudioService(catalog, recordingPlayer as unknown as SilentAudioPlayer, {
      sentenceGapMs: 0,
    });

    const sentences: Sentence[] = [
      {
        id: 's01',
        text: 'Luca arriva a Roma.',
        english: 'Luca arrives in Rome.',
        speakerId: 'narrator',
        kind: 'narration',
        tokens: [],
        phrases: [],
        reinforces: [],
        phraseReinforces: [],
        introduces: [],
        difficulty: 1,
        variants: [],
        selectedVariantId: 'standard',
      },
    ];

    await service.playChapter(sentences, 'luca-a-roma-01', {
      chapter: { id: 'luca-a-roma-01', number: 1, titleIt: 'Arrivo a Roma' },
    });

    // After speakItalian finishes, advanceChapter is called automatically
    expect(service.getPlayingId()).toBe('s01');
    expect(playedUrls).toEqual(['/audio/a1/s1.mp3']);
  });
});
