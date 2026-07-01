import type { PaletteBrickConfig } from '@/@types/palette.types';
import { cn } from '@/lib/utils';

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
export function BrickSlot({ brick }: BrickSlotProps) {
  return (
    <div
      title={brick.description}
      data-brick-id={brick.id}
      className={cn(
        'border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground flex min-h-11 cursor-grab items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-colors select-none',
      )}
    >
      <span className="truncate">{brick.name}</span>
    </div>
  );
}
