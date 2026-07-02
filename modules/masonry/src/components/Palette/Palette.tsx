import { useMemo, useState } from 'react';

import {
  Box,
  GitBranch,
  Music,
  Palette as PaletteIcon,
  Play,
  Repeat,
  Search,
  Shapes,
  Waves,
  type LucideIcon,
} from 'lucide-react';

import type {
  PaletteBrickConfig,
  PaletteCategoryConfig,
  PaletteConfig,
  PaletteSectionConfig,
} from '@/@types/palette.types';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';

// -------------------------------------------------------------------------------------------------

/**
 * Maps the string icon identifiers used in `PaletteConfig` (category/section `icon` fields) to
 * concrete lucide-react components. Config carries icon names as plain strings; this local lookup
 * resolves them, falling back to `Box` for unknown names.
 */
const ICONS: Record<string, LucideIcon> = {
  Music,
  Waves,
  GitBranch,
  Shapes,
  Play,
  Repeat,
  Palette: PaletteIcon,
  Box,
};

/** Resolves an icon name from the config to a lucide component, falling back to `Box`. */
function resolveIcon(name: string): LucideIcon {
  return ICONS[name] ?? Box;
}

// -------------------------------------------------------------------------------------------------

interface PaletteProps {
  /** Full Category → Section → Brick hierarchy the palette renders. */
  config: PaletteConfig;
}

/**
 * Root Brick Palette shell.
 *
 * Owns the active-category selection and the search query, and composes the whole shell in one
 * place: the category rail, the search input, and the per-section brick list. Sections are filtered
 * to the active category and (case-insensitively) to the search query over each brick's name and
 * description.
 *
 * This is the shell only — bricks render as placeholder boxes (no SVG, no brick renderer). Each
 * placeholder receives the whole `PaletteBrickConfig` so a later PR can turn it into a drag source
 * that carries the config as its payload without changing the prop contract.
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
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bricks"
              className="pl-8"
            />
          </div>
        </div>
        <SectionList sections={filteredSections} />
      </div>
    </div>
  );
}

export default Palette;

// -------------------------------------------------------------------------------------------------

interface CategoryRailProps {
  /** Ordered categories to show, one button per category. */
  categories: PaletteCategoryConfig[];
  /** Index of the currently active category. */
  activeIndex: number;
  /** Called with the index of the category the user selects. */
  onSelect: (index: number) => void;
}

/**
 * Scratch-style vertical category rail. Renders one icon-and-name button per category and
 * highlights the active one.
 */
function CategoryRail({ categories, activeIndex, onSelect }: CategoryRailProps) {
  return (
    <nav className="border-border bg-muted/40 flex w-20 shrink-0 flex-col gap-1 overflow-y-auto border-r p-2">
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

// -------------------------------------------------------------------------------------------------

interface SectionListProps {
  /** Sections to render (already filtered by the parent for search/active category). */
  sections: PaletteSectionConfig[];
}

/**
 * Scrollable content panel for the active category. Renders each section with a color-accented
 * header and a vertical stack of brick placeholders.
 */
function SectionList({ sections }: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-muted-foreground text-sm">No bricks match your search.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {sections.map((section) => {
        const Icon = resolveIcon(section.icon);
        return (
          <section key={section.name} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <Icon className="size-4" style={{ color: section.color }} />
              <h3 className="text-sm font-semibold" style={{ color: section.color }}>
                {section.name}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {section.bricks.map((brick) => (
                <BrickSlot key={brick.id} brick={brick} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------------------------------------------

interface BrickSlotProps {
  /**
   * The full palette brick config for this entry. The placeholder only reads `name`/`description`
   * today, but it receives the entire object so a later PR can turn this slot into a drag source
   * that carries the config as its payload without changing the prop contract.
   */
  brick: PaletteBrickConfig;
}

/**
 * Placeholder render boundary for a single palette brick. Renders a styled box showing the brick's
 * name with its description as a native hover tooltip. It intentionally renders no SVG and imports
 * no brick view components — live brick previews are the subject of a later PR.
 */
function BrickSlot({ brick }: BrickSlotProps) {
  return (
    <div
      title={brick.description}
      data-brick-id={brick.id}
      className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground flex min-h-11 cursor-grab items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-colors select-none"
    >
      <span className="truncate">{brick.name}</span>
    </div>
  );
}
