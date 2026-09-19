import { useId, useMemo } from 'react';

import type { BrickViewPropsWithModel } from '@/@types/brick.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';

import { BrickView } from '@/components/Brick/Brick';
import { useBrickTooltip } from '@/hooks/useBrickTooltip';
import { cn } from '@/lib/utils';
import { usePaletteDragStore } from '@/stores/palette';
import { createBrickModel } from '@/utils/brick-model-factory';
import { placeBrickFromPalette } from '@/utils/palette-placement';

import { BrickTooltip } from './BrickTooltip';

interface BrickSlotProps {
  /**
   * The full palette brick config for this entry. Beyond the preview's render props, the entry's
   * `id` doubles as the drag payload key (`data-brick-id`) that `useDragFromPalette` resolves back
   * to this config when a drag starts on the slot.
   */
  brick: PaletteBrickConfig;
}

/**
 * Render boundary for a single palette brick — a live SVG preview wrapped in a passive drag
 * source and click-to-place target: `palette-brick-slot` is the delegated selector `useDragFromPalette`
 * binds against, `data-brick-id` the payload key, and `touch-none` lets touch drags reach interact.js.
 * Clicking or pressing Enter/Space places a new standalone tower on the workspace canvas, and
 * hovering or focusing the slot reveals the brick's tooltip after a short delay.
 */
export function BrickSlot({ brick }: BrickSlotProps) {
  const model = useMemo(() => createBrickModel(brick.brick, brick.id), [brick.brick, brick.id]);
  const isDragging = usePaletteDragStore((state) => state.dragged?.id === brick.id);

  // The brick's own tooltip is the point of the hover; the catalog description stands in for
  // bricks that carry no tooltip text, since it is what the slot used to show through `title`.
  const tooltipText = model.tooltipText || brick.description;
  const tooltip = useBrickTooltip(tooltipText);
  const tooltipId = useId();

  // Use a type assertion because the view expects BrickViewPropsWithModel, but BrickModel
  // guarantees the model fields match the expected discriminated kind.
  const viewProps = { kind: model.kind, model } as unknown as BrickViewPropsWithModel;

  const handleClick = () => {
    const { dragged, lastDragEndTime } = usePaletteDragStore.getState();
    // Guard against drag-to-click double placement: ignore click if actively dragging
    // or if a drag gesture ended within the last 250ms.
    if (dragged || Date.now() - lastDragEndTime < 250) {
      return;
    }
    placeBrickFromPalette(brick);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        'grid min-h-6 items-start ease-in-out [overflow-anchor:none]',
        isDragging
          ? 'grid-rows-[0fr] opacity-0 transition-[grid-template-rows] duration-500'
          : 'grid-rows-[1fr] opacity-100 transition-all duration-500',
      )}
    >
      <div className="overflow-hidden p-0.5">
        <div
          role="button"
          tabIndex={0}
          aria-label={brick.name || brick.description}
          aria-describedby={tooltip.anchor !== null ? tooltipId : undefined}
          data-brick-id={brick.id}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onPointerEnter={(event) => tooltip.show(event.currentTarget)}
          onPointerLeave={tooltip.hide}
          onPointerDown={tooltip.hide}
          onFocus={(event) => tooltip.show(event.currentTarget)}
          onBlur={tooltip.hide}
          className="palette-brick-slot focus-visible:outline-primary flex min-h-11 w-fit cursor-grab touch-none items-center rounded-md px-1 py-1 transition-colors select-none hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-1 active:cursor-grabbing"
        >
          <div className="pointer-events-none">
            <BrickView {...viewProps} />
          </div>
        </div>
        {tooltip.anchor !== null && (
          <BrickTooltip id={tooltipId} text={tooltipText} anchor={tooltip.anchor} />
        )}
      </div>
    </div>
  );
}

export default BrickSlot;
