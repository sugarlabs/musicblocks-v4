import type { PaletteSectionConfig } from '@/@types/palette.types';

import { BrickSlot } from './brickSlot';
import { resolveIcon } from './icons';

interface SectionListProps {
  /** Sections to render (already filtered by the parent for search/active category). */
  sections: PaletteSectionConfig[];
  /** Message shown when there are no sections/bricks to display. */
  emptyMessage?: string;
}

/**
 * Scrollable content panel for the active category. Renders each section with a color-accented
 * header and a vertical stack of `BrickSlot` placeholders.
 */
export function SectionList({ sections, emptyMessage }: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-muted-foreground text-sm">
          {emptyMessage ?? 'No bricks match your search.'}
        </p>
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
