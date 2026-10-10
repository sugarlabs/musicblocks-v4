import { X } from 'lucide-react';
import {
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import type { BrickViewPropsWithModel } from '@/@types/brick.types';
import type { Bounds, Point, Size } from '@/@types/common.types';
import type { BrickHelp } from '@/utils/brick-help';

import { BrickView } from '@/components/Brick/Brick';
import { useBrickHelpStore } from '@/stores/brickHelp';
import { useWorkspaceStore } from '@/stores/workspace';

/** How close to the edge of the window the panel may be dragged, in px. */
const EDGE = 8;
/** The gap between the brick's head and the tip of the panel's arrow, in px. */
const GAP = 6;
/** How far the arrow sticks out of the panel's side, in px. */
const ARROW = 8;
/** The arrow's square, sized so that turned on its corner it sticks out by `ARROW`. */
const ARROW_BOX = ARROW * Math.SQRT2;
/** How close to the panel's top or bottom corner the arrow may sit, in px, clear of the rounding. */
const ARROW_INSET = 16;
/** Where the arrow sits on the panel's side, in px from its top: level with the title bar. */
const ARROW_TOP = 20;

/** The arrow on the panel's side that points at the brick: which side, and how far down it is. */
interface Arrow {
  /** The panel's side the arrow is on, the side facing the brick. */
  side: 'left' | 'right';
  /** The arrow's centre, in px from the panel's top. */
  y: number;
}

/**
 * Keeps a point within the window, so the panel can never be dragged, or opened, out of reach.
 *
 * @param point - where the panel's top-left corner would go
 * @param size - the panel's size
 * @returns the nearest point that keeps it on screen
 */
function clampToWindow(point: Point, size: Size): Point {
  return {
    x: Math.max(EDGE, Math.min(point.x, window.innerWidth - size.w - EDGE)),
    y: Math.max(EDGE, Math.min(point.y, window.innerHeight - size.h - EDGE)),
  };
}

/**
 * Where the panel goes to point at a brick: beside its head, to the right where it fits and to the
 * left where it does not, with its title bar level with the head as far as the window allows, so
 * it hangs down from the arrow like a callout. Where neither side has room
 * it takes the roomier one and gives up the arrow, which would only point into the panel.
 *
 * @param anchor - the brick's head on screen
 * @param size - the panel's size
 * @returns where the panel's top-left corner goes, and its arrow, if it has one
 */
export function besideAnchor(anchor: Bounds, size: Size): { position: Point; arrow: Arrow | null } {
  const offset = GAP + ARROW;
  const roomRight = window.innerWidth - (anchor.x + anchor.w) - offset - EDGE;
  const roomLeft = anchor.x - offset - EDGE;
  const fits = Math.max(roomRight, roomLeft) >= size.w;
  const side = roomRight >= size.w || roomRight >= roomLeft ? 'left' : 'right';

  const middle = anchor.y + anchor.h / 2;
  const position = clampToWindow(
    {
      x: side === 'left' ? anchor.x + anchor.w + offset : anchor.x - offset - size.w,
      y: middle - ARROW_TOP,
    },
    size,
  );

  if (!fits) return { position, arrow: null };

  const y = Math.max(ARROW_INSET, Math.min(middle - position.y, size.h - ARROW_INSET));

  return { position, arrow: { side, y } };
}

/**
 * Stops an event at the panel. The workspace listens for keys on the window, and Delete or
 * Backspace there deletes the selected brick, so a key pressed in the panel must never reach it.
 * Presses and wheel turns are kept from the canvas behind it the same way.
 */
function keepInPanel(event: SyntheticEvent) {
  event.stopPropagation();
}

/**
 * The help window the pie menu's help wedge opens, after v3's: dragged by its title bar, and open
 * until it is closed with its button or Escape. It shows the brick's name, a picture of the brick
 * and its help text. It opens beside the brick, with an arrow pointing at it, so it is clear which
 * brick it is about; once dragged away the arrow goes, since it would no longer point at the brick.
 * When the brick could not be found on screen it opens centred instead, without an arrow.
 *
 * Rendered into `document.body`, above the canvas, and non-modal, so the workspace stays usable
 * while it is open.
 */
export function HelpPanel() {
  const help = useBrickHelpStore((state) => state.help);
  const areBricksHidden = useWorkspaceStore((state) => state.areBricksHidden);

  // Hiding the bricks closes it: it describes a brick that is no longer on screen. Closed rather
  // than hidden with them, so showing the bricks again doesn't bring back help nobody asked for.
  useEffect(() => {
    if (areBricksHidden) useBrickHelpStore.getState().hide();
  }, [areBricksHidden]);

  if (help === null || areBricksHidden) return null;

  // Keyed by the preview, which is a fresh copy each time help opens, so every opening starts
  // beside its brick rather than wherever the last one was dragged to.
  return <HelpWindow key={help.preview.id} help={help} />;
}

function HelpWindow({ help }: { help: BrickHelp }) {
  const titleId = useId();
  const textId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ pointer: Point; origin: Point } | null>(null);
  // Set once the panel has been moved by hand, after which it stays wherever it was put.
  const wasDraggedRef = useRef(false);
  const hasFocusedRef = useRef(false);
  const [position, setPosition] = useState<Point | null>(null);
  const [arrow, setArrow] = useState<Arrow | null>(null);

  const close = () => useBrickHelpStore.getState().hide();

  const { anchor } = help;
  const place = useCallback(() => {
    const panel = panelRef.current;
    if (panel === null) return;

    const { width, height } = panel.getBoundingClientRect();
    const size = { w: width, h: height };

    if (anchor) {
      const beside = besideAnchor(anchor, size);
      setPosition(beside.position);
      setArrow(beside.arrow);
      return;
    }

    setPosition(
      clampToWindow(
        { x: (window.innerWidth - width) / 2, y: (window.innerHeight - height) / 2 },
        size,
      ),
    );
  }, [anchor]);

  // Placed once its size is known, before the browser paints, so it never appears elsewhere first.
  // The brick preview measures itself after mounting and can grow the panel a moment later, so
  // until the panel is dragged it is placed again on whatever size it settles at.
  useLayoutEffect(() => {
    place();

    const panel = panelRef.current;
    if (panel === null || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (!wasDraggedRef.current) place();
    });
    observer.observe(panel);

    return () => observer.disconnect();
  }, [place]);

  // A smaller window can leave the panel hanging off its edge without the panel itself changing
  // size, so a resize places it again too. Once dragged it stays where it was put, only pulled
  // back inside the window as far as it has to be.
  useEffect(() => {
    const onResize = () => {
      if (!wasDraggedRef.current) {
        place();
        return;
      }

      const panel = panelRef.current;
      if (panel === null) return;

      const { width, height } = panel.getBoundingClientRect();
      setPosition((current) =>
        current === null ? current : clampToWindow(current, { w: width, h: height }),
      );
    };

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [place]);

  // The keyboard goes to the panel as it opens, so it can be read and closed without the pointer.
  // Waits on the position, not just the mount: until placed the panel is hidden, and a browser
  // ignores focus() on a hidden element.
  useEffect(() => {
    if (position === null || hasFocusedRef.current) return;

    hasFocusedRef.current = true;
    closeRef.current?.focus();
  }, [position]);

  // Escape closes it wherever the focus has gone since it opened, as it does the pie menu: a key
  // pressed inside the panel never reaches the document, so this only hears the ones pressed
  // elsewhere, and the panel's own handler takes care of the rest.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') useBrickHelpStore.getState().hide();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const onTitlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // A press on the close button is the button's, not the start of a drag.
    if ((event.target as Element).closest('button') !== null || position === null) return;

    wasDraggedRef.current = true;
    // Moved off its brick, the arrow would point at nothing.
    setArrow(null);
    dragRef.current = { pointer: { x: event.clientX, y: event.clientY }, origin: position };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onTitlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (drag === null || panel === null) return;

    const { width, height } = panel.getBoundingClientRect();
    setPosition(
      clampToWindow(
        {
          x: drag.origin.x + event.clientX - drag.pointer.x,
          y: drag.origin.y + event.clientY - drag.pointer.y,
        },
        { w: width, h: height },
      ),
    );
  };

  const onTitlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const previewProps = {
    kind: help.preview.kind,
    model: help.preview,
  } as unknown as BrickViewPropsWithModel;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={textId}
      data-testid="help-panel"
      className="bg-popover text-popover-foreground ring-foreground/10 fixed z-50 flex w-80 max-w-[calc(100vw-16px)] flex-col rounded-lg shadow-lg ring-1"
      // Hidden until placed, so it is never seen at the top-left corner for a frame.
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        visibility: position === null ? 'hidden' : 'visible',
      }}
      onKeyDown={(event) => {
        keepInPanel(event);
        if (event.key === 'Escape') close();
      }}
      onPointerDown={keepInPanel}
      onWheel={keepInPanel}
    >
      {arrow !== null && (
        // A square turned on its corner, half out of the panel's side, with the panel's outline on
        // the two sides that show. Under the panel's content, so the half inside never covers it.
        <div
          data-testid="help-panel-arrow"
          data-side={arrow.side}
          aria-hidden="true"
          className={`bg-popover border-foreground/10 absolute -z-10 rotate-45 ${
            arrow.side === 'left' ? 'border-b border-l' : 'border-t border-r'
          }`}
          style={{
            width: ARROW_BOX,
            height: ARROW_BOX,
            top: arrow.y - ARROW_BOX / 2,
            [arrow.side]: -ARROW_BOX / 2,
          }}
        />
      )}
      <div
        data-testid="help-panel-title-bar"
        className="flex cursor-grab touch-none items-center justify-between gap-2 border-b px-3 py-2 select-none active:cursor-grabbing"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onPointerCancel={onTitlePointerUp}
      >
        <h2 id={titleId} className="m-0 truncate text-sm font-semibold">
          {help.title}
        </h2>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close help"
          className="hover:bg-foreground/10 focus-visible:outline-primary rounded p-1 focus-visible:outline-2"
          onClick={close}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 p-4">
        {/* A picture of the brick, not a brick: it cannot be dragged, clicked or typed into. */}
        <div data-testid="help-panel-preview" className="pointer-events-none" aria-hidden="true">
          <BrickView {...previewProps} />
        </div>
        <p id={textId} className="m-0 text-sm">
          {help.text}
        </p>
      </div>
    </div>,
    document.body,
  );
}
