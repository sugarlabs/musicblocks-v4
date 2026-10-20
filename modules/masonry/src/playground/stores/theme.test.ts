/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { THEME_STORAGE_KEY, useThemeStore } from './theme';

describe('useThemeStore', () => {
    let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[] = [];
    let matchesMedia = false;

    beforeEach(() => {
        mediaQueryListeners = [];
        matchesMedia = false;
        localStorage.clear();
        document.documentElement.className = '';
        document.documentElement.removeAttribute('style');

        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: matchesMedia,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
                if (event === 'change') {
                    mediaQueryListeners.push(callback);
                }
            }),
            removeEventListener: vi.fn(
                (event: string, callback: (e: MediaQueryListEvent) => void) => {
                    if (event === 'change') {
                        mediaQueryListeners = mediaQueryListeners.filter((cb) => cb !== callback);
                    }
                },
            ),
            dispatchEvent: vi.fn(),
        }));

        useThemeStore.setState({
            preference: 'system',
            resolvedTheme: 'light',
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        document.documentElement.className = '';
        document.documentElement.removeAttribute('style');
    });

    describe('Preference initialization', () => {
        it('saved light initializes to light', () => {
            localStorage.setItem(THEME_STORAGE_KEY, 'light');
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().preference).toBe('light');
            expect(useThemeStore.getState().resolvedTheme).toBe('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
            expect(document.documentElement.style.colorScheme).toBe('light');
        });

        it('saved dark initializes to dark', () => {
            localStorage.setItem(THEME_STORAGE_KEY, 'dark');
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().preference).toBe('dark');
            expect(useThemeStore.getState().resolvedTheme).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(document.documentElement.style.colorScheme).toBe('dark');
        });

        it('saved system resolves to the current OS preference (light)', () => {
            matchesMedia = false;
            localStorage.setItem(THEME_STORAGE_KEY, 'system');
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().preference).toBe('system');
            expect(useThemeStore.getState().resolvedTheme).toBe('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });

        it('saved system resolves to the current OS preference (dark)', () => {
            matchesMedia = true;
            localStorage.setItem(THEME_STORAGE_KEY, 'system');
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().preference).toBe('system');
            expect(useThemeStore.getState().resolvedTheme).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(document.documentElement.style.colorScheme).toBe('dark');
        });

        it('missing stored preference falls back to system', () => {
            matchesMedia = true;
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().preference).toBe('system');
            expect(useThemeStore.getState().resolvedTheme).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });

        it('an unknown stored value falls back to system', () => {
            matchesMedia = false;
            localStorage.setItem(THEME_STORAGE_KEY, 'unknown_value');
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().preference).toBe('system');
            expect(useThemeStore.getState().resolvedTheme).toBe('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });

        it('malformed or unexpected storage values are handled safely', () => {
            matchesMedia = false;
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ invalid: 123 }));
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().preference).toBe('system');
            expect(useThemeStore.getState().resolvedTheme).toBe('light');
        });

        it('handles localStorage access errors gracefully', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('Denied');
            });

            expect(() => useThemeStore.getState().initTheme()).not.toThrow();
            expect(useThemeStore.getState().preference).toBe('system');
        });
    });

    describe('Preference changes', () => {
        it("calling setPreference('light') updates preference and applies light mode", () => {
            useThemeStore.getState().setPreference('light');

            expect(useThemeStore.getState().preference).toBe('light');
            expect(useThemeStore.getState().resolvedTheme).toBe('light');
            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
            expect(document.documentElement.style.colorScheme).toBe('light');
        });

        it("calling setPreference('dark') updates preference and applies dark mode", () => {
            useThemeStore.getState().setPreference('dark');

            expect(useThemeStore.getState().preference).toBe('dark');
            expect(useThemeStore.getState().resolvedTheme).toBe('dark');
            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(document.documentElement.style.colorScheme).toBe('dark');
        });

        it("calling setPreference('system') resolves current OS preference", () => {
            matchesMedia = true;
            useThemeStore.getState().setPreference('system');

            expect(useThemeStore.getState().preference).toBe('system');
            expect(useThemeStore.getState().resolvedTheme).toBe('dark');
            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });

        it('handles localStorage setItem errors gracefully', () => {
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceeded');
            });

            expect(() => useThemeStore.getState().setPreference('dark')).not.toThrow();
            expect(useThemeStore.getState().preference).toBe('dark');
            expect(useThemeStore.getState().resolvedTheme).toBe('dark');
        });
    });

    describe('System preference listener', () => {
        it('when preference is system, OS preference change updates the resolved theme', () => {
            matchesMedia = false;
            useThemeStore.getState().setPreference('system');
            useThemeStore.getState().initTheme();

            expect(useThemeStore.getState().resolvedTheme).toBe('light');

            // Trigger OS theme change to dark
            mediaQueryListeners.forEach((listener) =>
                listener({ matches: true } as MediaQueryListEvent),
            );

            expect(useThemeStore.getState().resolvedTheme).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(document.documentElement.style.colorScheme).toBe('dark');
        });

        it('when preference is light or dark, OS preference changes do not override it', () => {
            useThemeStore.getState().setPreference('light');
            useThemeStore.getState().initTheme();

            // Trigger OS theme change to dark
            mediaQueryListeners.forEach((listener) =>
                listener({ matches: true } as MediaQueryListEvent),
            );

            expect(useThemeStore.getState().preference).toBe('light');
            expect(useThemeStore.getState().resolvedTheme).toBe('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });

        it('switching from explicit preference to system resumes system-based behavior', () => {
            useThemeStore.getState().setPreference('dark');
            useThemeStore.getState().initTheme();

            useThemeStore.getState().setPreference('system');
            expect(useThemeStore.getState().preference).toBe('system');

            // Trigger OS theme change to light
            mediaQueryListeners.forEach((listener) =>
                listener({ matches: false } as MediaQueryListEvent),
            );

            expect(useThemeStore.getState().resolvedTheme).toBe('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });

        it('repeated initialization does not create duplicate active listeners', () => {
            useThemeStore.getState().initTheme();
            useThemeStore.getState().initTheme();
            useThemeStore.getState().initTheme();

            // Only one active listener should be registered
            expect(mediaQueryListeners.length).toBe(1);
        });
    });
});
