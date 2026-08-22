/**
 * Web: MP3s are served from `/public/audio/a1/` (see catalog `audioUrl`).
 * Do not Metro-require media files here — A2 packaging adds 700+ clips and
 * breaks the web bundler with "Unable to resolve module ./media/….mp3".
 */
export const bundledAudioModules: Record<string, number> = {};

export function bundledModuleForUrl(_audioUrl: string): number | null {
  return null;
}
