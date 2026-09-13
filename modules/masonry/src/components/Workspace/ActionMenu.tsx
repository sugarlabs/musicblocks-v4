import { useEffect, useRef, useState } from 'react';

import type { ActionMenuWedge } from '@/@types/action-menu.types';
import type { Point } from '@/@types/common.types';

import { useActionMenuStore } from '@/stores/actionMenu';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { findNodeAndTower } from '@/stores/workspace';
import { ACTION_MENU_RING, SCALE_LEVEL_CONFIG } from '@/utils/constants';
import { ringAtScale, wedgeAngles, wedgeCentre, wedgePath, type PieRing } from '@/utils/pie-menu';

import { ACTION_MENU_WEDGES } from './actionMenuWedges';

/** Icon size at `brickScale` 1; scaled with the ring so it stays in proportion to its wedge. */
const ICON_PX = 20;

interface WedgeButtonProps {
  wedge: ActionMenuWedge;
  /** Its place in the ring, which is what decides the slice of the circle it owns. */
  index: number;
  count: number;
  ring: PieRing;
  iconSize: number;
  /** Whether this is the wedge the ring's single tab stop currently rests on. */
  isActive: boolean;
  /** The brick the menu is open on, and the one the wedge acts on. */
  brickId: string;
  onFocus: () => void;
  register: (element: HTMLButtonElement | null) => void;
}

/**
 * One wedge, as a button the size of the whole ring clipped down to its own slice.
 *
 * A button rather than an SVG path with a role bolted on: the tab order, the focus, the tooltip and
 * the pressing are all a button's already, and none of them have to be rebuilt. The wedge shape is
 * a `clip-path`, which the browser hit-tests against, so a press in the hole or in the gap between
 * two wedges is a press on neither of them and reaches whatever sits underneath.
 */
function WedgeButton(props: WedgeButtonProps) {
  const { wedge, index, count, ring, iconSize, isActive, brickId, onFocus, register } = props;

  const box = ring.outerRadius * 2;
  const angles = wedgeAngles(index, count, ACTION_MENU_RING.gapDegrees);
  const centre: Point = { x: ring.outerRadius, y: ring.outerRadius };
  const icon = wedgeCentre(angles, ring);

  const isEnabled = wedge.isEnabled(brickId);

  return (
    <button
      ref={register}
      type="button"
      role="menuitem"
      data-wedge={wedge.id}
      aria-label={wedge.label}
      aria-disabled={!isEnabled}
      title={wedge.tooltip}
      // One tab stop for the whole ring, the arrow keys moving it between the wedges: a menu is
      // one control, so tabbing through it should leave it rather than walk it wedge by wedge.
      tabIndex={isActive ? 0 : -1}
      onFocus={onFocus}
      onClick={() => {
        // An `aria-disabled` wedge is pressable as far as the browser is concerned, so the guard
        // that keeps it inert has to be here rather than left to a `disabled` attribute.
        if (!isEnabled) return;

        wedge.run(brickId);
        useActionMenuStore.getState().close();
      }}
      className={`pointer-events-auto absolute top-0 left-0 border-0 p-0 transition-colors ${
        isEnabled
          ? 'cursor-pointer bg-neutral-700/90 hover:bg-neutral-600 focus-visible:bg-neutral-600'
          : 'cursor-default bg-neutral-700/40'
      }`}
      style={{
        width: box,
        height: box,
        // An outline would be clipped away with the rest of the button, so the focused wedge is
        // shown by the fill the `focus-visible` class brightens instead.
        outline: 'none',
        clipPath: `path('${wedgePath(angles, ring, centre)}')`,
      }}
    >
      <wedge.Icon
        size={iconSize}
        className={`absolute ${isEnabled ? 'text-white' : 'text-white/40'}`}
        // Placed off the wedge's own centre rather than laid out, since the button behind it is
        // the whole ring and every wedge's button sits in exactly the same place.
        style={{
          left: centre.x + icon.x - iconSize / 2,
          top: centre.y + icon.y - iconSize / 2,
        }}
      />
    </button>
  );
}

/** Which way round the ring a key moves the tab stop, or `null` if it moves it nowhere. */
function stepFor(key: string): number | null {
  // Clockwise is forwards, which puts right and down on the same side as the next wedge along.
  if (key === 'ArrowRight' || key === 'ArrowDown') return 1;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return -1;

  return null;
}

/**
 * The pie menu: a ring of wedges over the brick it was opened on, the brick showing through the
 * hole in the middle.
 *
 * It is drawn in the canvas overlay beside `SnapPreviewView` rather than inside the brick, so a
 * press on a wedge lands on the overlay and never on the brick's `interact.js` draggable; without
 * that the brick would need an `ignoreFrom` for every wedge and a press meant for the menu would
 * start tearing the brick out of its tower.
 *
 * Placed off the brick's `coords` entry and sized off `SCALE_LEVEL_CONFIG`, so it follows a move, a
 * fold above it or a change of scale level without holding a position of its own.
 */
export function ActionMenu() {
  const brickId = useActionMenuStore((state) => state.brickId);
  const coords = useBrickLayoutStore((state) =>
    brickId === null ? undefined : state.coords[brickId],
  );
  const level = useWorkspaceScaleStore((state) => state.level);

  // The wedge the ring's one tab stop rests on. Kept here rather than read off `document` so the
  // ring has a tab stop before anything in it is focused, which is what lets Tab reach it at all.
  const [activeIndex, setActiveIndex] = useState(0);
  const wedgeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // A right-click leaves the focus wherever it was, so the menu takes it: opened from the pointer
  // or not, the keyboard should be in the menu while the menu is the thing on screen. The ring
  // opens on its first wedge, the same one every time, so the keys mean the same thing each time.
  //
  // Waits on the brick being placed as well as named, since until then there is no ring rendered
  // to take the focus; the flag is a boolean rather than the coords themselves, which change on
  // every move and would pull the focus back to the first wedge each time.
  const isPlaced = coords !== undefined;

  useEffect(() => {
    if (brickId === null || !isPlaced) return;

    setActiveIndex(0);
    wedgeRefs.current[0]?.focus();
  }, [brickId, isPlaced]);

  if (brickId === null || coords === undefined) return null;

  // The menu is centred on the brick's widget rather than on its bounding box: a nesting brick's
  // box runs down past its cavity, and the ring belongs over the head that names the brick.
  const found = findNodeAndTower(brickId);
  if (!found) return null;

  const widget = found.node.model.bounds.widget;
  const centre: Point = {
    x: coords.x + widget.x + widget.w / 2,
    y: coords.y + widget.y + widget.h / 2,
  };

  const ring = ringAtScale(level);
  const box = ring.outerRadius * 2;
  const count = ACTION_MENU_WEDGES.length;

  const moveTo = (index: number) => {
    // Wrapped, because the wedges are a ring: there is no end of the row to stop at.
    const wrapped = (index + count) % count;

    setActiveIndex(wrapped);
    wedgeRefs.current[wrapped]?.focus();
  };

  return (
    <div
      data-action-menu
      data-testid="action-menu"
      role="menu"
      aria-label="Brick actions"
      // The container passes presses through: only the wedges themselves take them, so the brick
      // under the hole is still there to be clicked, dragged and dropped on.
      className="pointer-events-none absolute top-0 left-0 z-40"
      style={{
        width: box,
        height: box,
        transform: `translate(${centre.x - ring.outerRadius}px, ${centre.y - ring.outerRadius}px)`,
      }}
      onKeyDown={(event) => {
        const step = stepFor(event.key);

        if (step !== null) {
          // Held back from the canvas, which pans on the arrow keys, and from the browser's own
          // scrolling: while the menu is open the arrows belong to the ring.
          event.preventDefault();
          moveTo(activeIndex + step);
          return;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          moveTo(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          moveTo(count - 1);
        }
        // Enter and Space are a button's own, and Escape is `useActionMenuDismiss`'s: both are
        // left to bubble rather than answered twice.
      }}
    >
      {ACTION_MENU_WEDGES.map((wedge, index) => (
        <WedgeButton
          key={wedge.id}
          wedge={wedge}
          index={index}
          count={count}
          ring={ring}
          iconSize={Math.round(ICON_PX * SCALE_LEVEL_CONFIG[level].brickScale)}
          isActive={index === activeIndex}
          brickId={brickId}
          onFocus={() => setActiveIndex(index)}
          register={(element) => {
            wedgeRefs.current[index] = element;
          }}
        />
      ))}
    </div>
  );
}
