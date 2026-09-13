import type { ActionMenuWedge } from '@/@types/action-menu.types';
import type { Point } from '@/@types/common.types';

import { useActionMenuStore } from '@/stores/actionMenu';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceScaleStore } from '@/stores/scale';
import { findNodeAndTower } from '@/stores/workspace';
import { ACTION_MENU_RING, SCALE_LEVEL_CONFIG } from '@/utils/constants';
import { ringAtScale, wedgeAngles, wedgeCentre, wedgePath } from '@/utils/pie-menu';

import { ACTION_MENU_WEDGES } from './actionMenuWedges';

/** Icon size at `brickScale` 1; scaled with the ring so it stays in proportion to its wedge. */
const ICON_PX = 20;

interface WedgeButtonProps {
  wedge: ActionMenuWedge;
  /** Its place in the ring, which is what decides the slice of the circle it owns. */
  index: number;
  count: number;
  /** The brick the menu is open on, and the one the wedge acts on. */
  brickId: string;
}

/**
 * One wedge, as a button the size of the whole ring clipped down to its own slice.
 *
 * A button rather than an SVG path with a role bolted on: the tab order, the focus, the tooltip and
 * the pressing are all a button's already, and none of them have to be rebuilt. The wedge shape is
 * a `clip-path`, which the browser hit-tests against, so a press in the hole or in the gap between
 * two wedges is a press on neither of them and reaches whatever sits underneath.
 */
function WedgeButton({ wedge, index, count, brickId }: WedgeButtonProps) {
  const level = useWorkspaceScaleStore((state) => state.level);
  const ring = ringAtScale(level);
  const box = ring.outerRadius * 2;

  const angles = wedgeAngles(index, count, ACTION_MENU_RING.gapDegrees);
  const centre: Point = { x: ring.outerRadius, y: ring.outerRadius };
  const icon = wedgeCentre(angles, ring);

  const isEnabled = wedge.isEnabled(brickId);
  const iconSize = Math.round(ICON_PX * SCALE_LEVEL_CONFIG[level].brickScale);

  return (
    <button
      type="button"
      role="menuitem"
      data-wedge={wedge.id}
      aria-label={wedge.label}
      aria-disabled={!isEnabled}
      title={wedge.tooltip}
      // An `aria-disabled` wedge, not a `disabled` one: it stays in the tab order, so its tooltip
      // can say what it would have done and the ring keeps the same shape under the keyboard.
      onClick={() => {
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
    >
      {ACTION_MENU_WEDGES.map((wedge, index) => (
        <WedgeButton
          key={wedge.id}
          wedge={wedge}
          index={index}
          count={ACTION_MENU_WEDGES.length}
          brickId={brickId}
        />
      ))}
    </div>
  );
}
