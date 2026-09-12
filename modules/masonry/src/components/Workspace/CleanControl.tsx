import { BrushCleaning } from 'lucide-react';
import type { RefObject } from 'react';

import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button } from '@/ui/button';

interface CleanControlProps {
  /** The canvas the towers stand on; its height is where a column of tidied towers wraps. */
  canvasRef: RefObject<HTMLElement | null>;
}

/**
 * Workspace-wide tidy control: one button that lays every tower out in a column, ordered by where
 * each stands, wrapping into further columns at the canvas height.
 *
 * Sits beside `ScaleControl` in the canvas' bottom-right corner and, like it, renders as an
 * ordinary button rather than `pointer-events-none`: `useDragFromPalette`'s delegated selector only
 * ever matches `.palette-brick-slot`, never a button. Disabled while there is nothing to tidy.
 *
 * The tidy also brings the canvas home. `cleanWorkspace` lays the towers out in canvas coordinates,
 * starting at the padding, so on a panned canvas the tidied column would sit outside what the user
 * is looking at. Resetting the viewport offset first makes the button mean "tidy, and show me".
 */
export function CleanControl({ canvasRef }: CleanControlProps) {
  const isEmpty = useWorkspaceStore((state) => Object.keys(state.towers).length === 0);
  const { cleanWorkspace } = useWorkspaceStore.getState();
  const { resetOffset } = useWorkspaceViewportStore.getState();

  return (
    <div className="absolute right-66 bottom-6 z-40 flex h-14 items-center">
      <Button
        variant="outline"
        size="icon"
        className="size-14 rounded-full border-2"
        aria-label="Clean workspace"
        disabled={isEmpty}
        onClick={() => {
          resetOffset();
          cleanWorkspace({ maxColumnHeight: canvasRef.current?.clientHeight });
        }}
      >
        <BrushCleaning className="size-6" />
      </Button>
    </div>
  );
}

export default CleanControl;
