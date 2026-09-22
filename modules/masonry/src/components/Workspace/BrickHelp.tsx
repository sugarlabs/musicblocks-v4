import { useCallback, useEffect, useId, useState } from 'react';

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

  const measure = useCallback(() => {
    if (brickId === null) {
      setAnchor(null);
      return;
    }

    // Matched on the dataset value rather than built into the selector: an imported project keeps
    // the IDs in its payload, and a quote or another CSS metacharacter in one would throw from a
    // selector however it was escaped in.
    const element =
      Array.from(document.querySelectorAll(TOWER_BRICK_SELECTOR)).find(
        (candidate) => candidate instanceof HTMLElement && candidate.dataset.id === brickId,
      ) ?? null;
    // The brick has gone — discarded, folded away, or replaced by an import.
    if (element === null) {
      useBrickHelpStore.getState().hide();
      return;
    }

    setAnchor(element.getBoundingClientRect());
  }, [brickId]);

  // Re-measures as the brick moves, since its coords change on a move, a scale change or a fold.
  useEffect(measure, [measure, coords]);

  // A resize moves the brick without touching its coords, and leaves the tooltip clamped to a
  // window that is no longer there, so the rect has to be taken again.
  useEffect(() => {
    if (brickId === null) return;

    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
  }, [brickId, measure]);

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
