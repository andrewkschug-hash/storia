import { gatewayDownMessage } from '@/src/audio/voiceDisplay';

export function friendlyGatewayError(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  if (/failed to fetch|network|econnrefused/i.test(message)) return gatewayDownMessage();
  if (/ELEVENLABS_API_KEY is not configured/i.test(message)) {
    return 'ElevenLabs is not configured. Paste your API key in Voice Lab, or add it to services/tts-gateway/.env and restart the gateway.';
  }
  if (/missing the permission voices_read|voices_read/i.test(message)) {
    return 'ElevenLabs key is valid but cannot list voices. In elevenlabs.io → Profile → API keys, edit or create a key with the voices_read permission (or unrestricted access), paste it in Voice Lab, tap Save key, then Test ElevenLabs.';
  }
  if (/text_to_speech|text-to-speech/i.test(message) && /permission|403|401/i.test(message)) {
    return 'ElevenLabs key cannot generate speech. Create or edit your API key with text_to_speech permission (or unrestricted access), update services/tts-gateway/.env, and restart the gateway.';
  }
  if (/invalid ID has been received|invalid_uid|lab-/i.test(message)) {
    return 'A character still has a placeholder voice (not a real ElevenLabs voice). Open Voice Lab, assign real voices for every speaker in this chapter, then try again.';
  }
  if (/ElevenLabs voices failed: 401|invalid_api_key|Invalid API key/i.test(message)) {
    return 'ElevenLabs rejected the API key (401). Create a new key at elevenlabs.io → Profile → API keys, paste it in Voice Lab, tap Save key, then Test ElevenLabs.';
  }
  if (/ElevenLabs generate failed: 401/i.test(message)) {
    return 'ElevenLabs rejected the API key when generating audio. Check text_to_speech permission on your key and restart the gateway.';
  }
  if (/AZURE_SPEECH/i.test(message)) {
    return 'Azure is not configured. You can ignore Azure for now and use ElevenLabs.';
  }
  if (/GOOGLE_TTS/i.test(message)) {
    return 'Google is not configured. You can ignore Google for now and use ElevenLabs.';
  }
  return message;
}

export function unassignedSpeakersMessage(speakers: string[]): string {
  const list = speakers.map((s) => s.replace(/-/g, ' ')).join(', ');
  return `Cannot generate yet — assign real ElevenLabs voices for: ${list}. Open Voice Lab → Load Italian Voices → Use for…`;
}
