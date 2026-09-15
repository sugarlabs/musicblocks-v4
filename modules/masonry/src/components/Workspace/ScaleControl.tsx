import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

import { useWorkspaceScaleStore } from '@/stores/scale';
import { Button } from '@/ui/button';
import { DEFAULT_SCALE_LEVEL, MAX_SCALE_LEVEL, MIN_SCALE_LEVEL } from '@/utils/constants';

/**
 * Workspace-wide zoom control: two magnifier buttons that step the scale store's level, plus a
 * reset that returns to the default.
 *
 * The reset only renders away from the default level, where it has nothing to undo. It sits
 * leftmost because the row is anchored on its right edge, so dropping it leaves the magnifiers
 * where they are rather than sliding them under the pointer.
 *
 * Unlike Trash this needs real pointer events, so it renders as ordinary buttons rather than
 * `pointer-events-none` — safe since `useDragFromPalette`'s delegated selector only ever matches
 * `.palette-brick-slot`, never a button.
 */
export function ScaleControl() {
  const level = useWorkspaceScaleStore((state) => state.level);
  const { reset, zoomIn, zoomOut } = useWorkspaceScaleStore.getState();

  return (
    <div className="absolute right-26 bottom-6 z-40 flex h-14 items-center gap-6">
      {level !== DEFAULT_SCALE_LEVEL && (
        <Button
          variant="outline"
          size="icon"
          className="size-14 rounded-full border-2"
          aria-label="Reset zoom"
          onClick={reset}
        >
          <RotateCcw className="size-6" />
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        className="size-14 rounded-full border-2"
        aria-label="Zoom out"
        disabled={level === MIN_SCALE_LEVEL}
        onClick={zoomOut}
      >
        <ZoomOut className="size-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="size-14 rounded-full border-2"
        aria-label="Zoom in"
        disabled={level === MAX_SCALE_LEVEL}
        onClick={zoomIn}
      >
        <ZoomIn className="size-6" />
      </Button>
    </div>
  );
}

export default ScaleControl;
