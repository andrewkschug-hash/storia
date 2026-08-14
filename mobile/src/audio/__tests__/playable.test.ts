import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCatalog, refreshCatalogFromGateway } from '@/src/audio/AudioService';
import { isPlayableAssetStatus } from '@/src/audio/playable';
import { normalizeRoster } from '@/src/audio/logicalVoices';
import type { AudioAsset } from '@/src/audio/types';
import { getChapter, getContentBundle } from '@/src/content';

const roster = normalizeRoster({
  activeProvider: 'elevenlabs',
  generationVersion: 1,
  characters: {
    narrator: {
      provider: 'elevenlabs',
      voiceId: 'onwK4e9ZLuTAKqWW03F9',
      language: 'it-IT',
      speakingStyle: '',
    },
    luca: {
      provider: 'elevenlabs',
      voiceId: 'N2lVS1w4EtoT3dr4eOWO',
      language: 'it-IT',
      speakingStyle: '',
    },
  },
});

function asset(partial: Partial<AudioAsset> & Pick<AudioAsset, 'text' | 'cacheKey'>): AudioAsset {
  return {
    id: partial.cacheKey,
    contentId: partial.contentId ?? 'test',
    speakerId: partial.speakerId ?? 'narrator',
    provider: 'elevenlabs',
    voiceId: partial.voiceId ?? 'onwK4e9ZLuTAKqWW03F9',
    language: 'it-IT',
    speed: 'normal',
    textHash: partial.textHash ?? 'x',
    audioUrl: partial.audioUrl ?? 'http://127.0.0.1:8787/v1/tts/audio/test',
    duration: null,
    generationVersion: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedAt: null,
    status: partial.status ?? 'review_required',
    ...partial,
  };
}

describe('playable gateway audio in reader catalog', () => {
  it('treats review_required assets as playable', () => {
    expect(isPlayableAssetStatus('review_required')).toBe(true);
    expect(isPlayableAssetStatus('approved')).toBe(true);
    expect(isPlayableAssetStatus('failed')).toBe(false);
  });

  it('finds generated chapter clips by full content id', () => {
    const chapter = getChapter('luca-a-roma-01');
    expect(chapter).toBeDefined();
    const sentence = chapter!.paragraphs[0]!.sentences[0]!;
    const catalog = createCatalog(
      [
        asset({
          text: sentence.text,
          cacheKey: 'tts_test',
          contentId: `sentence:luca-a-roma-01:${sentence.id}:standard`,
          status: 'review_required',
        }),
      ],
      roster,
      getContentBundle().characters,
    );
    expect(catalog.lookupSentence(sentence, 'normal', chapter!.id)?.text).toBe(sentence.text);
  });
});

describe('refreshCatalogFromGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps packaged /audio/a1 URLs instead of overwriting with gateway assets', async () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    const catalog = createCatalog(
      [
        asset({
          text: 'Luca arriva a Roma.',
          cacheKey: 'tts_packaged',
          audioUrl: '/audio/a1/tts_packaged.mp3',
          status: 'approved',
        }),
      ],
      roster,
      getContentBundle().characters,
    );

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes('/v1/tts/assets')) {
          return new Response(
            JSON.stringify({
              assets: [
                asset({
                  text: 'Luca arriva a Roma.',
                  cacheKey: 'tts_packaged',
                  audioUrl: 'http://127.0.0.1:8787/v1/tts/audio/tts_packaged',
                  status: 'approved',
                }),
                asset({
                  text: 'Nuovo clip.',
                  cacheKey: 'tts_gap',
                  audioUrl: 'http://127.0.0.1:8787/v1/tts/audio/tts_gap',
                  status: 'review_required',
                }),
              ],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return new Response('not found', { status: 404 });
      }),
    );

    await refreshCatalogFromGateway(catalog);
    expect(catalog.findByCacheKey('tts_packaged')?.audioUrl).toBe('/audio/a1/tts_packaged.mp3');
    expect(catalog.findByCacheKey('tts_gap')?.audioUrl).toContain('8787');
  });
});
