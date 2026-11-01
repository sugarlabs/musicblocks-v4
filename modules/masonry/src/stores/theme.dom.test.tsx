import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { THEME_STORAGE_KEY, useThemeStore } from './theme';

// Runs in the jsdom project (.test.tsx): covers the document-root side of the theme, which the
// node unit tests cannot reach.
describe('useThemeStore DOM effects', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');

    // This jsdom setup ships neither localStorage nor matchMedia; both are stubbed, and the
    // document itself is the real thing under test.
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, String(value));
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => storage.clear(),
    });
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    useThemeStore.setState({
      preference: 'system',
      resolvedTheme: 'light',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    storage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
  });

  it("setPreference('dark') puts the dark class and color scheme on the document root", () => {
    useThemeStore.getState().setPreference('dark');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it("setPreference('light') removes the dark class and sets the light color scheme", () => {
    useThemeStore.getState().setPreference('dark');
    useThemeStore.getState().setPreference('light');

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('initTheme applies a saved dark preference to the document root', () => {
    storage.set(THEME_STORAGE_KEY, 'dark');
    useThemeStore.getState().initTheme();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
