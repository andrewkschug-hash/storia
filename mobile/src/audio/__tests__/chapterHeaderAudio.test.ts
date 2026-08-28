import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AudioService, createCatalog } from '@/src/audio/AudioService';
import { AudioCatalog } from '@/src/audio/catalog';
import { audioCacheKey, textHash } from '@/src/audio/cacheKey';
import { assignmentForLogicalVoice } from '@/src/audio/logicalVoices';
import { SilentAudioPlayer } from '@/src/audio/playback';
import {
  chapterHeaderText,
  isHeaderSentenceId,
  makeHeaderSentence,
} from '@/src/audio/chapterHeader';
import type { AudioAsset, VoiceRoster } from '@/src/audio/types';
import type { Character, Sentence } from '@/src/content/schemas';

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

const roster: VoiceRoster = {
  activeProvider: 'elevenlabs',
  generationVersion: 1,
  logicalVoices: {
    luca: {
      speakingStyle: 'young Italian male, natural conversational',
      language: 'it-IT',
      providers: { elevenlabs: { voiceId: 'voice-luca' } },
    },
    narrator: {
      speakingStyle: 'clear Italian narrative, emotionally neutral',
      language: 'it-IT',
      providers: { elevenlabs: { voiceId: 'voice-narrator' } },
    },
  },
  characters: {
    luca: { logicalVoiceId: 'luca' },
    narrator: { logicalVoiceId: 'narrator' },
  },
};

const characters: Character[] = [
  {
    id: 'luca',
    name: 'Luca',
    role: 'protagonist',
    age: 22,
    origin: 'Palermo',
    residence: 'Roma',
    occupation: 'student',
    relationships: [],
    personalityTraits: [],
    introducedInChapter: 1,
  },
  {
    id: 'narrator',
    name: 'Narrator',
    role: 'narrator',
    relationships: [],
    personalityTraits: [],
    introducedInChapter: 1,
  },
];

function makeApprovedAsset(input: {
  text: string;
  speakerId: string;
  contentId?: string;
  speed?: 'normal' | 'slow';
}): AudioAsset {
  const assigned =
    assignmentForLogicalVoice(roster, input.speakerId) ??
    assignmentForLogicalVoice(roster, 'narrator');
  const speed = input.speed ?? 'normal';
  const cacheKey = audioCacheKey({
    provider: assigned!.provider,
    voiceId: assigned!.voiceId,
    language: assigned!.language,
    speed,
    text: input.text,
    generationVersion: 1,
  });
  return {
    id: cacheKey,
    contentId: input.contentId ?? `sentence:${textHash(input.text)}`,
    speakerId: input.speakerId,
    provider: assigned!.provider,
    voiceId: assigned!.voiceId,
    language: 'it-IT',
    speed,
    text: input.text,
    textHash: textHash(input.text),
    audioUrl: `https://cdn.test/${cacheKey}.mp3`,
    duration: 1.5,
    generationVersion: 1,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedAt: '2026-01-01T00:00:00.000Z',
    cacheKey,
  };
}

function makeSentence(partial: Partial<Sentence> & Pick<Sentence, 'id' | 'text'>): Sentence {
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

describe('Chapter Header Audio & Narration', () => {
  it('formats spoken header text correctly', () => {
    expect(chapterHeaderText({ number: 1, titleIt: 'Arrivo' })).toBe('Capitolo 1. Arrivo.');
    expect(chapterHeaderText({ number: 5, titleIt: 'Sofia.' })).toBe('Capitolo 5. Sofia.');
    expect(chapterHeaderText({ number: 12, titleIt: ' Un nuovo amico ' })).toBe(
      'Capitolo 12. Un nuovo amico.',
    );
  });

  it('creates synthetic header Sentence with narrator voice and header id', () => {
    const sentence = makeHeaderSentence({
      id: 'luca-a-roma-01',
      number: 1,
      titleIt: 'Arrivo',
    });
    expect(sentence.id).toBe('header:luca-a-roma-01');
    expect(sentence.speakerId).toBe('narrator');
    expect(sentence.text).toBe('Capitolo 1. Arrivo.');
    expect(isHeaderSentenceId(sentence.id)).toBe(true);
    expect(isHeaderSentenceId('s01')).toBe(false);
  });

  describe('AudioCatalog header lookup', () => {
    it('finds chapter header asset by text and content ID', () => {
      const headerAsset = makeApprovedAsset({
        text: 'Capitolo 1. Arrivo.',
        speakerId: 'narrator',
        contentId: 'header:luca-a-roma-01',
      });
      const catalog = createCatalog([headerAsset], roster, characters);

      const resolved = catalog.lookupChapterHeader(
        { id: 'luca-a-roma-01', number: 1, titleIt: 'Arrivo' },
        'normal',
      );
      expect(resolved).not.toBeNull();
      expect(resolved?.text).toBe('Capitolo 1. Arrivo.');
      expect(resolved?.voiceId).toBe('voice-narrator');
    });
  });

  describe('AudioService chapter playback with narrator header', () => {
    let catalog: AudioCatalog;
    let playedUrls: string[];
    let endedHandler: (() => void | Promise<void>) | null;
    let recordingPlayer: {
      play: (url: string) => Promise<void>;
      pause: () => void;
      resume: () => void;
      stop: () => void;
      isPlaying: () => boolean;
      onEnded: (cb: (() => void | Promise<void>) | null) => void;
    };
    let service: AudioService;

    beforeEach(() => {
      playedUrls = [];
      endedHandler = null;
      recordingPlayer = {
        play: async (url: string) => {
          playedUrls.push(url);
        },
        pause: () => undefined,
        resume: () => undefined,
        stop: () => undefined,
        isPlaying: () => playedUrls.length > 0,
        onEnded: (cb) => {
          endedHandler = cb;
        },
      };

      const headerAsset = makeApprovedAsset({
        text: 'Capitolo 1. Arrivo.',
        speakerId: 'narrator',
        contentId: 'header:luca-a-roma-01',
      });
      const s1Asset = makeApprovedAsset({
        text: 'Luca arriva a Roma.',
        speakerId: 'narrator',
        contentId: 'sentence:luca-a-roma-01:s01:standard',
      });
      const s2Asset = makeApprovedAsset({
        text: 'È alla stazione.',
        speakerId: 'narrator',
        contentId: 'sentence:luca-a-roma-01:s02:standard',
      });

      catalog = createCatalog([headerAsset, s1Asset, s2Asset], roster, characters);
      service = new AudioService(catalog, recordingPlayer as unknown as SilentAudioPlayer, {
        sentenceGapMs: 0,
      });
    });

    it('plays the narrator chapter header first, then advances through the story sentences', async () => {
      const sentences = [
        makeSentence({ id: 's01', text: 'Luca arriva a Roma.' }),
        makeSentence({ id: 's02', text: 'È alla stazione.' }),
      ];

      await service.playChapter(sentences, 'luca-a-roma-01', {
        chapter: { id: 'luca-a-roma-01', number: 1, titleIt: 'Arrivo' },
      });

      // Item 0 is the chapter header
      expect(service.getPlayingId()).toBe('header:luca-a-roma-01');
      expect(playedUrls).toHaveLength(1);

      // Advance after header finishes
      await endedHandler?.();
      expect(service.getPlayingId()).toBe('s01');
      expect(playedUrls).toHaveLength(2);

      // Advance after s01 finishes
      await endedHandler?.();
      expect(service.getPlayingId()).toBe('s02');
      expect(playedUrls).toHaveLength(3);
    });

    it('plays individual chapter header on demand with playChapterHeader', async () => {
      await service.playChapterHeader({
        id: 'luca-a-roma-01',
        number: 1,
        titleIt: 'Arrivo',
      });

      expect(service.getPlayingId()).toBe('header:luca-a-roma-01');
      expect(playedUrls).toHaveLength(1);
    });

    it('maintains backward compatibility when playChapter is called without chapter options', async () => {
      const sentences = [
        makeSentence({ id: 's01', text: 'Luca arriva a Roma.' }),
        makeSentence({ id: 's02', text: 'È alla stazione.' }),
      ];

      await service.playChapter(sentences, 'luca-a-roma-01');

      // Starts immediately on s01
      expect(service.getPlayingId()).toBe('s01');
      expect(playedUrls).toHaveLength(1);
    });
  });
});
