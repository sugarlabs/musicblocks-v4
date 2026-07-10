import { useMemo, type Ref } from 'react';

import type { BrickViewPropsWithModel } from '@/@types/brick.types';
import { BrickView } from '@/components/Brick/Brick';
import { usePaletteDragStore } from '@/stores';
import { createBrickModel } from '@/utils/brick-model-factory';

// -------------------------------------------------------------------------------------------------

interface DragGhostProps {
  /**
   * Ref to the ghost's positioning node; the palette drag hook shows/hides it and writes its
   * `transform` imperatively on every drag frame.
   */
  ref: Ref<HTMLDivElement>;
}

/**
 * Floating preview of the palette brick currently being dragged.
 *
 * The outer positioning node stays mounted (hidden) so the drag hook can write transforms to it
 * from the very first drag frame; only the inner brick preview mounts/unmounts with the drag
 * store's payload. `pointer-events-none` keeps it from swallowing the drag's own pointer events.
 */
export function DragGhost({ ref }: DragGhostProps) {
  const dragged = usePaletteDragStore((state) => state.dragged);

  // Generated id, so the ghost can't collide with the palette preview keyed by the entry's id.
  const model = useMemo(() => (dragged ? createBrickModel(dragged.brick) : null), [dragged]);

  // Use a type assertion because the view expects BrickViewPropsWithModel, but BrickModel
  // guarantees the model fields match the expected discriminated kind.
  const viewProps = model
    ? ({ kind: model.kind, model } as unknown as BrickViewPropsWithModel)
    : null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute top-0 left-0 z-50"
      style={{ display: 'none' }}
    >
      {viewProps ? <BrickView {...viewProps} /> : null}
    </div>
  );
}

export default DragGhost;
