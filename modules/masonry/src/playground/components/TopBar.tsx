import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { pages } from '../pages';

export default function TopBar() {
  return (
    <nav
      className={cn(
        'sticky top-0 z-100 flex h-12 items-center gap-4',
        'border-b border-slate-800 bg-slate-900 px-5',
      )}
    >
      <NavLink
        to="/"
        className={cn(
          'text-sm font-bold tracking-wide text-white',
          'opacity-75 transition-opacity hover:opacity-100',
        )}
      >
        Masonry Playground
      </NavLink>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex gap-1">
        {pages.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
