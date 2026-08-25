import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 15000,
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.ts'],
  },
  resolve: {
    alias: [
      // Must come before `@` — otherwise `@` steals this path and loads real MP3 requires.
      {
        find: '@/src/audio/bundledAssets',
        replacement: path.join(root, 'src/audio/__mocks__/bundledAssets.ts'),
      },
      {
        find: 'react-native',
        replacement: 'react-native-web',
      },
      {
        find: '@',
        replacement: root,
      },
    ],
  },
});
