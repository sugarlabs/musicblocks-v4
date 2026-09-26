import { Home } from 'lucide-react';

import { useWorkspaceViewportStore } from '@/stores/viewport';
import { Button } from '@/ui/button';

/**
 * Returns the canvas to the origin; the pointer twin of the `Home` key in `useCanvasKeyboardNav`.
 *
 * Disabled while the canvas already sits at the origin, since there is nowhere to go back to, the
 * way `ScaleControl` disables a magnifier at the end of its range. Only the view moves: the towers
 * keep their own positions.
 */
export function HomeControl() {
  // A boolean rather than the offset itself: a pan writes the offset on every pointer frame, and
  // this only needs to re-render when the canvas leaves or reaches the origin.
  const isAtOrigin = useWorkspaceViewportStore(
    (state) => state.offset.x === 0 && state.offset.y === 0,
  );
  const { resetOffset } = useWorkspaceViewportStore.getState();

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-14 rounded-full border-2"
      aria-label="Reset view"
      disabled={isAtOrigin}
      onClick={resetOffset}
    >
      <Home className="size-6" />
    </Button>
  );
}

export default HomeControl;
