import type { AudioGenerationStatus } from '@/src/audio/types';

/** Generated clips are usable without a separate human approve step. */
export function isPlayableAssetStatus(status: AudioGenerationStatus): boolean {
  return status === 'approved' || status === 'review_required';
}

export function isPlayableAsset(asset: { status: AudioGenerationStatus }): boolean {
  return isPlayableAssetStatus(asset.status);
}
