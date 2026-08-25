import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import catalogJson from '../../../content/audio/catalog.json';
import { bundledModuleForUrl } from '@/src/audio/bundledAssets';

describe('bundled A1 audio assets', () => {
  it('resolves every catalog packaged audio URL (via test mock / Metro map)', () => {
    const assets = catalogJson.assets ?? [];
    expect(assets.length).toBeGreaterThan(200);
    for (const asset of assets) {
      expect(
        asset.audioUrl.startsWith('/audio/a1/') || asset.audioUrl.startsWith('./bundled/'),
      ).toBe(true);
      expect(bundledModuleForUrl(asset.audioUrl)).toBeTypeOf('number');
    }
  }, 30000);

  it('keeps a Metro require loader for every packaged catalog asset', () => {
    const source = fs.readFileSync(path.join(__dirname, '../bundledAssets.ts'), 'utf8');
    for (const asset of catalogJson.assets ?? []) {
      const file = path.basename(asset.audioUrl || '');
      const key = file.replace(/\.mp3$/i, '');
      expect(file).toMatch(/^tts_[a-f0-9]+\.mp3$/i);
      expect(source).toContain(`'${key}'`);
      expect(source).toContain(`./media/${file}`);
    }
  });

  it('returns null for unknown or gateway URLs', () => {
    expect(bundledModuleForUrl('http://127.0.0.1:8787/v1/tts/audio/x')).toBeNull();
    expect(bundledModuleForUrl('./bundled/tts_does_not_exist.mp3')).toBeNull();
  });
});
