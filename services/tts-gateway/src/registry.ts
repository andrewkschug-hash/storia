import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import type { AudioAsset } from './types';

export class AssetRegistry {
  constructor(
    private readonly dataDir: string,
    private readonly publicBase: string,
  ) {
    mkdirSync(join(dataDir, 'audio'), { recursive: true });
  }

  private registryPath() {
    return join(this.dataDir, 'registry.json');
  }

  load(): AudioAsset[] {
    if (!existsSync(this.registryPath())) return [];
    try {
      const parsed = JSON.parse(readFileSync(this.registryPath(), 'utf8')) as { assets?: AudioAsset[] };
      return parsed.assets ?? [];
    } catch {
      return [];
    }
  }

  save(assets: AudioAsset[]) {
    writeFileSync(this.registryPath(), JSON.stringify({ assets }, null, 2));
  }

  audioPath(cacheKey: string) {
    return join(this.dataDir, 'audio', `${cacheKey}.mp3`);
  }

  writeAudio(cacheKey: string, bytes: Buffer) {
    writeFileSync(this.audioPath(cacheKey), bytes);
  }

  publicUrl(cacheKey: string) {
    return `${this.publicBase.replace(/\/$/, '')}/v1/tts/audio/${encodeURIComponent(cacheKey)}`;
  }
}
