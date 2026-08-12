import type { AudioAsset, TTSSpeed, VoiceRoster } from '@/src/audio/types';
import { audioCacheKey, textHash } from '@/src/audio/cacheKey';
import { isPlayableAsset } from '@/src/audio/playable';
import { resolveCharacterVoice, resolveSpeakerId } from '@/src/audio/voices';
import type { Character, Sentence } from '@/src/content/schemas';

export class AudioCatalog {
  constructor(
    private assets: AudioAsset[],
    readonly roster: VoiceRoster,
    private readonly characters: Character[],
  ) {}

  list(): AudioAsset[] {
    return [...this.assets];
  }

  replace(assets: AudioAsset[]) {
    const byKey = new Map<string, AudioAsset>();
    for (const asset of assets) byKey.set(asset.cacheKey, asset);
    this.assets = [...byKey.values()];
  }

  findById(id: string): AudioAsset | null {
    return this.assets.find((a) => a.id === id && isPlayableAsset(a)) ?? null;
  }

  findByCacheKey(cacheKey: string): AudioAsset | null {
    return this.assets.find((a) => a.cacheKey === cacheKey && isPlayableAsset(a)) ?? null;
  }

  lookupSentence(sentence: Sentence, speed: TTSSpeed, chapterId?: string): AudioAsset | null {
    if (sentence.audioAssetId) {
      const pinned = this.findById(sentence.audioAssetId);
      if (pinned && pinned.text === sentence.text && pinned.speed === speed) return pinned;
    }
    const shortContentId = `sentence:${sentence.id}:${sentence.selectedVariantId}`;
    const fullContentId = chapterId
      ? `sentence:${chapterId}:${sentence.id}:${sentence.selectedVariantId}`
      : shortContentId;
    return this.lookupSpoken(
      sentence.text,
      sentence.speakerId,
      speed,
      shortContentId,
      fullContentId,
    );
  }

  lookupPhrase(text: string, speed: TTSSpeed): AudioAsset | null {
    return this.lookupSpoken(text, 'narrator', speed, `phrase:${textHash(text)}`);
  }

  lookupWord(text: string, speed: TTSSpeed): AudioAsset | null {
    return this.lookupSpoken(text, 'narrator', speed, `word:${textHash(text)}`);
  }

  private lookupSpoken(
    text: string,
    speakerId: string | null,
    speed: TTSSpeed,
    contentId: string,
    altContentId?: string,
  ): AudioAsset | null {
    const voice = resolveCharacterVoice(this.roster, this.characters, speakerId);
    if (!voice) return null;
    const key = audioCacheKey({
      provider: voice.provider,
      voiceId: voice.voiceId,
      language: voice.language,
      speed,
      text,
      generationVersion: this.roster.generationVersion,
    });
    const byKey = this.findByCacheKey(key);
    if (byKey && byKey.text === text) return byKey;
    return (
      this.assets.find(
        (a) =>
          isPlayableAsset(a) &&
          a.speed === speed &&
          a.text === text &&
          a.speakerId === resolveSpeakerId(speakerId) &&
          (a.contentId === contentId ||
            a.contentId === altContentId ||
            a.textHash === textHash(text)),
      ) ?? null
    );
  }
}

export function shouldReuseGeneratedAsset(
  existing: AudioAsset | undefined,
  regenerate: boolean,
): boolean {
  if (!existing || regenerate) return false;
  return existing.status === 'approved' || existing.status === 'review_required';
}
