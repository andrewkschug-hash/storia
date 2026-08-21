/**
 * Resolve speaker → logical voice → provider binding for generation scripts.
 * Accepts the new roster and the legacy character.voiceId shape.
 */
function isPlaceholder(voiceId) {
  return !voiceId || String(voiceId).startsWith('lab-');
}

function emptyVoice() {
  return { speakingStyle: '', language: 'it-IT', providers: {} };
}

function normalizeRoster(raw) {
  const source = raw ?? {};
  const ids = ['narrator', 'luca', 'sofia', 'marco', 'giulia', 'nonna-rosa', 'padrone', 'marta'];
  const logicalVoices = {};
  for (const id of ids) logicalVoices[id] = emptyVoice();

  const absorb = (id, row) => {
    if (!row) return;
    const current = logicalVoices[id] ?? emptyVoice();
    const providers = { ...(current.providers ?? {}), ...(row.providers ?? {}) };
    if (row.provider && row.voiceId && !isPlaceholder(row.voiceId)) {
      providers[row.provider] = { voiceId: row.voiceId, voiceName: row.voiceName };
    }
    logicalVoices[id] = {
      speakingStyle: current.speakingStyle || row.speakingStyle || '',
      language: 'it-IT',
      gender: current.gender ?? row.gender,
      providers,
    };
  };

  for (const [id, row] of Object.entries(source.logicalVoices ?? {})) absorb(id, row);
  for (const [id, row] of Object.entries(source.characters ?? {})) absorb(id, row);

  const active =
    source.activeProvider === 'google' || source.activeProvider === 'azure' || source.activeProvider === 'elevenlabs'
      ? source.activeProvider
      : 'elevenlabs';

  const characters = {};
  for (const id of Object.keys(logicalVoices)) {
    characters[id] = { logicalVoiceId: source.characters?.[id]?.logicalVoiceId || id };
  }
  for (const id of ids) {
    if (!characters[id]) characters[id] = { logicalVoiceId: id };
  }

  return {
    activeProvider: active,
    generationVersion: source.generationVersion ?? 1,
    logicalVoices,
    characters,
  };
}

function resolveSpeakerVoice(roster, speakerId, provider) {
  const normalized = normalizeRoster(roster);
  const speaker = !speakerId || speakerId === 'narrator' ? 'narrator' : speakerId;
  const logicalId = normalized.characters[speaker]?.logicalVoiceId ?? speaker;
  const useProvider = provider || normalized.activeProvider;
  const binding = normalized.logicalVoices[logicalId]?.providers?.[useProvider];
  if (!binding?.voiceId || isPlaceholder(binding.voiceId)) return null;
  return {
    logicalVoiceId: logicalId,
    provider: useProvider,
    voiceId: binding.voiceId,
    voiceName: binding.voiceName,
  };
}

module.exports = { isPlaceholder, normalizeRoster, resolveSpeakerVoice };
