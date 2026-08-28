import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { audioCacheKey } from './cacheKey';
import {
  classifyExistingAssets,
  countBillableCharacters,
  type ExistingAssetLike,
  type PlannedGeneration,
} from './googleTtsGuard';
import type { TTSSpeed } from './types';

const require = createRequire(import.meta.url);
const { resolveSpeakerVoice } = require('../../../mobile/scripts/voice-roster-common.js') as {
  resolveSpeakerVoice: (
    roster: unknown,
    speakerId: string,
    provider?: string,
  ) => { logicalVoiceId: string; provider: string; voiceId: string; voiceName?: string } | null;
};

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const MOBILE = join(REPO, 'mobile');

export type LucaAudioTarget = 'a1' | 'a1plus' | 'a2';

function loadJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function resolveSpeakerId(speakerId: string | undefined): string {
  if (!speakerId || speakerId === 'narrator') return 'narrator';
  return speakerId;
}

function loadExistingAssets(): ExistingAssetLike[] {
  const assets: ExistingAssetLike[] = [];
  const catalogPath = join(MOBILE, 'content', 'audio', 'catalog.json');
  const registryPath = join(HERE, '..', 'data', 'registry.json');
  for (const file of [catalogPath, registryPath]) {
    if (!existsSync(file)) continue;
    const data = loadJson(file) as { assets?: ExistingAssetLike[] };
    assets.push(...(data.assets ?? []));
  }
  return assets;
}

export function collectLucaGooglePlan(input: {
  from: number;
  to: number;
  target: LucaAudioTarget;
  generationVersion?: number;
  speed?: TTSSpeed;
}): {
  planned: PlannedGeneration[];
  elevenLabsExistingCount: number;
  missingCount: number;
  mappingErrors: string[];
  storyId: string;
} {
  const bounds = { a1: [1, 20], a1plus: [21, 24], a2: [21, 40] } as const;
  const [min, max] = bounds[input.target];
  if (input.from < min || input.to > max || input.from > input.to) {
    throw new Error(
      `Range ${input.from}–${input.to} is outside ${input.target} chapters ${min}–${max}. Manifest not produced.`,
    );
  }

  const storyPath = join(MOBILE, 'content', 'stories', 'luca-a-roma');
  const voicesPath = join(MOBILE, 'content', 'audio', 'voices.json');
  const roster = loadJson(voicesPath);
  const manifest = loadJson(join(storyPath, 'manifest.json')) as {
    chapters: { number: number; file: string; id?: string }[];
  };
  const adaptive = loadJson(join(storyPath, 'adaptive-variants.json')) as {
    sentences?: Record<string, { variants?: { id: string; text: string }[] }>;
  };
  const existing = loadExistingAssets();
  const generationVersion = input.generationVersion ?? 1;
  const speed = input.speed ?? 'normal';
  const planned: PlannedGeneration[] = [];
  const mappingErrors: string[] = [];
  let elevenLabsExistingCount = 0;
  let missingCount = 0;

  for (let n = input.from; n <= input.to; n += 1) {
    const summary = manifest.chapters.find((c) => c.number === n);
    if (!summary) throw new Error(`A generation manifest cannot be produced: missing chapter ${n}.`);
    const chapter = loadJson(join(storyPath, 'chapters', summary.file)) as {
      id: string;
      number: number;
      titleIt?: string;
      paragraphs: { sentences: { id: string; text: string; speakerId?: string }[] }[];
    };
    const clips: { sentenceId: string; text: string; speakerId: string; contentId: string }[] = [];
    if (chapter.titleIt) {
      const cleanTitle = chapter.titleIt.trim().replace(/\.+$/, '');
      clips.push({
        sentenceId: 'header',
        text: `Capitolo ${chapter.number}. ${cleanTitle}.`,
        speakerId: 'narrator',
        contentId: `header:${chapter.id}`,
      });
    }
    for (const paragraph of chapter.paragraphs ?? []) {
      for (const sentence of paragraph.sentences ?? []) {
        const speakerId = resolveSpeakerId(sentence.speakerId);
        clips.push({
          sentenceId: sentence.id,
          text: sentence.text,
          speakerId,
          contentId: `sentence:${chapter.id}:${sentence.id}:standard`,
        });
        const overlay = adaptive.sentences?.[`${chapter.id}:${sentence.id}`];
        for (const variant of overlay?.variants ?? []) {
          if (!variant?.text || !variant?.id) continue;
          clips.push({
            sentenceId: sentence.id,
            text: variant.text,
            speakerId,
            contentId: `sentence:${chapter.id}:${sentence.id}:${variant.id}`,
          });
        }
      }
    }

    for (const clip of clips) {
      const counted = countBillableCharacters(clip.text);
      if (!counted.ok) {
        throw new Error(`${counted.error} (${clip.contentId})`);
      }
      const voice = resolveSpeakerVoice(roster, clip.speakerId, 'google');
      if (!voice) {
        mappingErrors.push(
          `The requested voice cannot be mapped to a Google voice (${clip.speakerId} / ${clip.contentId}).`,
        );
      }
      const googleVoiceId = voice?.voiceId ?? '';
      const classified = googleVoiceId
        ? classifyExistingAssets(existing, {
            voiceId: googleVoiceId,
            language: 'it-IT',
            speed,
            text: clip.text,
            generationVersion,
          })
        : { action: 'generate' as const, elevenLabsHit: existing.some((a) => a.provider === 'elevenlabs' && a.text === clip.text) };
      if (classified.elevenLabsHit) elevenLabsExistingCount += 1;
      if (classified.action === 'generate') missingCount += 1;
      const outputFilename = googleVoiceId
        ? audioCacheKey({
            provider: 'google',
            voiceId: googleVoiceId,
            language: 'it-IT',
            speed,
            text: clip.text,
            generationVersion,
          })
        : '';
      planned.push({
        storyId: 'luca-a-roma',
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        sentenceId: clip.sentenceId,
        logicalVoice: voice?.logicalVoiceId ?? clip.speakerId,
        googleVoiceId,
        language: 'it-IT',
        text: clip.text,
        generationSpeed: speed,
        generationVersion,
        outputFilename,
        estimatedBillableCharacters: counted.chars,
        action: classified.action,
      });
    }
  }

  return {
    planned,
    elevenLabsExistingCount,
    missingCount,
    mappingErrors,
    storyId: 'luca-a-roma',
  };
}
