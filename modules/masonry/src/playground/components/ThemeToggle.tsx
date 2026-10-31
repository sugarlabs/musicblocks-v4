import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '../stores/theme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  return (
    <div
      role="group"
      aria-label="Theme preference"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg p-0.5 select-none',
        'border border-slate-200/80 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/90',
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={preference === 'light'}
        aria-label="Switch to light mode"
        title="Light Mode"
        onClick={() => setPreference('light')}
        className={cn(
          'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all',
          preference === 'light'
            ? 'bg-blue-100 text-blue-600 shadow-xs dark:bg-blue-600 dark:text-white'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200',
        )}
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-pressed={preference === 'dark'}
        aria-label="Switch to dark mode"
        title="Dark Mode"
        onClick={() => setPreference('dark')}
        className={cn(
          'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all',
          preference === 'dark'
            ? 'bg-blue-100 text-blue-600 shadow-xs dark:bg-blue-600 dark:text-white'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200',
        )}
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-pressed={preference === 'system'}
        aria-label="Switch to system theme"
        title="System Theme"
        onClick={() => setPreference('system')}
        className={cn(
          'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all',
          preference === 'system'
            ? 'bg-blue-100 text-blue-600 shadow-xs dark:bg-blue-600 dark:text-white'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200',
        )}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
