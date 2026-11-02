import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Config-level assertion that the PWA plugin is wired into the Vite build so
 * the production build emits a web app manifest + service worker. The service
 * worker's runtime behavior cannot be exercised headlessly, so we assert on the
 * build configuration instead.
 */
describe('PWA build configuration', () => {
  const config = readFileSync(resolve(import.meta.dirname, '../../vite.config.ts'), 'utf-8');

  it('registers the vite-plugin-pwa plugin', () => {
    expect(config).toContain("from 'vite-plugin-pwa'");
    expect(config).toContain('VitePWA(');
  });

  it('declares a web app manifest with an app name and icons', () => {
    expect(config).toContain('manifest:');
    expect(config).toContain("name: 'TodoApp'");
    expect(config).toContain('icons:');
  });

  it('configures an offline app-shell fallback without caching the API', () => {
    expect(config).toContain("navigateFallback: '/index.html'");
    expect(config).toContain('navigateFallbackDenylist');
  });
});
