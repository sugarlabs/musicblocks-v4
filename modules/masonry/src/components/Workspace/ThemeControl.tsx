import { Moon, Sun } from 'lucide-react';

import { useThemeStore } from '@/stores/theme';
import { Button } from '@/ui/button';

/**
 * One-button light/dark switch, sitting above `BricksVisibilityControl` and following its
 * layout and button conventions. Like a phone's quick toggle: the icon shows the mode a press
 * switches to, and the theme applies to the whole page.
 */
export function ThemeControl() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const setPreference = useThemeStore((state) => state.setPreference);

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="absolute right-6 bottom-42 z-40 flex h-14 items-center gap-6">
      <Button
        variant="outline"
        size="icon"
        className="size-14 rounded-full border-2"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
        onClick={() => setPreference(isDark ? 'light' : 'dark')}
      >
        {isDark ? <Sun className="size-6" /> : <Moon className="size-6" />}
      </Button>
    </div>
  );
}

export default ThemeControl;
