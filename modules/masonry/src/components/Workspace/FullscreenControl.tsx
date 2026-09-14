import { Maximize, Minimize } from 'lucide-react';

import { useFullscreen } from '@/hooks/useFullscreen';
import { Button } from '@/ui/button';

/**
 * Toggles fullscreen on the page; icon and `aria-pressed` follow the real API state.
 *
 * Renders nothing where the browser has no fullscreen to give, since a button that can only fail
 * is worse than no button at all.
 */
export function FullscreenControl() {
  const { isFullscreen, isSupported, toggle } = useFullscreen();

  if (!isSupported) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-14 rounded-full border-2"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={isFullscreen}
      onClick={toggle}
    >
      {isFullscreen ? <Minimize className="size-6" /> : <Maximize className="size-6" />}
    </Button>
  );
}

export default FullscreenControl;
