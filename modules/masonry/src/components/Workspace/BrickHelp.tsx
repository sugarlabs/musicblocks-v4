import { useEffect, useId, useState } from 'react';

import { BrickTooltip } from '@/components/Brick/BrickTooltip';
import { useBrickLayoutStore } from '@/stores/brick';
import { useBrickHelpStore } from '@/stores/brickHelp';
import { findNodeAndTower } from '@/stores/workspace';
import { TOWER_BRICK_SELECTOR } from '@/utils/constants';

/**
 * The tooltip the pie menu's help wedge opens on a brick in the workspace.
 *
 * Hovering every brick was rejected as too noisy for the canvas, so the text is asked for instead,
 * one brick at a time, and stays until it is dismissed: Escape, a press anywhere, or the brick
 * itself leaving the canvas.
 *
 * It measures the brick's own element rather than deriving a position from `coords`, so the text
 * lands against what is on screen whatever the canvas is panned or scaled to; re-measuring when
 * the brick's coords change keeps it there as the brick moves.
 */
export function BrickHelp() {
  const brickId = useBrickHelpStore((state) => state.brickId);
  const coords = useBrickLayoutStore((state) =>
    brickId === null ? undefined : state.coords[brickId],
  );
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (brickId === null) {
      setAnchor(null);
      return;
    }

    const element = document.querySelector(`${TOWER_BRICK_SELECTOR}[data-id="${brickId}"]`);
    // The brick has gone — discarded, folded away, or replaced by an import.
    if (element === null) {
      useBrickHelpStore.getState().hide();
      return;
    }

    setAnchor(element.getBoundingClientRect());
  }, [brickId, coords]);

  useEffect(() => {
    if (brickId === null) return;

    const hide = () => useBrickHelpStore.getState().hide();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    document.addEventListener('keydown', onKeyDown);
    // Capture, so a press the brick or the fold chevron stops still dismisses the text.
    document.addEventListener('pointerdown', hide, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', hide, true);
    };
  }, [brickId]);

  if (brickId === null || anchor === null) return null;

  const text = findNodeAndTower(brickId)?.node.model.tooltipText;
  if (!text) return null;

  return <BrickTooltip id={tooltipId} text={text} anchor={anchor} />;
}
