const MEMORY = new Map<string, string>();
const CACHE_NAME = 'storia-audio-v1';

/** Remember an approved audio URL so replay does not require a fresh network fetch. */
export function rememberAudioUrl(url: string) {
  MEMORY.set(url, url);
}

export function hasCachedAudioUrl(url: string): boolean {
  return MEMORY.has(url);
}

function isBundledUrl(url: string): boolean {
  return (
    url.startsWith('/audio/a1/') ||
    url.startsWith('./bundled/') ||
    url.startsWith('bundled:')
  );
}

function isWebRuntime(): boolean {
  return typeof document !== 'undefined';
}

/** Resolve packaged A1 MP3s (web public path or native Metro asset). */
async function resolveBundledUrl(url: string): Promise<string | null> {
  // Web Expo serves files from /public as absolute paths.
  if (url.startsWith('/audio/a1/') && isWebRuntime()) return url;

  try {
    const { bundledModuleForUrl } = await import('@/src/audio/bundledAssets');
    const mod = bundledModuleForUrl(url);
    if (mod == null) {
      // Fallback: map catalog relative/bundled urls to public path on web.
      if (isWebRuntime()) {
        const file = url
          .replace(/^\.\/bundled\//, '')
          .replace(/^bundled:/, '')
          .replace(/^\/audio\/a1\//, '');
        if (file.endsWith('.mp3')) return `/audio/a1/${file}`;
      }
      return null;
    }
    const { Asset } = await import('expo-asset');
    const asset = Asset.fromModule(mod);
    await asset.downloadAsync();
    return asset.localUri ?? asset.uri ?? null;
  } catch {
    if (isWebRuntime()) {
      const file = url
        .replace(/^\.\/bundled\//, '')
        .replace(/^bundled:/, '')
        .replace(/^\/audio\/a1\//, '');
      if (file.endsWith('.mp3')) return `/audio/a1/${file}`;
    }
    return null;
  }
}

export async function resolvePlayableUrl(url: string): Promise<string> {
  rememberAudioUrl(url);
  if (isBundledUrl(url)) {
    const local = await resolveBundledUrl(url);
    if (local) return local;
  }
  const cacheApi = (globalThis as { caches?: CacheStorage }).caches;
  if (!cacheApi?.open) return url;
  try {
    const cache = await cacheApi.open(CACHE_NAME);
    const hit = await cache.match(url);
    if (hit) {
      const blob = await hit.blob();
      return URL.createObjectURL(blob);
    }
    const res = await fetch(url);
    if (res.ok) await cache.put(url, res.clone());
  } catch {
    /* reader still plays from the original URL */
  }
  return url;
}

export function __resetLocalAudioCache() {
  MEMORY.clear();
}
