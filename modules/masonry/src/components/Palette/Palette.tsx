import { Search } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { PaletteViewProps } from '@/@types/palette.types';

import { cn } from '@/lib/utils';
import { usePaletteDragStore } from '@/stores/palette';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';

import { BrickSlot } from './BrickSlot';

// -------------------------------------------------------------------------------------------------

/**
 * How long a category header stays highlighted after its sidebar button is clicked.
 */
const CATEGORY_FLASH_MS = 600;

/** A category's header row: icon, name, and the flash highlight — shared by both list modes. */
function CategoryHeader({
  category,
  isFlashing,
}: {
  category: {
    name: string;
    icon: ComponentType<{ className?: string; style?: CSSProperties }>;
    color: string;
  };
  isFlashing: boolean;
}) {
  const Icon = category.icon;
  return (
    <div
      data-flashing={isFlashing ? 'true' : undefined}
      className={cn(
        '-mx-1 mb-2 flex items-center gap-2 rounded-md px-1 transition-colors duration-300',
        isFlashing && 'bg-muted',
      )}
    >
      <Icon className="size-4" style={{ color: category.color }} />
      <h3 className="text-sm font-semibold" style={{ color: category.color }}>
        {category.name}
      </h3>
    </div>
  );
}

/**
 * Root Brick Palette shell.
 *
 * The component sets no width of its own — it fills its container, so its width is controlled by
 * whatever wraps it. Composes three grouping levels: a category sidebar on the left whose buttons
 * are padded down to begin below the search bar, and a content pane whose top holds a row of
 * equally-sized classification tabs (one icon button per classification, e.g. Music / Logic / Art)
 * spanning the list width, then the search input, then a single scroll container that stacks every
 * visible category. Selecting a classification tab swaps which categories the sidebar and main list
 * show. Clicking a sidebar button scrolls the main list to the top of that category.
 *
 * With an empty query, search filters within the active classification only, same as browsing:
 * categories are kept when any of their bricks match (case-insensitively over each brick's name and
 * description), and empty categories are hidden from both the sidebar and the main list. Once a
 * query is typed, search instead walks every classification, so a brick doesn't have to be found by
 * guessing its category first, and the main list groups matches under the classification they came
 * from so their origin stays visible. The sidebar and its scroll-to/flash behavior work the same way
 * in both modes — categories are keyed by classification rather than by bare position, so a search
 * spanning several classifications never collides two different categories onto the same key.
 * Selecting a classification tab clears the query and returns to the single-classification view.
 *
 * This is the shell only — bricks render as placeholder boxes (no SVG, no brick renderer). Each
 * placeholder receives the whole `PaletteBrickConfig` so a later PR can turn it into a drag source
 * that carries the config as its payload without changing the prop contract.
 */
export function Palette({ config }: PaletteViewProps) {
  const [activeClassification, setActiveClassification] = useState(0);
  const [query, setQuery] = useState('');
  // Keyed rather than indexed by position, so a category keeps a stable, unique identity whether
  // it's being browsed within one classification or found by a search that spans every
  // classification — the sidebar's scroll-to and flash behavior stays intact in both.
  const categoryRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const [flashedCategory, setFlashedCategory] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const isSearching = query.trim().length > 0;

  /** A category's stable identity: unique across classifications, not just within one. */
  const categoryKey = (classificationIndex: number, categoryName: string) =>
    `${classificationIndex}:${categoryName}`;

  // Without a query: the active classification's categories, filtered to those with any matching
  // brick (trivially all of them when the query is empty). Keyed by classification + category name
  // so the key stays valid regardless of what `searchGroups` below is doing.
  const visibleCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeCategories
      .map((category) => ({
        key: categoryKey(activeIndex, category.name),
        category: !q
          ? category
          : {
              ...category,
              bricks: category.bricks.filter(
                (brick) =>
                  brick.name.toLowerCase().includes(q) ||
                  brick.description.toLowerCase().includes(q),
              ),
            },
      }))
      .filter(({ category }) => category.bricks.length > 0);
  }, [activeCategories, activeIndex, query]);

  // Once there's a query, search walks every classification rather than just the active one, and
  // groups matches by the classification they came from so their origin stays visible. Categories
  // (and classifications) with no matching bricks are dropped, the same rule `visibleCategories`
  // already applies within a single classification.
  const searchGroups = useMemo(() => {
    if (!isSearching) return [];
    const q = query.trim().toLowerCase();

    return classifications
      .map((classification, classificationIndex) => ({
        classification,
        categories: classification.categories
          .map((category) => ({
            key: categoryKey(classificationIndex, category.name),
            category: {
              ...category,
              bricks: category.bricks.filter(
                (brick) =>
                  brick.name.toLowerCase().includes(q) ||
                  brick.description.toLowerCase().includes(q),
              ),
            },
          }))
          .filter(({ category }) => category.bricks.length > 0),
      }))
      .filter((group) => group.categories.length > 0);
  }, [classifications, isSearching, query]);

  // What the sidebar shows: the same categories the main list is showing, flattened to one list of
  // (key, category) regardless of which mode built them — the sidebar doesn't care whether a
  // category came from one classification or several.
  const sidebarCategories = isSearching
    ? searchGroups.flatMap((group) => group.categories)
    : visibleCategories;

  const clearFlashTimer = () => {
    if (flashTimer.current !== null) {
      clearTimeout(flashTimer.current);
      flashTimer.current = null;
    }
  };

  // Cleanup only; inlined rather than reusing clearFlashTimer so the effect has no dependencies.
  useEffect(
    () => () => {
      if (flashTimer.current !== null) clearTimeout(flashTimer.current);
    },
    [],
  );

  const scrollToCategory = (key: string) => {
    categoryRefs.current.get(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // The list can already be scrolled as far as it goes, in which case scrollIntoView moves
    // nothing and the click reads as ignored. Flashing the header answers the click either way.
    clearFlashTimer();
    setFlashedCategory(key);
    flashTimer.current = setTimeout(() => setFlashedCategory(null), CATEGORY_FLASH_MS);
  };

  const selectClassification = (index: number) => {
    setActiveClassification(index);
    setQuery('');
    categoryRefs.current = new Map();
    clearFlashTimer();
    setFlashedCategory(null);
  };

  const hasResults = isSearching ? searchGroups.length > 0 : visibleCategories.length > 0;

  return (
    <div className="border-border bg-background text-foreground flex h-full min-h-0 w-full overflow-hidden rounded-lg border">
      {/* Category sidebar: one button per visible category, keyed by classification so a search
          spanning several classifications never collides two categories onto the same key. */}
      <nav className="border-border bg-muted/40 flex w-20 shrink-0 flex-col gap-1 overflow-y-auto border-r px-2 pt-[104px] pb-2">
        {sidebarCategories.map(({ key, category }) => {
          const Icon = category.icon;
          return (
            <Button
              key={key}
              variant="ghost"
              size="default"
              title={category.name}
              onClick={() => scrollToCategory(key)}
              className="h-auto cursor-pointer flex-col gap-1 px-1 py-2 text-[0.7rem]"
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
                className="h-9 flex-1 cursor-pointer"
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

        {/* Main list: while searching, every matching category across every classification, grouped
            under its classification. */}
        {!hasResults ? (
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
            {isSearching
              ? searchGroups.map(({ classification, categories }) => {
                  const ClassificationIcon = classification.icon;
                  return (
                    <section key={classification.name} className="mb-6">
                      <div className="mb-3 flex items-center gap-2">
                        <ClassificationIcon className="size-4" />
                        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                          {classification.name}
                        </h2>
                      </div>
                      {categories.map(({ key, category }) => (
                        <section
                          key={key}
                          ref={(el) => {
                            categoryRefs.current.set(key, el);
                          }}
                          className="mb-4 ml-1 scroll-mt-4"
                        >
                          <CategoryHeader
                            category={category}
                            isFlashing={flashedCategory === key}
                          />
                          <div className="flex flex-col gap-2">
                            {category.bricks.map((brick) => (
                              <BrickSlot key={brick.id} brick={brick} />
                            ))}
                          </div>
                        </section>
                      ))}
                    </section>
                  );
                })
              : visibleCategories.map(({ key, category }) => (
                  <section
                    key={key}
                    ref={(el) => {
                      categoryRefs.current.set(key, el);
                    }}
                    className="mb-6 scroll-mt-4"
                  >
                    <CategoryHeader category={category} isFlashing={flashedCategory === key} />
                    <div className="flex flex-col gap-2">
                      {category.bricks.map((brick) => (
                        <BrickSlot key={brick.id} brick={brick} />
                      ))}
                    </div>
                  </section>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Palette;
