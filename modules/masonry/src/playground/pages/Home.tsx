import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { pages } from '.';

export default function Home() {
  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Masonry Playground</h1>
        <p className="mt-2 text-sm text-slate-500">
          A dev harness for building, experimenting with, and demoing Masonry components in
          isolation — outside the full application context.
        </p>
      </div>

      {pages.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pages.map(({ path, label, description }) => (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'group flex flex-col gap-2 rounded-lg',
                'border border-slate-200 p-5',
                'transition-colors hover:bg-slate-50',
              )}
            >
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                {label}
              </span>
              <span className="text-xs text-slate-400 group-hover:text-slate-500">
                {description}
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
