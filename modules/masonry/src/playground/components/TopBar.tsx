import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { pages } from '../pages';

export default function TopBar() {
  return (
    <nav
      className={cn(
        'border-border bg-background sticky top-0 z-100 flex h-14 items-center justify-between border-b px-6 shadow-xs transition-colors duration-200 select-none',
      )}
    >
      {/* Left side: Brand + Page Links */}
      <div className="flex items-center gap-5">
        <NavLink
          to="/"
          className={cn(
            'text-foreground text-base font-bold tracking-tight',
            'transition-opacity hover:opacity-90',
          )}
        >
          Masonry Playground
        </NavLink>

        <div className="bg-border h-5 w-px" />

        <div className="flex items-center gap-1.5">
          {pages.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs dark:border dark:border-blue-500/30 dark:bg-blue-600/20 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
