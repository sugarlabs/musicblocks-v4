/** Gap in px between the brick's top edge and the tooltip resting above it. */
const OFFSET = 8;
/** `foreignObject` needs a box to lay out in; the tooltip inside it sizes to its own content. */
const BOX_HEIGHT = 32;
const BOX_WIDTH = 9999;

/**
 * Tooltip shown above a hovered brick. It renders inside the brick's own `<svg>`, so it travels
 * with the brick, and it is inert to the pointer so it can neither break the hover it belongs to
 * nor swallow the start of a drag.
 */
export function BrickTooltip(props: { text: string }) {
  return (
    <foreignObject
      x={0}
      y={-(BOX_HEIGHT + OFFSET)}
      width={BOX_WIDTH}
      height={BOX_HEIGHT}
      style={{ overflow: 'visible' }}
      pointerEvents="none"
    >
      <div className="flex h-full items-end">
        <p
          role="tooltip"
          className="bg-popover text-popover-foreground m-0 w-max rounded-md px-2 py-1 text-xs shadow-md"
        >
          {props.text}
        </p>
      </div>
    </foreignObject>
  );
}
