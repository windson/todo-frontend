import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
// Initialize i18n for every test so components using useTranslation render
// real strings (English by default) instead of raw translation keys.
import '@/i18n/config';

// jsdom does not implement matchMedia; several components (ThemeProvider) use it.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Unmount React trees after every test to keep the jsdom DOM isolated.
afterEach(() => {
  cleanup();
});
