/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThemeStore } from './theme';

describe('useThemeStore', () => {
  let matchMediaListeners: Array<(e: { matches: boolean }) => void> = [];
  let isSystemDark = false;

  beforeEach(() => {
    matchMediaListeners = [];
    isSystemDark = false;
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    useThemeStore.setState({ theme: 'light', isDark: false });

    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: isSystemDark,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event: string, listener: (e: { matches: boolean }) => void) => {
        matchMediaListeners.push(listener);
      },
      removeEventListener: (_event: string, listener: (e: { matches: boolean }) => void) => {
        matchMediaListeners = matchMediaListeners.filter((l) => l !== listener);
      },
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('initializes with light theme by default when system is light', () => {
    useThemeStore.getState().init();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('initializes with dark theme when system is dark', () => {
    isSystemDark = true;
    useThemeStore.getState().init();
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme from light to dark and updates DOM and localStorage', () => {
    useThemeStore.setState({ theme: 'light', isDark: false });
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('toggles theme from dark to light and updates DOM and localStorage', () => {
    useThemeStore.setState({ theme: 'dark', isDark: true });
    document.documentElement.classList.add('dark');

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('explicitly sets theme via setTheme', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('init() listens for system theme changes when user has no explicit preference', () => {
    const cleanup = useThemeStore.getState().init();
    expect(matchMediaListeners.length).toBeGreaterThan(0);

    // Simulate system changing to dark
    matchMediaListeners.forEach((listener) => listener({ matches: true }));

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    cleanup();
  });

  it('init() ignores system theme changes if user explicitly chose a theme in localStorage', () => {
    localStorage.setItem('theme', 'light');
    const cleanup = useThemeStore.getState().init();

    // Simulate system changing to dark
    matchMediaListeners.forEach((listener) => listener({ matches: true }));

    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    cleanup();
  });
});
