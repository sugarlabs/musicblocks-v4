import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { Button } from '@/ui/button';

interface PaletteControlProps {
  /** The id of the palette it folds, for `aria-controls`. */
  controls: string;
  /** Whether the palette is folded down to its rail. */
  collapsed: boolean;
  /** Folds the palette, or opens it again. */
  onToggle: () => void;
}

/**
 * Folds the palette down to a rail of classification icons and back, with the same button
 * conventions as the other workspace controls.
 *
 * Pinned to the palette's top-left corner, which stays put either way, so it can be clicked again
 * without chasing it. The state stays with the Workspace, which owns the palette's width.
 */
export function PaletteControl({ controls, collapsed, onToggle }: PaletteControlProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={collapsed ? 'Expand palette' : 'Collapse palette'}
      aria-expanded={!collapsed}
      aria-controls={controls}
      onClick={onToggle}
      className="absolute top-1 left-1 z-10 size-14 rounded-full border-2"
    >
      {collapsed ? <PanelLeftOpen className="size-6" /> : <PanelLeftClose className="size-6" />}
    </Button>
  );
}

export default PaletteControl;
