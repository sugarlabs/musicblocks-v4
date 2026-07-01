import { useMemo, useState } from 'react';

import type { PaletteConfig } from '@/@types/palette.types';

import { CategoryRail } from './components/categoryRail';
import { PaletteSearch } from './components/paletteSearch';
import { SectionList } from './components/sectionList';

interface PaletteProps {
  /** Full Category → Section → Brick hierarchy the palette renders. */
  config: PaletteConfig;
}

/**
 * Root Brick Palette shell. Owns the active-category selection and the search query, composes the
 * category rail, search input, and section list, and computes the filtered sections for the active
 * category. This is the shell only — bricks render as placeholders (see `BrickSlot`).
 */
export function Palette({ config }: PaletteProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState('');

  const categories = config.categories;
  const clampedIndex = categories.length === 0 ? 0 : Math.min(activeIndex, categories.length - 1);
  const activeCategory = categories[clampedIndex];

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sections = activeCategory?.sections ?? [];
    if (!q) return sections;
    return sections
      .map((section) => ({
        ...section,
        bricks: section.bricks.filter(
          (brick) =>
            brick.name.toLowerCase().includes(q) || brick.description.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.bricks.length > 0);
  }, [activeCategory, query]);

  return (
    <div className="border-border bg-background text-foreground flex h-full min-h-0 w-full overflow-hidden rounded-lg border">
      <CategoryRail categories={categories} activeIndex={clampedIndex} onSelect={setActiveIndex} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-border border-b p-3">
          <PaletteSearch value={query} onChange={setQuery} />
        </div>
        <SectionList sections={filteredSections} />
      </div>
    </div>
  );
}

export default Palette;
