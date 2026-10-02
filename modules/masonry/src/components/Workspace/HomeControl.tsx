import { Home } from 'lucide-react';
import { RefObject, useEffect, useState } from 'react';

import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button } from '@/ui/button';
import { goHome, isAwayFromHome } from '@/utils/workspace-home';

interface HomeControlProps {
  /** The canvas the towers are laid out in. Without it, Home only returns the view. */
  canvasRef?: RefObject<HTMLElement | null>;
}

/**
 * Returns the view to the origin and lays every tower out inside the canvas; the pointer twin of
 * the `Home` key in `useCanvasKeyboardNav`.
 *
 * Disabled while the view is at the origin and every tower is on screen, since there is nothing to
 * bring back, the way v3 fades its Home button. It also stays disabled once every tower is already
 * in its home spot, even if one is too tall to fit, since another click would change nothing.
 */
export function HomeControl({ canvasRef }: HomeControlProps) {
  const [isAway, setIsAway] = useState(false);

  // Checked again on every pan, tower change, layout pass and canvas resize. Setting the same
  // value does not re-render.
  useEffect(() => {
    const canvas = canvasRef?.current ?? null;
    const check = () => setIsAway(isAwayFromHome(canvas));

    const unsubscribes = [
      useWorkspaceViewportStore.subscribe(check),
      useWorkspaceStore.subscribe(check),
      useBrickLayoutStore.subscribe(check),
    ];
    const observer = new ResizeObserver(check);
    if (canvas) observer.observe(canvas);
    check();

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      observer.disconnect();
    };
  }, [canvasRef]);

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-14 rounded-full border-2"
      aria-label="Home"
      disabled={!isAway}
      onClick={() => goHome(canvasRef?.current ?? null)}
    >
      <Home className="size-6" />
    </Button>
  );
}

export default HomeControl;
