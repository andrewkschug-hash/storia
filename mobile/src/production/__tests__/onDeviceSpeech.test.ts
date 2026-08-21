import { describe, expect, it } from 'vitest';

import {
  ITALIAN_SPEECH_LOCALE,
  SPEECH_MAX_MS,
  speechUnavailableMessage,
} from '@/src/production/onDeviceSpeechConfig';

describe('onDeviceSpeech helpers', () => {
  it('uses Italian locale and a short listen cap', () => {
    expect(ITALIAN_SPEECH_LOCALE).toBe('it-IT');
    expect(SPEECH_MAX_MS).toBeGreaterThanOrEqual(5000);
    expect(SPEECH_MAX_MS).toBeLessThanOrEqual(10000);
  });

  it('explains why speech may be unavailable', () => {
    expect(speechUnavailableMessage('web')).toMatch(/web/i);
    expect(speechUnavailableMessage('permission_denied')).toMatch(/permission/i);
    expect(speechUnavailableMessage('on_device_unsupported')).toMatch(/on-device/i);
  });
});
