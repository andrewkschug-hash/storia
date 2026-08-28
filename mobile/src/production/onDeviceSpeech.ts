/**
 * Unified Italian speech recognition helpers for Web, iOS, and Android.
 * - On Web: Uses browser Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * - On Native: Uses ExpoSpeechRecognitionModule with on-device Italian models.
 */

import { Platform } from 'react-native';

import {
  ITALIAN_SPEECH_LOCALE,
  SPEECH_MAX_MS,
  speechUnavailableMessage,
  type SpeechUnavailableReason,
} from '@/src/production/onDeviceSpeechConfig';

export {
  ITALIAN_SPEECH_LOCALE,
  SPEECH_MAX_MS,
  speechUnavailableMessage,
  type SpeechUnavailableReason,
} from '@/src/production/onDeviceSpeechConfig';

export type SpeechAvailability =
  | { available: true }
  | { available: false; reason: SpeechUnavailableReason; message: string };

type NativeSpeechModule = {
  isRecognitionAvailable: () => boolean;
  supportsOnDeviceRecognition: () => boolean;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  getSupportedLocales: (options?: {
    androidRecognitionServicePackage?: string;
  }) => Promise<{ locales?: string[]; installedLocales?: string[] }>;
  androidTriggerOfflineModelDownload: (options: { locale: string }) => Promise<unknown>;
  start: (options: Record<string, unknown>) => void;
  stop: () => void;
  abort: () => void;
  addListener: (
    eventName: string,
    listener: (event: Record<string, unknown>) => void,
  ) => { remove: () => void };
};

type LoadedSpeechPackage = {
  ExpoSpeechRecognitionModule: NativeSpeechModule;
};

// Web Speech API Adapter
class WebSpeechAdapter implements NativeSpeechModule {
  private activeRecognition: any = null;
  private listeners = new Map<string, Set<(event: Record<string, unknown>) => void>>();

  isRecognitionAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  supportsOnDeviceRecognition(): boolean {
    return false;
  }

  async requestPermissionsAsync(): Promise<{ granted: boolean }> {
    if (!this.isRecognitionAvailable()) return { granted: false };
    return { granted: true };
  }

  async getSupportedLocales(): Promise<{ locales?: string[]; installedLocales?: string[] }> {
    return { locales: [ITALIAN_SPEECH_LOCALE], installedLocales: [ITALIAN_SPEECH_LOCALE] };
  }

  async androidTriggerOfflineModelDownload(): Promise<unknown> {
    return Promise.resolve();
  }

  private emit(eventName: string, data: Record<string, unknown>) {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      for (const handler of Array.from(handlers)) {
        try {
          handler(data);
        } catch {
          // ignore
        }
      }
    }
  }

  start(options: Record<string, unknown>): void {
    this.abort();
    if (typeof window === 'undefined') return;
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechClass) {
      this.emit('error', {
        error: 'unsupported',
        message: speechUnavailableMessage('unsupported'),
      });
      return;
    }

    try {
      const recognition = new SpeechClass();
      recognition.lang = (options.lang as string) || ITALIAN_SPEECH_LOCALE;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }
        const text = (final || interim).trim();
        if (text) {
          this.emit('result', {
            results: [{ transcript: text }],
            isFinal: Boolean(final),
          });
        }
      };

      recognition.onerror = (event: any) => {
        const err = event.error;
        let message = 'Speech recognition error.';
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          message = speechUnavailableMessage('permission_denied');
        } else if (err === 'no-speech') {
          message = speechUnavailableMessage('no_speech');
        } else {
          message = speechUnavailableMessage('unavailable');
        }
        this.emit('error', { error: err, message });
      };

      recognition.onend = () => {
        this.emit('end', {});
        this.activeRecognition = null;
      };

      this.activeRecognition = recognition;
      recognition.start();
    } catch (e) {
      this.emit('error', {
        error: 'start_failed',
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  stop(): void {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch {
        // ignore
      }
    }
  }

  abort(): void {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.abort();
      } catch {
        // ignore
      }
      this.activeRecognition = null;
    }
  }

  addListener(
    eventName: string,
    listener: (event: Record<string, unknown>) => void,
  ): { remove: () => void } {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);
    return {
      remove: () => {
        this.listeners.get(eventName)?.delete(listener);
      },
    };
  }
}

let cachedWebAdapter: WebSpeechAdapter | null = null;
let cachedNativeModule: LoadedSpeechPackage | null | undefined;

function loadModule(): LoadedSpeechPackage | null {
  if (Platform.OS === 'web') {
    if (!cachedWebAdapter) cachedWebAdapter = new WebSpeechAdapter();
    return { ExpoSpeechRecognitionModule: cachedWebAdapter };
  }

  if (cachedNativeModule !== undefined) return cachedNativeModule;
  try {
    // Deep import avoids package index → useSpeechRecognitionEvent resolution failures.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-speech-recognition/build/ExpoSpeechRecognitionModule') as {
      ExpoSpeechRecognitionModule?: NativeSpeechModule;
    };
    if (!mod?.ExpoSpeechRecognitionModule) {
      cachedNativeModule = null;
      return null;
    }
    cachedNativeModule = { ExpoSpeechRecognitionModule: mod.ExpoSpeechRecognitionModule };
  } catch {
    cachedNativeModule = null;
  }
  return cachedNativeModule;
}

export function getSpeechRecognitionModule(): LoadedSpeechPackage | null {
  return loadModule();
}

export async function checkItalianSpeechAvailability(): Promise<SpeechAvailability> {
  const mod = loadModule();
  if (!mod?.ExpoSpeechRecognitionModule) {
    return {
      available: false,
      reason: Platform.OS === 'web' ? 'unsupported' : 'missing_module',
      message: speechUnavailableMessage(Platform.OS === 'web' ? 'unsupported' : 'missing_module'),
    };
  }

  const { ExpoSpeechRecognitionModule } = mod;
  try {
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      return {
        available: false,
        reason: Platform.OS === 'web' ? 'unsupported' : 'unavailable',
        message: speechUnavailableMessage(Platform.OS === 'web' ? 'unsupported' : 'unavailable'),
      };
    }
  } catch {
    return {
      available: false,
      reason: 'unavailable',
      message: speechUnavailableMessage('unavailable'),
    };
  }

  return { available: true };
}

export async function ensureItalianSpeechPermissions(): Promise<SpeechAvailability> {
  const base = await checkItalianSpeechAvailability();
  if (!base.available) return base;

  const mod = loadModule();
  if (!mod) {
    return {
      available: false,
      reason: 'missing_module',
      message: speechUnavailableMessage('missing_module'),
    };
  }

  try {
    const result = await mod.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      return {
        available: false,
        reason: 'permission_denied',
        message: speechUnavailableMessage('permission_denied'),
      };
    }
  } catch {
    return {
      available: false,
      reason: 'unavailable',
      message: speechUnavailableMessage('unavailable'),
    };
  }
  return { available: true };
}

/** Android may need an offline it-IT model before on-device recognition works. */
export async function ensureAndroidItalianOfflineModel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const mod = loadModule();
  if (!mod?.ExpoSpeechRecognitionModule) return;

  try {
    const locales = await mod.ExpoSpeechRecognitionModule.getSupportedLocales({
      androidRecognitionServicePackage: 'com.google.android.as',
    });
    const installed = locales.installedLocales ?? [];
    const hasItalian = installed.some(
      (locale) => locale.toLowerCase() === 'it-it' || locale.toLowerCase().startsWith('it'),
    );
    if (hasItalian) return;
    await mod.ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({
      locale: ITALIAN_SPEECH_LOCALE,
    });
  } catch {
    // Best-effort; start() will surface a clearer error if the model is still missing.
  }
}

export function startItalianOnDeviceRecognition(input?: {
  contextualStrings?: string[];
}): void {
  const mod = loadModule();
  if (!mod) throw new Error(speechUnavailableMessage('missing_module'));

  const contextual = (input?.contextualStrings ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 8);

  const supportsOnDevice = Boolean(
    mod.ExpoSpeechRecognitionModule.supportsOnDeviceRecognition?.(),
  );

  mod.ExpoSpeechRecognitionModule.start({
    lang: ITALIAN_SPEECH_LOCALE,
    interimResults: true,
    continuous: false,
    requiresOnDeviceRecognition: supportsOnDevice,
    addsPunctuation: false,
    maxAlternatives: 1,
    contextualStrings: contextual.length > 0 ? contextual : undefined,
  });
}

export function stopItalianSpeechRecognition(): void {
  const mod = loadModule();
  try {
    mod?.ExpoSpeechRecognitionModule.stop();
  } catch {
    // ignore
  }
}

export function abortItalianSpeechRecognition(): void {
  const mod = loadModule();
  try {
    mod?.ExpoSpeechRecognitionModule.abort();
  } catch {
    // ignore
  }
}
