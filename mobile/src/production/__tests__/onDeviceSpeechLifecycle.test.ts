import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  checkItalianSpeechAvailability,
  ensureItalianSpeechPermissions,
  getSpeechRecognitionModule,
  speechUnavailableMessage,
} from '../onDeviceSpeech';

describe('Speech Recognition Web & Native Lifecycle', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('detects unsupported browser and returns typing-friendly fallback message', async () => {
    // Simulate browser without Web Speech API
    // @ts-expect-error test mock
    global.window = {};

    const availability = await checkItalianSpeechAvailability();
    expect(availability.available).toBe(false);
    if (!availability.available) {
      expect(availability.message).toContain('type your answer');
      expect(availability.reason).toBe('unsupported');
    }
  });

  it('detects supported browser with Web Speech API', async () => {
    class MockSpeechRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      maxAlternatives = 1;
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
    }

    // @ts-expect-error test mock
    global.window = {
      SpeechRecognition: MockSpeechRecognition,
    };

    const availability = await checkItalianSpeechAvailability();
    expect(availability.available).toBe(true);

    const permissions = await ensureItalianSpeechPermissions();
    expect(permissions.available).toBe(true);
  });

  it('handles speech lifecycle events: interim results, final result, and end', async () => {
    let instance: any = null;

    class MockSpeechRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      maxAlternatives = 1;
      onresult: ((e: any) => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      onend: (() => void) | null = null;
      start = vi.fn(() => {
        instance = this;
      });
      stop = vi.fn();
      abort = vi.fn();
    }

    // @ts-expect-error test mock
    global.window = {
      SpeechRecognition: MockSpeechRecognition,
    };

    const mod = getSpeechRecognitionModule();
    expect(mod).not.toBeNull();

    const results: string[] = [];
    const isFinals: boolean[] = [];

    const sub = mod!.ExpoSpeechRecognitionModule.addListener('result', (event) => {
      const arr = event.results as Array<{ transcript?: string }>;
      results.push(arr[0].transcript!);
      isFinals.push(Boolean(event.isFinal));
    });

    mod!.ExpoSpeechRecognitionModule.start({ lang: 'it-IT' });
    expect(instance.start).toHaveBeenCalled();

    // 1. Interim result
    instance.onresult({
      resultIndex: 0,
      results: [
        {
          isFinal: false,
          0: { transcript: 'Cosa' },
          length: 1,
        },
      ],
    });

    expect(results).toEqual(['Cosa']);
    expect(isFinals).toEqual([false]);

    // 2. Final result
    instance.onresult({
      resultIndex: 0,
      results: [
        {
          isFinal: true,
          0: { transcript: "Cosa c'è?" },
          length: 1,
        },
      ],
    });

    expect(results).toEqual(['Cosa', "Cosa c'è?"]);
    expect(isFinals).toEqual([false, true]);

    sub.remove();
  });

  it('handles permission denied / blocked error without throwing', async () => {
    let instance: any = null;

    class MockSpeechRecognition {
      onerror: ((e: any) => void) | null = null;
      start = vi.fn(() => {
        instance = this;
      });
      stop = vi.fn();
      abort = vi.fn();
    }

    // @ts-expect-error test mock
    global.window = {
      SpeechRecognition: MockSpeechRecognition,
    };

    const mod = getSpeechRecognitionModule();
    let errorMessage = '';

    const errSub = mod!.ExpoSpeechRecognitionModule.addListener('error', (event) => {
      errorMessage = String(event.message);
    });

    mod!.ExpoSpeechRecognitionModule.start({});
    instance.onerror({ error: 'not-allowed' });

    expect(errorMessage).toContain('Microphone access');
    errSub.remove();
  });
});
