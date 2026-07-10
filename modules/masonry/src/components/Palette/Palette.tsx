import { useMemo, useRef, useState } from 'react';

import { Search } from 'lucide-react';

import type { PaletteViewProps } from '@/@types/palette.types';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';

import { cn } from '@/lib/utils';
import { usePaletteDragStore } from '@/stores';

import { BrickSlot } from './BrickSlot';

// -------------------------------------------------------------------------------------------------

/**
 * Root Brick Palette shell.
 *
 * The component sets no width of its own — it fills its container, so its width is controlled by
 * whatever wraps it. Composes three grouping levels: a category sidebar on the left whose buttons
 * are padded down to begin below the search bar, and a content pane whose top holds a row of
 * equally-sized classification tabs (one icon button per classification, e.g. Music / Logic / Art)
 * spanning the list width, then the search input, then a single scroll container that stacks every
 * category of the active classification. Selecting a classification tab swaps which categories the
 * sidebar and main list show. Clicking a category button scrolls the main list to the top of that
 * category; there is no panel swapping within a classification and no flattening across classifications.
 *
 * Search filters within the active classification only: categories are kept when any of their
 * bricks match the query (case-insensitively over each brick's name and description), and empty
 * categories are hidden from both the sidebar and the main list while filtering.
 *
 * This is the shell only — bricks render as placeholder boxes (no SVG, no brick renderer). Each
 * placeholder receives the whole `PaletteBrickConfig` so a later PR can turn it into a drag source
 * that carries the config as its payload without changing the prop contract.
 */
export function Palette({ config }: PaletteViewProps) {
  const [activeClassification, setActiveClassification] = useState(0);
  const [query, setQuery] = useState('');
  const categoryRefs = useRef<Array<HTMLElement | null>>([]);
  const isDragging = usePaletteDragStore((state) => state.dragged !== null);

  const classifications = config.classifications;

  // Clamp the active index so an out-of-range value (e.g. after a config change) stays valid.
  const activeIndex = Math.min(
    Math.max(activeClassification, 0),
    Math.max(classifications.length - 1, 0),
  );
  const activeCategories = useMemo(
    () => classifications[activeIndex]?.categories ?? [],
    [classifications, activeIndex],
  );

  // Filter the active classification's categories by search query, keeping the original index so
  // refs/keys stay stable across filtering.
  const visibleCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeCategories
      .map((category, index) => ({ category, index }))
      .map(({ category, index }) => {
        if (!q) return { category, index };
        return {
          index,
          category: {
            ...category,
            bricks: category.bricks.filter(
              (brick) =>
                brick.name.toLowerCase().includes(q) || brick.description.toLowerCase().includes(q),
            ),
          },
        };
      })
      .filter(({ category }) => category.bricks.length > 0);
  }, [activeCategories, query]);

  const scrollToCategory = (index: number) => {
    categoryRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectClassification = (index: number) => {
    setActiveClassification(index);
    setQuery('');
    categoryRefs.current = [];
  };

  return (
    <div className="border-border bg-background text-foreground flex h-full min-h-0 w-full overflow-hidden rounded-lg border">
      {/* Category sidebar: one button per (filtered) category of the active classification. */}
      <nav className="border-border bg-muted/40 flex w-20 shrink-0 flex-col gap-1 overflow-y-auto border-r px-2 pt-[104px] pb-2">
        {visibleCategories.map(({ category, index }) => {
          const Icon = category.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              size="default"
              onClick={() => scrollToCategory(index)}
              className="h-auto flex-col gap-1 px-1 py-2 text-[0.7rem]"
            >
              <Icon className="size-5" style={{ color: category.color }} />
              <span className="w-full truncate text-center">{category.name}</span>
            </Button>
          );
        })}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Classification tabs: fixed-height bar spanning the list width; tabs share it equally. */}
        <div className="border-border flex h-12 shrink-0 items-center gap-1 border-b px-2">
          {classifications.map((classification, index) => {
            const Icon = classification.icon;
            const isActive = index === activeIndex;
            return (
              <Button
                key={classification.name}
                variant={isActive ? 'secondary' : 'ghost'}
                size="default"
                aria-pressed={isActive}
                title={classification.name}
                onClick={() => selectClassification(index)}
                className="h-9 flex-1"
              >
                <Icon className="size-5" />
                <span className="sr-only">{classification.name}</span>
              </Button>
            );
          })}
        </div>

        <div className="border-border flex h-14 shrink-0 items-center border-b px-3">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bricks"
              className="pl-8"
            />
          </div>
        </div>

        {/* Main list: every visible category of the active classification stacked in one container. */}
        {visibleCategories.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-muted-foreground text-sm">No bricks match your search.</p>
          </div>
        ) : (
          <div
            className={cn(
              'flex-1 overflow-y-auto p-4 transition-[padding-bottom] duration-500',
              isDragging && 'pb-32',
            )}
          >
            {visibleCategories.map(({ category, index }) => {
              const Icon = category.icon;
              return (
                <section
                  key={index}
                  ref={(el) => {
                    categoryRefs.current[index] = el;
                  }}
                  className="mb-6 scroll-mt-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-4" style={{ color: category.color }} />
                    <h3 className="text-sm font-semibold" style={{ color: category.color }}>
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {category.bricks.map((brick) => (
                      <BrickSlot key={brick.id} brick={brick} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Palette;
