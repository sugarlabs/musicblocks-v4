import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'mb4_theme_preference';

interface ThemeState {
    preference: ThemePreference;
    resolvedTheme: ResolvedTheme;
    setPreference: (preference: ThemePreference) => void;
    initTheme: () => void;
}

function getSystemTheme(): ResolvedTheme {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

function applyDomTheme(theme: ResolvedTheme) {
    if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }
    }
}

let activeMediaQuery: MediaQueryList | null = null;
let activeMediaListener: ((e: MediaQueryListEvent) => void) | null = null;

/**
 * App-wide theme preference. The `dark` class goes on the document root, so every page follows
 * it; the control that flips it lives in the Workspace.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
    preference: 'system',
    resolvedTheme: 'light',

    setPreference: (preference: ThemePreference) => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, preference);
        } catch {
            // Ignore storage errors in restricted contexts
        }

        const resolvedTheme = preference === 'system' ? getSystemTheme() : preference;
        applyDomTheme(resolvedTheme);
        set({ preference, resolvedTheme });
    },

    initTheme: () => {
        // Falls back to the in-memory preference, not 'system': the Workspace re-inits on every
        // mount, and a selection made while storage is unavailable must survive the round trip.
        let savedPreference: ThemePreference = get().preference;
        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === 'light' || stored === 'dark' || stored === 'system') {
                savedPreference = stored;
            }
        } catch {
            // Fallback to the current preference
        }

        const resolved = savedPreference === 'system' ? getSystemTheme() : savedPreference;
        applyDomTheme(resolved);
        set({ preference: savedPreference, resolvedTheme: resolved });

        if (typeof window !== 'undefined' && window.matchMedia) {
            if (activeMediaQuery && activeMediaListener) {
                activeMediaQuery.removeEventListener('change', activeMediaListener);
                activeMediaQuery = null;
                activeMediaListener = null;
            }

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = (e: MediaQueryListEvent) => {
                if (get().preference === 'system') {
                    const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
                    applyDomTheme(newResolved);
                    set({ resolvedTheme: newResolved });
                }
            };

            mediaQuery.addEventListener('change', listener);
            activeMediaQuery = mediaQuery;
            activeMediaListener = listener;
        }
    },
}));
