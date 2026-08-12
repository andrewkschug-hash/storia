import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { VoiceRoster } from '@/src/audio/types';
import {
  ASSIGNABLE_CHARACTERS,
  DEFAULT_SAMPLE,
  assignmentCaption,
  coreVoicesLocked,
  displayVoiceName,
  gatewayDownMessage,
  isAssigned,
  isPlaceholderVoiceId,
  looksLikeInternalId,
  voiceSubtitle,
} from '@/src/audio/voiceDisplay';
import { friendlyVoiceName, looksLikeInternalId as gatewayLooksLikeId, voicesForItalianTTS } from '../../../../services/tts-gateway/src/voiceCatalog';
import { providerConfigured } from '../../../../services/tts-gateway/src/env';
import { publicRoster } from '../../../../services/tts-gateway/src/assignments';

const here = fileURLToPath(new URL('.', import.meta.url));

const roster = (voiceId: string, voiceName?: string): VoiceRoster => ({
  activeProvider: 'elevenlabs',
  generationVersion: 1,
  characters: {
    luca: {
      provider: 'elevenlabs',
      voiceId,
      language: 'it-IT',
      speakingStyle: '',
      voiceName,
    },
  },
});

describe('Voice Lab beginner-friendly labels', () => {
  it('treats provider hashes as internal IDs, never as display names', () => {
    expect(looksLikeInternalId('EXAVITQu4vr4xnSDxMaL')).toBe(true);
    expect(looksLikeInternalId('it-IT-IsabellaNeural')).toBe(true);
    expect(looksLikeInternalId('Antonio')).toBe(false);
    expect(gatewayLooksLikeId('EXAVITQu4vr4xnSDxMaL')).toBe(true);
    expect(friendlyVoiceName({ id: 'EXAVITQu4vr4xnSDxMaL', name: 'EXAVITQu4vr4xnSDxMaL', gender: 'male' }, 1)).toBe(
      'Italian Male Voice 1',
    );
  });

  it('shows a human name even when the provider only returns an ID', () => {
    expect(
      displayVoiceName({
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'EXAVITQu4vr4xnSDxMaL',
        displayName: 'Antonio',
        gender: 'male',
      }),
    ).toBe('Antonio');
    expect(
      displayVoiceName({
        id: 'it-IT-Standard-A',
        name: 'it-IT-Standard-A',
        gender: 'male',
      }),
    ).toMatch(/Italian Male/);
    expect(voiceSubtitle({ language: 'it-IT', gender: 'female' })).toBe('Italian • Female');
  });

  it('includes premade male voices when Italian metadata is mostly female', () => {
    const listed = voicesForItalianTTS([
      { voice_id: 'f1', category: 'premade', labels: { gender: 'female', language: 'Italian' } },
      { voice_id: 'f2', category: 'premade', labels: { gender: 'female', language: 'Italian' } },
      { voice_id: 'm1', category: 'premade', labels: { gender: 'male', accent: 'american' } },
      { voice_id: 'c1', category: 'cloned', labels: { gender: 'male' } },
    ] as never[]);
    expect(listed.map((v) => v.voice_id).sort()).toEqual(['f1', 'f2', 'm1']);
  });

  it('does not treat placeholder lab-* ids as locked voices', () => {
    expect(isPlaceholderVoiceId('lab-luca')).toBe(true);
    expect(isAssigned(roster('lab-luca').characters.luca)).toBe(false);
    expect(assignmentCaption(roster('lab-luca'), 'luca')).toBe('Not assigned yet');
    expect(assignmentCaption(roster('EXAVITQu4vr4xnSDxMaL', 'Antonio'), 'luca')).toBe(
      'Antonio · ElevenLabs',
    );
    expect(assignmentCaption(roster('EXAVITQu4vr4xnSDxMaL', 'Antonio'), 'luca')).not.toContain(
      'EXAVITQu4vr4xnSDxMaL',
    );
  });

  it('does not lock core voices until Luca, Sofia, and Narrator are real assignments', () => {
    expect(coreVoicesLocked(roster('lab-luca'))).toBe(false);
    expect(ASSIGNABLE_CHARACTERS.map((c) => c.label)).toEqual([
      'Luca',
      'Sofia',
      'Marco',
      'Giulia',
      'Nonna Rosa',
      'Narrator',
    ]);
    expect(DEFAULT_SAMPLE).toMatch(/Ciao, mi chiamo Luca/);
  });

  it('explains how to start the gateway without mentioning voice IDs', () => {
    const message = gatewayDownMessage();
    expect(message).toMatch(/cd services\/tts-gateway/);
    expect(message).toMatch(/npm start/);
    expect(message).toMatch(/8787/);
    expect(message).not.toMatch(/voice ID/i);
  });
});

describe('Gateway status and assignments stay key-safe', () => {
  it('reports configuration from env presence, not from calling the vendor', () => {
    expect(providerConfigured('elevenlabs', {})).toBe(false);
    expect(providerConfigured('elevenlabs', { ELEVENLABS_API_KEY: 'sk-test' })).toBe(true);
    expect(providerConfigured('azure', { AZURE_SPEECH_KEY: 'x' })).toBe(false);
    expect(providerConfigured('azure', { AZURE_SPEECH_KEY: 'x', AZURE_SPEECH_REGION: 'westeurope' })).toBe(true);
  });

  it('summarizes assignments by name and hides placeholder ids', () => {
    const summary = publicRoster({
      activeProvider: 'elevenlabs',
      generationVersion: 1,
      characters: {
        luca: {
          provider: 'elevenlabs',
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          voiceName: 'Antonio',
          language: 'it-IT',
          speakingStyle: '',
        },
        sofia: {
          provider: 'elevenlabs',
          voiceId: 'lab-sofia',
          language: 'it-IT',
          speakingStyle: '',
        },
      },
    });
    expect(summary.characters.luca).toEqual({
      provider: 'elevenlabs',
      voiceName: 'Antonio',
      assigned: true,
    });
    expect(summary.characters.sofia.assigned).toBe(false);
    expect(JSON.stringify(summary)).not.toContain('EXAVITQu4vr4xnSDxMaL');
    expect(JSON.stringify(summary)).not.toContain('lab-sofia');
  });
});

describe('Voice Lab screen copy', () => {
  it('does not ask the user to type a Voice ID', () => {
    const src = readFileSync(join(here, '../../../app/voice-lab.tsx'), 'utf8');
    expect(src).not.toMatch(/Voice ID/);
    expect(src).toMatch(/Load Italian Voices/);
    expect(src).toMatch(/Use for/);
    expect(src).toMatch(/Preview/);
  });
});
