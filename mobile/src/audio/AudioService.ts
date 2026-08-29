import AsyncStorage from '@react-native-async-storage/async-storage';

import { AudioCatalog } from '@/src/audio/catalog';
import { isPlayableAsset } from '@/src/audio/playable';
import { createAudioPlayer, type AudioPlayer } from '@/src/audio/playback';
import { gatewayBaseUrl, TtsGatewayClient } from '@/src/audio/TtsGatewayClient';
import { chapterHeaderText, isHeaderSentenceId, makeHeaderSentence } from '@/src/audio/chapterHeader';
import type { AudioAsset, TTSSpeed, VoiceRoster } from '@/src/audio/types';
import type { Character, Sentence } from '@/src/content/schemas';

export type PlayChapterOptions = {
  chapter?: { id?: string; number: number; titleIt: string };
  includeHeader?: boolean;
};

const SPEED_KEY = 'storia:audio-speed:v1';

/** Quiet beat between chapter sentences so listening feels natural and fluid. */
export const CHAPTER_SENTENCE_GAP_MS = 250;

/** Playback rates applied to packaged normal-speed clips. */
export const PLAYBACK_RATE: Record<TTSSpeed, number> = {
  slow: 0.8,
  normal: 1.0,
  faster: 1.15,
};

export type PlayResult = {
  played: boolean;
  reason?: 'missing' | 'failed' | 'unavailable';
};

export class AudioService {
  private player: AudioPlayer;
  private playingId: string | null = null;
  private chapterQueue: Sentence[] = [];
  private chapterIndex = 0;
  private lastSentence: Sentence | null = null;
  private chapterId: string | null = null;
  private speed: TTSSpeed = 'normal';
  private onChange: (() => void) | null = null;
  private advanceToken = 0;
  private readonly sentenceGapMs: number;

  constructor(
    readonly catalog: AudioCatalog,
    player?: AudioPlayer,
    options?: { sentenceGapMs?: number },
  ) {
    this.player = player ?? createAudioPlayer();
    this.sentenceGapMs = options?.sentenceGapMs ?? CHAPTER_SENTENCE_GAP_MS;
    this.player.onEnded(() => this.advanceChapter());
  }

  setOnChange(cb: (() => void) | null) {
    this.onChange = cb;
  }

  getSpeed(): TTSSpeed {
    return this.speed;
  }

  getPlayingId(): string | null {
    return this.playingId;
  }

  isPlaying(): boolean {
    return Boolean(this.playingId) || this.player.isPlaying();
  }

  async loadSpeed(): Promise<TTSSpeed> {
    try {
      const raw = await AsyncStorage.getItem(SPEED_KEY);
      if (raw === 'slow' || raw === 'normal' || raw === 'faster') this.speed = raw;
    } catch {
      /* keep default */
    }
    return this.speed;
  }

  async setSpeed(speed: TTSSpeed) {
    this.speed = speed;
    try {
      await AsyncStorage.setItem(SPEED_KEY, speed);
    } catch {
      /* ignore */
    }
    try {
      const { getLearnerCloud } = await import('@/src/sync/learnerSession');
      const cloud = getLearnerCloud();
      if (cloud) void cloud.upsertLearnerState({ preferences: { audioSpeed: speed } });
    } catch {
      /* local speed still saved */
    }
    this.onChange?.();
  }

  setChapterContext(chapterId: string | null) {
    this.chapterId = chapterId;
  }

  sentenceAudio(sentence: Sentence): AudioAsset | null {
    const chapterId = this.chapterId ?? undefined;
    const preferredSpeed: TTSSpeed = this.speed === 'faster' ? 'normal' : this.speed;
    return (
      this.catalog.lookupSentence(sentence, preferredSpeed, chapterId) ??
      (preferredSpeed === 'slow'
        ? this.catalog.lookupSentence(sentence, 'normal', chapterId)
        : null)
    );
  }

  phraseAudio(text: string): AudioAsset | null {
    const preferredSpeed: TTSSpeed = this.speed === 'faster' ? 'normal' : this.speed;
    return (
      this.catalog.lookupPhrase(text, preferredSpeed) ??
      (preferredSpeed === 'slow' ? this.catalog.lookupPhrase(text, 'normal') : null)
    );
  }

  wordAudio(text: string): AudioAsset | null {
    const preferredSpeed: TTSSpeed = this.speed === 'faster' ? 'normal' : this.speed;
    return (
      this.catalog.lookupWord(text, preferredSpeed) ??
      (preferredSpeed === 'slow' ? this.catalog.lookupWord(text, 'normal') : null)
    );
  }

  chapterHeaderAudio(chapter: { id?: string; number: number; titleIt: string }): AudioAsset | null {
    const preferredSpeed: TTSSpeed = this.speed === 'faster' ? 'normal' : this.speed;
    return (
      this.catalog.lookupChapterHeader(chapter, preferredSpeed) ??
      (preferredSpeed === 'slow'
        ? this.catalog.lookupChapterHeader(chapter, 'normal')
        : null)
    );
  }

  playbackRate(): number {
    return PLAYBACK_RATE[this.speed] ?? PLAYBACK_RATE.normal;
  }

  async playSentence(sentence: Sentence): Promise<PlayResult> {
    this.chapterQueue = [];
    this.lastSentence = sentence;
    const asset = this.sentenceAudio(sentence);
    if (asset) {
      return this.playAsset(sentence.id, asset);
    }
    if (isHeaderSentenceId(sentence.id)) {
      try {
        this.playingId = sentence.id;
        this.onChange?.();
        const { speakItalian } = await import('@/src/walkthrough/speakItalian');
        await speakItalian(sentence.text, this.playbackRate());
        this.playingId = null;
        this.onChange?.();
        return { played: true };
      } catch {
        this.playingId = null;
        this.onChange?.();
        return { played: false, reason: 'missing' };
      }
    }
    return this.playAsset(sentence.id, null);
  }

  async playChapterHeader(chapter: { id?: string; number: number; titleIt: string }): Promise<PlayResult> {
    const headerSentence = makeHeaderSentence(chapter);
    return this.playSentence(headerSentence);
  }

  async replay(): Promise<PlayResult> {
    if (this.lastSentence) return this.playSentence(this.lastSentence);
    const current = this.chapterQueue[this.chapterIndex];
    if (current) return this.playItem(current);
    return { played: false, reason: 'missing' };
  }

  async playWord(text: string): Promise<PlayResult> {
    this.chapterQueue = [];
    return this.playAsset(`word:${text}`, this.wordAudio(text) ?? this.phraseAudio(text));
  }

  async playPhrase(text: string): Promise<PlayResult> {
    this.chapterQueue = [];
    return this.playAsset(`phrase:${text}`, this.phraseAudio(text));
  }

  async playChapter(
    sentences: Sentence[],
    chapterIdOrOptions?: string | PlayChapterOptions,
    options?: PlayChapterOptions,
  ): Promise<PlayResult> {
    let resolvedOptions: PlayChapterOptions | undefined;
    let resolvedChapterId: string | undefined;

    if (typeof chapterIdOrOptions === 'string') {
      resolvedChapterId = chapterIdOrOptions;
      resolvedOptions = options;
    } else if (typeof chapterIdOrOptions === 'object') {
      resolvedOptions = chapterIdOrOptions;
      resolvedChapterId = resolvedOptions?.chapter?.id;
    }

    if (resolvedChapterId) {
      this.chapterId = resolvedChapterId;
    } else if (resolvedOptions?.chapter?.id) {
      this.chapterId = resolvedOptions.chapter.id;
    }

    if (this.chapterQueue.length > 0) {
      if (this.player.isPlaying()) {
        this.pause();
        return { played: true };
      }
      const current = this.chapterQueue[this.chapterIndex];
      if (current) {
        // Mid-sentence pause → resume; mid-gap pause → start the next clip.
        if (this.playingId === current.id) {
          this.player.resume();
          this.onChange?.();
          return { played: true };
        }
        return this.playItem(current);
      }
    }

    this.advanceToken += 1;
    const headerSentence =
      resolvedOptions?.chapter && resolvedOptions?.includeHeader !== false
        ? makeHeaderSentence(resolvedOptions.chapter)
        : null;

    const queueCandidates = headerSentence ? [headerSentence, ...sentences] : sentences;
    this.chapterQueue = queueCandidates.filter(
      (s) => this.sentenceAudio(s) || (headerSentence && s.id === headerSentence.id),
    );
    this.chapterIndex = 0;
    if (this.chapterQueue.length === 0) return { played: false, reason: 'missing' };
    return this.playItem(this.chapterQueue[0]);
  }

  async restartChapter(
    sentences: Sentence[],
    chapterIdOrOptions?: string | PlayChapterOptions,
    options?: PlayChapterOptions,
  ): Promise<PlayResult> {
    this.stop();
    return this.playChapter(sentences, chapterIdOrOptions, options);
  }

  isChapterMode(): boolean {
    return this.chapterQueue.length > 0;
  }

  getChapterPlaybackProgress(): { current: number; total: number } | null {
    if (this.chapterQueue.length === 0) return null;
    return {
      current: Math.min(this.chapterIndex + 1, this.chapterQueue.length),
      total: this.chapterQueue.length,
    };
  }

  stop() {
    this.advanceToken += 1;
    this.chapterQueue = [];
    this.playingId = null;
    this.player.stop();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { stopSpeakingItalian } = require('@/src/walkthrough/speakItalian');
      stopSpeakingItalian();
    } catch {
      /* ignore */
    }
    this.onChange?.();
  }

  pause() {
    this.advanceToken += 1;
    this.player.pause();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { stopSpeakingItalian } = require('@/src/walkthrough/speakItalian');
      stopSpeakingItalian();
    } catch {
      /* ignore */
    }
    this.onChange?.();
  }

  private async playItem(sentence: Sentence): Promise<PlayResult> {
    const asset = this.sentenceAudio(sentence);
    if (asset) {
      return this.playAsset(sentence.id, asset);
    }
    if (isHeaderSentenceId(sentence.id)) {
      const token = this.advanceToken;
      try {
        this.playingId = sentence.id;
        this.onChange?.();
        const { speakItalian } = await import('@/src/walkthrough/speakItalian');
        await speakItalian(sentence.text, this.playbackRate());
        if (token === this.advanceToken && this.isChapterMode()) {
          void this.advanceChapter();
        }
        return { played: true };
      } catch {
        this.playingId = null;
        this.onChange?.();
        return { played: false, reason: 'failed' };
      }
    }
    this.playingId = null;
    this.onChange?.();
    return { played: false, reason: 'missing' };
  }

  private async playAsset(id: string, asset: AudioAsset | null): Promise<PlayResult> {
    if (!asset?.audioUrl) {
      this.playingId = null;
      this.onChange?.();
      return { played: false, reason: 'missing' };
    }
    try {
      this.playingId = id;
      this.onChange?.();
      await this.player.play(asset.audioUrl, this.playbackRate());
      return { played: true };
    } catch {
      this.playingId = null;
      this.onChange?.();
      return { played: false, reason: 'failed' };
    }
  }

  private async advanceChapter() {
    if (this.chapterQueue.length === 0) {
      this.playingId = null;
      this.onChange?.();
      return;
    }
    this.chapterIndex += 1;
    const next = this.chapterQueue[this.chapterIndex];
    if (!next) {
      this.chapterQueue = [];
      this.playingId = null;
      this.onChange?.();
      return;
    }

    const token = ++this.advanceToken;
    this.playingId = null;
    this.onChange?.();
    if (this.sentenceGapMs > 0) {
      await sleep(this.sentenceGapMs);
    }
    if (token !== this.advanceToken || this.chapterQueue.length === 0) return;
    await this.playItem(next);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPackagedAudioUrl(url: string): boolean {
  return (
    url.startsWith('/audio/a1/') ||
    url.startsWith('./bundled/') ||
    url.startsWith('bundled:')
  );
}

export async function refreshCatalogFromGateway(
  catalog: AudioCatalog,
): Promise<void> {
  const base = gatewayBaseUrl();
  if (!base) return;
  try {
    const client = new TtsGatewayClient(base);
    const assets = await client.listAssets();
    const playable = assets.filter(isPlayableAsset);
    if (playable.length === 0) return;
    // Keep packaged learner assets; only fill gaps from the gateway.
    const existing = catalog.list();
    const keep = new Map(existing.map((a) => [a.cacheKey, a]));
    for (const asset of playable) {
      const prior = keep.get(asset.cacheKey);
      if (prior && isPackagedAudioUrl(prior.audioUrl)) continue;
      keep.set(asset.cacheKey, asset);
    }
    catalog.replace([...keep.values()]);
  } catch {
    /* reader must work without the gateway */
  }
}

export function createCatalog(
  assets: AudioAsset[],
  roster: VoiceRoster,
  characters: Character[],
): AudioCatalog {
  return new AudioCatalog(assets, roster, characters);
}
