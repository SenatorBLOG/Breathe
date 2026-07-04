// Standalone Vitest config — deliberately NOT reusing vite.config.ts, whose
// plugins (react, cesium) are pointless overhead for pure-TS unit tests.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
