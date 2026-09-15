import { createPortal } from 'react-dom';

/** Gap in px between the brick's edge and the tooltip resting against it. */
const GAP = 8;
/** Below this much room above the anchor, the tooltip flips under the brick instead. */
const FLIP_THRESHOLD = 40;

/**
 * Tooltip for a hovered brick.
 *
 * It renders into `document.body` rather than the brick's `<svg>`, for two reasons: anything
 * inside the svg widens the brick's `getBBox()`, which the workspace measures for canvas bounds,
 * and a tooltip drawn in the svg is clipped by any ancestor that hides its overflow, so bricks
 * near the top of the canvas would show a cut off tooltip. It is inert to the pointer, so it can
 * neither break the hover it belongs to nor swallow the start of a drag.
 */
export function BrickTooltip(props: { text: string; anchor: DOMRect }) {
  const { left, top, bottom } = props.anchor;
  const flip = top < FLIP_THRESHOLD;

  return createPortal(
    <div
      role="tooltip"
      className="bg-popover text-popover-foreground pointer-events-none fixed z-50 w-max rounded-md px-2 py-1 text-xs shadow-md"
      style={{
        left,
        top: flip ? bottom + GAP : top - GAP,
        transform: flip ? undefined : 'translateY(-100%)',
      }}
    >
      {props.text}
    </div>,
    document.body,
  );
}
