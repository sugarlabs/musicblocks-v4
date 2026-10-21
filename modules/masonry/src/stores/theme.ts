import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

export interface ThemeStore {
  /** The current active theme ('light' or 'dark'). */
  theme: Theme;
  /** Convenience flag indicating whether dark mode is currently active. */
  isDark: boolean;
  /** Toggles between 'light' and 'dark' themes. */
  toggleTheme: () => void;
  /** Explicitly sets the theme to 'light' or 'dark'. */
  setTheme: (theme: Theme) => void;
  /** Initializes theme from DOM / localStorage / system preference and registers system listeners. */
  init: () => () => void;
}

const STORAGE_KEY = 'theme';

/**
 * Returns whether system preference currently prefers dark mode.
 */
function getSystemIsDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Reads stored theme or resolves from document element / system preference.
 */
function resolveInitialTheme(): Theme {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // localStorage may fail in restricted/private environments
    }
  }

  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  return getSystemIsDark() ? 'dark' : 'light';
}

/**
 * Applies or removes the 'dark' class on the root <html> element and stores the preference.
 */
function applyTheme(theme: Theme, persist = true): void {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  if (persist && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }
}

export const useThemeStore = create<ThemeStore>()(
  subscribeWithSelector((set, get) => {
    const initialTheme = resolveInitialTheme();

    return {
      theme: initialTheme,
      isDark: initialTheme === 'dark',

      setTheme: (newTheme: Theme) => {
        applyTheme(newTheme, true);
        set({
          theme: newTheme,
          isDark: newTheme === 'dark',
        });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const nextTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(nextTheme);
      },

      init: () => {
        // Ensure store and root DOM match resolved initial state
        const current = resolveInitialTheme();
        applyTheme(current, false);
        set({
          theme: current,
          isDark: current === 'dark',
        });

        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
          return () => {};
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent | { matches: boolean }) => {
          let hasExplicitPreference = false;
          try {
            hasExplicitPreference = window.localStorage.getItem(STORAGE_KEY) !== null;
          } catch {
            hasExplicitPreference = false;
          }

          // Only follow system changes if the user hasn't explicitly set a preference
          if (!hasExplicitPreference) {
            const systemTheme: Theme = e.matches ? 'dark' : 'light';
            applyTheme(systemTheme, false);
            set({
              theme: systemTheme,
              isDark: systemTheme === 'dark',
            });
          }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      },
    };
  }),
);
