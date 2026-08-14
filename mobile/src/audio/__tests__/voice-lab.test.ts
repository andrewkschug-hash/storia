import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  allLogicalVoicesLocked,
  assignProviderVoice,
  normalizeRoster,
  providerBinding,
} from '@/src/audio/logicalVoices';
import { PLAYBACK_RATE, CHAPTER_SENTENCE_GAP_MS } from '@/src/audio/AudioService';
import { allLockSamples, lockSamplesForChapter } from '@/src/audio/lockSamples';
import { googleVoiceLabel } from '../../../../services/tts-gateway/src/voiceCatalog';
import { publicRoster } from '../../../../services/tts-gateway/src/assignments';
import {
  ASSIGNABLE_CHARACTERS,
  DEFAULT_SAMPLE,
  assignmentCaption,
  coreVoicesLocked,
  displayVoiceName,
  gatewayDownMessage,
  sevenVoicesLocked,
  voiceSubtitle,
} from '@/src/audio/voiceDisplay';
import { resolveCharacterVoice } from '@/src/audio/voices';

const here = fileURLToPath(new URL('.', import.meta.url));

describe('logical voice roster', () => {
  it('normalizes legacy character→vendor-id rows', () => {
    const roster = normalizeRoster({
      activeProvider: 'elevenlabs',
      generationVersion: 1,
      characters: {
        luca: {
          provider: 'elevenlabs',
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          voiceName: 'Antonio',
          speakingStyle: 'young Italian male',
        },
      },
    });
    expect(roster.characters.luca.logicalVoiceId).toBe('luca');
    expect(providerBinding(roster, 'luca', 'elevenlabs')?.voiceId).toBe('EXAVITQu4vr4xnSDxMaL');
    expect(resolveCharacterVoice(roster, [], 'luca')?.voiceId).toBe('EXAVITQu4vr4xnSDxMaL');
  });

  it('keeps ElevenLabs maps when assigning Google', () => {
    const start = normalizeRoster({
      activeProvider: 'elevenlabs',
      characters: {
        narrator: { provider: 'elevenlabs', voiceId: 'el-narrator', voiceName: 'Daniel' },
      },
    });
    const next = assignProviderVoice(start, 'narrator', 'google', {
      voiceId: 'it-IT-Neural2-C',
      voiceName: 'Neural2 C',
    });
    expect(providerBinding(next, 'narrator', 'elevenlabs')?.voiceId).toBe('el-narrator');
    expect(providerBinding(next, 'narrator', 'google')?.voiceId).toBe('it-IT-Neural2-C');
    expect(next.activeProvider).toBe('google');
  });

  it('locks all seven logical voices only when the active provider is fully mapped', () => {
    let roster = normalizeRoster({ activeProvider: 'google' });
    expect(allLogicalVoicesLocked(roster, 'google')).toBe(false);
    for (const id of ASSIGNABLE_CHARACTERS.map((c) => c.id)) {
      roster = assignProviderVoice(roster, id, 'google', { voiceId: `it-IT-${id}`, voiceName: id });
    }
    expect(sevenVoicesLocked(roster)).toBe(true);
    expect(coreVoicesLocked(roster)).toBe(true);
  });
});

describe('Voice Lab labels', () => {
  it('shows Google voice names instead of hiding it-IT ids', () => {
    expect(googleVoiceLabel('it-IT-Chirp3-HD-Achernar')).toBe('Chirp3 HD Achernar');
    expect(googleVoiceLabel('it-IT-Neural2-A')).toBe('Neural2 A');
    expect(
      displayVoiceName({
        id: 'it-IT-Neural2-A',
        name: 'it-IT-Neural2-A',
        displayName: 'Neural2 A',
        provider: 'google',
        gender: 'male',
      }),
    ).toBe('Neural2 A');
    expect(
      voiceSubtitle({
        id: 'it-IT-Neural2-A',
        language: 'it-IT',
        gender: 'male',
        provider: 'google',
      }),
    ).toContain('it-IT-Neural2-A');
  });

  it('lists Padrone among the seven assignable logical voices', () => {
    expect(ASSIGNABLE_CHARACTERS.map((c) => c.label)).toContain('Padrone');
    expect(ASSIGNABLE_CHARACTERS).toHaveLength(7);
  });

  it('does not treat placeholder lab-* ids as locked voices', () => {
    const roster = normalizeRoster({
      activeProvider: 'elevenlabs',
      characters: {
        luca: { provider: 'elevenlabs', voiceId: 'lab-luca' },
      },
    });
    expect(assignmentCaption(roster, 'luca')).toMatch(/not mapped/i);
    expect(
      assignmentCaption(
        normalizeRoster({
          activeProvider: 'elevenlabs',
          characters: {
            luca: { provider: 'elevenlabs', voiceId: 'EXAVITQu4vr4xnSDxMaL', voiceName: 'Antonio' },
          },
        }),
        'luca',
      ),
    ).toBe('luca → Antonio · ElevenLabs');
  });

  it('explains how to start the gateway without asking the user to type a voice ID', () => {
    const message = gatewayDownMessage();
    expect(message).toMatch(/cd services\/tts-gateway/);
    expect(message).toMatch(/npm start/);
    expect(message).not.toMatch(/paste a voice id/i);
  });
});

describe('Gateway assignments stay key-safe in the public summary', () => {
  it('summarizes assignments by name and hides placeholder ids', () => {
    const summary = publicRoster({
      activeProvider: 'elevenlabs',
      generationVersion: 1,
      logicalVoices: {
        luca: {
          speakingStyle: '',
          language: 'it-IT',
          providers: {
            elevenlabs: { voiceId: 'EXAVITQu4vr4xnSDxMaL', voiceName: 'Antonio' },
          },
        },
        sofia: {
          speakingStyle: '',
          language: 'it-IT',
          providers: {
            elevenlabs: { voiceId: 'lab-sofia' },
          },
        },
      },
      characters: {
        luca: { logicalVoiceId: 'luca' },
        sofia: { logicalVoiceId: 'sofia' },
      },
    });
    expect(summary.characters.luca).toMatchObject({
      provider: 'elevenlabs',
      voiceName: 'Antonio',
      assigned: true,
      logicalVoiceId: 'luca',
    });
    expect(summary.characters.sofia.assigned).toBe(false);
    expect(JSON.stringify(summary)).not.toContain('EXAVITQu4vr4xnSDxMaL');
    expect(JSON.stringify(summary)).not.toContain('lab-sofia');
  });
});

describe('Voice Lab screen copy', () => {
  it('documents Reader rates and does not ask the user to type a Voice ID', () => {
    const src = readFileSync(join(here, '../../../app/voice-lab.tsx'), 'utf8');
    expect(src).not.toMatch(/Paste a Voice ID|type a Voice ID/i);
    expect(src).toMatch(/Load \$\{PROVIDER_LABEL\[provider\]\}/);
    expect(src).toMatch(/Use for/);
    expect(src).toMatch(/Preview/);
    expect(src).toMatch(/PLAYBACK_RATE/);
    expect(src).toMatch(/CHAPTER_SENTENCE_GAP_MS/);
    expect(src).toMatch(/Padrone/);
    expect(src).toMatch(/speed: 'normal'/);
  });

  it('uses Reader playback constants', () => {
    expect(PLAYBACK_RATE.normal).toBe(0.9);
    expect(PLAYBACK_RATE.slow).toBe(0.75);
    expect(CHAPTER_SENTENCE_GAP_MS).toBe(650);
  });
});

describe('lock samples', () => {
  it('pulls a few sentences from chapters 1, 5, 10, and 20 without covering the library', () => {
    expect(lockSamplesForChapter(1).length).toBeGreaterThan(0);
    const all = allLockSamples();
    const chapters = new Set(all.map((row) => row.chapterNumber));
    expect([...chapters].sort((a, b) => a - b)).toEqual([1, 5, 10, 20]);
    expect(all.length).toBeLessThan(20);
    expect(DEFAULT_SAMPLE).toMatch(/Ciao, mi chiamo Luca/);
  });
});
