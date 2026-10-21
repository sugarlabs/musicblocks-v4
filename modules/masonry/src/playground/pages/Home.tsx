import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { pages } from '.';

export default function Home() {
  return (
    <div className="p-10 transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">Masonry Playground</h1>
        <p className="text-muted-foreground mt-2 text-sm">
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
                'group bg-card flex flex-col gap-2 rounded-lg',
                'border-border border p-5',
                'hover:bg-accent/50 hover:border-border/80 shadow-xs transition-all',
              )}
            >
              <span className="text-card-foreground group-hover:text-primary text-sm font-semibold">
                {label}
              </span>
              <span className="text-muted-foreground group-hover:text-foreground/80 text-xs">
                {description}
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
