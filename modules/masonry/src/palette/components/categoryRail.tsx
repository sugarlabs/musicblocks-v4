import type { PaletteCategoryConfig } from '@/@types/palette.types';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';

import { resolveIcon } from './icons';

interface CategoryRailProps {
  /** Ordered categories to show, one button per category. */
  categories: PaletteCategoryConfig[];
  /** Index of the currently active category. */
  activeIndex: number;
  /** Called with the index of the category the user selects. */
  onSelect: (index: number) => void;
  /** Layout direction of the rail. Defaults to the vertical, Scratch-style column. */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Scratch-style category rail. Renders one icon-and-name button per category and highlights the
 * active one. Defaults to a vertical column; pass `orientation="horizontal"` to lay the buttons in a
 * row.
 */
export function CategoryRail({
  categories,
  activeIndex,
  onSelect,
  orientation = 'vertical',
}: CategoryRailProps) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <nav
      className={cn(
        'border-border bg-muted/40 flex shrink-0 gap-1 p-2',
        isHorizontal
          ? 'flex-row overflow-x-auto border-b'
          : 'w-20 flex-col overflow-y-auto border-r',
      )}
    >
      {categories.map((category, i) => {
        const Icon = resolveIcon(category.icon);
        const isActive = i === activeIndex;
        return (
          <Button
            key={category.name}
            variant={isActive ? 'secondary' : 'ghost'}
            size="default"
            onClick={() => onSelect(i)}
            className={cn(
              'h-auto flex-col gap-1 px-1 py-2 text-[0.7rem]',
              isActive && 'ring-ring ring-1',
            )}
          >
            <Icon className="size-5" />
            <span className="w-full truncate text-center">{category.name}</span>
          </Button>
        );
      })}
    </nav>
  );
}
