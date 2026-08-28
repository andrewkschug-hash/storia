/**
 * On-device Italian speech recognition helpers.
 * Native STT only — no cloud transcription, no TTS.
 *
 * Imports ExpoSpeechRecognitionModule directly (not the package index) so Metro
 * does not load useSpeechRecognitionEvent, which can fail to resolve.
 */

import { Platform } from 'react-native';

import {
  ITALIAN_SPEECH_LOCALE,
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

let cachedModule: LoadedSpeechPackage | null | undefined;

function loadModule(): LoadedSpeechPackage | null {
  if (cachedModule !== undefined) return cachedModule;
  try {
    // Deep import avoids package index → useSpeechRecognitionEvent resolution failures.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-speech-recognition/build/ExpoSpeechRecognitionModule') as {
      ExpoSpeechRecognitionModule?: NativeSpeechModule;
    };
    if (!mod?.ExpoSpeechRecognitionModule) {
      cachedModule = null;
      return null;
    }
    cachedModule = { ExpoSpeechRecognitionModule: mod.ExpoSpeechRecognitionModule };
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

export function getSpeechRecognitionModule(): LoadedSpeechPackage | null {
  return loadModule();
}

export async function checkItalianSpeechAvailability(): Promise<SpeechAvailability> {
  if (Platform.OS === 'web') {
    return { available: false, reason: 'web', message: speechUnavailableMessage('web') };
  }

  const mod = loadModule();
  if (!mod?.ExpoSpeechRecognitionModule) {
    return {
      available: false,
      reason: 'missing_module',
      message: speechUnavailableMessage('missing_module'),
    };
  }

  const { ExpoSpeechRecognitionModule } = mod;
  try {
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      return {
        available: false,
        reason: 'unavailable',
        message: speechUnavailableMessage('unavailable'),
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
