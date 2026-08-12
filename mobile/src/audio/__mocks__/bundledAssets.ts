import catalogJson from '../../../content/audio/catalog.json';

/** Vitest stand-in for Metro asset modules (real requires live in bundledAssets.ts). */
export function bundledModuleForUrl(audioUrl: string): number | null {
  const file = audioUrl
    .replace(/^\/audio\/a1\//, '')
    .replace(/^\.\/bundled\//, '')
    .replace(/^bundled:/, '');
  const key = file.replace(/\.mp3$/i, '');
  const hit = (catalogJson.assets ?? []).some(
    (a) => a.id === key || a.cacheKey === key || a.audioUrl.endsWith(`/${file}`) || a.audioUrl.endsWith(file),
  );
  return hit ? 1 : null;
}

export const bundledAudioModules: Record<string, number> = {};
