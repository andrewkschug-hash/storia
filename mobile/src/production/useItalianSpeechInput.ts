import { useCallback, useEffect, useRef, useState } from 'react';

import {
  SPEECH_MAX_MS,
  abortItalianSpeechRecognition,
  ensureAndroidItalianOfflineModel,
  ensureItalianSpeechPermissions,
  getSpeechRecognitionModule,
  startItalianOnDeviceRecognition,
  stopItalianSpeechRecognition,
  type SpeechAvailability,
} from '@/src/production/onDeviceSpeech';

export type ItalianSpeechPhase = 'idle' | 'listening' | 'stopping';

type Options = {
  enabled?: boolean;
  contextualStrings?: string[];
  onFinalTranscript: (transcript: string) => void;
  onError?: (message: string) => void;
};

/**
 * Tap-to-talk Italian on-device STT for Speak the scene.
 * Caps listen time and always prefers requiresOnDeviceRecognition.
 */
export function useItalianSpeechInput({
  enabled = true,
  contextualStrings = [],
  onFinalTranscript,
  onError,
}: Options) {
  const [phase, setPhase] = useState<ItalianSpeechPhase>('idle');
  const [interim, setInterim] = useState('');
  const [availability, setAvailability] = useState<SpeechAvailability | null>(null);
  const finalRef = useRef('');
  const deliveredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinalRef = useRef(onFinalTranscript);
  const onErrorRef = useRef(onError);
  onFinalRef.current = onFinalTranscript;
  onErrorRef.current = onError;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const deliver = useCallback((transcript: string) => {
    if (deliveredRef.current) return;
    deliveredRef.current = true;
    clearTimer();
    setPhase('idle');
    setInterim('');
    finalRef.current = '';
    onFinalRef.current(transcript.trim());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void ensureItalianSpeechPermissions().then((result) => {
      if (!cancelled) setAvailability(result);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    const mod = getSpeechRecognitionModule();
    if (!mod || !enabled) return;

    const resultSub = mod.ExpoSpeechRecognitionModule.addListener('result', (event) => {
      const results = event.results as Array<{ transcript?: string }> | undefined;
      const text = results?.[0]?.transcript?.trim() ?? '';
      if (!text) return;
      finalRef.current = text;
      if (event.isFinal) {
        stopItalianSpeechRecognition();
        deliver(text);
        return;
      }
      setInterim(text);
    });

    const endSub = mod.ExpoSpeechRecognitionModule.addListener('end', () => {
      deliver(finalRef.current);
    });

    const errorSub = mod.ExpoSpeechRecognitionModule.addListener('error', (event) => {
      clearTimer();
      setPhase('idle');
      setInterim('');
      finalRef.current = '';
      deliveredRef.current = true;
      const message = event.message || event.error || 'Speech recognition failed.';
      onErrorRef.current?.(String(message));
    });

    return () => {
      resultSub.remove();
      endSub.remove();
      errorSub.remove();
      clearTimer();
      abortItalianSpeechRecognition();
    };
  }, [deliver, enabled]);

  const startListening = useCallback(async () => {
    if (!enabled || phase === 'listening' || phase === 'stopping') return;
    const ready = await ensureItalianSpeechPermissions();
    setAvailability(ready);
    if (!ready.available) {
      onErrorRef.current?.(ready.message);
      return;
    }

    try {
      await ensureAndroidItalianOfflineModel();
      deliveredRef.current = false;
      finalRef.current = '';
      setInterim('');
      setPhase('listening');
      startItalianOnDeviceRecognition({ contextualStrings });
      clearTimer();
      timerRef.current = setTimeout(() => {
        setPhase('stopping');
        stopItalianSpeechRecognition();
      }, SPEECH_MAX_MS);
    } catch (error) {
      setPhase('idle');
      onErrorRef.current?.(error instanceof Error ? error.message : String(error));
    }
  }, [contextualStrings, enabled, phase]);

  const stopListening = useCallback(() => {
    if (phase !== 'listening') return;
    setPhase('stopping');
    stopItalianSpeechRecognition();
  }, [phase]);

  return {
    phase,
    interim,
    availability,
    isListening: phase === 'listening',
    startListening,
    stopListening,
  };
}
