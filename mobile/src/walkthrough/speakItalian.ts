import * as Speech from 'expo-speech';

function webSpeech(): SpeechSynthesis | null {
  if (typeof globalThis === 'undefined') return null;
  return (globalThis as { speechSynthesis?: SpeechSynthesis }).speechSynthesis ?? null;
}

function isItalianLang(lang: string | undefined): boolean {
  return (lang ?? '').toLowerCase().startsWith('it');
}

async function loadWebVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const existing = synth.getVoices();
  if (existing.length > 0) return existing;
  return new Promise((resolve) => {
    const finish = () => {
      synth.removeEventListener('voiceschanged', finish);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', finish);
    setTimeout(finish, 400);
  });
}

async function speakWithWebSpeech(text: string, rate: number = 0.95): Promise<void> {
  const synth = webSpeech();
  if (!synth) return Promise.reject(new Error('Speech is not available'));

  const voices = await loadWebVoices(synth);
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.rate = Math.max(0.6, Math.min(1.5, rate));
  const italian =
    voices.find((voice) => voice.lang.toLowerCase().startsWith('it-it')) ??
    voices.find((voice) => isItalianLang(voice.lang));
  if (italian) utterance.voice = italian;

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error('Could not play pronunciation'));
    synth.speak(utterance);
  });
}

async function speakWithExpoSpeech(text: string, rate: number = 0.95): Promise<void> {
  Speech.stop();
  const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
  const italian =
    voices.find((voice) => voice.language.toLowerCase().startsWith('it-it')) ??
    voices.find((voice) => isItalianLang(voice.language));
  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: 'it-IT',
      rate: Math.max(0.6, Math.min(1.5, rate * 0.95)),
      voice: italian?.identifier,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => reject(new Error('Could not play pronunciation')),
    });
  });
}

export function stopSpeakingItalian(): void {
  webSpeech()?.cancel();
  Speech.stop();
}

/** Play Italian TTS for walkthrough demo only. Does not use story audio or STT. */
export async function speakItalian(text: string, rate: number = 0.95): Promise<void> {
  if (webSpeech()) return speakWithWebSpeech(text, rate);
  return speakWithExpoSpeech(text, rate);
}
