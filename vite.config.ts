import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import { renderNetlifyHeaders, securityHeaders } from './config/security-headers';

const netlifyHeaders = (): Plugin => ({
  name: 'netlify-headers',
  apply: 'build',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: '_headers', source: renderNetlifyHeaders() });
  },
});

export default defineConfig({
  plugins: [netlifyHeaders()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // three.js is code-split and loaded on idle, so its size does not block first paint.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'config/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/not-found.ts',
        'src/webgl/**',
        'src/ui/motion-effects.ts',
        'src/**/*.d.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
