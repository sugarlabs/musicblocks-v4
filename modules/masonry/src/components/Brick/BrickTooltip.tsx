import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Gap in px between the brick's edge and the tooltip resting against it. */
const GAP = 8;
/** Long tooltips wrap at this width rather than running off the side of the window. */
const MAX_WIDTH = 256;

/**
 * Tooltip for a hovered brick.
 *
 * It renders into `document.body` rather than the brick's `<svg>`, for two reasons: anything
 * inside the svg widens the brick's `getBBox()`, which the workspace measures for canvas bounds,
 * and a tooltip drawn in the svg is clipped by any ancestor that hides its overflow, so bricks
 * near the top of the canvas would show a cut off tooltip. It is inert to the pointer, so it can
 * neither break the hover it belongs to nor swallow the start of a drag.
 *
 * @param props.id - the trigger points `aria-describedby` at this while the tooltip is open
 * @param props.text - the text to show
 * @param props.anchor - client rect of the element the tooltip belongs to
 */
export function BrickTooltip(props: { id: string; text: string; anchor: DOMRect }) {
  const { left, top, bottom } = props.anchor;
  const ref = useRef<HTMLDivElement>(null);
  // Starts above and against the anchor's left edge, then settles once measured: a tooltip too
  // tall for the room above flips below, and one too wide for the room to the right slides left.
  // Measuring in a layout effect settles both before the browser paints, so neither moves in front
  // of the user.
  const [placeBelow, setPlaceBelow] = useState(false);
  const [renderedWidth, setRenderedWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const { height, width } = element.getBoundingClientRect();
    setPlaceBelow(top - GAP - height < GAP);
    setRenderedWidth(width);
  }, [top, props.text]);

  // Capped to the window, so a viewport narrower than the tooltip cannot leave it hanging off the
  // right edge.
  const maxWidth = Math.min(MAX_WIDTH, window.innerWidth - 2 * GAP);
  // Clamped by the width the tooltip actually rendered at rather than the cap, so a short tooltip
  // near the right edge stays against its brick instead of being pulled left by room it never uses.
  const clampedLeft = Math.max(GAP, Math.min(left, window.innerWidth - renderedWidth - GAP));

  return createPortal(
    <div
      ref={ref}
      id={props.id}
      role="tooltip"
      className="bg-popover text-popover-foreground pointer-events-none fixed z-50 w-max rounded-md px-2 py-1 text-xs shadow-md"
      style={{
        left: clampedLeft,
        top: placeBelow ? bottom + GAP : top - GAP,
        maxWidth,
        transform: placeBelow ? undefined : 'translateY(-100%)',
      }}
    >
      {props.text}
    </div>,
    document.body,
  );
}
