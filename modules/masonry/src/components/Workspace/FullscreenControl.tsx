import { Maximize, Minimize } from 'lucide-react';
import type { RefObject } from 'react';

import { useFullscreen } from '@/hooks/useFullscreen';
import { Button } from '@/ui/button';

/** Toggles fullscreen on the workspace root; icon and `aria-pressed` follow the real API state. */
export function FullscreenControl({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const { isFullscreen, toggle } = useFullscreen(rootRef);

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute right-66 bottom-6 z-40 size-14 rounded-full border-2"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={isFullscreen}
      onClick={toggle}
    >
      {isFullscreen ? <Minimize className="size-6" /> : <Maximize className="size-6" />}
    </Button>
  );
}

export default FullscreenControl;
