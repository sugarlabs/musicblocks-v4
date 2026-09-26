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
import type { Point } from '@/@types/common.types';

import { BrickView } from '@/components/Brick/Brick';
import { useBrickHelpStore } from '@/stores/brickHelp';
import type { BrickHelp } from '@/utils/brick-help';

/** How close to the edge of the window the panel may be dragged, in px. */
const EDGE = 8;

/**
 * Keeps a point within the window, so the panel can never be dragged, or opened, out of reach.
 *
 * @param point - where the panel's top-left corner would go
 * @param size - the panel's size
 * @returns the nearest point that keeps it on screen
 */
function clampToWindow(point: Point, size: { w: number; h: number }): Point {
  return {
    x: Math.max(EDGE, Math.min(point.x, window.innerWidth - size.w - EDGE)),
    y: Math.max(EDGE, Math.min(point.y, window.innerHeight - size.h - EDGE)),
  };
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
 * The help window the pie menu's help wedge opens, after v3's: centred when it opens, dragged by
 * its title bar, and open until it is closed with its button or Escape. It shows the brick's name,
 * a picture of the brick and its help text.
 *
 * Rendered into `document.body`, above the canvas, and non-modal, so the workspace stays usable
 * while it is open.
 */
export function HelpPanel() {
  const help = useBrickHelpStore((state) => state.help);
  if (help === null) return null;

  // Keyed by the preview, which is a fresh copy each time help opens, so every opening starts
  // centred rather than wherever the last one was dragged to.
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

  const close = () => useBrickHelpStore.getState().hide();

  const centre = useCallback(() => {
    const panel = panelRef.current;
    if (panel === null) return;

    const { width, height } = panel.getBoundingClientRect();
    setPosition(
      clampToWindow(
        { x: (window.innerWidth - width) / 2, y: (window.innerHeight - height) / 2 },
        { w: width, h: height },
      ),
    );
  }, []);

  // Centred once its size is known, before the browser paints, so it never appears elsewhere
  // first. The brick preview measures itself after mounting and can grow the panel a moment later,
  // so until the panel is dragged it re-centres on whatever size it settles at.
  useLayoutEffect(() => {
    centre();

    const panel = panelRef.current;
    if (panel === null || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (!wasDraggedRef.current) centre();
    });
    observer.observe(panel);

    return () => observer.disconnect();
  }, [centre]);

  // The keyboard goes to the panel as it opens, so it can be read and closed without the pointer.
  // Waits on the position, not just the mount: until centred the panel is hidden, and a browser
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
      // Hidden until centred, so it is never seen at the top-left corner for a frame.
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
