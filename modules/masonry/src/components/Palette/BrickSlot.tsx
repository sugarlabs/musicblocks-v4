import { useMemo } from 'react';

import type { BrickViewPropsWithModel } from '@/@types/brick.types';
import type { PaletteBrickConfig } from '@/@types/palette.types';

import { BrickView } from '@/components/Brick/Brick';
import { cn } from '@/lib/utils';
import { usePaletteDragStore } from '@/stores/palette';
import { createBrickModel } from '@/utils/brick-model-factory';

interface BrickSlotProps {
  /**
   * The full palette brick config for this entry. Beyond the preview's render props, the entry's
   * `id` doubles as the drag payload key (`data-brick-id`) that `useDragFromPalette` resolves back
   * to this config when a drag starts on the slot.
   */
  brick: PaletteBrickConfig;
  onActivate?: (brick: PaletteBrickConfig) => void;
}

/**
 * Render boundary for a single palette brick — a live SVG preview wrapped in a passive drag
 * source: `palette-brick-slot` is the delegated selector `useDragFromPalette` binds against,
 * `data-brick-id` the payload key, and `touch-none` lets touch drags reach interact.js. All drag
 * logic lives in the hook; the slot itself never moves while dragging.
 */
export function BrickSlot({ brick, onActivate }: BrickSlotProps) {
  const model = useMemo(() => createBrickModel(brick.brick, brick.id), [brick.brick, brick.id]);
  const isDragging = usePaletteDragStore((state) => state.dragged?.id === brick.id);

  // Use a type assertion because the view expects BrickViewPropsWithModel, but BrickModel
  // guarantees the model fields match the expected discriminated kind.
  const viewProps = { kind: model.kind, model } as unknown as BrickViewPropsWithModel;

  return (
    <div
      className={cn(
        'grid min-h-6 items-start ease-in-out [overflow-anchor:none]',
        isDragging
          ? 'grid-rows-[0fr] opacity-0 transition-[grid-template-rows] duration-500'
          : 'grid-rows-[1fr] opacity-100 transition-all duration-500',
      )}
    >
      <div className="overflow-hidden">
        <button
          type="button"
          title={brick.description}
          aria-label={`${brick.name}: ${brick.description}`}
          data-brick-id={brick.id}
          className="palette-brick-slot flex min-h-11 w-fit cursor-grab touch-none items-center px-1 py-1 transition-colors select-none hover:brightness-110 active:cursor-grabbing"
          onClick={() => onActivate?.(brick)}
        >
          <div className="pointer-events-none">
            <BrickView {...viewProps} />
          </div>
        </button>
      </div>
    </div>
  );
}

export default BrickSlot;
